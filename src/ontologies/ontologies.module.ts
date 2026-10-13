import { Module } from '@nestjs/common';
import { OntologiesController } from './ontologies.controller';
import { OntologiesService } from './ontologies.service';

@Module({ controllers: [OntologiesController], providers: [OntologiesService] })
export class OntologiesModule {}
