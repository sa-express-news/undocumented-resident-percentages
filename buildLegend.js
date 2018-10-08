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
        w: 960,
        h: 500
    },
    alias: {
        w: 'width',
        h: 'height',
    }
});

const svg = d3n.createSVG(width, height).append('g')
                            .attr('class', 'legend')
                            .attr('transform', `translate(20, ${height - 110})`);

const groupXPointer = {
    val: 0,
    getCurr: function () {
        return this.val + 15;
    },
    increment: function (d) {
        this.val += 30 + (radiusScale(d) * 2);
    }
};

const groups = svg.selectAll('g')
    .data(d3.ticks(domain[0], domain[1], 5))
    .enter()
    .append('g')
        .attr('transform', function(d, i) {
            const x = groupXPointer.getCurr();
            groupXPointer.increment(d);
            return `translate(${x}, 15)`;
        });

groups.append('circle')
        .attr('r', function (d) { return radiusScale(d); })
        .style('stroke', '#e34a33')
        .style('stroke-width', 1.5)
        .style('fill', '#b30000')
        .style('fill-opacity', 0.5);

groups.append('text')
        .attr('transform', 'translate(0, 50)')
        .style('text-anchor', 'middle')
        .text(function (d) { return d });

fs.writeFile('./legend.svg', d3n.svgString(), function(err) {
    if(err) {
        return console.log(err);
    }

    return console.log("legend was created");
}); 