import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import * as argon2 from 'argon2';
import { UserRepository } from '../../user/infrastructure/repository/user.repository';
import { RegisterDto } from '../infrastructure/interface/dto/register.dto';
import { LoginDto } from '../infrastructure/interface/dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private hashData(data: string): Promise<string> {
    return argon2.hash(data);
  }

  private async getTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { id: userId, email },
        {
          secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
          expiresIn: (this.configService.get<string>('JWT_ACCESS_EXPIRATION') ??
            '15m') as jwt.SignOptions['expiresIn'],
        },
      ),
      this.jwtService.signAsync(
        { id: userId, email },
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
          expiresIn: (this.configService.get<string>(
            'JWT_REFRESH_EXPIRATION',
          ) ?? '7d') as jwt.SignOptions['expiresIn'],
        },
      ),
    ]);
    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ) {
    const hash = refreshToken ? await this.hashData(refreshToken) : null;
    await this.userRepository.updateHashedRefreshToken(userId, hash);
  }

  async register(data: RegisterDto) {
    const email = data.email.toLowerCase().trim();
    const exists = await this.userRepository.findByEmail(email);
    if (exists) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await this.hashData(data.password);
    const user = await this.userRepository.createUser({
      email,
      password: hashedPassword,
      displayName: data.displayName.trim(),
    });

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async login(data: LoginDto) {
    const email = data.email.toLowerCase().trim();
    const user = await this.userRepository.findByEmailWithPassword(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const matches = await argon2.verify(user.password, data.password);
    if (!matches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userRepository.findByIdWithRefreshHash(userId);
    if (!user?.hashedRefreshToken) {
      throw new ForbiddenException('Access denied');
    }

    const matches = await argon2.verify(user.hashedRefreshToken, refreshToken);
    if (!matches) {
      throw new ForbiddenException('Access denied');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string) {
    await this.updateRefreshToken(userId, null);
  }
}
