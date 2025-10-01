import { Provider } from '@nestjs/common';

import { AppRepository } from './app.repository';

export const APP_REPOSITORY = 'AppRepository';

export const AppPersistenceProvider: Provider = {
  provide: APP_REPOSITORY,
  useClass: AppRepository,
};
