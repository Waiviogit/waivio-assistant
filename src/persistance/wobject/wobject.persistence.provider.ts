import { Provider } from '@nestjs/common';

import { WobjectRepository } from './wobject.repository';

export const WOBJECT_REPOSITORY = 'WobjectRepository';
export const WobjectPersistenceProvider: Provider = {
  provide: WOBJECT_REPOSITORY,
  useClass: WobjectRepository,
};
