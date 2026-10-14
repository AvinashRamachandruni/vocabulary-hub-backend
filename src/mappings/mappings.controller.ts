import { BadRequestException, Body, Controller, Get, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateMappingDto, UploadAlignmentDto } from './mappings.dto';
import { MappingsService } from './mappings.service';

@ApiTags('Mappings')
@Controller('mappings')
export class MappingsController {
  constructor(private readonly service: MappingsService) {}

  @Get('alignments')
  @ApiOperation({ summary: 'List uploaded ontology alignments' })
  alignments() { return this.service.listAlignments(); }

  @Post('alignments/upload')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 25 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', required: ['id', 'sourceOntology', 'targetOntology', 'file'], properties: {
    id: { type: 'string' }, sourceOntology: { type: 'string' }, targetOntology: { type: 'string' },
    file: { type: 'string', format: 'binary' },
  } } })
  @ApiOperation({ summary: 'Upload a Turtle alignment between two registered ontologies' })
  uploadAlignment(@Body() dto: UploadAlignmentDto, @UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('An alignment Turtle file is required');
    return this.service.uploadAlignment(dto, file);
  }

  @Get()
  @ApiOperation({ summary: 'List curated SKOS exact/related mappings' })
  list(@Query('limit') limit?: string) { return this.service.list(limit ? Number(limit) : 500); }

  @Post()
  @ApiOperation({ summary: 'Create a curated mapping between a hub concept and an ontology term' })
  create(@Body() dto: CreateMappingDto) { return this.service.create(dto.concept, dto.targetUri, dto.relation, dto.conceptUri); }
}
