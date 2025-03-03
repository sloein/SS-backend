import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CourseChapter } from './course-chapter.entity';

export enum ContentType {
  VIDEO = 'video',   // 视频
  DOCUMENT = 'document', // 文档
  QUIZ = 'quiz'      // 测验
}

@Entity('chapter_contents')
export class ChapterContent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'chapter_id' })
  chapterId: number;

  @Column()
  title: string;

  @Column({
    type: 'enum',
    enum: ContentType
  })
  type: ContentType;

  @Column({ name: 'content_url' })
  contentUrl: string;

  @Column({ nullable: true })
  duration: number;

  @Column()
  order: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 关联关系
  @ManyToOne(() => CourseChapter, chapter => chapter.contents)
  chapter: CourseChapter;
} 