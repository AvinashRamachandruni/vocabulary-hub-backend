import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SearchDto } from './search.dto';
import { SearchService } from './search.service';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly service: SearchService) {}

  @Get('curated')
  @ApiOperation({ summary: 'Search curated SKOS mappings from a hub concept to ontology terms' })
  curated(@Query() dto: SearchDto) { return this.service.curated(dto.q, dto.relation, dto.access); }

  @Get('discover')
  @ApiOperation({ summary: 'Discover candidate ontology terms by URI or label across loaded graphs' })
  discover(@Query('q') q: string) { return this.service.discover(q); }
}
