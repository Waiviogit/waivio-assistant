import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import { MessageOutDto } from './dto/message-out.dto';
import { HistoryOutDto } from './dto/history-out.dto';

export class AppControllerDoc {
  static main(): ClassDecorator {
    return applyDecorators(
      ApiTags('assistant'),
      ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Forbidden',
      }),
      ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
      }),
      ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error',
      }),
    );
  }

  static writeMessage(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'send message',
        description: 'send message',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'blacklist',
        type: MessageOutDto,
      }),
    );
  }

  static getHistory(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'get history',
        description: 'get history',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'blacklist',
        type: HistoryOutDto,
      }),
    );
  }
}
