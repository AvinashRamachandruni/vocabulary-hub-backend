#!/bin/sh
set -eu

REPOSITORY_URL="${GRAPHDB_URL:-http://graphdb:7200/repositories/Vocabulary_Hub_MVP}"
BASE_URL="$(printf '%s' "$REPOSITORY_URL" | sed 's#/repositories/[^/]*$##')"
REPO="$(printf '%s' "$REPOSITORY_URL" | sed 's#^.*/repositories/##')"
if [ "$BASE_URL" = "$REPOSITORY_URL" ] || [ -z "$REPO" ]; then
  echo "GRAPHDB_URL must be a repository URL ending in /repositories/{repository}" >&2
  exit 1
fi
MAPPING_GRAPH="${GRAPHDB_MAPPING_GRAPH:-http://example.org/graph/hub/mappings}"
RESOURCE_GRAPH="${GRAPHDB_RESOURCE_GRAPH:-http://example.org/graph/hub/resources}"
IFC_GRAPH="${GRAPHDB_IFC_GRAPH:-http://example.org/graph/ontology/ifc}"

echo "Waiting for GraphDB at ${BASE_URL}..."
until curl -fsS "${BASE_URL}/rest/repositories" >/dev/null 2>&1; do sleep 3; done

if ! curl -fsS "${BASE_URL}/rest/repositories" | grep -q "\"id\"[[:space:]]*:[[:space:]]*\"${REPO}\""; then
  echo "Creating repository ${REPO}..."
  curl -fsS -X POST -F "config=@/init/repository-config.ttl" "${BASE_URL}/rest/repositories" >/dev/null
else
  echo "Repository ${REPO} already exists."
fi

upload() {
  file="$1"; graph="$2"; type="$3"
  echo "Uploading $(basename "$file") -> $graph"
  curl -fsS -X POST \
    -H "Content-Type: ${type}" \
    --data-binary "@${file}" \
    "${REPOSITORY_URL}/statements?context=%3C$(printf '%s' "$graph" | sed 's/:/%3A/g; s#/#%2F#g')%3E" >/dev/null
}

upload /seed/hub_resources.ttl "$RESOURCE_GRAPH" text/turtle
upload /seed/hub_mappings.ttl "$MAPPING_GRAPH" text/turtle
upload /seed/IFContology.xml "$IFC_GRAPH" application/rdf+xml

echo "GraphDB initialization complete."
