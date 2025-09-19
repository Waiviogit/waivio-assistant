import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateQnaItemDto {
  @ApiProperty({
    description: 'Question text',
    example: 'What is Waivio?',
    required: false,
  })
  @IsString()
  @IsOptional()
  question?: string;

  @ApiProperty({
    description: 'Answer text',
    example: 'Waivio is a decentralized social commerce platform.',
    required: false,
  })
  @IsString()
  @IsOptional()
  answer?: string;

  @ApiProperty({
    description: 'Topic category',
    example: 'general',
    required: false,
  })
  @IsString()
  @IsOptional()
  topic?: string;
}
