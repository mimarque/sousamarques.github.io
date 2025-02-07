#!/bin/bash

mkdir -p optimized-jpg

for img in *.webp; do
  convert "$img" -quality 75 -sampling-factor 4:2:0 -strip "optimized-jpg/${img%.*}.jpg"
done

echo "✅ All WebP images converted to optimized JPEGs in 'optimized-jpg/' folder!"
