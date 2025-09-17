import { Injectable } from '@nestjs/common';
import { AgentQaRepository } from '../persistance/agent-qa/agent-qa.repository';
import { CreateQnaItemDto } from '../dto/qna-item-in.dto';
import { UpdateQnaItemDto } from '../dto/qna-item-update.dto';
import { QnaItemDto, QnaItemsResponseDto } from '../dto/qna-item-out.dto';
import { AgentQADocType } from '../persistance/agent-qa/types';

@Injectable()
export class QnaService {
  constructor(private readonly agentQaRepository: AgentQaRepository) {}

  async getTopics(): Promise<string[]> {
    return this.agentQaRepository.getDistinctTopics();
  }

  async getQnaItems(
    topic?: string,
    skip: number = 0,
    limit: number = 10,
  ): Promise<QnaItemsResponseDto> {
    const { result, hasMore } = await this.agentQaRepository.getQnaItemsByTopic(
      topic,
      skip,
      limit,
    );

    return {
      result: result.map(this.mapToDto),
      hasMore,
    };
  }

  async createQnaItem(
    createQnaItemDto: CreateQnaItemDto,
  ): Promise<QnaItemDto | null> {
    const result = await this.agentQaRepository.create(createQnaItemDto);
    return result ? this.mapToDto(result) : null;
  }

  async updateQnaItem(
    id: string,
    updateQnaItemDto: UpdateQnaItemDto,
  ): Promise<QnaItemDto | null> {
    const result = await this.agentQaRepository.findOneAndUpdate({
      filter: { _id: id },
      update: updateQnaItemDto,
      options: { new: true },
    });
    return result ? this.mapToDto(result) : null;
  }

  async deleteQnaItem(id: string): Promise<boolean> {
    const result = await this.agentQaRepository.deleteOne({
      filter: { _id: id },
    });
    return result.deletedCount > 0;
  }

  private mapToDto(doc: AgentQADocType): QnaItemDto {
    return {
      _id: doc._id.toString(),
      question: doc.question,
      answer: doc.answer,
      topic: doc.topic,
    };
  }
}
