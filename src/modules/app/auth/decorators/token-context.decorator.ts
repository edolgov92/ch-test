import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

export const UserTokenContext = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const request: Request = context.switchToHttp().getRequest();
  // Get Access Token from Authorization header
  const token: string | undefined =
    request && request.headers && request.headers.authorization
      ? request.headers.authorization.split(' ')[1]
      : undefined;
  if (token) {
    const decoded: string | jwt.JwtPayload = jwt.decode(token);
    if (decoded && typeof decoded === 'object' && decoded.user) {
      return decoded.user;
    }
  }
  return undefined;
});
