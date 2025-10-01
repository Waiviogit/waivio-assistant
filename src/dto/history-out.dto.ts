import { MessageContent, MessageType } from '@langchain/core/messages';
import { ApiProperty } from '@nestjs/swagger';
import { historyType } from '../rest/assistant/assistant.service';

class HistoryDto {
  @ApiProperty({ type: String })
  id: `${string}-${string}-${string}-${string}-${string}`;
  @ApiProperty({ type: String })
  text: MessageContent;
  @ApiProperty({ type: String })
  role: MessageType;
}

export class HistoryOutDto {
  @ApiProperty({ type: () => [HistoryDto] })
  result: historyType[];
}
