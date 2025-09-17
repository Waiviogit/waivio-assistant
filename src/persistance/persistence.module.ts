import { Module } from '@nestjs/common';

import { AgentQaPersistenceModule } from './agent-qa/agent-qa.persistence.module';

@Module({
  imports: [AgentQaPersistenceModule],
  exports: [AgentQaPersistenceModule],
})
export class PersistenceModule {}
