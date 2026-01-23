import * as dotenv from 'dotenv';
import * as process from 'process';

dotenv.config();

const ENSURE_VALUES = [
  'OPENAI_API_KEY',
  'WEAVIATE_CONNECTION_STRING',
  'PORT',
  'REDIS_URL',
  'APP_HOST',
];

class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) {}

  private getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];
    if (!value && throwOnMissing) {
      throw new Error(`config error - missing env.${key}`);
    }
    return value;
  }

  public ensureValues(keys: string[]): this {
    keys.forEach((k) => this.getValue(k, true));
    return this;
  }

  public getPort(): string {
    return this.getValue('PORT', true);
  }
  public getWeaviateHost(): string {
    return this.getValue('WEAVIATE_CONNECTION_STRING', true);
  }

  public getRedisUrl(): string {
    return this.getValue('REDIS_URL', true);
  }
  public getAppHost(): string {
    return this.getValue('APP_HOST', true);
  }

  public getOpenAiKey(): string {
    return this.getValue('OPENAI_API_KEY', true);
  }

  public getGoogleAIKey(): string {
    return this.getValue('GOOGLE_AI_API_KEY', true);
  }
  public getMongoWaivioConnectionString(): string {
    const defaultConnectionString = `mongodb://localhost:27017/waivio`;
    const connectionString = process.env.MONGO_CONNECTION_WAIVIO
      ? process.env.MONGO_CONNECTION_WAIVIO
      : defaultConnectionString;

    return connectionString;
  }

  public getOpenAiOrg(): string {
    return this.getValue('OPENAI_API_ORG', true);
  }

  public getGuestValidationURL(): string {
    return this.getValue('VALIDATE_GUEST_TOKEN_ROUTE', true);
  }

  public getKeychainValidationURL(): string {
    return this.getValue('VALIDATE_KEYCHAIN_URL', true);
  }

  public getAdmins(): string[] {
    const adminsString = this.getValue('WAIVIO_ADMINS', false);
    if (!adminsString) {
      return [];
    }
    return adminsString
      .split(',')
      .map((admin) => admin.trim())
      .filter((admin) => admin.length > 0);
  }
}

const configService = new ConfigService(process.env).ensureValues(
  ENSURE_VALUES,
);

export { configService };
