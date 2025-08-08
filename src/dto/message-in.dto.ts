import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, ArrayMaxSize } from 'class-validator';

export class MessageInDto {
  @IsString()
  @ApiProperty({ type: String })
  query: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: String })
  userName: string = 'UNAUTHORIZED';

  @IsString()
  @ApiProperty({ type: String })
  id: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(2)
  @IsString({ each: true })
  @ApiProperty({ type: [String], required: false })
  images?: string[];

  @IsString()
  @IsOptional()
  @ApiProperty({ type: String, required: false })
  currentPageContent?: string;
}
