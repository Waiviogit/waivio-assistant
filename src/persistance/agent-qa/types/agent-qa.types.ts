import { Document } from 'mongoose';
import { AgentQA } from '../agent-qa.schema';

export type AgentQADocType = AgentQA & Document;
