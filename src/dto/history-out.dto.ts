import { historyType } from '../assistant';
import { MessageContent, MessageType } from '@langchain/core/messages';
import { ApiProperty } from '@nestjs/swagger';

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
