import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AgentQaPersistenceProvider } from './agent-qa.persistence.provider';
import { AgentQaRepository } from './agent-qa.repository';
import { COLLECTION, CONNECTION_MONGO } from '../../database/database.module';
import { AgentQASchema, AgentQA } from './agent-qa.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: AgentQA.name,
          schema: AgentQASchema,
          collection: COLLECTION.AGENT_QA,
        },
      ],
      CONNECTION_MONGO.WAIVIO,
    ),
  ],
  providers: [AgentQaRepository, AgentQaPersistenceProvider],
  exports: [AgentQaPersistenceProvider],
})
export class AgentQaPersistenceModule {}
