import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AgentStatistic } from './agent-statistic.schema';

import { AgentStatisticRepositoryInterface } from './interface';
import { MongoRepository } from '../mongo.repository';
import { AgentStatisticDocType } from './types';
import { CONNECTION_MONGO } from '../../database/database.module';

export class AgentStatisticRepository
  extends MongoRepository<AgentStatisticDocType>
  implements AgentStatisticRepositoryInterface
{
  constructor(
    @InjectModel(AgentStatistic.name, CONNECTION_MONGO.WAIVIO)
    protected readonly model: Model<AgentStatisticDocType>,
  ) {
    super(model, new Logger(AgentStatisticRepository.name));
  }

  async getStatisticsByUser(
    userName: string,
    skip: number = 0,
    limit: number = 10,
  ): Promise<{ result: AgentStatisticDocType[]; hasMore: boolean }> {
    try {
      const filter = { userName };

      // Get items with limit + 1 to check if there are more
      const items = (await this.model
        .find(filter)
        .sort({ dateString: -1 })
        .skip(skip)
        .limit(limit + 1)
        .lean()) as unknown as AgentStatisticDocType[];

      const hasMore = items.length > limit;
      const result = hasMore ? items.slice(0, limit) : items;

      return { result, hasMore };
    } catch (error) {
      this.logger.error('Error getting statistics by user:', error.message);
      return { result: [], hasMore: false };
    }
  }

  async getStatisticsByDateRange(
    startDate: string,
    endDate: string,
    skip: number = 0,
    limit: number = 10,
  ): Promise<{ result: AgentStatisticDocType[]; hasMore: boolean }> {
    try {
      const filter = {
        dateString: { $gte: startDate, $lte: endDate },
      };

      // Get items with limit + 1 to check if there are more
      const items = (await this.model
        .find(filter)
        .sort({ dateString: -1, userName: 1 })
        .skip(skip)
        .limit(limit + 1)
        .lean()) as unknown as AgentStatisticDocType[];

      const hasMore = items.length > limit;
      const result = hasMore ? items.slice(0, limit) : items;

      return { result, hasMore };
    } catch (error) {
      this.logger.error(
        'Error getting statistics by date range:',
        error.message,
      );
      return { result: [], hasMore: false };
    }
  }

  async incrementChatRequests(
    userName: string,
    dateString: string,
  ): Promise<AgentStatisticDocType> {
    try {
      return (await this.model
        .findOneAndUpdate(
          { userName, dateString },
          { $inc: { chatRequests: 1 } },
          { new: true, upsert: true, setDefaultsOnInsert: true },
        )
        .lean()) as unknown as AgentStatisticDocType;
    } catch (error) {
      this.logger.error('Error incrementing chat requests:', error.message);
      throw error;
    }
  }

  async incrementImageRequests(
    userName: string,
    dateString: string,
  ): Promise<AgentStatisticDocType> {
    try {
      return (await this.model
        .findOneAndUpdate(
          { userName, dateString },
          { $inc: { imageRequests: 1 } },
          { new: true, upsert: true, setDefaultsOnInsert: true },
        )
        .lean()) as unknown as AgentStatisticDocType;
    } catch (error) {
      this.logger.error('Error incrementing image requests:', error.message);
      throw error;
    }
  }

  async addToolUsed(
    userName: string,
    dateString: string,
    tool: string,
  ): Promise<AgentStatisticDocType> {
    try {
      return (await this.model
        .findOneAndUpdate(
          { userName, dateString },
          { $addToSet: { toolsUsed: tool } },
          { new: true, upsert: true, setDefaultsOnInsert: true },
        )
        .lean()) as unknown as AgentStatisticDocType;
    } catch (error) {
      this.logger.error('Error adding tool used:', error.message);
      throw error;
    }
  }

  async addToolsUsed(
    userName: string,
    dateString: string,
    tools: string[],
  ): Promise<AgentStatisticDocType> {
    try {
      return (await this.model
        .findOneAndUpdate(
          { userName, dateString },
          { $addToSet: { toolsUsed: { $each: tools } } },
          { new: true, upsert: true, setDefaultsOnInsert: true },
        )
        .lean()) as unknown as AgentStatisticDocType;
    } catch (error) {
      this.logger.error('Error adding tools used:', error.message);
      throw error;
    }
  }

  async updateStatistics(
    userName: string,
    dateString: string,
    tools: string[],
    hasImageTools: boolean,
  ): Promise<AgentStatisticDocType> {
    try {
      const updateQuery: any = {
        $inc: { chatRequests: 1 },
        $addToSet: { toolsUsed: { $each: tools } },
      };

      if (hasImageTools) {
        updateQuery.$inc.imageRequests = 1;
      }

      return (await this.model
        .findOneAndUpdate({ userName, dateString }, updateQuery, {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        })
        .lean()) as unknown as AgentStatisticDocType;
    } catch (error) {
      this.logger.error('Error updating statistics:', error.message);
      throw error;
    }
  }
}
