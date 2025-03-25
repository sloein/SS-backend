import { IsEnum, IsNumber, IsString } from "class-validator";

import { IsNotEmpty } from "class-validator";

export class CreateContentDto {
    @IsNotEmpty({ message: '章节ID不能为空' })
    @IsNumber({}, { message: '章节ID必须是数字' })
    chapterId: number;

    @IsNotEmpty({ message: '内容标题不能为空' })
    @IsString({ message: '内容标题必须是字符串' })
    title: string;  
 
    @IsNotEmpty({ message: '内容类型不能为空' })
    type: string;

    @IsNotEmpty({ message: '内容URL不能为空' })
    @IsString({ message: '内容URL必须是字符串' })
    contentUrl: string;

    @IsNotEmpty({ message: '排序顺序不能为空' })
    @IsNumber({}, { message: '排序顺序必须是数字' })
    order: number;

    //hash
    @IsNotEmpty({ message: '文件哈希值不能为空' })
    @IsString({ message: '文件哈希值必须是字符串' })
    fileHash: string;

}
    
