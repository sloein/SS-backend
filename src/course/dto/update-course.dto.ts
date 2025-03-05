import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseDto } from './create-course.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { CourseStatus } from '../entities/course.entity';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {

    @ApiProperty({ description: '课程ID', required: true })
    @IsNotEmpty({ message: '课程不存在' })
    @IsNumber({}, { message: '课程ID必须是数字' })
    id: number;

    @ApiProperty({ description: '课程状态', enum: CourseStatus, required: false })
    @IsOptional()
    @IsEnum(CourseStatus, { message: '课程状态不正确' })
    status?: CourseStatus;

    @ApiProperty({ description: '教师ID数组', type: [Number], required: false })
    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true, message: '教师ID必须是数字' })
    teacherIds?: number[];
}
