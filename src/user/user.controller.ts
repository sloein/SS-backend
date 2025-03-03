import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, Query, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';

import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject(ConfigService)
  private configService: ConfigService;

  @Post('register')
  async register(@Body() registerUser: RegisterUserDto) {
    return await this.userService.register(registerUser);
  }

  @Get("init-data")
  async initData() {
    await this.userService.initData();
    return 'done';
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

    return { access_token, refresh_token };
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

  @Post('login')
  async userLogin(@Body() loginUser: LoginUserDto) {
    const vo = await this.userService.login(loginUser, false);
    // 使用抽离的方法生成token
    const tokens = this.generateTokens(vo);
    vo.accessToken = tokens.access_token;
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
    
    // 使用抽离的方法生成token
    const tokens = this.generateTokens(vo);
    vo.accessToken = tokens.access_token;
    vo.refreshToken = tokens.refresh_token;
    return vo;
  }

  @Get('admin/refresh')
  async adminRefresh(@Query('refreshToken') refreshToken: string) {
    return this.handleTokenRefresh(refreshToken, true);
  }
}
