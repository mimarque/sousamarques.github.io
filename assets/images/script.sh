#!/bin/bash

mkdir -p optimized2

for img in *.jpg; do
  convert "$img" -resize 1920x1920 -quality 80 -strip -colorspace sRGB -interlace Plane -sampling-factor 4:2:0 "optimized2/${img%.*}.webp"
done

echo "Optimization complete! Check the 'optimized' folder."
