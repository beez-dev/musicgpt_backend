import { ApiProperty } from '@nestjs/swagger';

export class SearchUserHitDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'email' })
  email!: string;

  @ApiProperty()
  displayName!: string;
}

export class SearchAudioHitDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  promptId!: string;

  @ApiProperty({ format: 'uuid' })
  userId!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;
}

export class SearchOffsetMetaDto {
  @ApiProperty({
    type: 'integer',
    nullable: true,
    example: 10,
    description:
      'Pass as `users_offset` or `audio_offset` on the next request; `null` when that ranked list has no further rows.',
  })
  next_offset!: number | null;
}

export class SearchUsersSectionDto {
  @ApiProperty({ type: [SearchUserHitDto] })
  data!: SearchUserHitDto[];

  @ApiProperty({ type: SearchOffsetMetaDto })
  meta!: SearchOffsetMetaDto;
}

export class SearchAudioSectionDto {
  @ApiProperty({ type: [SearchAudioHitDto] })
  data!: SearchAudioHitDto[];

  @ApiProperty({ type: SearchOffsetMetaDto })
  meta!: SearchOffsetMetaDto;
}

export class UnifiedSearchResponseDto {
  @ApiProperty({ type: SearchUsersSectionDto })
  users!: SearchUsersSectionDto;

  @ApiProperty({ type: SearchAudioSectionDto })
  audio!: SearchAudioSectionDto;
}
