import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { Course } from '../course/entities/course.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chapter } from './entities/chapter.entity';
import { Content, ContentStatus } from './entities/content.entity';
import { CreateContentDto } from './dto/create-content.dto';
import { CheckExistDto } from './dto/check-exist.dto';
import { InitMultipartDto } from './dto/init-multipart.dto';
import * as Minio from 'minio';

@Injectable()
export class ChapterService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Chapter)
    private chapterRepository: Repository<Chapter>,
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
    @Inject('MINIO_CLIENT')
    private minioClient: Minio.Client,
  ) {}

  /**
   * 创建章节
   */
  async create(createChapterDto: CreateChapterDto) {
    const { title, description, order, courseId, contents } = createChapterDto;
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException('课程不存在');
    }
    //如果order为0，则获取当前课程的章节数量,需要关联课程
    let chapterOrder = order;
    if (chapterOrder === 0) {
      const count = await this.chapterRepository.count({
        where: { course: { id: courseId } },
      });
      chapterOrder = count + 1;
    }

    const chapter = this.chapterRepository.create({
      title,
      description,
      order: chapterOrder,
      course,
      contents: contents,
    });

    return this.chapterRepository.save(chapter);
  }

  /**
   * 获取章节列表
   */
  async list(courseId: number) {
    const chapters = await this.chapterRepository.find({
      where: { course: { id: courseId } },
      order: { order: 'ASC' },
    });
    //返回vo
    return chapters.map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      description: chapter.description,
      order: chapter.order,
    }));
  }

  /**
   * 获取章节详情
   */
  async detail(id: number) {
    return this.chapterRepository.findOne({ where: { id } });
  }

  /**
   * 更新章节
   */
  async update(updateChapterDto: UpdateChapterDto) {
    const { id, title, description, order } = updateChapterDto;
    const chapter = await this.chapterRepository.findOne({ where: { id } });
    if (!chapter) {
      throw new NotFoundException('章节不存在');
    }
    chapter.title = title || chapter.title;
    chapter.description = description || chapter.description;
    chapter.order = order || chapter.order;

    return this.chapterRepository.save(chapter);
  }

  /**
   * 删除
   */
  async delete(id: number) {
    return this.chapterRepository.delete({ id });
  }

  /**
   * 添加内容
   */
  async addContent(createContentDto: CreateContentDto) {
    const { chapterId, title, type, contentUrl, order, fileHash } =
      createContentDto;
    const chapter = await this.chapterRepository.findOne({
      where: { id: chapterId },
    });
    if (!chapter) {
      throw new NotFoundException('章节不存在');
    }

    const content = this.contentRepository.create({
      title,
      type,
      contentUrl,
      order,
      chapter,
      fileHash,
    });
    return this.contentRepository.save(content);
  }

  /**
   * 检查文件是否存在
   */
  async checkExist(checkExistDto: CheckExistDto) {
    const { fileHash, fileName } = checkExistDto;
    console.log('开始检查文件是否存在');
    const content = await this.contentRepository.findOne({
      where: { fileHash },
    });
    console.log('检查文件是否存在', content);
    if (content) {
      return {
        exists: true,
        fileId: content.id,
        url: content.contentUrl,
      };
    }

    const url =
      'https://minio.goodlll.top:12345/browser/studysystem/' + fileName;

    return {
      exists: false,
      url: url,
    };
  }

  /**
   * 初始化分片上传
   */
  async initMultipart(initMultipartDto: InitMultipartDto) {
    const { fileHash, fileName, fileSize, type, contentUrl, chapterId } =
      initMultipartDto;

    // 1. 生成文件路径 - 确保与上传分片时使用相同的路径
    const objectName = `uploads/temp/${fileName}`;
    const bucketName = 'studysystem';

    console.log('初始化上传', {
      bucketName,
      objectName,
      fileHash,
      fileSize,
    });

    // 2. 初始化 MinIO 分片上传
    const uploadID = await this.minioClient.initiateNewMultipartUpload(
      bucketName,
      objectName,
      { 'Content-Type': type === 'video' ? 'video/mp4' : 'application/pdf' },
    );

    console.log('MinIO 初始化成功', {
      uploadId: uploadID,
      objectName,
    });

    // 3. 查找章节
    const chapter = await this.chapterRepository.findOne({
      where: { id: chapterId },
    });

    if (!chapter) {
      throw new NotFoundException('章节不存在');
    }

    // 4. 创建上传记录
    const content = await this.contentRepository.save({
      title: fileName,
      contentUrl: contentUrl || objectName,
      fileHash,
      size: fileSize,
      status: ContentStatus.PROCESSING,
      uploadID, // 保存为 uploadID 而不是 uploadId
      chapter,
    });

    return {
      exists: false,
      uploadID, // 返回 uploadID 而不是 uploadId
      fileId: content.id,
      objectName,
      bucketName,
    };
  }
}
