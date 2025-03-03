import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CourseChapter } from './entities/course-chapter.entity';
import { CourseMaterial } from './entities/course-material.entity';
import { ChapterContent } from './entities/chapter-content.entity';
import { StudentCourse } from './entities/student-course.entity';
import { Assignment } from './entities/assignment.entity';
import { Submission } from './entities/submission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Course, 
    CourseChapter, 
    ChapterContent, 
    CourseMaterial,
    StudentCourse,
    Assignment,
    Submission
  ])],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [CourseService]
})
export class CourseModule {}
