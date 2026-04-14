import { AccessTokenPayload } from './access-token-payload.type';

export type RefreshRequestUser = AccessTokenPayload & { refreshToken: string };
