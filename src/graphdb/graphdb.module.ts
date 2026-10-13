import { Global, Module } from '@nestjs/common';
import { GraphdbService } from './graphdb.service';

@Global()
@Module({ providers: [GraphdbService], exports: [GraphdbService] })
export class GraphdbModule {}
