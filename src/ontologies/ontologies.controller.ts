import { BadRequestException, Body, Controller, Param, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { RegisterOntologyDto } from './ontologies.dto';
import { OntologiesService } from './ontologies.service';

@ApiTags('Ontology ingestion')
@Controller('ontologies')
export class OntologiesController {
  constructor(private readonly service: OntologiesService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register ontology metadata in the Vocabulary Hub' })
  register(@Body() dto: RegisterOntologyDto) { return this.service.register(dto); }

  @Post('register-upload')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 25 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', required: ['id', 'title', 'namespace', 'sourceUrl', 'file'], properties: {
    id: { type: 'string' }, title: { type: 'string' }, namespace: { type: 'string' }, sourceUrl: { type: 'string' },
    description: { type: 'string' }, publisher: { type: 'string' }, domain: { type: 'string' },
    file: { type: 'string', format: 'binary' },
  } } })
  @ApiOperation({ summary: 'Register ontology metadata and upload a Turtle file into GraphDB' })
  async registerUpload(@Body() dto: RegisterOntologyDto, @UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('A Turtle file is required');
    return this.service.registerUpload(dto, file);
  }

  @Post(':id/sync')
  @ApiOperation({ summary: 'Fetch ontology from a canonical URL and cache it in GraphDB' })
  sync(@Param('id') id: string, @Query('sourceUrl') sourceUrl: string, @Query('contentType') contentType?: string) {
    return this.service.sync(id, sourceUrl, contentType);
  }
}
