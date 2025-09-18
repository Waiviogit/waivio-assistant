import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  QnaItemDto,
  QnaItemsResponseDto,
  TopicsResponseDto,
} from '../../dto/qna-item-out.dto';

export class QnaControllerDoc {
  static main(): ClassDecorator {
    return applyDecorators(
      ApiTags('qna'),
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

  static getTopics(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'Get all available topics',
        description:
          'Returns a list of all distinct topics available in the Q&A system',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'List of topics',
        type: TopicsResponseDto,
      }),
    );
  }

  static getQnaItems(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'Get Q&A items',
        description:
          'Get Q&A items with optional topic filtering and pagination',
      }),
      ApiQuery({
        name: 'topic',
        required: false,
        description: 'Filter by topic',
        type: String,
      }),
      ApiQuery({
        name: 'skip',
        required: false,
        description: 'Number of items to skip for pagination',
        type: Number,
        example: 0,
      }),
      ApiQuery({
        name: 'limit',
        required: false,
        description: 'Maximum number of items to return',
        type: Number,
        example: 10,
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'Q&A items with pagination info',
        type: QnaItemsResponseDto,
      }),
    );
  }

  static createQnaItem(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'Create new Q&A item',
        description: 'Create a new Q&A item with question, answer, and topic',
      }),
      ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Q&A item created successfully',
        type: QnaItemDto,
      }),
    );
  }

  static updateQnaItem(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'Update Q&A item',
        description:
          'Update an existing Q&A item by ID. At least one field is required.',
      }),
      ApiParam({
        name: 'id',
        description: 'Q&A item ID',
        type: String,
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'Q&A item updated successfully',
        type: QnaItemDto,
      }),
      ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Q&A item not found',
      }),
    );
  }

  static deleteQnaItem(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'Delete Q&A item',
        description: 'Delete a Q&A item by ID',
      }),
      ApiParam({
        name: 'id',
        description: 'Q&A item ID',
        type: String,
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'Q&A item deleted successfully',
      }),
      ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Q&A item not found',
      }),
    );
  }

  static migrateToWeaviate(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'Migrate Q&A data to Weaviate',
        description:
          'Migrates all Q&A data from MongoDB to Weaviate vector store for semantic search. This will drop the existing Weaviate collection and recreate it with all current Q&A data.',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'Migration completed successfully',
        schema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'QA data migration to Weaviate completed successfully',
            },
            migrated: {
              type: 'number',
              example: 153,
              description: 'Number of Q&A items migrated',
            },
          },
        },
      }),
      ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Migration failed',
        schema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Migration failed: Connection to Weaviate failed',
            },
          },
        },
      }),
    );
  }
}
