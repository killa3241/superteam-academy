"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLearningProgressService } from "@/services/LearningProgressService";
import { XPCalculator } from "@/lib/utils/xp";
import { useXpBalance } from "@/hooks/useXpBalance";
import { BN } from "@coral-xyz/anchor"

export function UserProfile() {
  const [userLevel, setUserLevel] = useState<number>(0);
  const [levelProgress, setLevelProgress] = useState<number>(0);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const learningService = useLearningProgressService();
  const { data: xpData, isLoading: xpLoading } = useXpBalance();

  const previousLevelRef = useRef<number>(0);

  useEffect(() => {
    if (!learningService) {
      setError("Wallet must be connected to load profile");
      setLoading(false);
      return;
    }

    loadUserProgress();
  }, [learningService]);

  useEffect(() => {
    if (xpData === undefined) return;

    const xpNumber = xpData ?? 0;
    const xpBN = new BN(xpNumber);

    const level = XPCalculator.calculateLevel(xpBN);
    const progressToNext = XPCalculator.levelProgress(xpBN);

    setUserLevel(level);
    setLevelProgress(progressToNext);

    if (level > previousLevelRef.current) {
      previousLevelRef.current = level;
      console.log("Level Up!");
    }

  }, [xpData]);

  const loadUserProgress = async () => {
    if (!learningService) return;

    try {
      setLoading(true);
      setError(null);

      const progress = await learningService.getUserProgress();
      setUserProgress(progress);

    } catch (err) {
      console.error("Error loading user data:", err);
      setError("Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading || xpLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500 text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const userXP = xpData ?? 0;

  const completedCourses = userProgress.filter(p => p.isCompleted).length;
  const inProgressCourses = userProgress.filter(p => !p.isCompleted).length;
  const totalLessonsCompleted = userProgress.reduce(
    (sum, p) => sum + p.completedLessons,
    0
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Your Progress</span>
            <Badge variant="secondary">Level {userLevel}</Badge>
          </CardTitle>
          <CardDescription>
            Track your learning journey and achievements
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* XP + Level */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-indigo-600">
                {userXP.toLocaleString()} XP
              </span>
              <Badge variant="outline">
                Level {userLevel}
              </Badge>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progress to Level {userLevel + 1}</span>
                <span>{Math.round(levelProgress)}%</span>
              </div>
              <Progress value={levelProgress} className="w-full" />
            </div>

            <p className="text-xs text-gray-500">
              {Number(
                XPCalculator.xpForLevel(userLevel + 1)
              ) - userXP} XP to next level
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {completedCourses}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {inProgressCourses}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {totalLessonsCompleted}
              </div>
              <div className="text-sm text-gray-600">Lessons Done</div>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Course Progress Breakdown */}
      {userProgress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Course Progress</CardTitle>
            <CardDescription>
              Your progress across all enrolled courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userProgress.map((progress, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">
                        {progress.course.courseId}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Track {progress.course.trackId} • Level {progress.course.trackLevel}
                      </p>
                    </div>
                    <Badge
                      variant={progress.isCompleted ? "default" : "secondary"}
                    >
                      {progress.isCompleted ? "Completed" : "In Progress"}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>
                        {progress.completedLessons}/{progress.totalLessons} lessons
                      </span>
                    </div>
                    <Progress value={progress.progress} className="w-full" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{Math.round(progress.progress)}% complete</span>
                      <span>
                        {progress.completedLessons * progress.course.xpPerLesson} XP earned
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {userProgress.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">
              Start Your Learning Journey
            </h3>
            <p className="text-gray-600 mb-4">
              Enroll in your first course to start earning XP and tracking your progress
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}