import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateMappingDto } from './mappings.dto';
import { MappingsService } from './mappings.service';

@ApiTags('Mappings')
@Controller('mappings')
export class MappingsController {
  constructor(private readonly service: MappingsService) {}

  @Get()
  @ApiOperation({ summary: 'List curated SKOS exact/related mappings' })
  list(@Query('limit') limit?: string) { return this.service.list(limit ? Number(limit) : 500); }

  @Post()
  @ApiOperation({ summary: 'Create a curated mapping between a hub concept and an ontology term' })
  create(@Body() dto: CreateMappingDto) { return this.service.create(dto.concept, dto.targetUri, dto.relation, dto.conceptUri); }
}
