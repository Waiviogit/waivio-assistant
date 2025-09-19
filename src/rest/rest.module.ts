import { Module } from '@nestjs/common';
import { AssistantModule } from './assistant/assistant.module';
import { StatisticsModule } from './statistics/statistics.module';
import { QnaModule } from './qna/qna.module';

@Module({
  imports: [AssistantModule, StatisticsModule, QnaModule],
  exports: [AssistantModule, StatisticsModule, QnaModule],
})
export class RestModule {}
