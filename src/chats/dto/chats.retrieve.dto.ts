import { MessageDto } from "src/messages/dto/messages.dto";

export class ChatsRetrieveDto {
    id: string;
    name: string;
    isPending: boolean;
    isRequestedUser: boolean;
    lastMessage: MessageDto;
    messages: MessageDto[];
}
