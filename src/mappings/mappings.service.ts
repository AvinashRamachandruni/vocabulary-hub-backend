import { Injectable } from '@nestjs/common';
import { GraphdbService } from '../graphdb/graphdb.service';
import { escapeSparqlString, iri } from '../common/sparql';
import { createHash } from 'crypto';

@Injectable()
export class MappingsService {
  constructor(private readonly graphdb: GraphdbService) {}

  async list(limit = 500) {
    return this.graphdb.select(`
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
SELECT DISTINCT ?concept ?label ?relation ?target WHERE {
  GRAPH <${this.graphdb.mappingGraph}> {
    ?concept a skos:Concept ; skos:prefLabel ?label ; ?relation ?target .
    FILTER(?relation IN (skos:exactMatch, skos:relatedMatch))
  }
} ORDER BY ?label LIMIT ${Math.min(Math.max(limit, 1), 2000)}`);
  }

  async create(concept: string, targetUri: string, relation = 'exactMatch', conceptUri?: string) {
    const hash = createHash('sha1').update(concept.toLowerCase()).digest('hex').slice(0, 12);
    const hubConcept = conceptUri ?? `http://example.org/vocab-hub/concept/${hash}`;
    const predicate = relation === 'relatedMatch' ? 'skos:relatedMatch' : 'skos:exactMatch';
    await this.graphdb.update(`
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
INSERT DATA {
  GRAPH <${this.graphdb.mappingGraph}> {
    ${iri(hubConcept)} a skos:Concept ;
      skos:prefLabel "${escapeSparqlString(concept)}"@en ;
      ${predicate} ${iri(targetUri)} .
  }
}`);
    return { conceptUri: hubConcept, concept, relation, targetUri };
  }
}
