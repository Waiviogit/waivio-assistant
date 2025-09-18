import { Document } from 'mongoose';
import { AgentStatistic } from '../agent-statistic.schema';

export type AgentStatisticDocType = AgentStatistic & Document;
