import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QnaService } from './qna.service';
import { CreateQnaItemDto } from '../dto/qna-item-in.dto';
import { UpdateQnaItemDto } from '../dto/qna-item-update.dto';
import {
  QnaItemDto,
  QnaItemsResponseDto,
  TopicsResponseDto,
} from '../dto/qna-item-out.dto';
import { QnaControllerDoc } from './qna.controller.doc';
import { QAWeaviateMigrationService } from '../cli/migrate-qa-to-weaviate';
import { AuthGuard, AdminGuard } from '../guards';

@Controller('qna')
@QnaControllerDoc.main()
export class QnaController {
  constructor(
    private readonly qnaService: QnaService,
    private readonly migrationService: QAWeaviateMigrationService,
  ) {}

  @Get('topics')
  @UseGuards(AuthGuard, AdminGuard)
  @QnaControllerDoc.getTopics()
  async getTopics(): Promise<TopicsResponseDto> {
    const topics = await this.qnaService.getTopics();
    return { topics };
  }

  @Get()
  @UseGuards(AuthGuard, AdminGuard)
  @QnaControllerDoc.getQnaItems()
  async getQnaItems(
    @Query('topic') topic?: string,
    @Query('skip') skip?: string,
    @Query('limit') limit?: string,
  ): Promise<QnaItemsResponseDto> {
    const skipNum = skip ? parseInt(skip, 10) : 0;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    if (isNaN(skipNum) || skipNum < 0) {
      throw new HttpException('Invalid skip parameter', HttpStatus.BAD_REQUEST);
    }

    if (isNaN(limitNum) || limitNum <= 0 || limitNum > 100) {
      throw new HttpException(
        'Invalid limit parameter (must be between 1 and 100)',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.qnaService.getQnaItems(topic, skipNum, limitNum);
  }

  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  @QnaControllerDoc.createQnaItem()
  async createQnaItem(
    @Body() createQnaItemDto: CreateQnaItemDto,
  ): Promise<QnaItemDto> {
    const result = await this.qnaService.createQnaItem(createQnaItemDto);
    if (!result) {
      throw new HttpException(
        'Failed to create Q&A item',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return result;
  }

  @Patch(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @QnaControllerDoc.updateQnaItem()
  async updateQnaItem(
    @Param('id') id: string,
    @Body() updateQnaItemDto: UpdateQnaItemDto,
  ): Promise<QnaItemDto> {
    // Validate that at least one field is provided
    const { question, answer, topic } = updateQnaItemDto;
    if (!question && !answer && !topic) {
      throw new HttpException(
        'At least one field (question, answer, or topic) must be provided',
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.qnaService.updateQnaItem(id, updateQnaItemDto);
    if (!result) {
      throw new HttpException('Q&A item not found', HttpStatus.NOT_FOUND);
    }
    return result;
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @QnaControllerDoc.deleteQnaItem()
  async deleteQnaItem(@Param('id') id: string): Promise<{ message: string }> {
    const result = await this.qnaService.deleteQnaItem(id);
    if (!result) {
      throw new HttpException('Q&A item not found', HttpStatus.NOT_FOUND);
    }
    return { message: 'Q&A item deleted successfully' };
  }

  @Post('migrate-to-weaviate')
  @UseGuards(AuthGuard, AdminGuard)
  @QnaControllerDoc.migrateToWeaviate()
  async migrateToWeaviate(): Promise<{ message: string; migrated: number }> {
    try {
      // Get total count before migration
      const totalCount = await this.qnaService.getTotalCount();

      // Run the migration
      await this.migrationService.migrateQADataToWeaviate();

      return {
        message: 'QA data migration to Weaviate completed successfully',
        migrated: totalCount,
      };
    } catch (error) {
      throw new HttpException(
        `Migration failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
