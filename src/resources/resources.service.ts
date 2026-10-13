import { Injectable } from '@nestjs/common';
import { GraphdbService } from '../graphdb/graphdb.service';

const val = (row: any, key: string) => row?.[key]?.value ?? '';

@Injectable()
export class ResourcesService {
  constructor(private readonly graphdb: GraphdbService) {}

  async list() {
    const rows = await this.graphdb.select(`
PREFIX hub: <http://example.org/vocab-hub#>
PREFIX dcterms: <http://purl.org/dc/terms/>
SELECT DISTINCT ?resource ?title ?description ?publisher ?resourceType ?accessLevel ?resourceFormat ?availability ?namespaceURI ?sourceURI ?domainTag ?graphURI
WHERE {
  GRAPH <${this.graphdb.resourceGraph}> {
    ?resource a hub:SemanticResource ; dcterms:title ?title ; hub:resourceType ?resourceType ; hub:accessLevel ?accessLevel ; hub:namespaceURI ?namespaceURI .
    OPTIONAL { ?resource dcterms:description ?description . }
    OPTIONAL { ?resource dcterms:publisher ?publisher . }
    OPTIONAL { ?resource hub:resourceFormat ?resourceFormat . }
    OPTIONAL { ?resource hub:availability ?availability . }
    OPTIONAL { ?resource hub:sourceURI ?sourceURI . }
    OPTIONAL { ?resource hub:domainTag ?domainTag . }
    OPTIONAL { ?resource hub:graphURI ?graphURI . }
  }
}
ORDER BY ?title`);

    return rows.map((r) => ({
      id: val(r, 'resource'), title: val(r, 'title'), description: val(r, 'description'), publisher: val(r, 'publisher'),
      type: val(r, 'resourceType'), access: val(r, 'accessLevel'), format: val(r, 'resourceFormat'),
      availability: val(r, 'availability'), namespace: val(r, 'namespaceURI'), source: val(r, 'sourceURI'),
      domain: val(r, 'domainTag'), graph: val(r, 'graphURI'),
    }));
  }
}
