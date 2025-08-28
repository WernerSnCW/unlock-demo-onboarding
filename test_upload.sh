#!/bin/bash

# Test the actual upload endpoint with sample data
curl -X POST \
  -F "file=@test_dcf_deck.txt" \
  -F "sector=Technology" \
  -F "stage=Series A" \
  -F "geography=UK" \
  http://localhost:5000/api/analyse-pitch-deck