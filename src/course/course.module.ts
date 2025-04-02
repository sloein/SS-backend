import { Module, forwardRef } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { Chapter } from '../chapter/entities/chapter.entity';
import { CourseMaterial } from './entities/material.entity';
import { Assignment } from '../assignment/entities/assignment.entity';
import { Submission } from '../assignment/entities/submission.entity';
import { User } from 'src/user/entities/user.entity';
import { MinioModule } from '../minio/minio.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course, 
      Chapter,  
      CourseMaterial,
      Assignment,
      Submission,
      User
    ]),
    forwardRef(() => MinioModule)
  ],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [CourseService]
})
export class CourseModule {}
