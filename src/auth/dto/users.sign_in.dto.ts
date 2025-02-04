import { IsNotEmpty } from "class-validator";

export class UsersSignInDto {
    @IsNotEmpty()
    login: string;

    @IsNotEmpty()
    password: string;
}
