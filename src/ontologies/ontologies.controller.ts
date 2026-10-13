import { Body, Controller, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RegisterOntologyDto } from './ontologies.dto';
import { OntologiesService } from './ontologies.service';

@ApiTags('Ontology ingestion')
@Controller('ontologies')
export class OntologiesController {
  constructor(private readonly service: OntologiesService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register ontology metadata in the Vocabulary Hub' })
  register(@Body() dto: RegisterOntologyDto) { return this.service.register(dto); }

  @Post(':id/sync')
  @ApiOperation({ summary: 'Fetch ontology from a canonical URL and cache it in GraphDB' })
  sync(@Param('id') id: string, @Query('sourceUrl') sourceUrl: string, @Query('contentType') contentType?: string) {
    return this.service.sync(id, sourceUrl, contentType);
  }
}
