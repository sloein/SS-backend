import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, UseGuards, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { RequireLogin, RequirePermission, UserInfo } from '../custom.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginGuard } from '../login.guard';
import { PermissionGuard } from '../permission.guard';
import { generateParseIntPipe } from 'src/utils';

@ApiTags('课程管理')
@Controller('course')
@UseGuards(LoginGuard, PermissionGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @RequirePermission('TC','AD') // 需要教师创建权限
  @ApiOperation({ summary: '创建新课程' })
  @ApiResponse({ status: 200, description: '创建成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async create(
    @Body() createCourseDto: CreateCourseDto,
  ) {
    return this.courseService.create(createCourseDto);
  }

  @Get()
  @ApiOperation({ summary: '分页查询课程列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findAll(
    @Query('pageNo', new DefaultValuePipe(1), generateParseIntPipe('pageNo')) pageNo: number,
    @Query('pageSize', new DefaultValuePipe(2), generateParseIntPipe('pageSize')) pageSize: number,
    @Query('title') title: string,
    @Query('description') description: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string
  ) {
    return this.courseService.findAll(pageNo, pageSize, title, description, startTime, endTime);
  }

  @Get('detail')
  @ApiOperation({ summary: '获取课程详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '课程不存在' })
  findOne(@Query('id', new ParseIntPipe()) id: number) {
    return this.courseService.findOne(id);
  }

  @Post('update')
  @RequirePermission('TC','AD') // 需要教师创建权限
  @ApiOperation({ summary: '更新课程信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '课程不存在' })
  async update(
    @Body() updateCourseDto: UpdateCourseDto,
    @UserInfo('id') userId: number
  ) {
    // TODO: 验证课程是否属于当前教师
    return this.courseService.update( updateCourseDto, userId);
  }

  
  @Get('delete')
  @RequirePermission('TC','AD') // 需要教师创建权限
  @RequireLogin()
  @ApiOperation({ summary: '删除课程' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '课程不存在' })
  async remove(
    @Query('id', new ParseIntPipe()) id: number,
    @UserInfo('id') userId: number
  ) {
    // TODO: 验证课程是否属于当前教师
    return this.courseService.delete(+id, userId);
  }
}

