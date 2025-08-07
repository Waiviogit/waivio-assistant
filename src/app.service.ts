import { Injectable } from '@nestjs/common';
import { RunQueryI, runQuery, getHistory } from './assistant';

@Injectable()
export class AppService {
  async writeMessage(params: RunQueryI) {
    const result = await runQuery(params);

    return { result };
  }

  async getHistory(id: string) {
    const result = await getHistory({ id });

    return { result };
  }
}
