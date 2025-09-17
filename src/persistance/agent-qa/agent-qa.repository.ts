import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AgentQA } from './agent-qa.schema';

import { AgentQaRepositoryInterface } from './interface';
import { MongoRepository } from '../mongo.repository';
import { AgentQADocType } from './types';
import { CONNECTION_MONGO } from '../../database/database.module';

export class AgentQaRepository
  extends MongoRepository<AgentQADocType>
  implements AgentQaRepositoryInterface
{
  constructor(
    @InjectModel(AgentQA.name, CONNECTION_MONGO.WAIVIO)
    protected readonly model: Model<AgentQADocType>,
  ) {
    super(model, new Logger(AgentQaRepository.name));
  }
}
