shp2json cb_2017_us_state_20m/cb_2017_us_state_20m.shp | # Convert state shapefile to geojson

geoproject 'd3.geoAlbersUsa().fitSize([960, 600], d)' > states.geojson # Scale the geojson to needed specs and output

# ndjson-split 'd.features' > states.ndjson # output states as ndjson

shp2json cb_2017_us_cbsa_20m/cb_2017_us_cbsa_20m.shp | # Convert metro area shapefile to geojson

geoproject 'd3.geoAlbersUsa().fitSize([960, 600], d)' > metroareas.geojson

node buildGeoJSON.js # Create points from metroarea geojson, merge with state features and outputs data.geojson

ndjson-split 'd.features' < data.geojson > data.ndjson # convert to ndjson and output

geo2svg --newline-delimited -w 960 -h 600 < data.ndjson > data.svg
