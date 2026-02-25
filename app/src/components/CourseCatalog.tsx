"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useLearningProgressService } from "@/services/LearningProgressService";
import { LessonBitmap } from "@/lib/utils/lesson-bitmap";
import { CourseList } from "./CourseList";

interface CourseCardProps {
  course: any;
  enrollment?: any;
  onEnroll: (courseId: string) => void;
}

function CourseCard({ course, enrollment, onEnroll }: CourseCardProps) {
  const progress = enrollment 
    ? LessonBitmap.calculateProgress(enrollment.lessonFlags, course.lessonCount)
    : 0;
  
  const completedLessons = enrollment
    ? LessonBitmap.countCompletedLessons(enrollment.lessonFlags)
    : 0;

  const isCompleted = !!enrollment?.completedAt;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{course.courseId}</CardTitle>
            <CardDescription>
              Track {course.trackId} • Level {course.trackLevel} • {course.lessonCount} lessons
            </CardDescription>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge variant={isCompleted ? "default" : "secondary"}>
              {isCompleted ? "Completed" : enrollment ? "In Progress" : "Not Started"}
            </Badge>
            <Badge variant="outline">
              {course.xpPerLesson} XP/lesson
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {enrollment && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{completedLessons}/{course.lessonCount} lessons</span>
              </div>
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-gray-500">
                {Math.round(progress)}% complete
              </p>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <p>Difficulty: {"⭐".repeat(course.difficulty)}</p>
              <p>Total XP: {course.lessonCount * course.xpPerLesson}</p>
            </div>
            {!enrollment && (
              <Button onClick={() => onEnroll(course.courseId)}>
                Enroll Now
              </Button>
            )}
            {enrollment && isCompleted && (
              <Badge variant="default" className="bg-green-600">
                ✓ Completed
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CourseCatalog() {
  const [courses, setCourses] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const learningService = useLearningProgressService();

  useEffect(() => {
    if (learningService) {
      loadData();
    }
  }, [learningService]);

  const loadData = async () => {
    if (!learningService) {
      setError("Wallet must be connected to load courses");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [allCourses, progress] = await Promise.all([
        learningService.getAllCourses(),
        learningService.getUserProgress()
      ]);
      
      setCourses(allCourses);
      setUserProgress(progress);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    if (!learningService) {
      setError("Wallet must be connected to enroll in course");
      return;
    }

    try {
      await learningService.enrollInCourse(courseId);
      await loadData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to enroll");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading courses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p className="font-semibold">Error</p>
        <p>{error}</p>
        <Button onClick={loadData} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {courses.map((course) => {
        const enrollment = userProgress.find(
          (p) => p.course.courseId === course.courseId
        )?.enrollment;

        return (
          <CourseCard
            key={course.courseId}
            course={course}
            enrollment={enrollment}
            onEnroll={handleEnroll}
          />
        );
      })}
    </div>
  );
}
