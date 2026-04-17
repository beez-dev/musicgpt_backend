import { ApiProperty } from '@nestjs/swagger';

export class AudioSummaryResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  promptId!: string;

  @ApiProperty({ format: 'uuid' })
  userId!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ format: 'uri' })
  url!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;
}

export class PaginatedAudioResponseDto {
  @ApiProperty({ type: [AudioSummaryResponseDto] })
  data!: AudioSummaryResponseDto[];

  @ApiProperty({ example: 100 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 10 })
  totalPages!: number;
}
