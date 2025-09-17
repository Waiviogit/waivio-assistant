import { AgentQADocType } from '../types/agent-qa.types';
import { MongoRepositoryInterface } from '../../mongo.repository';

export interface AgentQaRepositoryInterface
  extends MongoRepositoryInterface<AgentQADocType> {
  getDistinctTopics(): Promise<string[]>;
  getQnaItemsByTopic(
    topic?: string,
    skip?: number,
    limit?: number,
  ): Promise<{ result: AgentQADocType[]; hasMore: boolean }>;
}
