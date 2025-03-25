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
import { UploadMultipartDto } from './dto/upload-multipart.dto';
import { CompleteMultipartDto } from './dto/complete-multipart.dto';

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
    private minioClient: Minio.Client
  ) {}

  /**
   * 创建章节
   */
  async create(createChapterDto: CreateChapterDto) {
    const { title, description, order, courseId, contents } = createChapterDto;
    const course = await this.courseRepository.findOne({ where: { id: courseId } });
    if (!course) {
      throw new NotFoundException('课程不存在');
    }
    //如果order为0，则获取当前课程的章节数量,需要关联课程
    let chapterOrder = order;
    if (chapterOrder === 0) {
      const count = await this.chapterRepository.count({ 
        where: { course: { id: courseId } } 
      });
      chapterOrder = count + 1;
    }

    const chapter = this.chapterRepository.create({
      title,
      description,
      order: chapterOrder,
      course,
      contents: contents
    });

    return this.chapterRepository.save(chapter);
  }

  /**
   * 获取章节列表
   */
  async list(courseId: number) {
    const chapters = await this.chapterRepository.find({ where: { course: { id: courseId } } ,order: { order: 'ASC' }});
    //返回vo
    return chapters.map(chapter => ({
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
  async delete (id:number){
    return this.chapterRepository.delete({id})
  }


  /**
   * 添加内容
   */
  async addContent(createContentDto: CreateContentDto) {
    const { chapterId, title, type, contentUrl, order, fileHash } = createContentDto;
    const chapter = await this.chapterRepository.findOne({ where: { id: chapterId } });
    if (!chapter) {
      throw new NotFoundException('章节不存在');
    }

    const content = this.contentRepository.create({ title, type, contentUrl, order, chapter, fileHash });
    return this.contentRepository.save(content);
  }

  /**
   * 检查文件是否存在
   */
  async checkExist(checkExistDto: CheckExistDto) {
    const { fileHash,fileName } = checkExistDto;
    console.log("开始检查文件是否存在")
    const content = await this.contentRepository.findOne({ where: { fileHash } });
    console.log("检查文件是否存在", content)
    if (content) {
      return {
        exists: true,
        fileId: content.id,
        url: content.contentUrl
      } 
    }

    const url = "https://minio.goodlll.top:12345/browser/studysystem/"+fileName;

    return {
      exists: false,
      url: url
    }
  }

  /**
   * 初始化分片上传
   */
  async initMultipart(initMultipartDto: InitMultipartDto) {
    const { fileHash, fileName, fileSize, type, contentUrl, chapterId } = initMultipartDto;

    // 首先检查是否已存在相同的文件
    const existingContent = await this.contentRepository.findOne({
      where: { fileHash }
    });

    if (existingContent) {
      return {
        exists: true,
        fileId: existingContent.id,
        url: existingContent.contentUrl
      };
    }

    // 1. 生成文件路径 - 确保与上传分片时使用相同的路径
    const objectName = `uploads/temp/${fileName}`;
    const bucketName = 'studysystem';
    
    console.log('初始化上传', {
      bucketName,
      objectName,
      fileHash,
      fileSize
    });
    
    // 2. 初始化 MinIO 分片上传
    const uploadID = await this.minioClient.initiateNewMultipartUpload(
      bucketName,
      objectName,
      { 'Content-Type': type === 'video' ? 'video/mp4' : 'application/pdf' }
    );
    
    console.log('MinIO 初始化成功', {
      uploadID,
      objectName
    });

    // 3. 查找章节
    const chapter = await this.chapterRepository.findOne({
      where: { id: chapterId }
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
      chapter
    });
    
    return {
      exists: false,
      uploadID, // 返回 uploadID 而不是 uploadId
      fileId: content.id,
      objectName,
      bucketName
    };
  }

  /**
   * 分片上传
   */
  async uploadMultipart(uploadMultipartDto: UploadMultipartDto) {
    const { uploadID, partNumber, chunk, bucketName, objectName } = uploadMultipartDto;
  
    try {
      console.log('开始上传分片', {
        bucketName,
        objectName,
        uploadID,
        partNumber: partNumber 
      });

      if (!chunk || !Buffer.isBuffer(chunk)) {
        console.error('分片数据无效', { chunkType: typeof chunk, isBuffer: Buffer.isBuffer(chunk) });
        throw new Error('分片数据无效');
      }

      // 确保分片序号是数字并且从1开始
      const partNum = typeof partNumber === 'string' ? parseInt(partNumber, 10) + 1 : partNumber + 1;

      console.log(`上传分片 ${partNum} 到 ${objectName}，大小: ${chunk.length} 字节`);

      // 使用正确的方式调用 uploadPart
      const result = await this.minioClient.uploadPart({
        bucketName,
        objectName,
        uploadID,
        partNumber: partNum,
        headers: {}
      }, chunk);
      
      console.log('分片上传成功', result);
      
      return {
        etag: result.etag,
        partNumber: result.part
      };
    } catch (error) {
      console.error('分片上传失败', error);
      throw error;
    }
  }

  /**
   * 完成分片上传
   */
  async completeMultipart(completeMultipartDto: CompleteMultipartDto) {
    const { uploadID, fileHash, parts, objectName } = completeMultipartDto;
  
    try {
      console.log('完成分片上传', { 
        uploadID, 
        fileHash, 
        objectName,
        partsCount: parts.length 
      });
      
      // 1. 使用 MinIO 合并分片
      const result = await this.minioClient.completeMultipartUpload(
        'studysystem',
        objectName,
        uploadID,
        parts.map(part => ({
          part: part.partNumber,
          etag: part.etag
        }))
      );
      
      console.log('MinIO 合并分片成功', result);
      
      // 2. 更新数据库状态并获取更新后的内容
      const content = await this.contentRepository.findOne({ where: { fileHash } });
      if (!content) {
        throw new NotFoundException('文件记录不存在');
      }
  
      content.status = ContentStatus.COMPLETED;
      content.contentUrl = `https://minio.goodlll.top:12345/studysystem/${objectName}`;
      await this.contentRepository.save(content);
      
      return {
        fileId: content.id,
        url: content.contentUrl
      };
    } catch (error) {
      console.error('完成分片上传失败', error);
      throw error;
    }
  }

}
