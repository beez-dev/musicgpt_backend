import { ApiProperty } from '@nestjs/swagger';

/**
 * Returned with `POST /prompts` to explain queue state before the cron picks up the row.
 */
export class PromptQueueStubDto {
  @ApiProperty({
    example: false,
    description:
      'Always `false` from this endpoint; jobs are added by the scheduler when it sees `PENDING` prompts.',
  })
  queued!: boolean;

  @ApiProperty({
    example: 'Job ready to be queued, waiting for cron to schedule',
    description: 'Human-readable hint for the simulation pipeline.',
  })
  reason!: string;
}

export class CreatePromptResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  userId!: string;

  @ApiProperty()
  text!: string;

  @ApiProperty({
    enum: ['PENDING', 'PROCESSING', 'COMPLETED'],
    description:
      '**PENDING** after create → cron enqueues BullMQ job → worker sets **PROCESSING** → simulated delay → audio row + **COMPLETED**.',
  })
  status!: 'PENDING' | 'PROCESSING' | 'COMPLETED';

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: string;

  @ApiProperty({ type: PromptQueueStubDto })
  queue!: PromptQueueStubDto;
}
