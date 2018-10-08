#! /usr/bin/env node
const fs = require('fs');

const states    = JSON.parse(fs.readFileSync('./states.geojson', 'utf8'));
const circles   = JSON.parse(fs.readFileSync('./circles.geojson', 'utf8'));

const parseStates = features => features.map(({ type, properties, geometry }) => ({
    type,
    geometry,
    properties: {
        name: properties.NAME,
        stateFP: properties.STATEFP,
    }
})).filter(({ geometry }) => geometry);

const res = {
    "type": "FeatureCollection",
    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::4269" } },
    "features": circles.features.slice().concat(parseStates(states.features)),
};

fs.writeFile('./data.geojson', JSON.stringify(res), function(err) {
    if(err) {
        return console.log(err);
    }

    return console.log("data.geojson was created");
}); 