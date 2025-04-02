import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Course } from './course.entity';

// export enum MaterialType {
//   DOCUMENT = 'document', // 文档
//   VIDEO = 'video',      // 视频
//   LINK = 'link'         // 链接
// }


@Entity('course_materials')
export class CourseMaterial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  // @Column({
  //   type: 'enum',
  //   enum: MaterialType
  // })
  // type: MaterialType;

  @Column({
    length: 2048,  // 增加长度限制
    comment: '文件URL'
  })
  type: string;
  @Column()
  url: string;


  @Column({ name: 'file_hash', nullable: true })
  fileHash: string;

  @Column({ name: 'file_size', nullable: true })
  fileSize: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 关联关系
  @ManyToOne(() => Course, course => course.materials)
  course: Course;
} 