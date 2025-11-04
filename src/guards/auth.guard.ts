import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as sc2 from 'sc2-sdk';
import * as CryptoJS from 'crypto-js';

export const HIVE_SIGNER_URL = 'https://hivesigner.com';

type HeadersRequestType = {
  'access-token'?: string;
  currentUser?: string;
  'waivio-auth'?: string;
  'hive-auth'?: string;
};

export type ValidateRequestType = {
  headers: HeadersRequestType;
};

const secretKey = process.env.HIVE_AUTH;
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  async validateRequest({ headers }: ValidateRequestType): Promise<boolean> {
    const account = headers.currentUser;
    const token = headers['access-token'];
    const hiveAuth = headers['hive-auth'] === 'true';
    if (hiveAuth) {
      return this.validateHiveAuth(account, token);
    }
    return this.validateHiveSigner(account, token);
  }

  validateHiveAuth(account: string, token: string): boolean {
    try {
      const bytes = CryptoJS.AES.decrypt(token, secretKey);
      const decryptedMessage = bytes.toString(CryptoJS.enc.Utf8);
      const json = JSON.parse(decryptedMessage);

      return json.username === account && json.expire > Date.now();
    } catch (error) {
      void error;
      return false;
    }
  }

  async validateHiveSigner(account: string, token: string): Promise<boolean> {
    try {
      const api = sc2.Initialize({
        baseURL: HIVE_SIGNER_URL,
        accessToken: token,
      });
      const user = await api.me();
      return user._id === account;
    } catch (error) {
      void error;
      return false;
    }
  }
}
