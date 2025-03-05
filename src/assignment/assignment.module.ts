import { Module } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { AssignmentController } from './assignment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assignment } from './entities/assignment.entity';
import { Submission } from './entities/submission.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Assignment,
    Submission,
    User
  ])],
  controllers: [AssignmentController],
  providers: [AssignmentService],
  exports: [AssignmentService]
})
export class AssignmentModule {}
