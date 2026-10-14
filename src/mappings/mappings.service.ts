import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { GraphdbService } from '../graphdb/graphdb.service';
import { escapeSparqlString, iri } from '../common/sparql';
import { createHash } from 'crypto';
import { UploadAlignmentDto } from './mappings.dto';

@Injectable()
export class MappingsService {
  constructor(private readonly graphdb: GraphdbService) {}

  async list(limit = 500) {
    return this.graphdb.select(`
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX hub: <http://example.org/vocab-hub#>
PREFIX align: <http://knowledgeweb.semanticweb.org/heterogeneity/alignment#>
SELECT DISTINCT ?concept ?label ?relation ?target ?graph WHERE {
  {
    GRAPH <${this.graphdb.mappingGraph}> {
    ?concept a skos:Concept ; skos:prefLabel ?label ; ?relation ?target .
    FILTER(?relation IN (skos:exactMatch, skos:relatedMatch))
    }
    BIND(<${this.graphdb.mappingGraph}> AS ?graph)
  } UNION {
    GRAPH <${this.graphdb.mappingGraph}> { ?graph a hub:OntologyAlignment . }
    GRAPH ?graph {
      {
        ?concept ?relation ?target .
        FILTER(?relation IN (skos:exactMatch, skos:relatedMatch, skos:closeMatch,
          skos:broadMatch, skos:narrowMatch, owl:equivalentClass, owl:equivalentProperty,
          owl:sameAs, rdfs:subClassOf, rdfs:subPropertyOf))
      } UNION {
        ?cell align:entity1 ?concept ; align:entity2 ?target ; align:relation ?relation .
      }
      OPTIONAL { ?concept rdfs:label|skos:prefLabel ?label . }
    }
  }
} ORDER BY ?label LIMIT ${Math.min(Math.max(limit, 1), 2000)}`);
  }

  async listAlignments() {
    const rows = await this.graphdb.select(`
PREFIX hub: <http://example.org/vocab-hub#>
SELECT ?graph ?id ?source ?target ?file WHERE {
  GRAPH <${this.graphdb.mappingGraph}> {
    ?graph a hub:OntologyAlignment ; hub:alignmentId ?id ;
      hub:sourceOntology ?source ; hub:targetOntology ?target ; hub:uploadedFile ?file .
  }
} ORDER BY ?id`);
    return rows.map(row => ({ graph: row.graph.value, id: row.id.value,
      source: row.source.value, target: row.target.value, file: row.file.value }));
  }

  async uploadAlignment(dto: UploadAlignmentDto, file: Express.Multer.File) {
    if (!file.originalname.toLowerCase().endsWith('.ttl') || !file.size) {
      throw new BadRequestException('A non-empty .ttl alignment file is required');
    }
    if (dto.sourceOntology === dto.targetOntology) {
      throw new BadRequestException('Select two different registered ontologies');
    }
    const ontologies = await this.graphdb.select(`
PREFIX hub: <http://example.org/vocab-hub#>
SELECT DISTINCT ?resource WHERE {
  GRAPH <${this.graphdb.resourceGraph}> {
    VALUES ?resource { ${iri(dto.sourceOntology)} ${iri(dto.targetOntology)} }
    ?resource a hub:SemanticResource ; hub:resourceType "ontology" ; hub:graphURI ?ontologyGraph .
  }
}`);
    if (new Set(ontologies.map(row => row.resource.value)).size !== 2) {
      throw new BadRequestException('Both ontologies must be registered with a named graph');
    }
    const graphUri = `http://example.org/vocab-hub/mapping/${dto.id}`;
    const existing = await this.graphdb.select(`SELECT ?predicate WHERE {
      GRAPH <${this.graphdb.mappingGraph}> { ${iri(graphUri)} ?predicate ?value }
    } LIMIT 1`);
    if (existing.length) throw new ConflictException('An alignment with this ID already exists');
    await this.graphdb.upload(file.buffer, 'text/turtle', graphUri, graphUri);
    await this.graphdb.update(`
PREFIX hub: <http://example.org/vocab-hub#>
INSERT DATA { GRAPH <${this.graphdb.mappingGraph}> {
  ${iri(graphUri)} a hub:OntologyAlignment ;
    hub:alignmentId "${escapeSparqlString(dto.id)}" ;
    hub:sourceOntology ${iri(dto.sourceOntology)} ; hub:targetOntology ${iri(dto.targetOntology)} ;
    hub:uploadedFile "${escapeSparqlString(file.originalname)}" .
} }`);
    return { id: dto.id, graph: graphUri, source: dto.sourceOntology,
      target: dto.targetOntology, file: file.originalname, bytes: file.size };
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
