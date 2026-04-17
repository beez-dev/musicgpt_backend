import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { SearchService } from '../../application/search.service';
import { SearchQueryDto } from '../dto/search-query.dto';
import { HttpErrorResponseDto } from '../../../common/swagger/http-error-response.dto';
import { UnifiedSearchResponseDto } from '../../../common/swagger/search.swagger.dto';

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
      'Ranked full-text style match over **users** (email, display name) and **audio** (title). Pagination is **per-list**: use `users_offset` / `audio_offset` and each section’s `meta.next_offset` (see global **Pagination** docs).',
  })
  @ApiOkResponse({ type: UnifiedSearchResponseDto })
  @ApiUnauthorizedResponse({ type: HttpErrorResponseDto })
  search(@Query() query: SearchQueryDto) {
    return this.searchService.search(query);
  }
}
