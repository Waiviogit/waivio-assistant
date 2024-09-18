import { BaseMessage } from '@langchain/core/messages';
import { ApiProperty } from '@nestjs/swagger';

class Kwargs {
  @ApiProperty({ type: String })
  content: string;
}
class BaseMessageDto {
  @ApiProperty({ type: () => Kwargs })
  kwargs: object;
}

export class MessageOutDto {
  @ApiProperty({ type: () => BaseMessageDto })
  result: BaseMessage;
}
