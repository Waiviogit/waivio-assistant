import { Injectable } from '@nestjs/common';
import { AgentStatisticRepository } from '../../persistance/agent-statistic/agent-statistic.repository';
import { WobjectRepository } from '../../persistance/wobject/wobject.repository';
import { AppRepository } from '../../persistance/app/app.repository';
import { RedisChatMessageHistory } from '@langchain/redis';
import { REDIS_KEYS, TTL_TIME } from '../../assistant/constants/common';
import { configService } from '../../config';
import * as crypto from 'node:crypto';
import {
  BaseMessage,
  HumanMessage,
  MessageContent,
  MessageType,
} from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { WaivioAgent } from '../../assistant/agents';

export interface RunQueryI {
  query: string;
  userName: string;
  id: string;
  host: string;
  currentUser?: string;
  images?: string[];
  currentPageContent?: string;
}

export type historyType = {
  id: `${string}-${string}-${string}-${string}-${string}`;
  text: MessageContent;
  role: MessageType;
};

@Injectable()
export class AssistantService {
  constructor(
    private readonly agentStatisticRepository: AgentStatisticRepository,
    private readonly wobjectRepository: WobjectRepository,
    private readonly appRepository: AppRepository,
  ) {}

  private getCurrentDateString(): string {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  private async getChatHistory({ id }): Promise<historyType[]> {
    const chatHistory = new RedisChatMessageHistory({
      sessionId: `${REDIS_KEYS.API_RES_CACHE}:${REDIS_KEYS.ASSISTANT}:${id}`,
      sessionTTL: TTL_TIME.TEN_MINUTES,
      config: {
        url: configService.getRedisUrl(),
      },
    });

    const history = await chatHistory.getMessages();

    const result = history.map((el) => ({
      id: crypto.randomUUID(),
      text: el?.content,
      role: el._getType(),
    }));

    return result;
  }

  private async runQuery({
    query,
    id,
    host,
    currentUser,
    images,
    currentPageContent,
  }: RunQueryI): Promise<{ response: BaseMessage; toolsCalled: string[] }> {
    const historyStore = new RedisChatMessageHistory({
      sessionId: `${REDIS_KEYS.API_RES_CACHE}:${REDIS_KEYS.ASSISTANT}:${id}`,
      sessionTTL: TTL_TIME.TEN_MINUTES,
      config: {
        url: configService.getRedisUrl(),
      },
    });

    const llm = new ChatOpenAI({
      model: 'gpt-4o',
      temperature: 0,
    });

    const chatHistory = await historyStore.getMessages();
    const app = new WaivioAgent(
      llm,
      this.wobjectRepository,
      this.appRepository,
    );

    const result = await app.invoke({
      query,
      chatHistory,
      host,
      currentPageContent,
      images,
      currentUser,
    });

    const messages = [new HumanMessage(query)];
    if (result.response?.content) messages.push(result.response);

    await historyStore.addMessages(messages);

    return {
      response: result.response,
      toolsCalled: result.toolsCalled || [],
    };
  }

  async writeMessage(params: RunQueryI) {
    const result = await this.runQuery({
      ...params,
    });
    const dateString = this.getCurrentDateString();
    const userName = params.userName || 'unauthorized';

    try {
      // Check if image tools were used
      const imageTools = ['waivioImageTool', 'imageToTextTool'];
      const hasImageTools = result.toolsCalled.some((tool) =>
        imageTools.includes(tool),
      );

      // Update all statistics in a single operation
      await this.agentStatisticRepository.updateStatistics(
        userName,
        dateString,
        result.toolsCalled,
        hasImageTools,
      );
    } catch (error) {
      console.error('Error updating agent statistics:', error);
      // Don't fail the request if statistics update fails
    }

    return { result: result.response };
  }

  async getHistory(id: string) {
    const result = await this.getChatHistory({ id });

    return { result };
  }
}
