import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Course } from './course.entity';
import { ChapterContent } from './chapter-content.entity';

@Entity('course_chapters')
export class CourseChapter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'course_id' })
  courseId: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  order: number;

  @Column()
  duration: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 关联关系
  @ManyToOne(() => Course, course => course.chapters)
  course: Course;

  @OneToMany(() => ChapterContent, content => content.chapter)
  contents: ChapterContent[];
} 