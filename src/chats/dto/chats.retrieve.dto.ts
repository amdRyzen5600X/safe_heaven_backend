import { MessageDto } from "src/messages/dto/messages.dto";

export class ChatsRetrieveDto {
    id: string;
    name: string;
    lastMessage: MessageDto;
    messages: MessageDto[];
}
