import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { formatDate, md5 } from '../utils';
import { Between, In, Like, Repository } from 'typeorm';
import { RegisterUserDto } from './dto/register-user.dto';
import { User } from './entities/user.entity';
import { RedisService } from 'src/redis/redis.service';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginUserVo } from './vo/login-user.vo';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserListVo } from './vo/user-list.vo';
import { Router } from './entities/router.entity';
import { UserDetailVo } from './vo/user-info.vo';
@Injectable()
export class UserService {
    private logger = new Logger();

    @InjectRepository(User)
    private userRepository: Repository<User>;

    @InjectRepository(Role)
    private roleRepository: Repository<Role>;

    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>;

    @InjectRepository(Router)
    private routerRepository: Repository<Router>;

    @Inject(RedisService)
    private redisService: RedisService;

    async register(user: RegisterUserDto) {
        const captcha = await this.redisService.get(`captcha_${user.email}`);

        console.log(captcha);

        if (!captcha) {
            throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
        }

        if (user.captcha !== captcha) {
            throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
        }

        const foundUser = await this.userRepository.findOneBy({
            username: user.username
        });

        if (foundUser) {
            throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST);
        }

        const newUser = new User();
        newUser.username = user.username;
        newUser.password = md5(user.password);
        const teacherRole = await this.roleRepository.findOneBy({
            id: 3
        });
        if (!teacherRole) {
            throw new HttpException('老师角色不存在', HttpStatus.BAD_REQUEST);
        }
        newUser.roles = [teacherRole];
        newUser.email = user.email;
        newUser.nickName = user.nickName;
        //路由里menuId为100到199的添加进去
        const routers = await this.routerRepository.find({
            where: {
                menuId: Between(100, 199)
            }
        });
        newUser.routers = routers;

