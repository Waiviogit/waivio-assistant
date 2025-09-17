import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './middleware/logger-middleware';
import { DatabaseModule } from './database/database.module';
import { PersistenceModule } from './persistance/persistence.module';
import { QnaModule } from './qna/qna.module';

@Module({
  imports: [DatabaseModule, PersistenceModule, QnaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
