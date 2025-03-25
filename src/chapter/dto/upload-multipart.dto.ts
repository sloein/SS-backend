import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UploadMultipartDto {
    @ApiProperty({ description: '上传ID' })
    @IsNotEmpty({ message: '上传ID不能为空' })
    @IsString({ message: '上传ID必须是字符串' })
    uploadID: string;

    @ApiProperty({ description: '分片序号' })
    @IsNotEmpty({ message: '分片序号不能为空' })
    partNumber: number;
    
    @ApiProperty({ description: '文件分片' })
    chunk: Buffer;

    @ApiProperty({ description: '存储桶名称' })
    @IsNotEmpty({ message: '存储桶名称不能为空' })
    @IsString({ message: '存储桶名称必须是字符串' })
    bucketName: string;

    @ApiProperty({ description: '对象名称' })
    @IsNotEmpty({ message: '对象名称不能为空' })
    @IsString({ message: '对象名称必须是字符串' })
    objectName: string;
}