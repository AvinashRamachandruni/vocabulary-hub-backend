import { Injectable } from '@nestjs/common';
import { GraphdbService } from '../graphdb/graphdb.service';
import { escapeSparqlString } from '../common/sparql';

const val = (row: any, key: string) => row?.[key]?.value ?? '';

@Injectable()
export class SearchService {
  constructor(private readonly graphdb: GraphdbService) {}

  async curated(q: string, relation = 'all', access = 'all') {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    const concept = escapeSparqlString(query);
    const termPattern = escapeSparqlString(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/[ _-]+/g, '[ _-]*'));
    const relationClause = relation === 'exact'
      ? 'FILTER(?matchRelation IN (skos:exactMatch, owl:equivalentClass, owl:equivalentProperty, owl:sameAs) || STR(?matchRelation) = "=")'
      : relation === 'related'
        ? 'FILTER(?matchRelation IN (skos:relatedMatch, skos:closeMatch, skos:broadMatch, skos:narrowMatch, rdfs:subClassOf, rdfs:subPropertyOf) || STR(?matchRelation) IN ("<", ">", "~"))'
        : '';
    const accessClause = access !== 'all' ? `FILTER(LCASE(STR(?accessLevel)) = "${escapeSparqlString(access.toLowerCase())}")` : '';

    const rows = await this.graphdb.select(`
PREFIX hub: <http://example.org/vocab-hub#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX align: <http://knowledgeweb.semanticweb.org/heterogeneity/alignment#>
SELECT DISTINCT ?resourceTitle ?accessLevel ?namespaceURI ?matchedTerm ?termLabel ?matchRelation ?sourceTerm ?alignmentGraph
WHERE {
  {
    GRAPH <${this.graphdb.mappingGraph}> {
      ?hubConcept a skos:Concept ; skos:prefLabel|skos:altLabel ?queryLabel .
      FILTER(LCASE(STR(?queryLabel)) = "${concept}")
      ?hubConcept ?matchRelation ?matchedTerm .
      FILTER(?matchRelation IN (skos:exactMatch, skos:relatedMatch))
    }
  } UNION {
    GRAPH <${this.graphdb.mappingGraph}> { ?alignmentGraph a hub:OntologyAlignment . }
    GRAPH ?alignmentGraph {
      {
        ?alignmentSource ?matchRelation ?alignmentTarget .
        FILTER(?matchRelation IN (skos:exactMatch, skos:relatedMatch, skos:closeMatch,
          skos:broadMatch, skos:narrowMatch, owl:equivalentClass, owl:equivalentProperty,
          owl:sameAs, rdfs:subClassOf, rdfs:subPropertyOf))
      } UNION {
        ?cell align:entity1 ?alignmentSource ; align:entity2 ?alignmentTarget ; align:relation ?matchRelation .
      }
    }
    VALUES ?reverse { false true }
    BIND(IF(?reverse, ?alignmentTarget, ?alignmentSource) AS ?sourceTerm)
    BIND(IF(?reverse, ?alignmentSource, ?alignmentTarget) AS ?matchedTerm)
    OPTIONAL {
      GRAPH ?sourceLabelGraph { ?sourceTerm rdfs:label|skos:prefLabel ?sourceLabel . }
      FILTER(LANG(?sourceLabel) IN ("en", ""))
    }
    FILTER(REGEX(STR(?sourceTerm), "${termPattern}", "i") ||
      REGEX(COALESCE(STR(?sourceLabel), ""), "${termPattern}", "i"))
  }
  ${relationClause}
  GRAPH <${this.graphdb.resourceGraph}> {
    ?resource a hub:SemanticResource ; dcterms:title ?resourceTitle ; hub:accessLevel ?accessLevel ; hub:namespaceURI ?namespaceURI .
    FILTER(STRSTARTS(STR(?matchedTerm), STR(?namespaceURI)))
    ${accessClause}
  }
  OPTIONAL {
    GRAPH ?termLabelGraph { ?matchedTerm rdfs:label|skos:prefLabel ?termLabel . }
    FILTER(LANG(?termLabel) IN ("en", ""))
  }
}
ORDER BY ?resourceTitle ?matchRelation ?matchedTerm`);

    return rows.map((r) => ({
      vocabulary: val(r, 'resourceTitle'), access: val(r, 'accessLevel'), namespace: val(r, 'namespaceURI'),
      term: val(r, 'matchedTerm'), label: val(r, 'termLabel'), relation: val(r, 'matchRelation'),
      sourceTerm: val(r, 'sourceTerm'), graph: val(r, 'alignmentGraph'),
    }));
  }

  async discover(q: string) {
    const normalize = (text: string) => text.replace(/([a-z])([A-Z])/g, '$1 $2')
      .toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
    const normalizedQuery = normalize(q);
    if (!normalizedQuery) return [];
    const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const candidatePattern = escapeSparqlString(normalizedQuery.split(' ').map(escapeRegex).join('[ _-]*'));
    const wordPattern = new RegExp(`(^|[^a-z0-9])${escapeRegex(normalizedQuery)}([^a-z0-9]|$)`);
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
    OPTIONAL { ?term a ?type . }
  }
    BIND(COALESCE(STR(?rdfsLabel), STR(?skosLabel), "") AS ?label)
    FILTER(
      REGEX(STR(?term), "${candidatePattern}", "i") ||
      REGEX(STR(?label), "${candidatePattern}", "i")
    )
    FILTER(?graph NOT IN (<${this.graphdb.mappingGraph}>, <${this.graphdb.resourceGraph}>))
    FILTER(!STRSTARTS(STR(?graph), "http://example.org/vocab-hub/mapping/"))
}
`);
    const ranked = rows.map(row => {
      const result = { graph: val(row, 'graph'), term: val(row, 'term'), label: val(row, 'label'), type: val(row, 'type') };
      const termText = normalize(result.term.split(/[/#]/).pop() ?? '');
      const labelText = normalize(result.label);
      const rank = [termText, labelText].some(text => text === normalizedQuery) ? 0
        : [termText, labelText].some(text => wordPattern.test(text)) ? 1
          : [termText, labelText].some(text => text.includes(normalizedQuery)) ? 2 : 3;
      return { result, rank, labelText, termText };
    });
    ranked.sort((left, right) => left.rank - right.rank
      || left.labelText.localeCompare(right.labelText)
      || left.termText.localeCompare(right.termText)
      || left.result.term.localeCompare(right.result.term)
      || left.result.graph.localeCompare(right.result.graph)
      || left.result.type.localeCompare(right.result.type));
    return ranked.slice(0, 200).map(row => row.result);
  }
}
