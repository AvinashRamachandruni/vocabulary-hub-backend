import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GraphdbService {
  readonly repository: string;
  readonly baseUrl: string;
  readonly queryEndpoint: string;
  readonly statementsEndpoint: string;
  readonly mappingGraph: string;
  readonly resourceGraph: string;

  constructor(private readonly config: ConfigService) {
    this.queryEndpoint = this.config.get<string>(
      'GRAPHDB_URL',
      'http://graphdb:7200/repositories/Vocabulary_Hub_MVP',
    ).replace(/\/$/, '');
    this.repository = this.queryEndpoint.split('/').pop() ?? '';
    this.baseUrl = this.queryEndpoint.replace(/\/repositories\/[^/]+$/, '');
    this.statementsEndpoint = `${this.queryEndpoint}/statements`;
    this.mappingGraph = this.config.get<string>('GRAPHDB_MAPPING_GRAPH', 'http://example.org/graph/hub/mappings');
    this.resourceGraph = this.config.get<string>('GRAPHDB_RESOURCE_GRAPH', 'http://example.org/graph/hub/resources');
  }

  async select(query: string): Promise<any[]> {
    const body = new URLSearchParams({ query });
    const response = await fetch(this.queryEndpoint, {
      method: 'POST',
      headers: { Accept: 'application/sparql-results+json', 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!response.ok) throw new ServiceUnavailableException(`GraphDB SELECT failed: ${response.status} ${await response.text()}`);
    const json = await response.json() as any;
    return json.results?.bindings ?? [];
  }

  async update(update: string): Promise<void> {
    const body = new URLSearchParams({ update });
    const response = await fetch(this.statementsEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!response.ok) throw new ServiceUnavailableException(`GraphDB UPDATE failed: ${response.status} ${await response.text()}`);
  }

  async upload(content: Buffer | string, contentType: string, graphUri: string, baseUri?: string): Promise<void> {
    const params = new URLSearchParams({ context: `<${graphUri}>` });
    if (baseUri) params.set('baseURI', `<${baseUri}>`);
    const url = `${this.statementsEndpoint}?${params}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': contentType },
      body: typeof content === 'string' ? content : new Uint8Array(content),
    });
    if (!response.ok) throw new ServiceUnavailableException(`GraphDB upload failed: ${response.status} ${await response.text()}`);
  }

  async ping(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/rest/repositories`, { signal: AbortSignal.timeout(5000) });
      return response.ok;
    } catch {
      return false;
    }
  }
}
