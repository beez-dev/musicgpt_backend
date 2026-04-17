import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class SearchQueryDto {
  @ApiProperty({ example: 'john', minLength: 1, maxLength: 200 })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  q!: string;

  @ApiPropertyOptional({
    default: 0,
    minimum: 0,
    description:
      'Skip this many ranked user rows (pass prior `users.meta.next_offset` for the next page).',
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  users_offset = 0;

  @ApiPropertyOptional({
    default: 0,
    minimum: 0,
    description:
      'Skip this many ranked audio rows (pass prior `audio.meta.next_offset` for the next page).',
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  audio_offset = 0;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;
}
