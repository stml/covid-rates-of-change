var first_limit = 100;

var countries = [];

$( document ).ready(function() {

  drawGraph();

  $( "#select-all" ).click(function() {
    $('.line').removeClass('grey_line');
    $('.label').removeClass('grey_label');
    $('.country_checkbox').prop('checked', true);
    });
  $( "#deselect-all" ).click(function() {
    $('.line').addClass('grey_line');
    $('.label').addClass('grey_label');
    $('.country_checkbox').prop('checked', false);
    });
  $( "#personal" ).click(function() {
    $('.line').removeClass('grey_line');
    $('.label').removeClass('grey_label');
    $('.line').addClass('grey_line');
    $('.label').addClass('grey_label');
    $('.country_checkbox').prop('checked', false);
    $('#line_UK').removeClass('grey_line');
    $('#label_UK').removeClass('grey_label');
    $('#check_UK').prop('checked', true);
    $('#line_IT').removeClass('grey_line');
    $('#label_IT').removeClass('grey_label');
    $('#check_IT').prop('checked', true);
    $('#line_FR').removeClass('grey_line');
    $('#label_FR').removeClass('grey_label');
    $('#check_FR').prop('checked', true);
    $('#line_EL').removeClass('grey_line');
    $('#label_EL').removeClass('grey_label');
    $('#check_EL').prop('checked', true);
    $('#line_US').removeClass('grey_line');
    $('#label_US').removeClass('grey_label');
    $('#check_US').prop('checked', true);
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
    $('.label').toggleClass('black_label');
    });

  });

function drawGraph() {

$('#first_limit').html(first_limit);

// set the dimensions and margins of the graph
var margin = {top: 25, right: 50, bottom: 35, left: 50},
    width = Math.round($("#graph").parent().width()) - margin.left - margin.right,
    height = Math.round($("#graph").parent().width()/2) - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#graph")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.csv("data/covid.csv").then(function(csv_data) {

  // REVERSE FOR TIME ORDER!
  csv_data.reverse();

  // CSV Column Headers:
  // DateRep,Day,Month,Year,Cases,Deaths,Countries and territories,GeoId

  parseDate = d3.timeParse("%d/%m/%Y");

  // Parse csv contents, create countries array with cumulative totals.
  csv_data.forEach(function(d) {
    d.DateRep = parseDate(d.DateRep);
    d.Day = +d.Day;
    d.Month = +d.Month;
    d.Year = +d.Year;
    d.Cases = +d.Cases;
    d.Deaths = +d.Deaths;
    if (typeof countries[d.GeoId] != "undefined") {
      countries[d.GeoId]['cases'] = countries[d.GeoId]['cases'] + d.Cases;
      countries[d.GeoId]['deaths'] = countries[d.GeoId]['deaths'] + d.Deaths;
      d.cumulativeCases = countries[d.GeoId]['cases'];
      d.cumulativeDeaths = countries[d.GeoId]['deaths'];
    } else {
      countries[d.GeoId] = [];
      countries[d.GeoId]['cases'] = d.Cases;
      countries[d.GeoId]['deaths'] = d.Cases;
      countries[d.GeoId]['id'] = d.GeoId;
      countries[d.GeoId]['name'] = d['Countries and territories'];
      d.cumulativeCases = countries[d.GeoId]['cases'];
      d.cumulativeDeaths = countries[d.GeoId]['deaths'];
      }
    });

  var cases_data = [];
  // New array only with entries where cumulative total cases >= 100
  csv_data.forEach(function(d) {
    if (d.cumulativeCases >= first_limit) {
      cases_data.push(d)
      }
    });

  var data = d3.nest()
    .key(function(d) { return d.GeoId; })
    .entries(cases_data);

  data.forEach(function(d) {
    countries[d.key]['firstdate'] = d.values[0].DateRep;
  });

  // A color scale: one color for each group
  var myColor = d3.scaleOrdinal()
    .domain(data)
    .range(d3.schemeSet2);

  // Note axis domains are based on total cases_data

  // OLD x-axis code for dates
  // var x = d3.scaleTime()
  //   .range([ 0, width ])
  //   .domain(d3.extent(cases_data, function(d) { return d.DateRep; }));
  // svg.append("g")
  //   .attr("transform", "translate(0," + height + ")")
  //   .call(d3.axisBottom(x));

  // Add linear x-axis in days
  var x = d3.scaleLinear()
    .range([ 0, width ])
    .domain([0,d3.max(cases_data, function(d) { return Math.ceil(Math.abs(d.DateRep - countries[d.GeoId].firstdate) / (1000 * 60 * 60 * 24)) } )]);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .attr("id","x_axis");

  // Add Y axis
  var y = d3.scaleLog()
    .base(2)
    .range([ height, 1 ])
    .domain([first_limit, d3.max(cases_data, function(d) { return d.cumulativeCases; })]);
  svg.append("g")
    .call(d3.axisLeft(y))
    .attr("id","y_axis");

  // Add the lines
  var line = d3.line()
    .x(function(d) { return x(Math.ceil(Math.abs(d.DateRep - countries[d.GeoId].firstdate) / (1000 * 60 * 60 * 24))) })
    .y(function(d) { return y(d.cumulativeCases) });
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

  // Add a legend at the end of each line
  svg
    .selectAll("myLabels")
    .data(data)
    .enter()
      .append('g')
      .append("text")
        .datum(function(d) { return {name: d.key, value: d.values[d.values.length - 1]}; }) // keep only the last value of each time series
        .attr("transform", function(d) { return "translate(" + x(Math.ceil(Math.abs(d.value.DateRep - countries[d.value.GeoId].firstdate) / (1000 * 60 * 60 * 24))) + "," + y(d.value.cumulativeCases) + ")"; }) // Put the text at the position of the last point
        .attr("x", 6) // shift the text a bit more right
        .attr("y", 4) // shift the text a bit more right
        .text(function(d) { return d.value['Countries and territories'].replace(/\_/g, " ");; })
        .style("fill", function(d){ return myColor(d.name) })
        .style("font-size", 12)
        .attr("id", function(d){ return 'label_'+d.name })
        .attr("class", "label");

    for(country in countries) {
      $('#selectors').prepend('<li><label><input type="checkbox" class="country_checkbox" id="check_'+countries[country]['id']+'" name="'+countries[country]['id']+'" value="'+countries[country]['id']+'" checked> '+countries[country]['name'].replace(/\_/g,' ')+'</label> ('+countries[country]['cases']+' / '+countries[country]['deaths']+')</li>');
    }

    $('.country_checkbox').change(function() {
      if(this.checked) {
        $('#line_'+this.name).removeClass('grey_line');
        $('#label_'+this.name).removeClass('grey_label');
      } else {
        $('#line_'+this.name).addClass('grey_line');
        $('#label_'+this.name).addClass('grey_label');
      }});

});


}
