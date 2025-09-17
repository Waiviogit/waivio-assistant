import { Module } from '@nestjs/common';
import { QnaController } from './qna.controller';
import { QnaService } from './qna.service';
import { AgentQaPersistenceModule } from '../persistance/agent-qa/agent-qa.persistence.module';

@Module({
  imports: [AgentQaPersistenceModule],
  controllers: [QnaController],
  providers: [QnaService],
  exports: [QnaService],
})
export class QnaModule {}
