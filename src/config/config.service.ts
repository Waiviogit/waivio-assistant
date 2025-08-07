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

  public getOpenAiOrg(): string {
    return this.getValue('OPENAI_API_ORG', true);
  }
}

const configService = new ConfigService(process.env).ensureValues(
  ENSURE_VALUES,
);

export { configService };
