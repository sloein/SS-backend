import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';
import { SubmissionStatus } from '../entities/submission.entity';

export class UpdateSubmissionDto {
  @IsNotEmpty({ message: '提交ID不能为空' })
  @IsNumber({}, { message: '提交ID必须是数字' })
  id: number;

  @IsNotEmpty({ message: '分数不能为空' })
  @IsNumber({}, { message: '分数必须是数字' })
  score: number;

  @IsOptional()
  @IsString({ message: '反馈必须是字符串' })
  feedback?: string;

  status: SubmissionStatus = SubmissionStatus.GRADED;
}
