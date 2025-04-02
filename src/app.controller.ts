import { Controller, Get, SetMetadata } from '@nestjs/common';
import { AppService } from './app.service';
import { RequirePermission, UserInfo } from './custom.decorator';
import { RequireLogin } from './custom.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  
  @Get('aaa')
  @RequireLogin()
  @RequirePermission('ddd')
  aaaa(@UserInfo() user) {
    
    return user;
  }

  @Get('bbb')
  bbb() {
    return 'bbb';
  }

}
