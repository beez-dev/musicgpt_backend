import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionStatusResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({
    enum: ['FREE', 'PAID'],
    description:
      '**FREE** — default tier; lower shared HTTP/socket rate limit; lower BullMQ job priority. **PAID** — upgraded tier; higher limits and priority.',
  })
  subscriptionStatus!: 'FREE' | 'PAID';
}
