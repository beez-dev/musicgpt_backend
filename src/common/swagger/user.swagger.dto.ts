import { ApiProperty } from '@nestjs/swagger';

export class UserSummaryResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'email' })
  email!: string;

  @ApiProperty()
  displayName!: string;

  @ApiProperty({
    enum: ['FREE', 'PAID'],
    description:
      '**FREE**: default tier. **PAID**: upgraded via `POST /subscription/subscribe`. Affects BullMQ job priority and shared HTTP/socket rate limits.',
  })
  subscriptionStatus!: 'FREE' | 'PAID';
}

export class PaginatedUsersResponseDto {
  @ApiProperty({ type: [UserSummaryResponseDto] })
  data!: UserSummaryResponseDto[];

  @ApiProperty({ example: 42, description: 'Total rows matching the list (all pages).' })
  total!: number;

  @ApiProperty({ example: 1, description: 'Current 1-based page (from `page` query).' })
  page!: number;

  @ApiProperty({ example: 10, description: 'Page size (from `limit` query).' })
  limit!: number;

  @ApiProperty({ example: 5, description: 'Ceiling of `total / limit`.' })
  totalPages!: number;
}
