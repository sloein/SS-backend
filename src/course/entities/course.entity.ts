import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { CourseMaterial } from './course-material.entity';
import { CourseChapter } from './course-chapter.entity';
import { Assignment } from './assignment.entity';
import { StudentCourse } from './student-course.entity';


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

  @Column({ name: 'teacher_id' })
  teacherId: number;

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

  // 关联关系
  @ManyToOne(() => User)
  teacher: User;

  @OneToMany(() => CourseChapter, chapter => chapter.course)
  chapters: CourseChapter[];

  @OneToMany(() => CourseMaterial, material => material.course)
  materials: CourseMaterial[];

  @OneToMany(() => Assignment, assignment => assignment.course)
  assignments: Assignment[];

  @OneToMany(() => StudentCourse, studentCourse => studentCourse.course)
  studentCourses: StudentCourse[];
}
