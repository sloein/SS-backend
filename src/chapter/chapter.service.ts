import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { Course } from '../course/entities/course.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chapter } from './entities/chapter.entity';
import { Content } from './entities/content.entity';
import { CreateContentDto } from './dto/create-content.dto';
@Injectable()
export class ChapterService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Chapter)
    private chapterRepository: Repository<Chapter>,
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
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
    const { chapterId, title, type, contentUrl, order } = createContentDto;
    const chapter = await this.chapterRepository.findOne({ where: { id: chapterId } });
    if (!chapter) {
      throw new NotFoundException('章节不存在');
    }

    const content = this.contentRepository.create({ title, type, contentUrl, order });
    return this.contentRepository.save(content);
  }




}
