import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCourseDto {
  @IsNotEmpty({ message: '课程标题不能为空' })
  @IsString()
  @MaxLength(100, { message: '课程标题不能超过100个字符' })
  title: string;

  @IsNotEmpty({ message: '课程描述不能为空' })
  @IsString()
  description: string;

  @IsNotEmpty({ message: '课程封面图片不能为空' })
  @IsString()
  coverImage: string;

  @IsOptional()
  @IsDateString({}, { message: '开始时间格式错误' })
  startTime?: string;

  @IsOptional()
  @IsDateString({}, { message: '结束时间格式错误' })
  endTime?: string;
}
