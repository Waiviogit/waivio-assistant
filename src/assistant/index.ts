import { RedisChatMessageHistory } from '@langchain/redis';
import { ChatOpenAI } from '@langchain/openai';
import {
  BaseMessage,
  HumanMessage,
  MessageContent,
  MessageType,
} from '@langchain/core/messages';
import { REDIS_KEYS, TTL_TIME } from './constants/common';
import { WaivioAgent } from './agents';
import * as crypto from 'node:crypto';
import { configService } from '../config';
import { WobjectRepository } from '../persistance/wobject/wobject.repository';

export type GraphState = {
  query: string;
  chatHistory: BaseMessage[];
  response?: BaseMessage;
  nextRepresentative?: string;
  host: string;
  currentPageContent?: string;
  images?: string[];
  currentUser?: string;
  toolsCalled?: string[];
};

export interface RunQueryI {
  query: string;
  userName: string;
  id: string;
  host: string;
  currentUser?: string;
  images?: string[];
  currentPageContent?: string;
  wobjectRepository?: WobjectRepository;
}

export type historyType = {
  id: `${string}-${string}-${string}-${string}-${string}`;
  text: MessageContent;
  role: MessageType;
};

export const runQuery = async ({
  query,
  id,
  host,
  currentUser,
  images,
  currentPageContent,
  wobjectRepository,
}: RunQueryI): Promise<{ response: BaseMessage; toolsCalled: string[] }> => {
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
  const app = new WaivioAgent(llm, wobjectRepository);

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
};

export const getHistory = async ({ id }): Promise<historyType[]> => {
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
};
