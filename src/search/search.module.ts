import { Module } from '@nestjs/common';
import { SearchService } from './application/search.service';
import { SearchController } from './interface/controllers/search.controller';
import { SearchRepository } from './infrastructure/repository/search.repository';

@Module({
  controllers: [SearchController],
  providers: [SearchService, SearchRepository],
})
export class SearchModule {}
