import { ApiProperty } from '@nestjs/swagger';

export class QnaItemDto {
  @ApiProperty({
    description: 'Item ID',
    example: '507f1f77bcf86cd799439011',
  })
  _id: string;

  @ApiProperty({
    description: 'Question text',
    example: 'What is Waivio?',
  })
  question: string;

  @ApiProperty({
    description: 'Answer text',
    example: 'Waivio is a decentralized social commerce platform.',
  })
  answer: string;

  @ApiProperty({
    description: 'Topic category',
    example: 'general',
  })
  topic: string;
}

export class QnaItemsResponseDto {
  @ApiProperty({
    description: 'Array of Q&A items',
    type: [QnaItemDto],
  })
  result: QnaItemDto[];

  @ApiProperty({
    description: 'Whether there are more items available',
    example: true,
  })
  hasMore: boolean;
}

export class TopicsResponseDto {
  @ApiProperty({
    description: 'Array of available topics',
    type: [String],
    example: ['general', 'technical', 'business'],
  })
  topics: string[];
}
