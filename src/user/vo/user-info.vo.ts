export class UserDetailVo {
    id: number;

    username: string;

    nickName: string;

    email: string;

    avatar: string;

    phoneNumber: string;

    isFrozen: boolean;

    createTime: Date;

    roles: string[];

    permissions: string[];  

    isAdmin: boolean;
}
