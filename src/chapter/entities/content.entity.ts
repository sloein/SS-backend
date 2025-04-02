import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Chapter } from './chapter.entity';



export enum ContentStatus {
  PROCESSING = 'processing', // 处理中
  COMPLETED = 'completed',   // 完成
  FAILED = 'failed',        // 失败
}

@Entity('contents')
export class Content {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ default: ' ' })
  type: string;

  @Column({ name: 'content_url', length: 1024 })
  contentUrl: string;

  @Column({ nullable: true })
  duration: number;

  @Column({ type: 'bigint', default: 0 })
  size: number;

  @Column({ name: 'file_hash', length: 32, nullable: true })
  fileHash: string;

  @Column({
    type: 'enum',
    enum: ContentStatus,
    default: ContentStatus.PROCESSING
  })
  status: ContentStatus;

  @Column({ name: 'upload_id', nullable: true })
  uploadID: string;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @Column({ default: 0 })
  order: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Chapter, chapter => chapter.contents)
  chapter: Chapter;
} 