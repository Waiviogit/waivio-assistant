import { Module } from '@nestjs/common';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { AgentStatisticPersistenceModule } from '../../persistance/agent-statistic/agent-statistic.persistence.module';

@Module({
  imports: [AgentStatisticPersistenceModule],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}
