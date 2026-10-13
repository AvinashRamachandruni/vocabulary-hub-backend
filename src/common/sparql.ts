export function escapeSparqlString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export function iri(value: string): string {
  if (!/^https?:\/\//i.test(value) && !/^urn:/i.test(value)) {
    throw new Error(`Invalid IRI: ${value}`);
  }
  return `<${value.replace(/>/g, '%3E')}>`;
}
