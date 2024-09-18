import { END, START, StateGraph } from '@langchain/langgraph';
import { RedisChatMessageHistory } from '@langchain/redis';
import { ChatOpenAI } from '@langchain/openai';
import {
  BaseMessage,
  HumanMessage,
  MessageContent,
  MessageType,
} from '@langchain/core/messages';
import { REDIS_KEYS, TTL_TIME } from './constants/common';
import { initialSupport } from './nodes/initialNode';
import { generalNode } from './nodes/generalNode';
import { searchNode } from './nodes/searchNode';
import { AGENTS } from './constants/nodes';
import * as crypto from 'node:crypto';
import { configService } from '../config';

export type GraphState = {
  llm: ChatOpenAI;
  query: string;
  chatHistory: BaseMessage[];
  response: BaseMessage;
  nextRepresentative: string;
  host: string;
};

const graphChannels = {
  llm: null,
  query: null,
  chatHistory: null,
  response: null,
  nextRepresentative: null,
  host: null,
};

const router = (state: GraphState): string => {
  const routes = {
    [AGENTS.UserTools]: 'generalNode',
    [AGENTS.ObjectSearch]: 'searchNode',
    [AGENTS.CampaignManagement]: 'generalNode',
    [AGENTS.EarnCampaign]: 'generalNode',
    [AGENTS.ObjectImport]: 'generalNode',
    [AGENTS.SitesManagement]: 'generalNode',
    [AGENTS.WaivioObjects]: 'generalNode',
    [AGENTS.WaivioGeneral]: 'generalNode',
    default: 'conversational',
  };

  const route = state.nextRepresentative as keyof typeof routes;

  return routes[route] || routes.default;
};

const routerSettings = Object.freeze({
  generalNode: 'generalNode',
  searchNode: 'searchNode',
  conversational: END,
});

const createGraph = () => {
  // add nodes
  const graph = new StateGraph<GraphState>({
    channels: graphChannels,
  })
    .addNode('initialSupport', initialSupport)
    .addNode('generalNode', generalNode)
    .addNode('searchNode', searchNode);

  //add Edges
  graph
    .addEdge(START, 'initialSupport')
    .addConditionalEdges('initialSupport', router, routerSettings)
    .addEdge('generalNode', END)
    .addEdge('searchNode', END);

  const app = graph.compile();
  return app;
};

export interface RunQueryI {
  query: string;
  userName: string;
  id: string;
  host: string;
}

export const runQuery = async ({
  query,
  id,
  host,
}: RunQueryI): Promise<BaseMessage> => {
  const app = createGraph();

  const llm = new ChatOpenAI({
    modelName: 'gpt-4o',
    temperature: 0,
  });

  const historyStore = new RedisChatMessageHistory({
    sessionId: `${REDIS_KEYS.API_RES_CACHE}:${REDIS_KEYS.ASSISTANT}:${id}`,
    sessionTTL: TTL_TIME.TEN_MINUTES,
    config: {
      url: configService.getRedisUrl(),
    },
  });

  const chatHistory = await historyStore.getMessages();

  const result = await app.invoke({
    llm,
    query,
    chatHistory,
    host,
  });

  await historyStore.addMessages([new HumanMessage(query), result.response]);

  return result.response;
};

export type historyType = {
  id: `${string}-${string}-${string}-${string}-${string}`;
  text: MessageContent;
  role: MessageType;
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