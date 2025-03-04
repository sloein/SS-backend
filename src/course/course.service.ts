import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThanOrEqual, Like, MoreThanOrEqual, Repository } from 'typeorm';
import { Course, CourseStatus } from './entities/course.entity';
import { CourseListVo } from './vo/course-list.vo';
import { User } from '../user/entities/user.entity';

@Injectable()
export class CourseService {

  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async delete(id: number, userId: number) {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['teachers']
    });

    if (!course) {
      throw new NotFoundException(`课程 #${id} 不存在`);
    } 

    //判断是否是管理员
    const foundUser = await this.userRepository.findOne({
      where: { id: userId }
    });

    const isMaster = course.teachers.some(teacher => teacher.id === userId);
    if (!foundUser?.isAdmin && !isMaster) {
      throw new UnauthorizedException('您没有权限删除课程');
    }

    await this.courseRepository.delete(id);
    return '删除课程成功';
  }

  async create(createCourseDto: CreateCourseDto) {
    const { title, description, coverImage, startTime, endTime, teacherIds } = createCourseDto;

    // 验证教师是否存在
    const teachers = await this.userRepository.find({
      where: {
        id: In(teacherIds)
      }
    });

    if (teachers.length !== teacherIds.length) {
      throw new BadRequestException('部分教师ID不存在');
    }

    // 创建新课程实例
    const course = new Course();
    course.title = title;
    course.description = description;
    course.coverImage = coverImage;
    course.teachers = teachers;

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

    return savedCourse;
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

  async findAll(pageNo: number, pageSize: number, title: string, description: string, startTime: string, endTime: string) {
    const skipCount = (pageNo - 1) * pageSize;

    const queryBuilder = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.teachers', 'teachers')
      .leftJoinAndSelect('course.chapters', 'chapters')
      .select([
        'course',
        'teachers.id',
        'teachers.username',
        'teachers.nickName',
        'chapters.id',
        'chapters.title',
        'chapters.order'
      ])
      .skip(skipCount)
      .take(pageSize)
      .orderBy('course.createdAt', 'DESC')
      .addOrderBy('chapters.order', 'ASC');

    if (title) {
      queryBuilder.andWhere('course.title LIKE :title', { title: `%${title}%` });
    }
    if (description) {
      queryBuilder.andWhere('course.description LIKE :description', { description: `%${description}%` });
    }
    if (startTime) {
      queryBuilder.andWhere('course.startTime >= :startTime', { startTime: new Date(startTime) });
    }
    if (endTime) {
      queryBuilder.andWhere('course.endTime <= :endTime', { endTime: new Date(endTime) });
    }

    const [courses, totalCount] = await queryBuilder.getManyAndCount();


    const vo = new CourseListVo();
    vo.courses = courses;
    vo.totalCount = totalCount;

    return vo;
  }

  async findOne(id: number) {
    const course = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.teachers', 'teachers')
      .leftJoinAndSelect('course.chapters', 'chapters')
      .leftJoinAndSelect('course.materials', 'materials')
      .leftJoinAndSelect('chapters.contents', 'contents')
      .leftJoinAndSelect('chapters.assignments', 'assignments')
      .select([
        'course',
        'teachers.id',
        'teachers.username',
        'teachers.nickName',
        'chapters',
        'contents',
        'materials',
        'assignments'
      ])
      .where('course.id = :id', { id })
      .orderBy('chapters.order', 'ASC')
      .addOrderBy('materials.createdAt', 'DESC')
      .getOne();

    if (!course) {
      throw new NotFoundException(`课程 #${id} 不存在`);
    }

    return course;
  }

  async update(id: number, updateCourseDto: UpdateCourseDto, userId: number) {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['teachers']
    });

    if (!course) {
      throw new NotFoundException(`课程 #${id} 不存在`);
    }

    //判断该课程老师中是否包含
    const isTeacher = course.teachers.some(teacher => teacher.id === userId);
    
    //判断是否是管理员
    const isAdmin = await this.userRepository.findOne({
      where: { id: userId, roles: { name: 'admin' } }
    });

    if (!isAdmin && !isTeacher) {
      throw new UnauthorizedException('您没有权限更新课程');
    }

    // 更新课程信息
    const { startTime, endTime, ...rest } = updateCourseDto;

    // 处理日期字段
    if (startTime) {
      course.startTime = new Date(startTime);
    }
    if (endTime) {
      course.endTime = new Date(endTime);
    }

    // 更新其他字段
    Object.assign(course, rest);

    // 更新状态
    course.status = this.determineStatus(course.startTime, course.endTime);

    // 保存更新
    const updatedCourse = await this.courseRepository.save(course);
    return updatedCourse;
  }


}
