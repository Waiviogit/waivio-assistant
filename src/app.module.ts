import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from './middleware/logger-middleware';
import { DatabaseModule } from './database/database.module';
import { PersistenceModule } from './persistance/persistence.module';
import { RestModule } from './rest/rest.module';

@Module({
  imports: [DatabaseModule, PersistenceModule, RestModule],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
