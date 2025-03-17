import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { SubmissionStatus } from '../entities/submission.entity';

export class CreateSubmissionDto {

  @IsNotEmpty({ message: 'courseId不能为空' })
  @IsNumber({}, { message: 'courseId必须是数字' })
  courseId: number;

  @IsNotEmpty({ message: '作业内容不能为空' })
  @IsString({ message: '作业内容必须是字符串' })
  content: string;

  @IsOptional()
  @IsString({ message: '文件URL必须是字符串' })
  fileUrl?: string;

  @IsNotEmpty({ message: '未选择作业' })
  assignmentId: number;

}
