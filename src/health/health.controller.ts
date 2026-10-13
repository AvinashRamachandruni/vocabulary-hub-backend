import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GraphdbService } from '../graphdb/graphdb.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly graphdb: GraphdbService) {}

  @Get()
  async health() {
    const graphdb = await this.graphdb.ping();
    return { status: graphdb ? 'ok' : 'degraded', graphdb, repository: this.graphdb.repository, timestamp: new Date().toISOString() };
  }
}
