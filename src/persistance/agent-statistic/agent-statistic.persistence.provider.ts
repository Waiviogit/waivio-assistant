import { Provider } from '@nestjs/common';
import { AgentStatisticRepository } from './agent-statistic.repository';

export const AgentStatisticPersistenceProviderName =
  'AgentStatisticPersistence';

export const AgentStatisticPersistenceProvider: Provider = {
  provide: AgentStatisticPersistenceProviderName,
  useClass: AgentStatisticRepository,
};
