import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class UpdateChapterTitleDto {
  @ApiProperty({ description: '章节ID' })
  @IsNumber()
  @IsNotEmpty({ message: '章节ID不能为空' })
  chapterId: number;

  @ApiProperty({ description: '新的章节标题' })
  @IsString()
  @IsNotEmpty({ message: '章节标题不能为空' })
  @MaxLength(100, { message: '章节标题不能超过100个字符' })
  title: string;
} 