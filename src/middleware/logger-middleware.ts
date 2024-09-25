import { Injectable, NestMiddleware, Logger } from '@nestjs/common';

import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { method, originalUrl, body, hostname } = request;
    this.logger.log(
      `[REQ]  ${method} ${hostname}${originalUrl} ${JSON.stringify(body)}`,
    );

    next();
  }
}
