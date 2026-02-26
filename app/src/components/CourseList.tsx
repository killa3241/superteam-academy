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
      {courses.map((course) => (
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

              <Button className="w-full">
                Start Learning
              </Button>

            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  </div>
)
}
