"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLearningProgressService } from "@/services/LearningProgressService";
import { useWallet } from "@solana/wallet-adapter-react";
import { Loader2 } from "lucide-react";

type Course = {
    courseId: string;
    lessonCount: number;
    difficulty: number;
    xpPerLesson: number;
    trackId: number;
    trackLevel: number;
    prerequisite: string | null;
    isActive: boolean;
  };

export function CourseList() {
    
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { connected } = useWallet();
  const learningService = useLearningProgressService();

  useEffect(() => {
    const loadCourses = async () => {
      
      if (!learningService) {
        setLoading(false);
        setCourses([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const fetchedCourses = await learningService.getAllCourses();
        setCourses(fetchedCourses);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch courses");
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [learningService]);

  if (!connected) {
    return (
      <div className="flex justify-center items-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Please connect your wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Connect your Phantom wallet to fetch available courses from Devnet.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="text-lg font-medium text-gray-700">Loading courses...</span>
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

  if (courses.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Courses Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              No courses are currently available on the program.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Courses</h2>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
            <Card
              key={course.courseId}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    {course.courseId}
                  </CardTitle>
                  <Badge
                    variant={course.isActive ? "default" : "secondary"}
                    className={
                      course.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }
                  >
                    {course.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <CardDescription className="mb-4">
                  Track {course.trackId} • Level {course.trackLevel}
                </CardDescription>

                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <strong>Difficulty:</strong>{" "}
                    {"⭐".repeat(course.difficulty || 1)}
                  </p>
                  <p>
                    <strong>Lessons:</strong> {course.lessonCount}
                  </p>
                  <p>
                    <strong>XP per Lesson:</strong> {course.xpPerLesson}
                  </p>
                  <p>
                    <strong>Total XP:</strong>{" "}
                    {course.lessonCount * course.xpPerLesson}
                  </p>
                </div>

                {course.prerequisite && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      <strong>Prerequisite Required</strong>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
