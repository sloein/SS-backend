import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { RequirePermission, UserInfo } from '../custom.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('课程管理')
@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @RequirePermission('TC') // 需要教师创建权限
  async create(
    @Body() createCourseDto: CreateCourseDto,
    @UserInfo('id') userId: number
  ) {
    if (!userId) {
      throw new HttpException('用户未登录', HttpStatus.UNAUTHORIZED);
    }
    return this.courseService.create(createCourseDto, userId);
  }

  @Get()
  findAll() {
    return this.courseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.courseService.update(+id, updateCourseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courseService.remove(+id);
  }
}

