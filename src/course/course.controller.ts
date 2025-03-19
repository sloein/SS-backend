import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, UseGuards, Query, DefaultValuePipe, ParseIntPipe, ParseArrayPipe, Inject } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { RequireLogin, RequirePermission, UserInfo } from '../custom.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginGuard } from '../login.guard';
import { PermissionGuard } from '../permission.guard';
import { generateParseIntPipe } from 'src/utils';
import { User } from 'src/user/entities/user.entity';
import { UploadMaterialDto } from './dto/upload-material.dto';
import { UpdateChapterOrderDto } from './dto/update-chapter-order.dto';
import { UpdateChapterDto } from 'src/chapter/dto/update-chapter.dto';
import { UpdateChapterTitleDto } from './dto/update-chapter-title.dto';

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
    @UserInfo('id') userId: number
  ) {
    return this.courseService.create(createCourseDto, userId);
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

  @Post('batchDelete')
  @ApiOperation({ summary: '删除课程' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '课程不存在' })
  async batchRemove(
    @Body('ids', new ParseArrayPipe({ items: Number, separator: ',' })) ids: number[],
    @UserInfo('id') userId: number
  ) {
    // TODO: 验证课程是否属于当前教师
    for (const id of ids) {
      await this.courseService.delete(+id, userId);
    }
    return {
      message: '删除成功',
      data: ids
    };
  }

  /**
   * 获取我的课程(我教的或我学的)
   */
  @Get('my')
  @RequireLogin()
  @ApiOperation({ summary: '获取我的课程' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  getMyCourses(@UserInfo() user: User) {
    return this.courseService.getMyCourses(user);
  }

  /**
   * 选修课程(学生)
   */
  @Post('select')
  @RequireLogin()
  @RequirePermission('ST')
  @ApiOperation({ summary: '选修课程' })
  @ApiResponse({ status: 200, description: '选修成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  selectCourse(@UserInfo('id') userId: number, @Body('courseId') courseId: number) {  
    return this.courseService.selectCourse(userId, courseId);
  }

  /**
   * 获取我的选修课程
   */
  @Get('mySelect')
  @RequireLogin()
  @ApiOperation({ summary: '获取我的选修课程' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  getMySelectCourses(@UserInfo('id') userId: number, @Query('pageNo', new DefaultValuePipe(1), generateParseIntPipe('pageNo')) pageNo: number,
    @Query('pageSize', new DefaultValuePipe(2), generateParseIntPipe('pageSize')) pageSize: number,
    @Query('title') title: string,
    @Query('description') description: string) {
    return this.courseService.getMySelectCourses(userId, pageNo, pageSize, title, description);
  }
  

  /**
   * 取消选课
   */
  @Post('cancel')
  @RequireLogin()
  @RequirePermission('ST')
  @ApiOperation({ summary: '退课' })
  @ApiResponse({ status: 200, description: '退课成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  cancelCourse(@UserInfo('id') userId: number, @Body('courseId') courseId: number) {
    return this.courseService.cancelCourse(userId, courseId);
  }

  /**
   * 教师上传课程资料
   */
  @Post('upload')
  @RequireLogin()
  @ApiOperation({ summary: '上传课程资料' })
  @ApiResponse({ status: 200, description: '上传成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  uploadCourseMaterial(@Body() uploadMaterialDto: UploadMaterialDto) {
    return this.courseService.uploadCourseMaterial( uploadMaterialDto);
  }

  //删除某个资料
  @Get('deleteMaterial/:id')
  @RequireLogin()
  @ApiOperation({ summary: '删除课程资料' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  deleteMaterial(@Param('id', new ParseIntPipe()) id: number) {
    return this.courseService.deleteMaterial(id);
  }

  @Post('chapter/updateOrder')
  @RequireLogin()
  @ApiOperation({ summary: '更新章节顺序' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateChapterOrder(@Body() updateChapterOrderDto: UpdateChapterOrderDto) {
    return this.courseService.updateChapterOrder(updateChapterOrderDto);
  }


  

  @Post('chapter/updateTitle')
  @RequireLogin()
  @ApiOperation({ summary: '更新章节标题' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateChapterTitle(@Body() updateChapterTitleDto: UpdateChapterTitleDto) {
    return this.courseService.updateChapterTitle(updateChapterTitleDto);
  }

}

