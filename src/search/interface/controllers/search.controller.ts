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
      'Stage 1: ILIKE-weighted user match on email/display_name; full-text rank on audio title.',
  })
  search(@Query() query: SearchQueryDto) {
    return this.searchService.search(query);
  }
}
