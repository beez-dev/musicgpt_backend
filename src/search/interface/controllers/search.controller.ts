import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { SearchService } from '../../application/search.service';
import { SearchQueryDto } from '../dto/search-query.dto';

@Controller('search')
@ApiTags('search')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({
    summary: 'Unified search (users + audio)',
    description:
      'Paged unified search: optional integer `users_offset` / `audio_offset` (rows to skip in each ranked list). Response `meta.next_offset` is the offset to pass on the next page, or null. Same `q` when advancing pages.',
  })
  search(@Query() query: SearchQueryDto) {
    return this.searchService.search(query);
  }
}
