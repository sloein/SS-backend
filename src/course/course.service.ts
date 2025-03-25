import { Injectable, BadRequestException, NotFoundException, UnauthorizedException, Inject } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThanOrEqual, Like, MoreThanOrEqual, Repository } from 'typeorm';
import { Course, CourseStatus } from './entities/course.entity';
import { CourseListVo } from './vo/course-list.vo';
import { User } from '../user/entities/user.entity';
import { UploadMaterialDto } from './dto/upload-material.dto';
import { CourseMaterial } from './entities/material.entity';
import { formatDateToDate } from 'src/utils';
import * as Minio from 'minio';
import { UpdateChapterOrderDto } from './dto/update-chapter-order.dto';
import { UpdateChapterOrderVo } from './vo/chapter-order.vo';
import { Chapter } from '../chapter/entities/chapter.entity';
import { UpdateChapterTitleDto } from './dto/update-chapter-title.dto';

@Injectable()
export class CourseService {

  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(CourseMaterial)
    private materialRepository: Repository<CourseMaterial>,
    @InjectRepository(Chapter)
    private chapterRepository: Repository<Chapter>,
    @Inject('MINIO_CLIENT')
    private minioClient: Minio.Client
  ) { }

  async delete(id: number, userId: number) {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['teachers']
    });

    if (!course) {
      throw new NotFoundException(`课程 #${id} 不存在`);
    }

    //判断是否是管理员
    // const foundUser = await this.userRepository.findOne({
    //   where: { id: userId }
    // });

    // const isMaster = course.teachers.some(teacher => teacher.id === userId);
    // if (!foundUser?.isAdmin && !isMaster) {
    //   throw new UnauthorizedException('您没有权限删除课程');
    // }

    //获取课程的所有资料
    const materials = await this.materialRepository.find({
      where: { course: { id } }
    });

    //todo删除minio中的资料文件


    await this.courseRepository.delete(id);



    return '删除课程成功';
  }

  async create(createCourseDto: CreateCourseDto, userId: number) {
    const { title, description, coverImage, startTime, endTime, teacherIds } = createCourseDto;

    // 创建新课程实例
    const course = new Course();
    if (teacherIds) {
      // 验证教师是否存在
      const teachers = await this.userRepository.find({
        where: {
          id: In(teacherIds)
        }
      });

      if (teachers.length !== teacherIds.length) {
        throw new BadRequestException('部分教师ID不存在');
      } 
      course.teachers = teachers;
    } else {
      const teacher = await this.userRepository.findOne({
        where: {
          id: userId
        }
      });
      if (!teacher) {
        throw new BadRequestException('教师不存在');
      }
      course.teachers = [teacher];
    }


    course.title = title;
    course.description = description;
    course.coverImage = coverImage || '';


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

    console.log(courses);

    const vo = new CourseListVo();
    vo.courses = courses;
    vo.totalCount = totalCount;

    return vo;
  }

  async findOne(id: number) {
    const course = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.teachers', 'teachers')
      .leftJoinAndSelect('course.students', 'students')
      .leftJoinAndSelect('course.chapters', 'chapters')
      .leftJoinAndSelect('course.materials', 'materials')
      .leftJoinAndSelect('course.assignments', 'assignments')
      .leftJoinAndSelect('chapters.contents', 'contents')
      .select([
        'course',
        'teachers.id',
        'teachers.username',
        'teachers.nickName',
        'students.id',
        'students.username',
        'students.nickName',
        'chapters',
        'contents',
        'materials',
        'assignments.id',
        'assignments.title',
        'assignments.description',
        'assignments.deadline'
      ])
      .where('course.id = :id', { id })
      .orderBy('chapters.order', 'ASC') 
      .addOrderBy('materials.createdAt', 'DESC')
      .addOrderBy('assignments.deadline', 'ASC')
      .getOne();

    if (!course) {
      throw new NotFoundException(`课程 #${id} 不存在`);
    }

    return course;
  }

  async update(updateCourseDto: UpdateCourseDto, userId: number) {
    const course = await this.courseRepository.findOne({
      where: { id: updateCourseDto.id },
      relations: ['teachers']
    });

    if (!course) {
      throw new NotFoundException(`课程 #${updateCourseDto.title} 不存在`);
    }

    //判断该课程老师中是否包含
    const isTeacher = course.teachers.some(teacher => teacher.id === userId);

    //判断是否是管理员
    const isAdmin = this.userRepository.findOne({
      where: { id: userId, roles: { name: 'admin' } }
    });

    if (!isAdmin && !isTeacher) {
      throw new UnauthorizedException('您没有权限更新课程');
    }

    // 更新课程信息
    const { startTime, endTime, ...rest } = updateCourseDto;

    // 处理日期字段
    if (startTime) {
      course.startTime = formatDateToDate(startTime);
    }
    if (endTime) {
      course.endTime = formatDateToDate(endTime);
    } 

    // 更新其他字段
    Object.assign(course, rest);

    // 更新状态
    course.status = this.determineStatus(course.startTime, course.endTime);

    // 保存更新
    const updatedCourse = await this.courseRepository.save(course);
    return updatedCourse;
  }

  async getMyCourses(user: User) {
    //判断是教师还是学生
    const isTeacher = user.roles.some(role => role.name === 'teacher');
    const isStudent = user.roles.some(role => role.name === 'student');

    if (isTeacher) {
      const courses = await this.courseRepository.find({
        where: { teachers: { id: user.id } }
      });
      return courses;
    } else if (isStudent) {
      const courses = await this.courseRepository.find({
        where: { students: { id: user.id } }
      });
      return courses;
    }
  }

  async selectCourse(courseId: number, userId: number) {
    // 1. 查找课程
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['students']
    });

    if (!course) {
      throw new NotFoundException(`课程 #${courseId} 不存在`);
    }

    // 2. 查找用户
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException(`用户 #${userId} 不存在`);
    }

    // 3. 检查是否已经选过这门课
    if (course.students && course.students.some(student => student.id === userId)) {
      throw new BadRequestException('您已经选过这门课程了');
    }

    // 4. 初始化 students 数组（如果为空）
    if (!course.students) {
      course.students = [];
    }

    // 5. 添加学生到课程
    course.students.push(user);

    // 6. 保存更新
    await this.courseRepository.save(course);

    return '选课成功';
  }

  async cancelCourse(userId: number, courseId: number) {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['students']
    });

    if (!course) {
      throw new NotFoundException(`课程 #${courseId} 不存在`);
    }

    course.students = course.students.filter(student => student.id !== userId);

    await this.courseRepository.save(course);
    return '取消选课成功';
  }

  async uploadCourseMaterial(uploadMaterialDto: UploadMaterialDto) {
    const course = await this.courseRepository.findOne({
      where: { id: uploadMaterialDto.courseId },
      relations: ['materials']
    });

    if (!course) {
      throw new NotFoundException(`课程不存在`);
    }

    const { title, type, url, fileHash } = uploadMaterialDto;

    const material = new CourseMaterial();
    material.title = title;
    material.type = type;
    material.url = url;
    material.course = course;
    material.fileHash = fileHash;

    const savedMaterial = await this.materialRepository.save(material);
    
    return savedMaterial;
  }

  async deleteMaterial(materialId: number) {
    const material = await this.materialRepository.findOne({
        where: { id: materialId }
    });

    if (!material) {
        throw new Error('资料不存在');
    }

    try {
        // 从URL中提取文件名
        const fileName = material.url.split('/').pop();
        
        // 从MinIO中删除文件
        await this.minioClient.removeObject('studysystem', fileName||'');
        
        // 从数据库中删除记录
        await this.materialRepository.remove(material);
        
        return '删除成功';
    } catch (error) {
        throw new Error('删除失败：' + error.message);
    }
  }

  async getMySelectCourses(userId: number, pageNo: number, pageSize: number, title: string, description: string) {
    const skipCount = (pageNo - 1) * pageSize;

    const queryBuilder = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.students', 'students')
      .leftJoinAndSelect('course.chapters', 'chapters')
      .select([
        'course',
        'chapters.id',
        'chapters.title',
        'chapters.order'
      ])
      .skip(skipCount)
      .take(pageSize)
      .orderBy('course.createdAt', 'DESC')
      .addOrderBy('chapters.order', 'ASC');
    
    queryBuilder.where('students.id = :userId', { userId });

    if (title) {
      queryBuilder.andWhere('course.title LIKE :title', { title: `%${title}%` });
    }
    if (description) {
      queryBuilder.andWhere('course.description LIKE :description', { description: `%${description}%` });
    }


    const [courses, totalCount] = await queryBuilder.getManyAndCount();

    console.log(courses);

    const vo = new CourseListVo();
    vo.courses = courses;
    vo.totalCount = totalCount;

    return vo;

  }

  async updateChapterOrder(updateChapterOrderDto: UpdateChapterOrderDto): Promise<UpdateChapterOrderVo> {
    const { courseId, chapterIds } = updateChapterOrderDto;

    // 验证课程是否存在
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['chapters']
    });

    if (!course) {
      throw new NotFoundException(`课程 #${courseId} 不存在`);
    }

    // 验证所有章节是否属于该课程
    const chapters = await this.chapterRepository.find({
      where: {
        id: In(chapterIds),
        course: { id: courseId }
      }
    });

    if (chapters.length !== chapterIds.length) {
      throw new BadRequestException('部分章节不属于该课程');
    }

    // 更新章节顺序
    const updatedChapters = await Promise.all(
      chapterIds.map(async (chapterId, index) => {
        const chapter = chapters.find(c => c.id === chapterId);
        if (!chapter) {
          throw new BadRequestException(`章节 #${chapterId} 不存在`);
        }
        chapter.order = index + 1;
        return await this.chapterRepository.save(chapter);
      })
    );

    // 构建返回数据
    const vo = new UpdateChapterOrderVo();
    vo.courseId = courseId;
    vo.chapters = updatedChapters.map(chapter => ({
      id: chapter.id,
      title: chapter.title,
      order: chapter.order
    }));

    return vo;
  }

  async updateChapterTitle(updateChapterTitleDto: UpdateChapterTitleDto) {
    const { chapterId, title } = updateChapterTitleDto;

    // 查找章节
    const chapter = await this.chapterRepository.findOne({
      where: { id: chapterId },
      relations: ['course', 'course.teachers']
    });

    if (!chapter) {
      throw new NotFoundException(`章节 #${chapterId} 不存在`);
    }

    // 更新章节标题
    chapter.title = title;
    await this.chapterRepository.save(chapter);

    return {
      code: 200,
      msg: '更新成功',
      data: {
        id: chapter.id,
        title: chapter.title
      }
    };
  }

}
