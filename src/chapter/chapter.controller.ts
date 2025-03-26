import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ChapterService } from './chapter.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { CreateContentDto } from './dto/create-content.dto';
import { CheckExistDto } from './dto/check-exist.dto';
import { InitMultipartDto } from './dto/init-multipart.dto';
import { UploadMultipartDto } from './dto/upload-multipart.dto';
import { CompleteMultipartDto } from './dto/complete-multipart.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('chapter')
export class ChapterController {
  constructor(private readonly chapterService: ChapterService) { }

  /**
   * 创建章节
   */
  @Post('create')
  create(@Body() createChapterDto: CreateChapterDto) {
    return this.chapterService.create(createChapterDto);
  }

  /**
   * 获取章节列表
   */
  @Get('list')
  list(@Query('courseId') courseId: number) {
    return this.chapterService.list(courseId);
  }

  /**
   * 获取章节详情
   */
  @Get('detail')
  detail(@Query('id') id: number) {
    return this.chapterService.detail(id);
  }

  /**
   * 更新章节
   */
  @Post('update')
  update(@Body() updateChapterDto: UpdateChapterDto) {
    return this.chapterService.update(updateChapterDto);
  }

  /**
   * 删除章节
   */
  @Get('delete')
  delete(@Query('id') id: number) {
    return this.chapterService.delete(id);
  }

  /**
   * 添加内容
   */
  @Post('addContent')
  addContent(@Body() addContentDto: CreateContentDto) {
    return this.chapterService.addContent(addContentDto);
  }

  /**
   * 检查文件是否存在
   */
  @Post('checkExist')
  checkExist(@Body() checkExistDto: CheckExistDto) {
    console.log("检查文件是否存在", checkExistDto)
    return this.chapterService.checkExist(checkExistDto);
  }

  /**
   * 初始化分片上传
   */
  @Post('multipart/init')
  initMultipart(@Body() initMultipartDto: InitMultipartDto) {
    return this.chapterService.initMultipart(initMultipartDto);
  }

  /**
   * 分片上传
   */






}
