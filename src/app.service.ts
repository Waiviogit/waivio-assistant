import { Injectable } from '@nestjs/common';
import { RunQueryI, runQuery, getHistory } from './assistant';

@Injectable()
export class AppService {
  async writeMessage({ id, query, userName, host, currentUser }: RunQueryI) {
    const result = await runQuery({ query, id, userName, host, currentUser });

    return { result };
  }

  async getHistory(id: string) {
    const result = await getHistory({ id });

    return { result };
  }
}
