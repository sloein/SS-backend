import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class PartInfo {
  @ApiProperty({ description: '分片序号' })
  partNumber: number;

  @ApiProperty({ description: '分片的 ETag' })
  etag: string;
}

export class CompleteMultipartDto {
  @ApiProperty({ description: '上传ID' })
  @IsNotEmpty({ message: '上传ID不能为空' })
  @IsString({ message: '上传ID必须是字符串' })
  uploadID: string;

  @ApiProperty({ description: '文件哈希值' })
  @IsNotEmpty({ message: '文件哈希值不能为空' })
  @IsString({ message: '文件哈希值必须是字符串' })
  fileHash: string;

  @ApiProperty({ description: '对象名称' })
  @IsNotEmpty({ message: '对象名称不能为空' })
  @IsString({ message: '对象名称必须是字符串' })
  objectName: string;

  @ApiProperty({ description: '分片信息数组', type: [PartInfo] })
  @IsArray({ message: '分片信息必须是数组' })
  parts: PartInfo[];
}
