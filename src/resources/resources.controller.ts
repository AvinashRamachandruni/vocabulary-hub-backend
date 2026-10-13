import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResourcesService } from './resources.service';

@ApiTags('Vocabularies')
@Controller('vocabularies')
export class ResourcesController {
  constructor(private readonly service: ResourcesService) {}

  @Get()
  @ApiOperation({ summary: 'List registered semantic resources / vocabularies' })
  list() { return this.service.list(); }
}
