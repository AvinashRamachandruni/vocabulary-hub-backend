import { BadRequestException, Injectable } from '@nestjs/common';
import { GraphdbService } from '../graphdb/graphdb.service';
import { escapeSparqlString, iri } from '../common/sparql';
import { RegisterOntologyDto } from './ontologies.dto';

@Injectable()
export class OntologiesService {
  constructor(private readonly graphdb: GraphdbService) {}

  async register(dto: RegisterOntologyDto) {
    const graphUri = `http://example.org/graph/ontology/${encodeURIComponent(dto.id)}`;
    const resourceUri = `http://example.org/vocab-hub/resource/${encodeURIComponent(dto.id)}`;
    await this.graphdb.update(`
PREFIX hub: <http://example.org/vocab-hub#>
PREFIX dcterms: <http://purl.org/dc/terms/>
INSERT DATA {
  GRAPH <${this.graphdb.resourceGraph}> {
    ${iri(resourceUri)} a hub:SemanticResource ;
      dcterms:title "${escapeSparqlString(dto.title)}" ;
      dcterms:description "${escapeSparqlString(dto.description ?? '')}" ;
      dcterms:publisher "${escapeSparqlString(dto.publisher ?? '')}" ;
      hub:resourceType "${escapeSparqlString(dto.resourceType ?? 'ontology')}" ;
      hub:accessLevel "${escapeSparqlString(dto.accessLevel ?? 'public')}" ;
      hub:resourceFormat "${escapeSparqlString(dto.format ?? 'text/turtle')}" ;
      hub:availability "remote+cached" ;
      hub:namespaceURI "${escapeSparqlString(dto.namespace)}" ;
      hub:sourceURI "${escapeSparqlString(dto.sourceUrl)}" ;
      hub:domainTag "${escapeSparqlString(dto.domain ?? '')}" ;
      hub:graphURI "${escapeSparqlString(graphUri)}" .
  }
}`);
    return { ...dto, resourceUri, graphUri };
  }

  async sync(id: string, sourceUrl: string, contentType?: string) {
    const graphUri = `http://example.org/graph/ontology/${encodeURIComponent(id)}`;
    const response = await fetch(sourceUrl, { headers: { Accept: 'text/turtle, application/rdf+xml, application/ld+json;q=0.9, */*;q=0.1' } });
    if (!response.ok) throw new BadRequestException(`Could not fetch ontology: ${response.status} ${response.statusText}`);
    const body = Buffer.from(await response.arrayBuffer());
    const type = contentType || response.headers.get('content-type')?.split(';')[0] || 'text/turtle';
    await this.graphdb.update(`CLEAR GRAPH <${graphUri}>`);
    await this.graphdb.upload(body, type, graphUri);
    return { id, graphUri, sourceUrl, contentType: type, bytes: body.length, syncedAt: new Date().toISOString() };
  }
}
