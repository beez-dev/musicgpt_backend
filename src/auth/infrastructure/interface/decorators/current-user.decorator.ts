import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AccessTokenPayload } from '../../../domain/types/access-token-payload.type';

export const CurrentUser = createParamDecorator(
  (
    data: keyof AccessTokenPayload | undefined,
    ctx: ExecutionContext,
  ): AccessTokenPayload[keyof AccessTokenPayload] | AccessTokenPayload => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user: AccessTokenPayload }>();
    const user = request.user;
    if (data) {
      return user[data];
    }
    return user;
  },
);
