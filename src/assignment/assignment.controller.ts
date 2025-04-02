import { Controller, Get, Post, Body, Patch, Param, Delete, Query, DefaultValuePipe } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { RequireLogin, UserInfo } from 'src/custom.decorator';
import { generateParseIntPipe } from 'src/utils';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { User } from 'src/user/entities/user.entity';
import { UpdateSubmissionDto } from './dto/update-submission.dto';

@Controller('assignment')
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) { }

  // 教师创建作业
  @Post('create')
  @RequireLogin()
  createAssignment(@Body() createAssignmentDto: CreateAssignmentDto) {
    return this.assignmentService.createAssignment(createAssignmentDto);
  }

  // 老师查看作业列表
  @Get('list')
  @RequireLogin()
  getAssignmentList(@Query('pageNo', new DefaultValuePipe(1), generateParseIntPipe('pageNo')) pageNo: number,
    @Query('pageSize', new DefaultValuePipe(2), generateParseIntPipe('pageSize')) pageSize: number, @Query('courseId') courseId: number) {
    return this.assignmentService.getAssignmentList(pageNo, pageSize, courseId);
  }

  //删除作业
  @Get('delete')
  @RequireLogin()
  deleteAssignment(@Param('id') id: number) {
    return this.assignmentService.deleteAssignment(id);
  }

  //更改作业
  @Post('update')
  @RequireLogin()
  updateAssignment(@Body() updateAssignmentDto: UpdateAssignmentDto) {
    return this.assignmentService.updateAssignment(updateAssignmentDto);
  }

  // 学生查看作业列表
  @Get('list-for-student')
  @RequireLogin()
  getAssignmentListForStudent(@Query('pageNo', new DefaultValuePipe(1), generateParseIntPipe('pageNo')) pageNo: number,
    @Query('pageSize', new DefaultValuePipe(2), generateParseIntPipe('pageSize')) pageSize: number, @Query('courseId') courseId: number) {
    return this.assignmentService.getAssignmentListForStudent(pageNo, pageSize, courseId);
  }

  // 查看作业详情
  @Get('detail')
  @RequireLogin()
  getAssignmentDetail(@Query('id') id: number, @UserInfo() user: User) {
    return this.assignmentService.getAssignmentDetail(id, user);
  }

  // 学生提交作业
  @Post('submit')
  @RequireLogin()
  submitAssignment(@UserInfo() user: User, @Body() createSubmissionDto: CreateSubmissionDto) {
    return this.assignmentService.createSubmission(user, createSubmissionDto);
  }

  // 老师批改作业
  @Post('grade')
  @RequireLogin()
  gradeAssignment(@Body() updateSubmissionDto: UpdateSubmissionDto) {
    return this.assignmentService.updateSubmission(updateSubmissionDto);
  }

  
  

}