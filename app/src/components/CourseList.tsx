"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLearningProgressService } from "@/services/LearningProgressService";
import { useWallet } from "@solana/wallet-adapter-react";
import { Loader2 } from "lucide-react";
import { CourseDefinition } from "@/domain/mockCourses";
import Link from "next/link";

type Course = CourseDefinition;

export function CourseList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const wallet = useWallet();
  const learningService = useLearningProgressService();

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const fetchedCourses = await learningService?.getAllCourses();
        setCourses(fetchedCourses ?? []);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("Failed to fetch courses");
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [learningService]);

  const getProgress = (course: Course) => {
    if (!wallet.publicKey) return 0;

    const key = `superteam:${wallet.publicKey.toBase58()}:lessons:${course.id}`;
    const raw = localStorage.getItem(key);

    if (!raw) return 0;

    const flags: number[] = JSON.parse(raw);

    let completedCount = 0;

    course.lessons.forEach((_, index) => {
      const wordIndex = Math.floor(index / 32);
      const bitIndex = index % 32;
      const mask = 1 << bitIndex;

      if ((flags[wordIndex] & mask) !== 0) {
        completedCount++;
      }
    });

    return Math.round((completedCount / course.lessons.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="text-lg font-medium text-gray-700">
          Loading courses...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">

      <div className="mb-12">
        <h2 className="text-3xl font-bold tracking-tight">
          Available Courses
        </h2>
        <p className="text-muted-foreground mt-2">
          Start learning and earn XP on Solana.
        </p>
      </div>

      <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {courses.map((course) => {
          const progress = getProgress(course);
          const isCompleted = progress === 100;

          return (
            <Link key={course.id} href={`/courses/${course.id}`}>
              <Card className="group transition-all hover:shadow-xl hover:-translate-y-1 duration-200 border bg-card">

                <CardHeader className="space-y-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {course.title}
                    </CardTitle>

                    <Badge variant="secondary">
                      {course.difficulty}
                    </Badge>
                  </div>

                  <CardDescription>
                    Track {course.trackId} • Level {course.trackLevel}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">

                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{course.lessonCount} Lessons</span>
                    <span>
                      {course.lessonCount * course.xpPerLesson} XP
                    </span>
                  </div>

                  {wallet.connected && (
                    <div className="space-y-2">
                      <Progress value={progress} />
                      <div className="text-xs text-muted-foreground text-right">
                        {progress}% complete
                      </div>
                    </div>
                  )}

                  <Button className="w-full">
                    {isCompleted
                      ? "Review Course"
                      : progress > 0
                      ? "Continue Learning"
                      : "Start Learning"}
                  </Button>

                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

    </div>
  );
}