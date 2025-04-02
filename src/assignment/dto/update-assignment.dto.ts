import { PartialType } from '@nestjs/swagger';
import { CreateAssignmentDto } from './create-assignment.dto';
import { IsDateString, IsString } from 'class-validator';

export class UpdateAssignmentDto extends PartialType(CreateAssignmentDto) {


  id: number;

  @IsString({ message: '作业标题必须是字符串' })
  title: string;

  @IsString({ message: '作业描述必须是字符串' })
  description: string;

  @IsDateString({}, { message: '截止日期格式不正确' })
  deadline: Date;

}
