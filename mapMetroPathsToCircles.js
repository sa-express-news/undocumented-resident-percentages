#! /usr/bin/env node
const fs        = require('fs');
const turf      = require('@turf/turf');
const parseCSV  = require('csv-parse/lib/sync');
const d3        = require('d3');

const metro         = JSON.parse(fs.readFileSync('./metroareas.geojson', 'utf8'));
const undocumented  = parseCSV(fs.readFileSync('./metro-area-percent-undocumented.csv', 'utf8'), { columns: true });

const undocumentedHash = undocumented.reduce((res, hash) => {
    res[hash.Area] = hash;
    return res;
}, {});

const getRadiusDomain = undocumented => {
    const nums = undocumented.map(area => area['Unauthorized immigrant % of total pop.']).sort((a, b) => a - b);
    return [parseFloat(nums[0], 10), parseFloat(nums[nums.length - 1], 10)];
};

const radiusScale = d3.scalePow().exponent(2).domain(getRadiusDomain(undocumented.slice())).range([2,30]);

const getPoint = feature => turf.center(feature);

const getID = name => {
    return `metro-${name.replace(/[\.\,]/, '').replace(/\s/, '-').toLowerCase()}`;
};

const getProperties = (feature, percentUndocumented) => ({
    title: `${feature.properties.NAME}: ${parseFloat(percentUndocumented, 10)}% undocumented`,
    pointRadius: radiusScale(parseFloat(percentUndocumented, 10)),
    stroke: '#e34a33',
    strokeWidth: 1.5,
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
        point.id = getID(feature.properties.NAME);
        resFeatures.push(point);
    }
    return resFeatures;
};

const res = {
    "type": "FeatureCollection",
    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::4269" } },
    "features": metro.features.reduce(getPoints, []),
};

fs.writeFile('./circles.geojson', JSON.stringify(res), function(err) {
    if(err) {
        return console.log(err);
    }

    return console.log("circles.geojson was created");
}); 
