import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { configService } from '../config';

export const CONNECTION_MONGO = Object.freeze({
  WAIVIO: 'WAIVIO',
} as const);

export const COLLECTION = Object.freeze({
  AGENT_QA: 'agent_qa',
} as const);

@Module({
  imports: [
    MongooseModule.forRoot(configService.getMongoWaivioConnectionString(), {
      connectionName: CONNECTION_MONGO.WAIVIO,
    }),
  ],
})
export class DatabaseModule {}
