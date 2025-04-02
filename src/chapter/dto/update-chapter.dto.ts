import { PartialType } from '@nestjs/swagger';
import { CreateChapterDto } from './create-chapter.dto';
import { IsArray, IsNotEmpty, IsOptional, ValidateNested, IsString, MaxLength, Min, IsInt } from 'class-validator';
import { IsNumber } from 'class-validator';
import { Content } from '../entities/content.entity';
import { Type } from 'class-transformer';

export class UpdateChapterDto extends PartialType(CreateChapterDto) {


    id: number;

 
    title?: string;

    description?: string;

    
    order?: number;
}
