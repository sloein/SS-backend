import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { Assignment } from './entities/assignment.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from 'src/course/entities/course.entity';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { Submission, SubmissionStatus } from './entities/submission.entity';
import { User } from 'src/user/entities/user.entity';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
@Injectable()
export class AssignmentService {
  constructor(
    @InjectRepository(Assignment)
    private assignmentRepository: Repository<Assignment>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Submission)
    private submissionRepository: Repository<Submission>,
  ) { }

  async createAssignment(createAssignmentDto: CreateAssignmentDto) {
    // 先查询课程是否存在
    const course = await this.courseRepository.findOne({
      where: { id: createAssignmentDto.courseId }
    });

    if (!course) {
      throw new NotFoundException('课程不存在');
    }

    // 创建作业并建立关联
    const assignment = this.assignmentRepository.create({
      title: createAssignmentDto.title,
      description: createAssignmentDto.description,
      deadline: createAssignmentDto.deadline,
      course: course  // 直接关联课程实体
    });

    await this.assignmentRepository.save(assignment);

    return '创建作业成功';
  }

  async getAssignmentList(pageNo: number, pageSize: number, courseId: number) {
    const [assignments, totalCount] = await this.assignmentRepository.findAndCount({
      relations: ['submissions'],
      where: { course: { id: courseId } },
      skip: (pageNo - 1) * pageSize,
      take: pageSize
    });
    return {
      assignments,
      totalCount
    };
  }

  async deleteAssignment(id: number) {
    const assignment = await this.assignmentRepository.findOne({
      where: { id }
    });
    if (!assignment) {
      throw new NotFoundException('作业不存在');
    }
    await this.assignmentRepository.remove(assignment);
    return '删除作业成功';
  }

  async updateAssignment(updateAssignmentDto: UpdateAssignmentDto) {
    const assignment = await this.assignmentRepository.findOne({
      where: { id: updateAssignmentDto.id }
    });
    if (!assignment) {
      throw new NotFoundException('作业不存在');
    }
    assignment.title = updateAssignmentDto.title;
    assignment.description = updateAssignmentDto.description;
    assignment.deadline = updateAssignmentDto.deadline;
    await this.assignmentRepository.save(assignment);
    return '更新作业成功';
  }

  async getAssignmentListForStudent(pageNo: number, pageSize: number, courseId: number) {
    const [assignments, totalCount] = await this.assignmentRepository.findAndCount({
      where: { course: { id: courseId } },
      skip: (pageNo - 1) * pageSize,
      take: pageSize
    });
    return {
      assignments,
      totalCount
    };
  }

  async getAssignmentDetail(id: number, user: User) {
    const assignment = await this.assignmentRepository.findOne({
      where: { id },
      relations: ['submissions']
    });

    //查找这个课程共有多少学生
    const course = await this.courseRepository.findOne({
      where: { assignments: { id } },
      relations: ['students']
    });
    if (!course) {
      throw new NotFoundException('课程不存在');
    }
    const studentCount = course.students.length;

    if (!assignment) {
      throw new NotFoundException('作业不存在');
    }


    const submissions = await this.submissionRepository.findAndCount({
      where: {
        assignment: { id }
      },
      relations: ['student']
    });

    const submissionCount = submissions[1];

    // 提取学生姓名到submission对象
    const studentNames = submissions[0].map(submission => {
      return {
        ...submission,
        studentName: submission.student.username
      };
    });


    return {
      ...assignment,
      submission: studentNames,
      submissionCount,
      totalStudents: studentCount,
      
    };
  }

  async createSubmission(user: User, createSubmissionDto: CreateSubmissionDto) {
    const submission = this.submissionRepository.create(createSubmissionDto);
    const assignment = await this.assignmentRepository.findOne({
      where: { id: createSubmissionDto.assignmentId }
    });
    if (!assignment) {
      throw new NotFoundException('作业不存在');
    }
    submission.assignment = assignment;
    submission.student = user;
    submission.submitTime = new Date();
    submission.status = SubmissionStatus.PENDING;
    await this.submissionRepository.save(submission);
    return '提交作业成功';
  }

  async updateSubmission(updateSubmissionDto: UpdateSubmissionDto) {
    const submission = await this.submissionRepository.findOne({
      where: { id: updateSubmissionDto.id }
    });
    if (!submission) {
      throw new NotFoundException('提交不存在');
    }
    submission.score = updateSubmissionDto.score;
    submission.feedback = updateSubmissionDto.feedback || '';
    submission.status = updateSubmissionDto.status;
    await this.submissionRepository.save(submission);
    return '批改作业成功';
  }



}
