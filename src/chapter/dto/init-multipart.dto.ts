import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class InitMultipartDto {
  filename: string;
  contentType?: string;

  @ApiProperty({ description: '文件名' })
 
  fileName: string;

  @ApiProperty({ description: '文件大小（字节）' })

  fileSize: number;

  @ApiProperty({ description: '文件MD5哈希值' })
  
  fileHash: string;

  @ApiProperty({ description: '文件类型' })
 
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
