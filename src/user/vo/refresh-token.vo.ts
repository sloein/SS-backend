import { ApiProperty } from "@nestjs/swagger";

export class RefreshTokenVo {
    @ApiProperty()
    token: string;

    @ApiProperty()
    refresh_token: string;
}
