import { ApiProperty } from '@nestjs/swagger';



export class CheckExistDto{

  @ApiProperty({ description: '文件哈希值' })
  fileHash: string;

  @ApiProperty({ description: '文件名' })
  fileName: string;

  @ApiProperty({ description: '文件大小' })
  fileSize: number;;
} 