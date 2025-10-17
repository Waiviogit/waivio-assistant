import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AgentQA } from './agent-qa.schema';

import { AgentQaRepositoryInterface } from './interface';
import { MongoRepository } from '../mongo.repository';
import { AgentQADocType } from './types';
import { CONNECTION_MONGO } from '../../database/database.module';

export class AgentQaRepository
  extends MongoRepository<AgentQADocType>
  implements AgentQaRepositoryInterface
{
  constructor(
    @InjectModel(AgentQA.name, CONNECTION_MONGO.WAIVIO)
    protected readonly model: Model<AgentQADocType>,
  ) {
    super(model, new Logger(AgentQaRepository.name));
  }

  async getDistinctTopics(): Promise<string[]> {
    try {
      return await this.model.distinct('topic').lean();
    } catch (error) {
      this.logger.error('Error getting distinct topics:', error.message);
      return [];
    }
  }

  async getQnaItemsByTopic(
    topic?: string,
    skip: number = 0,
    limit: number = 10,
  ): Promise<{ result: AgentQADocType[]; hasMore: boolean }> {
    try {
      const filter = topic ? { topic } : {};

      // Get items with limit + 1 to check if there are more
      const items = (await this.model
        .find(filter)
        .skip(skip)
        .limit(limit + 1)
        .lean()) as unknown as AgentQADocType[];

      const hasMore = items.length > limit;
      const result = hasMore ? items.slice(0, limit) : items;

      return { result, hasMore };
    } catch (error) {
      this.logger.error('Error getting QnA items by topic:', error.message);
      return { result: [], hasMore: false };
    }
  }
}
