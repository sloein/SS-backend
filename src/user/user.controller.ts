import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, Query, UnauthorizedException, ParseIntPipe, DefaultValuePipe, UploadedFile, UseInterceptors, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';

import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RequirePermission, UserInfo } from 'src/custom.decorator';
import { RequireLogin } from 'src/custom.decorator';
import { UserDetailVo } from './vo/user-info.vo';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { RedisService } from 'src/redis/redis.service';
import { EmailService } from 'src/email/email.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { generateParseIntPipe } from 'src/utils';
import { ApiTags } from '@nestjs/swagger';
import { RefreshTokenVo } from './vo/refresh-token.vo';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import { storage } from 'src/my-file-storage';

@ApiTags('用户管理模块')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject(ConfigService)
  private configService: ConfigService;

  @Inject(RedisService)
  private redisService: RedisService;

  @Inject(EmailService)
  private emailService: EmailService;

  /**
   * 教师注册
   * @param registerUser 
   * @returns 
   */
  @Post('register')
  async register(@Body() registerUser: RegisterUserDto) {
    return await this.userService.register(registerUser);
  }

  

  /**
   * 发送更改密码验证码
   * @param address 
   * @returns 
   */
  @Get('update_password/captcha')
  @RequireLogin()
  async updatePasswordCaptcha(@Query('address') address: string) {
    const code = Math.random().toString().slice(2, 8);

    await this.redisService.set(`update_password_captcha_${address}`, code, 10 * 60);

    await this.emailService.sendMail({
      to: address,
      subject: '更改密码验证码',
      html: `<p>你的更改密码验证码是 ${code}</p>`
    });
    return '发送成功';
  }

  /**
   * 用户登录
   * @param loginUser 
   * @returns 
   */
  @Post('login')
  @RequirePermission('TC')
  async userLogin(@Body() loginUser: LoginUserDto) {
    const vo = await this.userService.login(loginUser, false);
    // 使用抽离的方法生成token
    const tokens = this.generateTokens(vo);
    vo.token = tokens.token;
    vo.refreshToken = tokens.refresh_token;
    return vo;
  }

  @Get('refresh')
  async refresh(@Query('refreshToken') refreshToken: string) {
    return this.handleTokenRefresh(refreshToken, false);
  }

  @Post('admin/login')
  async adminLogin(@Body() loginUser: LoginUserDto) {
    const vo = await this.userService.login(loginUser, true);
    
    if(!vo.userInfo.isAdmin) {
      throw new HttpException('不是管理员', HttpStatus.BAD_REQUEST);
    }

    // 使用抽离的方法生成token
    const tokens = this.generateTokens(vo);
    vo.token = tokens.token;
    vo.refreshToken = tokens.refresh_token;
    return vo;
  }

  @Get('admin/refresh')
  async adminRefresh(@Query('refreshToken') refreshToken: string) {
    return this.handleTokenRefresh(refreshToken, true);
  }

  @Get('listRouters')
  @RequireLogin()
  async listRouters(@UserInfo('userId') userId: number) {
    return await this.userService.listRouters(userId);
  }


  @Get('info')
  @RequireLogin()
  async info(@UserInfo('userId') userId: number) {
    const user = await this.userService.findUserDetailById(userId);

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

  

    return user;
  }

  /**根据id查询用户信息 */
  @Get('getById/:id')
  @RequireLogin()
  async infoById(@Param('id') id: number) {
    return await this.userService.findUserDetailById(id);
  }

  @Post(['update_password', 'admin/update_password'])
  @RequireLogin()
  async updatePassword(@UserInfo('userId') userId: number, @Body() passwordDto: UpdateUserPasswordDto) {
    return await this.userService.updatePassword(userId, passwordDto);
  }

  @Post(['update', 'admin/update'])
  @RequireLogin()
  async update(@UserInfo('userId') userId: number, @Body() updateUserDto: UpdateUserDto) {
    return await this.userService.update(userId, updateUserDto);
  }

  /**
   * 发送更改用户信息验证码
   */
  @Get('update/captcha')
  async updateCaptcha(@Query('address') address: string) {
    const code = Math.random().toString().slice(2, 8);

    await this.redisService.set(`update_user_captcha_${address}`, code, 10 * 60);

    await this.emailService.sendMail({
      to: address,
      subject: '更改用户信息验证码',
      html: `<p>你的验证码是 ${code}</p>`
    });
    return '发送成功';
  }

  @Get('list')
  async list(
    @Query('pageNo', new DefaultValuePipe(1), generateParseIntPipe('pageNo')) pageNo: number,
    @Query('pageSize', new DefaultValuePipe(2), generateParseIntPipe('pageSize')) pageSize: number,
    @Query('username') username: string,
    @Query('nickName') nickName: string,
    @Query('email') email: string
  ) {
    return await this.userService.findUsers(username, nickName, email, pageNo, pageSize);
  }

  /**
   * 删除用户
   */
  @Get('delete/:id')
  async delete(@Param('id') id: number) {
    return await this.userService.delete(id);
  }

  /**
   * 上传头像
   * @param file 
   * @returns 
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    dest: 'uploads',
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 3
    },
    fileFilter(req, file, callback) {
      const extname = path.extname(file.originalname);
      if (['.png', '.jpg', '.gif'].includes(extname)) {
        callback(null, true);
      } else {
        callback(new BadRequestException('只能上传图片'), false);
      }
    }
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File,@UserInfo('userId') userId: number) {
    return this.userService.uploadAvatar(file,userId);
   
  }



  /**
   * 生成JWT access token
   */
  private generateAccessToken(user: any): string {

    return this.jwtService.sign({
      userId: user.userInfo.id,
      username: user.userInfo.username,
      roles: user.userInfo.roles,
      permissions: user.userInfo.permissions
    }, {
      expiresIn: this.configService.get('jwt_access_token_expires_time') || '30m'
    });
  }

  /**
   * 生成JWT refresh token
   */
  private generateRefreshToken(userId: number): string {
    return this.jwtService.sign({
      userId: userId
    }, {
      expiresIn: this.configService.get('jwt_refresh_token_expres_time') || '7d'
    });
  }

  /**
   * 生成token对象
   */
  private generateTokens(user: any) {
    const access_token = this.generateAccessToken(user);
    const refresh_token = this.generateRefreshToken(user.id);
    const vo = new RefreshTokenVo();
    vo.token = access_token;
    vo.refresh_token = refresh_token;
    return vo;
  }

  /**
   * 处理刷新token的通用逻辑
   */
  private async handleTokenRefresh(refreshToken: string, isAdmin: boolean) {
    try {
      const data = this.jwtService.verify(refreshToken);
      const user = await this.userService.findUserById(data.userId, isAdmin);

      if (!user) {
        throw new UnauthorizedException('token 已失效，请重新登录');
      }

      return this.generateTokens(user);
    } catch (e) {
      throw new UnauthorizedException('token 已失效，请重新登录');
    }
  }

}
