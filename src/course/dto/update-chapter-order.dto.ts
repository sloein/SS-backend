import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';

export class UpdateChapterOrderDto {
    @ApiProperty({ description: '课程ID' })
    @IsNumber()
    courseId: number;

    @ApiProperty({ description: '章节ID数组，表示新的顺序' })
    @IsArray()
    @IsNumber({}, { each: true })
    chapterIds: number[];
} 