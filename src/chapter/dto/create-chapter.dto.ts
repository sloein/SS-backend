import { IsArray, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength, Min, ValidateNested } from 'class-validator';
import { Content } from '../entities/content.entity';
import { Type } from 'class-transformer';
export class CreateChapterDto {
    @IsNotEmpty({ message: '章节标题不能为空' })
    @IsString({ message: '章节标题必须是字符串' })
    @MaxLength(100, { message: '章节标题最多100个字符' })
    title: string;

    @IsOptional()
    @IsString({ message: '章节描述必须是字符串' })
    description?: string;

    @IsOptional()
    @IsInt({ message: '排序顺序必须是整数' })
    @Min(0, { message: '排序顺序不能小于0' })
    order?: number;

    @IsNotEmpty({ message: '课程ID不能为空' })
    @IsInt({ message: '课程ID必须是整数' })
    @IsPositive({ message: '课程ID必须是正数' })
    courseId: number;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Content)
    contents?: Content[];
    
}
