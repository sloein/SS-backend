import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Chapter } from './chapter.entity';

export enum ContentType {
  VIDEO = 'video',   // 视频
  DOCUMENT = 'document', // 文章
}

@Entity('contents')
export class Content {
  
  @PrimaryGeneratedColumn()
  id: number;

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

  @ManyToOne(() => Chapter, chapter => chapter.contents)
  chapter: Chapter;
} 