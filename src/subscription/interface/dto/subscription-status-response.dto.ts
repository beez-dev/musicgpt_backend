import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionStatusResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ enum: ['FREE', 'PAID'] })
  subscriptionStatus!: 'FREE' | 'PAID';
}
