import { Module } from '@nestjs/common';
import { AssistantController } from './assistant.controller';
import { AssistantService } from './assistant.service';
import { AgentStatisticPersistenceModule } from '../../persistance/agent-statistic/agent-statistic.persistence.module';

@Module({
  imports: [AgentStatisticPersistenceModule],
  controllers: [AssistantController],
  providers: [AssistantService],
  exports: [AssistantService],
})
export class AssistantModule {}
