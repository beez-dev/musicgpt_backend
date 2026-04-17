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
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
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
import { HttpErrorResponseDto } from '../../../../common/swagger/http-error-response.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a user with **FREE** subscription, returns access + refresh JWTs, and stores a hashed refresh token server-side.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({
    type: AuthTokensDto,
    description: 'Issued access and refresh tokens.',
  })
  @ApiBadRequestResponse({
    description: 'Email already registered or validation failed.',
    type: HttpErrorResponseDto,
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    type: AuthTokensDto,
    description: 'Issued access and refresh tokens.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unknown email or wrong password.',
    type: HttpErrorResponseDto,
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('refresh')
  @ApiOperation({
    summary: 'Rotate tokens using refresh JWT',
    description:
      'Authorization must carry a valid **refresh** JWT. Returns new access + refresh tokens and replaces the stored refresh hash.',
  })
  @ApiOkResponse({ type: AuthTokensDto })
  @ApiForbiddenResponse({
    description: 'Refresh token missing, revoked, or does not match the stored hash.',
    type: HttpErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid refresh JWT signature or expiry.',
    type: HttpErrorResponseDto,
  })
  refresh(@Req() req: Request & { user: RefreshRequestUser }) {
    const { id, refreshToken } = req.user;
    return this.authService.refreshTokens(id, refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard, SubscriptionRateLimitGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Invalidate stored refresh token',
    description:
      'Clears the hashed refresh token for the current user. Access JWT may still be valid until it expires.',
  })
  @ApiResponse({ status: 204, description: 'Refresh token cleared.' })
  @ApiTooManyRequestsResponse({
    description:
      'Shared per-user per-minute budget exceeded (HTTP + socket handshake). See **Retry-After** header.',
    type: HttpErrorResponseDto,
  })
  @ApiServiceUnavailableResponse({
    description: 'Redis unavailable; requests denied (fail closed).',
    type: HttpErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User id from JWT no longer exists (edge case, e.g. after DB cleanup).',
    type: HttpErrorResponseDto,
  })
  async logout(@CurrentUser('id') userId: string) {
    await this.authService.logout(userId);
  }
}
