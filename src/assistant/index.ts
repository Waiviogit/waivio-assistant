import { END, START, StateGraph } from '@langchain/langgraph';
import { RedisChatMessageHistory } from '@langchain/redis';
import { ChatOpenAI } from '@langchain/openai';
import {
  BaseMessage,
  HumanMessage,
  MessageContent,
  MessageType,
  SystemMessage,
} from '@langchain/core/messages';
import { REDIS_KEYS, TTL_TIME } from './constants/common';
import {
  // InitialSupportAgent,
  // GeneralAgent,
  // SearchAgent,
  // CustomAgent,
  Agent,
  WaivioAgent,
} from './agents';
import { AGENTS } from './constants/nodes';
import * as crypto from 'node:crypto';
import { configService } from '../config';
// import { checkClassExistByHost } from './store/weaviateStore';
import { getIntention } from './intention/intention';
import { imageGenerator } from './images/imageGenerator';

export type GraphState = {
  query: string;
  chatHistory: BaseMessage[];
  response?: BaseMessage;
  nextRepresentative?: string;
  host: string;
  intention?: string;
  currentPageContent?: string;
};

const graphChannels = {
  query: null,
  chatHistory: null,
  response: null,
  nextRepresentative: null,
  host: null,
  intention: null,
  currentPageContent: null,
};

const router = (state: GraphState): string => {
  const routes = {
    [AGENTS.UserTools]: 'generalNode',
    // [AGENTS.ObjectSearch]: 'searchNode',
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

const createGraph = (agents: { [key: string]: Agent }) => {
  // add nodes
  const graph = new StateGraph<GraphState>({
    channels: graphChannels,
  })
    .addNode('initialSupport', (state) => agents.initialSupport.invoke(state))
    .addNode('generalNode', (state) => agents.generalNode.invoke(state))
    .addNode('searchNode', (state) => agents.searchNode.invoke(state));

  //add Edges
  graph
    .addEdge(START, 'initialSupport')
    .addConditionalEdges('initialSupport', router, routerSettings)
    .addEdge('generalNode', END)
    .addEdge('searchNode', END);

  return graph.compile();
};

export interface RunQueryI {
  query: string;
  userName: string;
  id: string;
  host: string;
  currentUser?: string;
  images?: string[];
  currentPageContent?: string;
}

const CONTROL_ROUTES = Object.freeze({
  IMAGINE: /^\/imagine/,
} as const);

const COMMAND_CONTROLLERS = {
  IMAGINE: imageGenerator,
};

export const runQuery = async ({
  query,
  id,
  host,
  currentUser,
  images,
  currentPageContent,
}: RunQueryI): Promise<BaseMessage> => {
  const historyStore = new RedisChatMessageHistory({
    sessionId: `${REDIS_KEYS.API_RES_CACHE}:${REDIS_KEYS.ASSISTANT}:${id}`,
    sessionTTL: TTL_TIME.TEN_MINUTES,
    config: {
      url: configService.getRedisUrl(),
    },
  });

  for (const [key, regEx] of Object.entries(CONTROL_ROUTES)) {
    if (regEx.test(query)) {
      const result = await COMMAND_CONTROLLERS[key].invoke({ query, images });
      const reply = new SystemMessage(result as string);
      await historyStore.addMessages([new HumanMessage(result), reply]);
      return reply;
    }
  }

  const llm = new ChatOpenAI({
    model: 'gpt-4o',
    temperature: 0,
  });

  // const existWeaviateClass = await checkClassExistByHost({ host });
  const chatHistory = await historyStore.getMessages();
  const intention = await getIntention({
    host,
    currentUser,
  });

  const app = new WaivioAgent(llm);

  // // Create agents
  // const agents = {
  //   initialSupport: existWeaviateClass
  //     ? new CustomAgent(llm)
  //     : new InitialSupportAgent(llm),
  //   generalNode: new GeneralAgent(llm),
  //   searchNode: new SearchAgent(llm),
  // };
  //
  //
  //
  // const app = createGraph(agents);
  const result = await app.invoke({
    query,
    chatHistory,
    host,
    intention,
    currentPageContent,
  });

  const messages = [new HumanMessage(query)];
  if (result.response?.content) messages.push(result.response);

  await historyStore.addMessages(messages);

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
