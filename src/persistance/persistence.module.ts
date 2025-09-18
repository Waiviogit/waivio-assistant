import { Module } from '@nestjs/common';

import { AgentQaPersistenceModule } from './agent-qa/agent-qa.persistence.module';
import { AgentStatisticPersistenceModule } from './agent-statistic/agent-statistic.persistence.module';

@Module({
  imports: [AgentQaPersistenceModule, AgentStatisticPersistenceModule],
  exports: [AgentQaPersistenceModule, AgentStatisticPersistenceModule],
})
export class PersistenceModule {}
