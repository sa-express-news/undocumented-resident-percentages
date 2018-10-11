#! /usr/bin/env node
const fs        = require('fs');
const D3Node    = require('d3-node');
const parseCSV  = require('csv-parse/lib/sync');

const d3n   = new D3Node();
const d3    = d3n.d3;

const undocumented  = parseCSV(fs.readFileSync('./metro-area-percent-undocumented.csv', 'utf8'), { columns: true });

const getRadiusDomain = undocumented => {
    const nums = undocumented.map(area => area['Unauthorized immigrant % of total pop.']).sort((a, b) => a - b);
    return [parseFloat(nums[0], 10), parseFloat(nums[nums.length - 1], 10)];
};

const domain = getRadiusDomain(undocumented.slice());

const radiusScale = d3.scalePow().exponent(2).domain(domain).range([2,30]);

const { width, height } = require('minimist')(process.argv.slice(2), { // parse the -w and -h flags using minimist
    default: {
        w: 200,
        h: 200
    },
    alias: {
        w: 'width',
        h: 'height',
    }
});

const svg = d3n.createSVG(width, height);

const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(" + (width - 75) + "," + (height - 20) + ")")
  .selectAll("g")
    .data([5, 8, 10])
  .enter().append("g");

legend.append("circle")
    .attr("cy", function(d) { return -radiusScale(d); })
    .attr("r", radiusScale)
    .style('fill', 'none')
    .style('stroke', '#e34a33')
    .style('stroke-opacity', 0.8);

legend.append('line')
    .attr('x2', function () { return radiusScale(domain[1]) + 4; })
    .attr('y1', function(d) { return -2 * radiusScale(d); })
    .attr('y2', function(d) { return -2 * radiusScale(d); })
    .style('stroke', '#b30000')
    .style('stroke-opacity', 0.5)
    .style('stroke-dasharray', 2);

legend.append("text")
    .attr("y", function(d) { return -2 * radiusScale(d); })
    .attr('x', function () { return radiusScale(domain[1]) + 8; })
    .style('stroke', '#777')
    .style('stroke-width', 0.6)
    .style('fill', '#777')
    .style('font-family', 'sans-serif')
    .style('font-size', '18px')
    .style('text-anchor', 'center')
    .text(function (d) { return `${d}%`; });

const removeOpeningTag = svgStr => { // used to merge topo.svg with legend.svg
    const tagEnd = `height="${height}">`;
    return svgStr.slice(svgStr.indexOf(tagEnd) + tagEnd.length);
}

fs.writeFile('./legend.svg', removeOpeningTag(d3n.svgString()), function(err) {
    if(err) {
        return console.log(err);
    }

    return console.log("legend was created");
}); 