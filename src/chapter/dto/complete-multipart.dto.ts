import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class PartInfo {
  @ApiProperty({ description: '分片序号' })
  partNumber: number;

  @ApiProperty({ description: '分片的 ETag' })
  etag: string;
}

export class CompleteMultipartDto {

  uploadId: string;

 
  key: string;

 
  objectName: string;


  parts: PartInfo[];


  etags: string[];
}
