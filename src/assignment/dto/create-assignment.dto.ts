import { OmitType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDateString } from 'class-validator';
import { Assignment } from "../entities/assignment.entity";

export class CreateAssignmentDto {
  @IsNotEmpty({ message: '作业标题不能为空' })
  @IsString({ message: '作业标题必须是字符串' })
  title: string;

  @IsNotEmpty({ message: '作业描述不能为空' })
  @IsString({ message: '作业描述必须是字符串' })
  description: string;

  @IsNotEmpty({ message: '截止日期不能为空' })
  @IsDateString({}, { message: '截止日期格式不正确' })
  deadline: Date;

  @IsNotEmpty({ message: '未选择课程' })
  courseId: number;
}