#!/bin/bash
echo "Testing Rasa files..."
echo "Config file exists: $(test -f config.yml && echo YES || echo NO)"
echo "Domain file exists: $(test -f domain.yml && echo YES || echo NO)"
echo "Models found: $(ls models/ | wc -l) model(s)"
echo "Data files: $(find data -name "*.yml" | wc -l) YML file(s)"