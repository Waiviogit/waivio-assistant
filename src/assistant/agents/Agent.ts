import { BaseMessage } from '@langchain/core/messages';

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

export interface Agent {
  invoke(state: GraphState): Promise<Partial<GraphState>>;
}
