import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePromptDto {
  @ApiProperty({
    example: 'A cinematic lo-fi beat with soft piano and rain ambience.',
    minLength: 2,
    maxLength: 2000,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(2000)
  text!: string;
}
