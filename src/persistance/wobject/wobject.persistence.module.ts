import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Wobject, WobjectSchema } from './wobject.schema';
import { WobjectPersistenceProvider } from './wobject.persistence.provider';
import { WobjectRepository } from './wobject.repository';
import { COLLECTION, CONNECTION_MONGO } from '../../database/database.module';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: Wobject.name,
          schema: WobjectSchema,
          collection: COLLECTION.WOBJECTS,
        },
      ],
      CONNECTION_MONGO.WAIVIO,
    ),
  ],
  providers: [WobjectRepository, WobjectPersistenceProvider],
  exports: [WobjectRepository, WobjectPersistenceProvider],
})
export class WobjectPersistenceModule {}