        try {
            await this.userRepository.save(newUser);
            return '注册成功';
        } catch (e) {
            this.logger.error(e, UserService);
            return '注册失败';
        }
    }

    async login(loginUserDto: LoginUserDto, isAdmin: boolean) {
        const user = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.roles', 'roles')
        .leftJoinAndSelect('roles.permissions', 'permissions')
        .where('user.username = :username', { username: loginUserDto.username })
        .getOne();

        if (!user) {
            throw new HttpException('用户不存在', HttpStatus.UNAUTHORIZED);
        }

        if (user.password !== md5(loginUserDto.password)) {
            throw new HttpException('密码错误', HttpStatus.UNAUTHORIZED);
        }
        
        const vo = new LoginUserVo();
        vo.userInfo = {
            id: user.id,
            username: user.username,
            nickName: user.nickName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            avatar: user.avatar,
            createTime: formatDate(user.createTime),
            isFrozen: user.isFrozen,
            isAdmin: user.isAdmin,
            roles: user.roles.map(item => item.name),
            permissions: [
                ...new Map(
                    user.roles
                        .flatMap(role => role.permissions)
                        .map(item => [item.code, item])
                ).values()
            ]
        }


        return vo;
    }

    async delete(id: number) {
        const user = await this.userRepository.findOneBy({ id });
        if (!user) {
            throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
        }
        await this.userRepository.delete(id);
        return '删除成功';
    }

    async findUsersByPage(pageNo: number, pageSize: number) {
        const skipCount = (pageNo - 1) * pageSize;

        const [users, totalCount] = await this.userRepository.findAndCount({
            select: ['id', 'username', 'nickName', 'email', 'phoneNumber', 'isFrozen', 'avatar', 'createTime'],
            skip: skipCount,
            take: pageSize
        });

        return {
            users,
            totalCount
        }
    }

    async findUsers(username: string, nickName: string, email: string, pageNo: number, pageSize: number) {
        const skipCount = (pageNo - 1) * pageSize;

        const condition: Record<string, any> = {};

        if (username) {
            condition.username = Like(`%${username}%`);
        }
        if (nickName) {
            condition.nickName = Like(`%${nickName}%`);
        }
        if (email) {
            condition.email = Like(`%${email}%`);
        }

        const [users, totalCount] = await this.userRepository.findAndCount({
            select: ['id', 'username', 'nickName', 'email', 'phoneNumber', 'isFrozen', 'avatar', 'createTime'],
            skip: skipCount,
            take: pageSize,
            where: condition
        });
        const vo = new UserListVo();
        vo.users = users.map(user => ({
            ...user,
            createTime: formatDate(user.createTime)
        }));    
        vo.totalCount = totalCount;
        return vo;
    }

    async listRouters(userId: number) {
        const user = await this.userRepository.findOne({
            where: {
                id: userId
            },
            relations: ['routers']
        });
        if (!user) {
            throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
        }
        return user.routers;
    }

    async findUserById(userId: number, isAdmin: boolean) {
        const user = await this.userRepository.findOne({
            where: {
                id: userId,
                isAdmin
            },
            relations: ['roles', 'roles.permissions']
        });
        if (user) {
            return {
                id: user.id,
                username: user.username,
                isAdmin: user.isAdmin,
                roles: user.roles.map(item => item.name),
                permissions: user.roles.reduce((arr: Permission[], item) => {
                    item.permissions.forEach(permission => {
                        if (arr.indexOf(permission) === -1) {
                            arr.push(permission);
                        }
                    })
                    return arr;
                }, [])
            }
        }
        console.log("findUserById失败");
        return null;

    }

    async findUserDetailById(userId: number) {
        const user = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.roles', 'roles')
        .leftJoinAndSelect('roles.permissions', 'permissions')
        .where('user.id = :id', { id: userId })
        .getOne();

        if (!user) {
            throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
        }

        console.log('uuuuuuuuuuser',user);

        const vo = new UserDetailVo();
        vo.id = user.id;
        vo.isAdmin = user.isAdmin;
        vo.username = user.username;
        vo.nickName = user.nickName;
        vo.email = user.email;
        vo.avatar = user.avatar;
        vo.phoneNumber = user.phoneNumber;
        vo.roles = user.roles.map(item => item.name);
       
        console.log('vo',vo.roles);

        return vo;
    }

    async updatePassword(userId: number, passwordDto: UpdateUserPasswordDto) {
        const captcha = await this.redisService.get(`update_password_captcha_${passwordDto.email}`);

        if (!captcha) {
            throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
        }

        if (passwordDto.captcha !== captcha) {
            throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
        }

        const foundUser = await this.userRepository.findOneBy({
            id: userId
        });

        if (!foundUser) {
            throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
        }

        foundUser.password = md5(passwordDto.password);

        try {
            await this.userRepository.save(foundUser);
            return '密码修改成功';
        } catch (e) {
            this.logger.error(e, UserService);
            return '密码修改失败';
        }
    }

    async update(userId: number, updateUserDto: UpdateUserDto) {
        const captcha = await this.redisService.get(`update_user_captcha_${updateUserDto.email}`);


        if (updateUserDto.captcha && updateUserDto.captcha !== captcha) {
            throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
        }

        const cfID = updateUserDto.id?updateUserDto.id:userId;

        const foundUser = await this.userRepository.findOne({
            where: { id: cfID },
            relations: ['roles']
        });

        if (!foundUser) {
            throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
        }

        if (updateUserDto.nickName) {
            foundUser.nickName = updateUserDto.nickName;
        }
        if (updateUserDto.avatar) {
            foundUser.avatar = updateUserDto.avatar;
        }

        if (updateUserDto.roleIds && updateUserDto.roleIds.length > 0) {
            const roles = await this.roleRepository.find({
                where: {
                    id: In(updateUserDto.roleIds)
                }
            });
            
            if (roles.length !== updateUserDto.roleIds.length) {
                throw new HttpException('存在无效的角色ID', HttpStatus.BAD_REQUEST);
            }
            
            foundUser.roles = roles;
        }

        try {
            await this.userRepository.save(foundUser);
            return '用户信息修改成功';
        } catch (e) {
            this.logger.error(e, UserService);
            return '用户信息修改失败';
        }
    }

    async uploadAvatar(file: Express.Multer.File,userId: number) {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) {
            throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
        }
        user.avatar = 'http://localhost:3000/uploads/'+file.filename;
        await this.userRepository.save(user);
        const user1 = await this.userRepository.findOneBy({ id: userId });
        console.log('user1**',user1);
        return '头像上传成功';
    }
}

