"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLearningProgressService } from "@/services/LearningProgressService";
import { useWallet } from "@solana/wallet-adapter-react";
import { Loader2 } from "lucide-react";

import { CourseDefinition } from "@/domain/mockCourses"
import Link from "next/link"

type Course = CourseDefinition

export function CourseList() {
    
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const learningService = useLearningProgressService();

  useEffect(() => {
  const loadCourses = async () => {
    try {
      setLoading(true)
      const fetchedCourses = await learningService?.getAllCourses()
      setCourses(fetchedCourses ?? [])
    } catch (err) {
      console.error("Error fetching courses:", err)
      setError("Failed to fetch courses")
    } finally {
      setLoading(false)
    }
  }

    loadCourses()
  }, [learningService])
  

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
        <Link key={course.id} href={`/courses/${course.id}`}>
          <Card className="hover:shadow-xl transition-all cursor-pointer hover:scale-[1.02]">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">
                  {course.title}
                </CardTitle>
                <Badge className="bg-indigo-100 text-indigo-800">
                  {course.difficulty}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <CardDescription className="mb-4">
                Track {course.trackId} • Level {course.trackLevel}
              </CardDescription>

              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Difficulty:</strong> {course.difficulty}</p>
                <p><strong>Lessons:</strong> {course.lessonCount}</p>
                <p><strong>XP per Lesson:</strong> {course.xpPerLesson}</p>
                <p><strong>Total XP:</strong> {course.lessonCount * course.xpPerLesson}</p>
              </div>

              <div className="mt-6">
                <Button className="w-full">
                  Start Learning
                </Button>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
      </div>
    </div>
  );
}
