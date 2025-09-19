import { Module } from '@nestjs/common';
import { QnaController } from './qna.controller';
import { QnaService } from './qna.service';
import { AgentQaPersistenceModule } from '../../persistance/agent-qa/agent-qa.persistence.module';
import { QAWeaviateMigrationService } from '../../cli/migrate-qa-to-weaviate';

@Module({
  imports: [AgentQaPersistenceModule],
  controllers: [QnaController],
  providers: [QnaService, QAWeaviateMigrationService],
  exports: [QnaService],
})
export class QnaModule {}
