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
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

interface UploadDetail {
  key: string;
  parts: Array<{
    partNumber: number;
    etag: string;
    size: number;
  }>;
  createdAt: Date;
  contentType: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  totalParts: number;
  completedParts: number;
  url?: string;
  error?: string;
  completedAt?: Date;
}

@Injectable()
export class ChapterService {
  private uploadDetails: Record<string, UploadDetail> = {};

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
    const { filename, contentType } = initMultipartDto;
    
    if (!filename) {
      throw new Error('文件名不能为空');
    }
    
    // 生成随机的uploadId用于跟踪上传过程
    const uploadId = uuidv4();
    
    // 生成唯一的文件路径
    const datePrefix = new Date().toISOString().split('T')[0].replace(/-/g, '/');
    const fileExt = path.extname(filename);
    const baseName = path.basename(filename, fileExt);
    const key = `uploads/${datePrefix}/${baseName}-${uploadId.slice(0, 8)}${fileExt}`;
    
    // 存储上传信息
    this.uploadDetails[uploadId] = {
      key,
      parts: [],
      createdAt: new Date(),
      contentType: contentType || 'application/octet-stream',
      status: 'uploading',
      totalParts: 0,
      completedParts: 0
    };
    
    console.log(`初始化分片上传 - uploadId: ${uploadId}, key: ${key}`);
    
    


