import { Permission } from "../entities/permission.entity";

interface UserInfo {
    id: number;

    username: string;

    nickName: string;

    email: string;

    avatar: string;

    phoneNumber: string;

    isFrozen: boolean;

    isAdmin: boolean;

    createTime: string;

    roles: string[];

    permissions: Permission[]
}
export class LoginUserVo {

    userInfo: UserInfo;

    token: string;

    refreshToken: string;
}

