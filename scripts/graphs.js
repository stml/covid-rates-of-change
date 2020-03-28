var first_limit = 100;

var svg;
var casesdeaths = 'Cases';
var cd = ['cumulativeCases','cumulativeDeaths'];
var r;

$( document ).ready(function() {

  prepData(casesdeaths);

  $( "#select-all" ).click(function() {
    $('.line').removeClass('grey_line');
    $('.dot').removeClass('grey_line');
    $('.label').removeClass('grey_label');
    $('.country_checkbox').prop('checked', true);
    });
  $( "#deselect-all" ).click(function() {
    $('.line').addClass('grey_line');
    $('.dot').addClass('grey_line');
    $('.label').addClass('grey_label');
    $('.country_checkbox').prop('checked', false);
    });

  var personal = ['UK','IT','FR','EL','US','UZ'];

  $( "#personal" ).click(function() {
    $('.line').removeClass('grey_line');
    $('.dot').removeClass('grey_line');
    $('.label').removeClass('grey_label');
    $('.line').addClass('grey_line');
    $('.dot').addClass('grey_line');
    $('.label').addClass('grey_label');
    $('.country_checkbox').prop('checked', false);
    for (var i = 0; i < personal.length; i++) {
      $('#line_'+personal[i]).removeClass('grey_line');
      $('#dot_'+personal[i]).removeClass('grey_line');
      $('#label_'+personal[i]).removeClass('grey_label');
      $('#check_'+personal[i]).prop('checked', true);
      }
    });

  $( "#toggle-axes" ).click(function() {
    $('#x_axis').toggle();
    $('#y_axis').toggle();
    });
  var labels_on = 1;
  $( "#toggle-labels" ).click(function() {
    if (labels_on == 1) {
      $('.label').hide();
      labels_on = 0;
    } else {
      $('.label').show();
      labels_on = 1;
      }
    });
  $( "#toggle-colours" ).click(function() {
    $('.line').toggleClass('black_line');
    $('.dot').toggleClass('black_label');
    $('.label').toggleClass('black_label');
    });

  $('#first_limit').change( function() {
    first_limit = this.value;
    clearGraph();
    prepData(casesdeaths);
    });

  $('#casesdeaths').change( function() {
    casesdeaths = this.value;
    $('#casedeath').html(casesdeaths.toLowerCase());
    clearGraph();
    prepData(casesdeaths);
    });

  });

function prepData(casesdeaths) {
  //Read the data
  d3.csv("data/covid.csv").then(function(csv_data) {

    // REVERSE FOR TIME ORDER!
    csv_data.reverse();

    // CSV Column Headers:
    // DateRep,Day,Month,Year,Cases,Deaths,Countries and territories,geoId

    parseDate = d3.timeParse("%d/%m/%Y");

    // (re-)initialise these arrays at each pass
    var countries = [];
    var cases_data = [];
    var data = [];

    // Parse csv contents, create countries array with cumulative totals.
    csv_data.forEach(function(d) {
      d.dateRep = parseDate(d.dateRep);
      d.day = +d.day;
      d.month = +d.month;
      d.year = +d.year;
      d.cases = +d.cases;
      d.deaths = +d.deaths;
      if (typeof countries[d.geoId] != "undefined") {
        countries[d.geoId]['cases'] = countries[d.geoId]['cases'] + d.cases;
        countries[d.geoId]['deaths'] = countries[d.geoId]['deaths'] + d.deaths;
        d.cumulativeCases = countries[d.geoId]['cases'];
        d.cumulativeDeaths = countries[d.geoId]['deaths'];
      } else {
        countries[d.geoId] = [];
        countries[d.geoId]['cases'] = d.cases;
        countries[d.geoId]['deaths'] = d.deaths;
        countries[d.geoId]['id'] = d.geoId;
        countries[d.geoId]['name'] = d.countriesAndTerritories;
        d.cumulativeCases = countries[d.geoId]['cases'];
        d.cumulativeDeaths = countries[d.geoId]['deaths'];
        }
      });
    console.log(csv_data);

    // trim to just the dates we want
    var cases_data = [];

    // are we doing cases or deaths?
    if (casesdeaths == 'Cases') {
      r = '0';
    } else {
      r = '1';
    }

    // New array only with entries where cumulative total >= 100
    csv_data.forEach(function(d) {
      if (d[cd[r]] >= first_limit) {
        cases_data.push(d)
        }
      });

    // New array for final graph data
    var data = [];

    // sort data and nest by countries
    data = d3.nest()
      .key(function(d) { return d.geoId; })
      .entries(cases_data);

    // get earliest date from data for each country
    data.forEach(function(d) {
      countries[d.key]['firstdate'] = d.values[0].dateRep;
    });

    // Get latest update date from data and write to page
    var formatTime = d3.timeFormat("%B %d, %Y");
    $('#latest_update').html(formatTime(d3.max(cases_data, function(d) { return d.dateRep; })));

    drawGraph(data,cases_data,countries);

    // Add all the checkboxes
    for(country in countries) {
      $('#selectors').prepend('<li><label><input type="checkbox" class="country_checkbox" id="check_'+countries[country]['id']+'" name="'+countries[country]['id']+'" value="'+countries[country]['id']+'" checked> '+countries[country]['name'].replace(/\_/g,' ')+'</label> ('+countries[country]['cases']+' / '+countries[country]['deaths']+')</li>');
    }

    // checkbox functions
    $('.country_checkbox').change(function() {
      if(this.checked) {
        $('#line_'+this.name).removeClass('grey_line');
        $('#dot_'+this.name).removeClass('grey_line');
        $('#label_'+this.name).removeClass('grey_label');
      } else {
        $('#line_'+this.name).addClass('grey_line');
        $('#dot_'+this.name).addClass('grey_line');
        $('#label_'+this.name).addClass('grey_label');
      }});
  });
}

