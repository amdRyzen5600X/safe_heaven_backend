import { IsNotEmpty, IsString } from "class-validator";

export class UsersRefreshDto {
    @IsNotEmpty()
    @IsString()
    refresh_token: string;
}
