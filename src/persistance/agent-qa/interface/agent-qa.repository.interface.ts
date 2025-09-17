import { AgentQADocType } from '../types/agent-qa.types';
import { MongoRepositoryInterface } from '../../mongo.repository';

export type AgentQaRepositoryInterface =
  MongoRepositoryInterface<AgentQADocType>;
