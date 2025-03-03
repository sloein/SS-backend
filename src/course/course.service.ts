import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course, CourseStatus } from './entities/course.entity';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>
  ) {}

  async create(createCourseDto: CreateCourseDto, teacherId: number) {
    const { title, description, coverImage, startTime, endTime } = createCourseDto;
    
    // 创建新课程实例
    const course = new Course();
    course.title = title;
    course.description = description;
    course.coverImage = coverImage;
    course.teacherId = teacherId;
    
    // 设置开始和结束时间
    if (startTime) {
      course.startTime = new Date(startTime);
    }
    
    if (endTime) {
      course.endTime = new Date(endTime);
    }
    
    // 根据日期自动设置课程状态
    course.status = this.determineStatus(course.startTime, course.endTime);
    
    // 保存到数据库
    const savedCourse = await this.courseRepository.save(course);
    
    return {
      code: 200,
      message: '课程创建成功',
      data: savedCourse
    };
  }

  /**
   * 根据开始和结束时间确定课程状态
   */
  private determineStatus(startTime?: Date, endTime?: Date): CourseStatus {
    const now = new Date();
    
    // 如果没有设置开始时间或结束时间，默认为未开始
    if (!startTime) {
      return CourseStatus.NOT_STARTED;
    }
    
    if (startTime > now) {
      return CourseStatus.NOT_STARTED; // 开始时间在未来，状态为未开始
    }
    
    if (!endTime || endTime > now) {
      return CourseStatus.IN_PROGRESS; // 已开始但未结束，状态为进行中
    }
    
    return CourseStatus.FINISHED; // 已结束
  }

  findAll() {
    return `This action returns all course`;
  }

  findOne(id: number) {
    return `This action returns a #${id} course`;
  }

  update(id: number, updateCourseDto: UpdateCourseDto) {
    return `This action updates a #${id} course`;
  }

  remove(id: number) {
    return `This action removes a #${id} course`;
  }
}