function clearGraph() {
  d3.selectAll("svg > *").remove();
  $('#graph_box').remove();
  }

function drawGraph(data,cases_data,countries) {

// set the dimensions and margins of the graph
var margin = {top: 25, right: 50, bottom: 35, left: 50},
    width = Math.round($("#graph").parent().width()) - margin.left - margin.right,
    height = Math.round($("#graph").parent().width()/2) - margin.top - margin.bottom;

// append the svg object to the body of the page
svg = d3.select("#graph")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .attr("id", "graph_box")
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

  // A color scale: one color for each group
  var myColor = d3.scaleOrdinal()
    .domain(data)
    .range(d3.schemeSet2);

  // Note axis domains are based on total cases_data

  // OLD x-axis code for dates
  // var x = d3.scaleTime()
  //   .range([ 0, width ])
  //   .domain(d3.extent(cases_data, function(d) { return d.dateRep; }));
  // svg.append("g")
  //   .attr("transform", "translate(0," + height + ")")
  //   .call(d3.axisBottom(x));

  // Add linear x-axis in days
  var x = d3.scaleLinear()
    .range([ 0, width ])
    .domain([0,d3.max(cases_data, function(d) { return Math.ceil(Math.abs(d.dateRep - countries[d.geoId].firstdate) / (1000 * 60 * 60 * 24)) } )]);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .attr("id","x_axis");

  // Add Y axis
  var y = d3.scaleLog()
    .range([ height, 1 ])
    .domain([first_limit, d3.max(cases_data, function(d) { return d[cd[r]]; })]);
  svg.append("g")
    .call(d3.axisLeft(y).ticks(10, "~s"))
    .attr("id","y_axis");


  // Add the lines
  var line = d3.line()
    .x(function(d) { return x(Math.ceil(Math.abs(d.dateRep - countries[d.geoId].firstdate) / (1000 * 60 * 60 * 24))) })
    .y(function(d) { return y(d[cd[r]]) });
  svg.selectAll("myLines")
    .data(data)
    .enter()
    .append("path")
      .attr("d", function(d){ return line(d.values) } )
      .attr("stroke", function(d){ return myColor(d.key) })
      .style("stroke-width", 2)
      .style("fill", "none")
      .attr("id", function(d){ return 'line_'+d.key })
      .attr("class", "line");

  // Add dot to end of lines
  svg
    .selectAll("myDots")
    .data(data)
    .enter()
      .append('g')
      .append("circle")
        .datum(function(d) { return {name: d.key, value: d.values[d.values.length - 1]}; }) // keep only the last value of each time series
        .attr("cx", function(d) { return x(Math.ceil(Math.abs(d.value.dateRep - countries[d.value.geoId].firstdate) / (1000 * 60 * 60 * 24))) })
        .attr("cy", function(d) { return y(d.value[cd[r]]) })
        .attr("r", 2)
        .style("fill", function(d){ return myColor(d.name) })
        .attr("id", function(d){ return 'dot_'+d.name })
        .attr("class", "dot");

  // Add a legend at the end of each line
  svg
    .selectAll("myLabels")
    .data(data)
    .enter()
      .append('g')
      .append("text")
        .datum(function(d) { return {name: d.key, value: d.values[d.values.length - 1]}; }) // keep only the last value of each time series
        .attr("transform", function(d) { return "translate(" + x(Math.ceil(Math.abs(d.value.dateRep - countries[d.value.geoId].firstdate) / (1000 * 60 * 60 * 24))) + "," + y(d.value[cd[r]]) + ")"; }) // Put the text at the position of the last point
        .attr("x", 6) // shift the text a bit more right
        .attr("y", 4) // shift the text a bit more right
        .text(function(d) { return d.value.countriesAndTerritories.replace(/\_/g, " ");; })
        .style("fill", function(d){ return myColor(d.name) })
        .style("font-size", 12)
        .attr("id", function(d){ return 'label_'+d.name })
        .attr("class", "label");

}
