import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { App, AppSchema } from './app.schema';
import { AppPersistenceProvider } from './app.persistence.provider';
import { COLLECTION, CONNECTION_MONGO } from '../../database/database.module';
import { AppRepository } from './app.repository';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: App.name,
          schema: AppSchema,
          collection: COLLECTION.APPS,
        },
      ],
      CONNECTION_MONGO.WAIVIO,
    ),
  ],
  providers: [AppPersistenceProvider, AppRepository],
  exports: [AppPersistenceProvider, AppRepository],
})
export class AppPersistenceModule {}
