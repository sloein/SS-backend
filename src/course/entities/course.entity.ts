import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { CourseMaterial } from './material.entity';
import { Chapter } from '../../chapter/entities/chapter.entity';
import { Assignment } from '../../assignment/entities/assignment.entity';


export enum CourseStatus {
  NOT_STARTED = 'not_started',  // 未开始
  IN_PROGRESS = 'in_progress',  // 进行中
  FINISHED = 'finished',        // 已结束
}

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ name: 'cover_image' })
  coverImage: string;

  @Column({
    type: 'enum',
    enum: CourseStatus
  })
  status: CourseStatus;

  @Column({ name: 'start_time', type: 'timestamp', nullable: true })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamp', nullable: true })
  endTime: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToMany(() => User)
  @JoinTable({
      name: 'course_teachers'
  })
  teachers: User[] 

  @OneToMany(() => Chapter, chapter => chapter.course)
  chapters: Chapter[];

  @OneToMany(() => CourseMaterial, material => material.course)
  materials: CourseMaterial[];

  @OneToMany(() => Assignment, assignment => assignment.course)
  assignments: Assignment[];

  @ManyToMany(() => User)
  @JoinTable({
      name: 'course_students'
  })
  students: User[];
}
