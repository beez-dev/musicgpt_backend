import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from '../../../application/auth.service';
import { AuthTokensDto } from '../dto/auth-tokens.dto';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { CurrentUser } from '../decorators/current-user.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { JwtRefreshGuard } from '../../guards/jwt-refresh.guard';
import { RefreshRequestUser } from '../../../domain/types/refresh-request-user.type';
import { SubscriptionRateLimitGuard } from '../../../../common/rate-limit/subscription-rate-limit.guard';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOkResponse({ type: AuthTokensDto })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthTokensDto })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('refresh')
  @ApiOkResponse({ type: AuthTokensDto })
  refresh(@Req() req: Request & { user: RefreshRequestUser }) {
    const { id, refreshToken } = req.user;
    return this.authService.refreshTokens(id, refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard, SubscriptionRateLimitGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @ApiTooManyRequestsResponse({
    description:
      'Shared per-user per-minute budget exceeded (HTTP + socket handshake). See Retry-After.',
  })
  @ApiServiceUnavailableResponse({
    description: 'Redis unavailable; requests denied (fail closed).',
  })
  @ApiOperation({ summary: 'Invalidate stored refresh token' })
  async logout(@CurrentUser('id') userId: string) {
    await this.authService.logout(userId);
  }
}
