#!/bin/bash

# USA albers
PROJECTION='d3.geoAlbersUsa()'

# Year to pull census geo data from
YEAR=2017

# Display height and width
WIDTH=960
MAPHEIGHT=600
SVGHEIGHT=800

# Download the Census shapefiles
# and extract them (.shp & .dbf)
if [ ! -f cb_${YEAR}_us_state_20m.shp ]; then # state files
  curl -Lo cb_${YEAR}_us_state_20m.zip \
    "http://www2.census.gov/geo/tiger/GENZ${YEAR}/shp/cb_${YEAR}_us_state_20m.zip"
  unzip -o \
    cb_${YEAR}_us_state_20m.zip \
    cb_${YEAR}_us_state_20m.shp \
    cb_${YEAR}_us_state_20m.dbf
fi

if [ ! -f cb_${YEAR}_us_cbsa_20m.shp ]; then # metro files
  curl -Lo cb_${YEAR}_us_cbsa_20m.zip \
    "http://www2.census.gov/geo/tiger/GENZ${YEAR}/shp/cb_${YEAR}_us_cbsa_20m.zip"
  unzip -o \
    cb_${YEAR}_us_cbsa_20m.zip \
    cb_${YEAR}_us_cbsa_20m.shp \
    cb_${YEAR}_us_cbsa_20m.dbf
fi


shp2json cb_2017_us_state_20m.shp > states.geojson # Convert state shapefile to geojson

shp2json cb_${YEAR}_us_cbsa_20m.shp > metroareas.geojson # Convert metro area shapefile to geojson

node mapMetroPathsToCircles.js # Create points from metroarea geojson

node mapAndMergeStates.js # merge circles with state features and output data.geojson

geoproject "${PROJECTION}.fitSize([${WIDTH}, ${MAPHEIGHT}], d)" < data.geojson | # Scale the geojson to needed specs and output

ndjson-split 'd.features' > data.ndjson # convert to ndjson and output

geo2svg --newline-delimited -w ${WIDTH} -h ${SVGHEIGHT} < data.ndjson > data.svg

# clean up dir
find . -name "*.zip" -exec rm -f {} \;
rm states.geojson metroareas.geojson circles.geojson
