import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { Router } from './entities/router.entity';
import { EmailModule } from 'src/email/email.module';
import { RedisModule } from 'src/redis/redis.module';
@Module({
  imports: [TypeOrmModule.forFeature([User,Role,Permission,Router]),EmailModule,RedisModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
