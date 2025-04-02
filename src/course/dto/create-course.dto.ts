import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength, IsArray, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ description: '课程标题' })
  @IsNotEmpty({ message: '课程标题不能为空' })
  @IsString()
  @MaxLength(100, { message: '课程标题不能超过100个字符' })
  title: string;

  @ApiProperty({ description: '课程描述' })
  @IsNotEmpty({ message: '课程描述不能为空' })
  @IsString()
  description: string;

  @ApiProperty({ description: '课程封面图片', required: false })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiProperty({ description: '开始时间', required: false })
  @IsOptional()
  @IsDateString({}, { message: '开始时间格式错误' })
  startTime?: string;

  @ApiProperty({ description: '结束时间', required: false })
  @IsOptional()
  @IsDateString({}, { message: '结束时间格式错误' })
  endTime?: string;

  @ApiProperty({ description: '教师ID数组', type: [Number], required: false })
  @IsArray()
  @IsOptional()
  @IsNumber({}, { each: true, message: '教师ID必须是数字' })
  teacherIds?: number[];
}
