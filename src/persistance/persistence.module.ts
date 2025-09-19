import { Module } from '@nestjs/common';

import { AgentQaPersistenceModule } from './agent-qa/agent-qa.persistence.module';
import { AgentStatisticPersistenceModule } from './agent-statistic/agent-statistic.persistence.module';
import { WobjectPersistenceModule } from './wobject/wobject.persistence.module';

@Module({
  imports: [
    AgentQaPersistenceModule,
    AgentStatisticPersistenceModule,
    WobjectPersistenceModule,
  ],
  exports: [
    AgentQaPersistenceModule,
    AgentStatisticPersistenceModule,
    WobjectPersistenceModule,
  ],
})
export class PersistenceModule {}
