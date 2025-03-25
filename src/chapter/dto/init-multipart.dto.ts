import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class InitMultipartDto {

  chapterId:number;

  @ApiProperty({ description: '文件名' })
  @IsNotEmpty({ message: '文件名不能为空' })
  @IsString({ message: '文件名必须是字符串' })
  fileName: string;

  @ApiProperty({ description: '文件大小（字节）' })
  @IsNotEmpty({ message: '文件大小不能为空' })
  @IsNumber({}, { message: '文件大小必须是数字' })
  @Min(1, { message: '文件大小必须大于0' })
  fileSize: number;

  @ApiProperty({ description: '文件MD5哈希值' })
  @IsNotEmpty({ message: '文件哈希值不能为空' })
  @IsString({ message: '文件哈希值必须是字符串' })
  fileHash: string;

 

  @ApiProperty({ description: '文件类型' })
  @IsNotEmpty({ message: '文件类型不能为空' })
  @IsString({ message: '文件类型必须是字符串' })
  type: string;

  contentUrl: string;


}

export class InitMultipartVo {
  @ApiProperty({ description: '上传ID' })
  uploadId: string;

  @ApiProperty({ description: '文件是否已存在' })
  exists: boolean;

  @ApiProperty({ description: '文件URL（如果已存在）', required: false })
  url?: string;

  @ApiProperty({ description: '文件ID（如果已存在）', required: false })
  fileId?: number;
}
