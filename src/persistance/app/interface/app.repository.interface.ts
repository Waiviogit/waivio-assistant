import { AppDocumentType } from '../types';
import { MongoRepositoryInterface } from '../../mongo.repository';

export interface AppRepositoryInterface
  extends MongoRepositoryInterface<AppDocumentType> {
  findOneByHost(host: string): Promise<AppDocumentType>;
}
