import { AgentStatisticDocType } from '../types/agent-statistic.types';
import { MongoRepositoryInterface } from '../../mongo.repository';

export interface AgentStatisticRepositoryInterface
  extends MongoRepositoryInterface<AgentStatisticDocType> {
  getStatisticsByUser(
    userName: string,
    skip?: number,
    limit?: number,
  ): Promise<{ result: AgentStatisticDocType[]; hasMore: boolean }>;

  getStatisticsByDateRange(
    startDate: string,
    endDate: string,
    skip?: number,
    limit?: number,
  ): Promise<{ result: AgentStatisticDocType[]; hasMore: boolean }>;

  incrementChatRequests(
    userName: string,
    dateString: string,
  ): Promise<AgentStatisticDocType>;

  incrementImageRequests(
    userName: string,
    dateString: string,
  ): Promise<AgentStatisticDocType>;

  addToolUsed(
    userName: string,
    dateString: string,
    tool: string,
  ): Promise<AgentStatisticDocType>;

  addToolsUsed(
    userName: string,
    dateString: string,
    tools: string[],
  ): Promise<AgentStatisticDocType>;

  updateStatistics(
    userName: string,
    dateString: string,
    tools: string[],
    hasImageTools: boolean,
  ): Promise<AgentStatisticDocType>;
}
