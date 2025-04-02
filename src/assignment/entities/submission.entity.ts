import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Assignment } from './assignment.entity';
import { User } from '../../user/entities/user.entity';

export enum SubmissionStatus {
  PENDING = 'pending',   // 未批改
  GRADED = 'graded'     // 已批改
}

@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn()
  id: number;


  @Column('text')
  content: string;

  @Column({ name: 'file_url', nullable: true })
  fileUrl: string;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  score: number;

  @Column('text', { nullable: true })
  feedback: string;

  @Column({
    type: 'enum',
    enum: SubmissionStatus,
    default: SubmissionStatus.PENDING
  })
  status: SubmissionStatus;

  @Column({ name: 'submit_time', type: 'timestamp' })
  submitTime: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 关联关系
  @ManyToOne(() => Assignment, assignment => assignment.submissions)
  assignment: Assignment;

  @ManyToOne(() => User)
  student: User;
} 