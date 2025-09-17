import { Provider } from '@nestjs/common';
import { AgentQaRepository } from './agent-qa.repository';

export const AgentQaPersistenceProviderName = 'AgentQaPersistence';

export const AgentQaPersistenceProvider: Provider = {
  provide: AgentQaPersistenceProviderName,
  useClass: AgentQaRepository,
};
