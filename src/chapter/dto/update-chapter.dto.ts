import { PartialType } from '@nestjs/swagger';
import { CreateChapterDto } from './create-chapter.dto';
import { IsArray, IsNotEmpty, IsOptional, ValidateNested, IsString, MaxLength, Min, IsInt } from 'class-validator';
import { IsNumber } from 'class-validator';
import { Content } from '../entities/content.entity';
import { Type } from 'class-transformer';

export class UpdateChapterDto extends PartialType(CreateChapterDto) {

    @IsNotEmpty({ message: '章节ID不能为空' })
    @IsNumber({}, { message: '章节ID必须是数字' })
    id: number;

    @IsOptional()
    @IsString({ message: '章节标题必须是字符串' })
    @MaxLength(100, { message: '章节标题最多100个字符' })
    title?: string;

    @IsOptional()
    @IsString({ message: '章节描述必须是字符串' })
    description?: string;

    @IsOptional()
    @IsInt({ message: '排序顺序必须是整数' })
    @Min(0, { message: '排序顺序不能小于0' })
    order?: number;
}
