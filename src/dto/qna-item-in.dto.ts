import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateQnaItemDto {
  @ApiProperty({
    description: 'Question text',
    example: 'What is Waivio?',
  })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    description: 'Answer text',
    example: 'Waivio is a decentralized social commerce platform.',
  })
  @IsString()
  @IsNotEmpty()
  answer: string;

  @ApiProperty({
    description: 'Topic category',
    example: 'general',
  })
  @IsString()
  @IsNotEmpty()
  topic: string;
}
