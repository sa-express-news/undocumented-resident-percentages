#!/bin/bash

# USA albers
PROJECTION='d3.geoAlbersUsa().fitSize([960, 600]'

# Year to pull census geo data from
YEAR=2017

# Display height and width
WIDTH=960
HEIGHT=600

# Download the Census shapefiles
# and extract the shapefiles (.shp)
if [ ! -f cb_${YEAR}_us_state_20m.shp ]; then
  curl -Lo cb_${YEAR}_us_state_20m.zip \
    "http://www2.census.gov/geo/tiger/GENZ${YEAR}/shp/cb_${YEAR}_us_state_20m.zip"
  unzip -o \
    cb_${YEAR}_us_state_20m.zip \
    cb_${YEAR}_us_state_20m.shp \
    cb_${YEAR}_us_state_20m.dbf
fi

if [ ! -f cb_${YEAR}_us_cbsa_20m.shp ]; then
  curl -Lo cb_${YEAR}_us_cbsa_20m.zip \
    "http://www2.census.gov/geo/tiger/GENZ${YEAR}/shp/cb_${YEAR}_us_cbsa_20m.zip"
  unzip -o \
    cb_${YEAR}_us_cbsa_20m.zip \
    cb_${YEAR}_us_cbsa_20m.shp \
    cb_${YEAR}_us_cbsa_20m.dbf
fi

# if [ ! -f cb_${YEAR}_us_nation_20m.shp ]; then
#   curl -Lo cb_${YEAR}_us_nation_20m.zip \
#     "http://www2.census.gov/geo/tiger/GENZ${YEAR}/shp/cb_${YEAR}_us_nation_20m.zip"
#   unzip -o \
#     cb_${YEAR}_us_nation_20m.zip \
#     cb_${YEAR}_us_nation_20m.shp
# fi

shp2json cb_2017_us_state_20m.shp > states.geojson # Convert state shapefile to geojson

shp2json cb_${YEAR}_us_cbsa_20m.shp > metroareas.geojson # Convert metro area shapefile to geojson

#geoproject 'd3.geoAlbersUsa().fitSize([960, 600], d)' > states.geojson # Scale the geojson to needed specs and output

# ndjson-split 'd.features' > states.ndjson # output states as ndjson

# geoproject 'd3.geoAlbersUsa().fitSize([960, 600], d)' > metroareas.geojson

node buildGeoJSON.js # Create points from metroarea geojson, merge with state features and outputs data.geojson

geoproject 'd3.geoAlbersUsa().fitSize([960, 600], d)' < data.geojson | # Scale the geojson to needed specs and output

ndjson-split 'd.features' > data.ndjson # convert to ndjson and output

geo2svg --newline-delimited -w 960 -h 600 < data.ndjson > data.svg


