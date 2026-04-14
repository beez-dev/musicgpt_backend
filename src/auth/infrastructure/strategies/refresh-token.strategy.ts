import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AccessTokenPayload } from '../../domain/types/access-token-payload.type';
import { RefreshRequestUser } from '../../domain/types/refresh-request-user.type';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: AccessTokenPayload): RefreshRequestUser {
    const auth = req.get('authorization') ?? req.get('Authorization');
    const refreshToken = auth?.replace(/^Bearer\s+/i, '').trim() ?? '';
    return { ...payload, refreshToken };
  }
}
