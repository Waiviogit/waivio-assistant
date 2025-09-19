import { Module } from '@nestjs/common';
import { AssistantController } from './assistant.controller';
import { AssistantService } from './assistant.service';
import { AgentStatisticPersistenceModule } from '../../persistance/agent-statistic/agent-statistic.persistence.module';
import { WobjectPersistenceModule } from '../../persistance/wobject/wobject.persistence.module';

@Module({
  imports: [AgentStatisticPersistenceModule, WobjectPersistenceModule],
  controllers: [AssistantController],
  providers: [AssistantService],
  exports: [AssistantService],
})
export class AssistantModule {}
