import { Module } from '@nestjs/common';
import { QnaController } from './qna.controller';
import { QnaService } from './qna.service';
import { AgentQaPersistenceModule } from '../../persistance/agent-qa/agent-qa.persistence.module';
import { QAWeaviateMigrationService } from './qa-weaviate-migration.service';

@Module({
  imports: [AgentQaPersistenceModule],
  controllers: [QnaController],
  providers: [QnaService, QAWeaviateMigrationService],
  exports: [QnaService, QAWeaviateMigrationService],
})
export class QnaModule {}
