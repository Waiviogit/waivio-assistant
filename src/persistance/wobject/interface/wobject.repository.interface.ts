import { WobjectDocumentType } from '../types';
import { MongoRepositoryInterface } from '../../mongo.repository';

export interface WobjectRepositoryInterface
  extends MongoRepositoryInterface<WobjectDocumentType> {}