    return {
      uploadId,
      key,
      bucketName: 'studysystem'
    };
  }

  /**
   * 上传分片
   */
  async uploadMultipart(uploadMultipartDto: UploadMultipartDto) {
    const { uploadId, partNumber, file } = uploadMultipartDto;
    
    console.log('上传分片', uploadMultipartDto);

    if (!this.uploadDetails[uploadId]) {
      throw new Error(`未找到uploadId为 ${uploadId} 的上传`);
    }
    
    const { key } = this.uploadDetails[uploadId];
    const bucketName = 'studysystem';
    const buffer = file.buffer;
    
    try {
      console.log(`上传分片 ${partNumber} - uploadId: ${uploadId}, 大小: ${buffer.length} 字节`);
      
      // 计算ETag (MinIO使用MD5哈希作为ETag)
      const etag = require('crypto').createHash('md5').update(buffer).digest('hex');
      
      // 上传分片到MinIO
      await this.minioClient.putObject(
        bucketName,
        `${key}.part.${partNumber}`,
        buffer,
        buffer.length
      );
      
      // 保存分片信息
      this.uploadDetails[uploadId].parts[partNumber - 1] = {
        partNumber,
        etag,
        size: buffer.length
      };
      
      // 更新完成的分片数量
      this.uploadDetails[uploadId].completedParts++;
      
      // 返回格式与前端期望的一致
      return { 
        etag,
        partNumber,
        success: true
      };
    } catch (error) {
      console.error(`上传分片 ${partNumber} 失败:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 完成分片上传
   */
  async completeMultipart(completeMultipartDto: CompleteMultipartDto) {
    const { uploadId, key, etags } = completeMultipartDto;
    
    console.log('完成分片上传', completeMultipartDto);
   
    if (!this.uploadDetails[uploadId]) {
      throw new Error(`未找到uploadId为 ${uploadId} 的上传`);
    }
    
    const bucketName = 'studysystem';
    const contentType = this.uploadDetails[uploadId].contentType;
    
    // 更新上传状态
    this.uploadDetails[uploadId].status = 'processing';
    this.uploadDetails[uploadId].totalParts = etags.length;

    const keyName = key.split('.')[0].split('-')[0]+'.'+key.split('.')[1];
 
    // 创建初始内容记录
    const content = this.contentRepository.create({
      chapter: {
        id: completeMultipartDto.chapterId
      },
      title: path.basename(keyName),
      type: this.getContentType(contentType),
      contentUrl: '', // 初始为空，处理完成后更新
      fileHash: '', // 初始为空，处理完成后更新
      status: ContentStatus.PROCESSING,
      order: 0,
      size: 0, // 初始为0，处理完成后更新
      uploadID: uploadId,
    });
    
    const savedContent = await this.contentRepository.save(content);
    
    // 立即返回成功响应，让前端可以继续操作
    const response = {
      message: '文件上传成功，正在后台处理',
      uploadId,
      key,
      bucketName,
      status: 'processing',
      contentId: savedContent.id
    };
    
    // 在后台异步处理文件合并
    this.processMultipartUpload(uploadId, key, etags, bucketName, contentType, savedContent.id).catch(error => {
      console.error('后台处理分片上传失败:', error);
      this.uploadDetails[uploadId].status = 'failed';
      this.uploadDetails[uploadId].error = error.message;
      
      // 更新内容状态为失败
      this.contentRepository.update(savedContent.id, {
        status: ContentStatus.FAILED
      });
    });
    
    return response;
  }

  /**
   * 后台处理分片合并
   */
  private async processMultipartUpload(uploadId: string, key: string, etags: string[], bucketName: string, contentType: string, contentId: number) {
    try {
      console.log(`开始后台处理分片合并 - uploadId: ${uploadId}, key: ${key}, 分片数: ${etags.length}`);
      
      // 从所有分片中组装完整文件
      const partsData: Buffer[] = [];
      for (let i = 0; i < etags.length; i++) {
        const partNumber = i + 1;
        const partKey = `${key}.part.${partNumber}`;
        
        // 获取分片数据
        const partData = await this.minioClient.getObject(bucketName, partKey);
        const chunks: Buffer[] = [];
        
        // 将流转为Buffer
        for await (const chunk of partData) {
          chunks.push(chunk);
        }
        
        partsData.push(Buffer.concat(chunks));
        
        // 删除临时分片
        await this.minioClient.removeObject(bucketName, partKey);
      }
      
      // 合并所有分片
      const combinedBuffer = Buffer.concat(partsData);
      
      // 上传完整文件
      await this.minioClient.putObject(
        bucketName,
        key,
        combinedBuffer,
        combinedBuffer.length,
        { 'Content-Type': contentType }
      );
      
      // 生成访问URL
      const url = `https://minio.goodlll.top:12345/${bucketName}/${key}`;
      
      // 更新上传状态
      this.uploadDetails[uploadId].status = 'completed';
      this.uploadDetails[uploadId].url = url;
      this.uploadDetails[uploadId].completedAt = new Date();

      // 计算文件哈希值
      const fileHash = require('crypto').createHash('md5').update(combinedBuffer).digest('hex');
      
      // 更新数据库记录
      await this.contentRepository.update(contentId, {
        contentUrl: url,
        fileHash: fileHash,
        status: ContentStatus.COMPLETED,
        size: combinedBuffer.length
      });
      
      console.log(`分片合并完成 - uploadId: ${uploadId}, url: ${url}, contentId: ${contentId}`);
    } catch (error) {
      console.error('后台处理分片上传时出错:', error);
      
      // 尝试清理临时分片
      try {
        for (let i = 0; i < etags.length; i++) {
          const partNumber = i + 1;
          const partKey = `${key}.part.${partNumber}`;
          await this.minioClient.removeObject(bucketName, partKey);
        }
      } catch (cleanupError) {
        console.error('清理临时分片时出错:', cleanupError);
      }
      
      // 更新上传状态
      this.uploadDetails[uploadId].status = 'failed';
      this.uploadDetails[uploadId].error = error.message;
      
      // 更新内容状态为失败
      await this.contentRepository.update(contentId, {
        status: ContentStatus.FAILED
      });
      
      throw error;
    }
  }

  /**
   * 根据contentType获取内容类型
   */
  private getContentType(contentType: string): string {
    if (contentType.startsWith('video/')) {
      return 'video';
    } else if (contentType.startsWith('audio/')) {
      return 'audio';
    } else if (contentType.startsWith('image/')) {
      return 'image';
    } else if (contentType.includes('pdf')) {
      return 'pdf';
    } else if (contentType.includes('word') || contentType.includes('doc')) {
      return 'doc';
    } else if (contentType.includes('excel') || contentType.includes('sheet')) {
      return 'excel';
    } else if (contentType.includes('powerpoint') || contentType.includes('presentation')) {
      return 'ppt';
    } else {
      return 'other';
    }
  }

  /**
   * 获取上传状态
   */
  async getUploadStatus(uploadId: string) {
    if (!this.uploadDetails[uploadId]) {
      throw new Error(`未找到uploadId为 ${uploadId} 的上传`);
    }
    
    const { key, status, totalParts, completedParts, url, error } = this.uploadDetails[uploadId];
    const bucketName = 'studysystem';
    
    return {
      uploadId,
      key,
      bucketName,
      status,
      progress: totalParts > 0 ? Math.round((completedParts / totalParts) * 100) : 0,
      url: status === 'completed' ? url : null,
      error: status === 'failed' ? error : null
    };
  }

  /**
   * 中止分片上传
   */
  async abortMultipartUpload(uploadId: string) {
    if (!this.uploadDetails[uploadId]) {
      throw new Error(`未找到uploadId为 ${uploadId} 的上传`);
    }
    
    const { key, parts } = this.uploadDetails[uploadId];
    const bucketName = 'studysystem';
    
    try {
      console.log(`中止分片上传 - uploadId: ${uploadId}`);
      
      // 删除已上传的临时分片
      for (let i = 0; i < parts.length; i++) {
        if (parts[i]) {
          const partKey = `${key}.part.${i + 1}`;
          await this.minioClient.removeObject(bucketName, partKey);
        }
      }
      
      // 清理上传详情
      delete this.uploadDetails[uploadId];
    } catch (error) {
      console.error('中止分片上传时出错:', error);
      throw error;
    }
  }
}
