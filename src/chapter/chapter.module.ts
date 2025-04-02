import { Module } from '@nestjs/common';
import { ChapterService } from './chapter.service';
import { ChapterController } from './chapter.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chapter } from './entities/chapter.entity';
import { Content } from './entities/content.entity';
import { Course } from '../course/entities/course.entity';
@Module({
  imports: [TypeOrmModule.forFeature([
    Chapter,
    Content,
    Course
  ])],
  controllers: [ChapterController],
  providers: [ChapterService],
  exports: [ChapterService]
})
export class ChapterModule {}
