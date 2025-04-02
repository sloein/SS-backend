import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UploadMultipartDto {
  
    partNumber: number;


    uploadId: string;


    file: any;
}