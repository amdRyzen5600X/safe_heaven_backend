import { IsNotEmpty, IsString } from "class-validator";

export class MessagesSendDto {
    @IsString()
    @IsNotEmpty()
    content: string;
}
