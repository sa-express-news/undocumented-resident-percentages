#! /usr/bin/env node
const fs        = require('fs');
const turf      = require('@turf/turf');
const parseCSV  = require('csv-parse/lib/sync');
const d3        = require('d3');

const states        = JSON.parse(fs.readFileSync('./states.geojson', 'utf8'));
const metro         = JSON.parse(fs.readFileSync('./metroareas.geojson', 'utf8'));
const undocumented  = parseCSV(fs.readFileSync('./metro-area-percent-undocumented.csv', 'utf8'), { columns: true });

const res = {
    "type": "FeatureCollection",
    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::4269" } },
    "features": [],
};

const undocumentedHash = undocumented.reduce((res, hash) => {
    res[hash.Area] = hash;
    return res;
}, {});

const getRadiusDomain = undocumented => {
    const nums = undocumented.map(area => area['Unauthorized immigrant % of total pop.']).sort((a, b) => a - b);
    return [parseFloat(nums[0], 10), parseFloat(nums[nums.length - 1], 10)];
};

const radiusScale = d3.scaleLinear().domain(getRadiusDomain(undocumented.slice())).range([4.5,25]);

const getPoint = feature => turf.center(feature);

const getProperties = (feature, percentUndocumented) => ({
    percentUndocumented: parseFloat(percentUndocumented, 10),
    name: feature.properties.NAME,
    pointRadius: radiusScale(parseFloat(percentUndocumented, 10)),
    stroke: '#e34a33',
    fill: '#b30000',
    fillOpacity: 0.5,
});

const getUndocumented = feature => {
    if (undocumentedHash[feature.properties.NAME]) {
        return undocumentedHash[feature.properties.NAME]['Unauthorized immigrant % of total pop.'];
    } else {
        return null;
    }
};

const getPoints = (resFeatures, feature) => {
    const percentUndocumented = getUndocumented(feature);
    if (percentUndocumented) {
        const point = getPoint(feature);
        point.properties = getProperties(feature, percentUndocumented);
        resFeatures.push(point);
    }
    return resFeatures;
};

const parseStates = features => features.map(({ type, properties, geometry }) => ({
    type,
    geometry,
    properties: {
        name: properties.NAME,
        stateFP: properties.STATEFP,
    }
})).filter(({ geometry }) => geometry);

res.features = metro.features.reduce(getPoints, []).concat(parseStates(states.features));

fs.writeFile('./data.geojson', JSON.stringify(res), function(err) {
    if(err) {
        return console.log(err);
    }

    return console.log("data.geojson was created");
}); 