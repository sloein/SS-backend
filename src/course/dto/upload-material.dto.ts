import { IsEnum, IsNotEmpty, IsNumber, IsString, IsUrl } from 'class-validator';

// export enum MaterialType {
//   DOCUMENT = 'document',
//   VIDEO = 'video',
//   LINK = 'link'
// }

export class UploadMaterialDto {
  @IsNotEmpty({ message: '标题不能为空' })
  @IsString()
  title: string;

  @IsNotEmpty({ message: '类型不能为空' })
 
  type: string;

  @IsNotEmpty({ message: 'URL不能为空' })
  @IsUrl({}, { message: 'URL格式不正确' })
  url: string;

  @IsNotEmpty({ message: '课程ID不能为空' })
  @IsNumber()
  courseId: number;

  @IsNotEmpty({ message: '文件大小不能为空' })
  @IsNumber()
  fileSize: number;
}
