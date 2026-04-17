import { ApiProperty } from '@nestjs/swagger';

export class AuthTokensDto {
  @ApiProperty({
    description:
      'Short-lived JWT for `Authorization: Bearer` on REST and for Socket.IO `auth.token` / `Authorization` header.',
  })
  accessToken!: string;

  @ApiProperty({
    description:
      'Long-lived JWT used only with `POST /auth/refresh` (Bearer scheme **refresh** in Swagger).',
  })
  refreshToken!: string;
}
