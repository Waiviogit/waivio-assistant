import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as sc2 from 'sc2-sdk';
import * as CryptoJS from 'crypto-js';
import { configService } from '../config';

export const HIVE_SIGNER_URL = 'https://hivesigner.com';

type HeadersRequestType = {
  'access-token'?: string;
  'current-user'?: string;
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
    const account = headers['current-user'];
    const token = headers['access-token'];
    const authType = headers['auth-type'];

    const strategies: Record<
      string,
      (account: string, token: string) => Promise<boolean> | boolean
    > = {
      'hive-auth': this.validateHiveAuth.bind(this),
      'hive-signer': this.validateHiveSigner.bind(this),
      'hive-keychain': this.validateHiveKeychain.bind(this),
      'waivio-auth': this.validateGuestUser.bind(this),
    };

    const strategy = strategies[authType];

    if (!strategy) return false;

    const result = strategy(account, token);
    return result instanceof Promise ? await result : result;
  }

  async validateGuestUser(account: string, token: string): Promise<boolean> {
    try {
      const res = await fetch(configService.getGuestValidationURL(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access-token': token,
        },
        body: JSON.stringify({}),
      });

      if (!res.ok) return false;

      const data = await res.json().catch(() => ({}));

      return data?.user?.name === account;
    } catch (error) {
      void error;
      return false;
    }
  }

  async validateHiveKeychain(account: string, token: string): Promise<boolean> {
    try {
      const res = await fetch(configService.getKeychainValidationURL(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        return false;
      }

      return body?.username === account && body?.exp > Date.now() / 1000;
    } catch (error) {
      void error;
      return false;
    }
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
