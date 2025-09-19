import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AgentStatisticPersistenceProvider } from './agent-statistic.persistence.provider';
import { AgentStatisticRepository } from './agent-statistic.repository';
import { COLLECTION, CONNECTION_MONGO } from '../../database/database.module';
import { AgentStatisticSchema, AgentStatistic } from './agent-statistic.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: AgentStatistic.name,
          schema: AgentStatisticSchema,
          collection: COLLECTION.AGENT_STATISTIC,
        },
      ],
      CONNECTION_MONGO.WAIVIO,
    ),
  ],
  providers: [AgentStatisticRepository, AgentStatisticPersistenceProvider],
  exports: [AgentStatisticRepository, AgentStatisticPersistenceProvider],
})
export class AgentStatisticPersistenceModule {}
