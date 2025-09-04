import { Client, ExtendedAccount } from '@hiveio/dhive';

const NODES = [
  'https://api.hive.blog',
  'https://api.deathwing.me',
  'https://api.openhive.network',
  'https://techcoderx.com',
  'https://anyx.io',
  'https://hive-api.3speak.tv',
  'https://rpc.mahdiyari.info',
];

export class HiveClient {
  private readonly client: Client;
  constructor(
    nodes: string[],
    options = { failoverThreshold: 0, timeout: 10000 },
  ) {
    this.client = new Client(nodes, options);
  }

  async getUser(userName: string): Promise<ExtendedAccount | null> {
    try {
      const [account] = await this.client.database.getAccounts([userName]);
      return account;
    } catch (error) {
      void error;
      return null;
    }
  }

  async getVotingPower(userName: string): Promise<number> {
    const account = await this.getUser(userName);
    if (!account) return 10000;

    const previousVoteTime =
      (new Date().getTime() -
        new Date(`${account.last_vote_time}Z`).getTime()) /
      1000;
    const accountVotingPower = Math.min(
      10000,
      account.voting_power + (10000 * previousVoteTime) / 432000,
    );

    return accountVotingPower;
  }

  async getAccountRCPercentage(userName: string): Promise<number> {
    try {
      const result = await this.client.rc.getRCMana(userName);
      return result.percentage;
    } catch (error) {
      void error;
      return 0;
    }
  }

  async isActiveObjectImport(userName: string): Promise<boolean> {
    const account = await this.getUser(userName);
    if (!account) return false;
    const postingAuth = (account?.posting?.account_auths || []).map(
      (el) => el[0],
    );
    return postingAuth.includes('waivio.import');
  }
}

export const hiveClient = new HiveClient(NODES);
