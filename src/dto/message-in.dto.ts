import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

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
}
