"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLearningProgressService } from "@/services/LearningProgressService";
import { Loader2 } from "lucide-react";

export function CourseList() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const learningService = useLearningProgressService();

  useEffect(() => {
    const loadCourses = async () => {
      if (!learningService) {
        setError("Wallet must be connected to fetch courses");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const fetchedCourses = await learningService.getAllCourses();
        console.log("Courses fetched:", fetchedCourses);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <Loader2 className="ml-2 h-6 w-6 text-indigo-600" />
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
        {courses.map((course, index) => {
          // Debug logging to understand data structure
          console.log(`Course ${index}:`, course);
          console.log(`Course ${index} keys:`, Object.keys(course));
          
          // Safety check - ensure course exists and has required properties
          if (!course) {
            console.warn(`Course ${index} is undefined or null`);
            return null;
          }
          
          // Safety check - ensure required properties exist
          const requiredProps = ['courseId', 'lessonCount', 'xpPerLesson', 'isActive'];
          const missingProps = requiredProps.filter(prop => !(prop in course));
          if (missingProps.length > 0) {
            console.warn(`Course ${index} missing properties:`, missingProps);
          }
          
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    {course.courseId || 'Unknown Course'}
                  </CardTitle>
                  <Badge 
                    variant={(course.courseId && course.isActive !== false) ? "default" : "secondary"}
                    className={(course.courseId && course.isActive !== false) ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                  >
                    {course.isActive !== false ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Track ID: {course.contentTxId || 'N/A'}
                </CardDescription>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Difficulty:</strong> {course.difficulty || 'N/A'}/10</p>
                  <p><strong>Lessons:</strong> {course.lessonCount || 'N/A'}</p>
                  <p><strong>XP per Lesson:</strong> {course.xpPerLesson || 'N/A'}</p>
                  <p><strong>XP per Lesson:</strong> {course.xpPerLesson || 0}</p>
                  <p><strong>Total XP:</strong> {(course.lessonCount || 0) * (course.xpPerLesson || 0)}</p>
                  <p><strong>Track:</strong> {course.trackId || 'N/A'} (Level {course.trackLevel || 'N/A'})</p>
                </div>

                {course.prerequisite && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      <strong>Prerequisite Required:</strong> Complete course {course.prerequisite.toString().slice(0, 4)}...{course.prerequisite.toString().slice(-4)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
