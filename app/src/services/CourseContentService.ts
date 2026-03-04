import { mockCourses } from "@/domain/mockCourses"
import type { CourseDefinition } from "@/domain/courses"

export class CourseContentService {
  async getCourses(): Promise<CourseDefinition[]> {
    return mockCourses
  }
}