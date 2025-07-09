import { GraphState } from '../index';

export interface Agent {
  invoke(state: GraphState): Promise<Partial<GraphState>>;
}
