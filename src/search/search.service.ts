import { Injectable } from '@nestjs/common';
import { GraphdbService } from '../graphdb/graphdb.service';
import { escapeSparqlString } from '../common/sparql';

const val = (row: any, key: string) => row?.[key]?.value ?? '';

@Injectable()
export class SearchService {
  constructor(private readonly graphdb: GraphdbService) {}

  async curated(q: string, relation = 'all', access = 'all') {
    const concept = escapeSparqlString(q.toLowerCase());
    const relationClause = relation === 'exact'
      ? 'FILTER(?matchRelation = skos:exactMatch)'
      : relation === 'related'
        ? 'FILTER(?matchRelation = skos:relatedMatch)'
        : 'FILTER(?matchRelation IN (skos:exactMatch, skos:relatedMatch))';
    const accessClause = access !== 'all' ? `FILTER(LCASE(STR(?accessLevel)) = "${escapeSparqlString(access.toLowerCase())}")` : '';

    const rows = await this.graphdb.select(`
PREFIX hub: <http://example.org/vocab-hub#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX dcterms: <http://purl.org/dc/terms/>
SELECT DISTINCT ?resourceTitle ?accessLevel ?namespaceURI ?matchedTerm ?termLabel ?matchRelation
WHERE {
  GRAPH <${this.graphdb.mappingGraph}> {
    ?hubConcept a skos:Concept ; skos:prefLabel|skos:altLabel ?queryLabel .
    FILTER(LCASE(STR(?queryLabel)) = "${concept}")
    ?hubConcept ?matchRelation ?matchedTerm .
    ${relationClause}
  }
  GRAPH <${this.graphdb.resourceGraph}> {
    ?resource a hub:SemanticResource ; dcterms:title ?resourceTitle ; hub:accessLevel ?accessLevel ; hub:namespaceURI ?namespaceURI .
    FILTER(STRSTARTS(STR(?matchedTerm), STR(?namespaceURI)))
    ${accessClause}
  }
  OPTIONAL { ?matchedTerm rdfs:label ?termLabel . FILTER(LANG(?termLabel) = "en" || LANG(?termLabel) = "") }
}
ORDER BY ?resourceTitle ?matchRelation ?matchedTerm`);

    return rows.map((r) => ({
      vocabulary: val(r, 'resourceTitle'), access: val(r, 'accessLevel'), namespace: val(r, 'namespaceURI'),
      term: val(r, 'matchedTerm'), label: val(r, 'termLabel'), relation: val(r, 'matchRelation'),
    }));
  }

  async discover(q: string) {
    const needle = escapeSparqlString(q.toLowerCase());
    const rows = await this.graphdb.select(`
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
SELECT DISTINCT ?graph ?term ?label ?type
WHERE {
  GRAPH ?graph {
    ?term ?p ?o .
    OPTIONAL { ?term rdfs:label ?rdfsLabel . }
    OPTIONAL { ?term skos:prefLabel ?skosLabel . }
    BIND(COALESCE(?rdfsLabel, ?skosLabel, "") AS ?label)
    OPTIONAL { ?term a ?type . }
    FILTER(
      CONTAINS(LCASE(STR(?term)), "${needle}") ||
      CONTAINS(LCASE(STR(?label)), "${needle}")
    )
    FILTER(?graph NOT IN (<${this.graphdb.mappingGraph}>, <${this.graphdb.resourceGraph}>))
  }
}
LIMIT 200`);
    return rows.map((r) => ({ graph: val(r, 'graph'), term: val(r, 'term'), label: val(r, 'label'), type: val(r, 'type') }));
  }
}
