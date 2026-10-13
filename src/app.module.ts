import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphdbModule } from './graphdb/graphdb.module';
import { ResourcesModule } from './resources/resources.module';
import { SearchModule } from './search/search.module';
import { MappingsModule } from './mappings/mappings.module';
import { OntologiesModule } from './ontologies/ontologies.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env'] }),
    GraphdbModule,
    ResourcesModule,
    SearchModule,
    MappingsModule,
    OntologiesModule,
    HealthModule,
  ],
})
export class AppModule {}
