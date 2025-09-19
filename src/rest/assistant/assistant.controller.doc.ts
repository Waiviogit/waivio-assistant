import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import { MessageOutDto } from '../../dto/message-out.dto';
import { HistoryOutDto } from '../../dto/history-out.dto';

export class AssistantControllerDoc {
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
        summary: 'Send message to assistant',
        description:
          'Send message to the AI assistant. Use /imagine at the start of query to trigger image generation. If images are in body and /imagine is at the start of query, edit command will run.',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'Assistant response',
        type: MessageOutDto,
      }),
    );
  }

  static getHistory(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'Get chat history',
        description: 'Get chat history for a specific session ID',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'Chat history',
        type: HistoryOutDto,
      }),
    );
  }
}
