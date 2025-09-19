import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Wobject } from './wobject.schema';
import { WobjectDocumentType } from './types';
import { WobjectRepositoryInterface } from './interface';
import { MongoRepository } from '../mongo.repository';
import { CONNECTION_MONGO } from '../../database/database.module';

@Injectable()
export class WobjectRepository
  extends MongoRepository<WobjectDocumentType>
  implements WobjectRepositoryInterface
{
  constructor(
    @InjectModel(Wobject.name, CONNECTION_MONGO.WAIVIO)
    protected readonly model: Model<WobjectDocumentType>,
  ) {
    super(model, new Logger(WobjectRepository.name));
  }
}
