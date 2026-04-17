import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Standard NestJS HTTP exception body (`HttpException` / validation pipe).
 */
export class HttpErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({
    description:
      'Human-readable message, or array of validation messages when `ValidationPipe` rejects the body/query.',
    oneOf: [
      { type: 'string', example: 'User not found' },
      { type: 'array', items: { type: 'string' }, example: ['email must be an email'] },
    ],
  })
  message!: string | string[];

  @ApiPropertyOptional({ example: 'Bad Request' })
  error?: string;
}
