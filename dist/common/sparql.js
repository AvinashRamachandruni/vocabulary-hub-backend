"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeSparqlString = escapeSparqlString;
exports.iri = iri;
function escapeSparqlString(value) {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}
function iri(value) {
    if (!/^https?:\/\//i.test(value) && !/^urn:/i.test(value)) {
        throw new Error(`Invalid IRI: ${value}`);
    }
    return `<${value.replace(/>/g, '%3E')}>`;
}
//# sourceMappingURL=sparql.js.map