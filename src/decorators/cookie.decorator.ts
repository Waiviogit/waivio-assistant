import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Cookies = createParamDecorator(
  (cookieName: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return cookieName ? request.cookies?.[cookieName] : request.cookies;
  },
);
