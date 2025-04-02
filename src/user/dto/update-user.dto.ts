import { IsEmail, IsNotEmpty, IsOptional, IsArray, IsNumber } from "class-validator";

export class UpdateUserDto {

    id: number;

    avatar: string;

    nickName: string;
    
 

    email: string;
    
    captcha: string;

    @IsOptional()
    @IsArray({
        message: '角色必须是数组'
    })
    @IsNumber({}, {
        each: true,
        message: '角色ID必须是数字'
    })
    roleIds?: number[];
}
