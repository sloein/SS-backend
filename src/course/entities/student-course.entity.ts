import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Course } from './course.entity';
import { User } from '../../user/entities/user.entity';

@Entity('student_courses')
export class StudentCourse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'student_id' })
  studentId: number;

  @Column({ name: 'course_id' })
  courseId: number;

  @Column('decimal', { precision: 5, scale: 2 })
  progress: number;

  @Column({ name: 'last_learn_time', type: 'timestamp' })
  lastLearnTime: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 关联关系
  @ManyToOne(() => User)
  student: User;

  @ManyToOne(() => Course, course => course.studentCourses)
  course: Course;
} 