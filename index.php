<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Weather Station</title>  <meta name="description" content="">
  <meta name="author" content="">
  <meta name="viewport" content="width=device-width, initial-scale=1">

    <script src="scripts/jquery.js" type="text/javascript"></script>
    <script src="scripts/d3.min.js"></script>
    <script src="scripts/d3-scale-chromatic.v1.min.js"></script>
    <script src="scripts/d3-time-format.v2.min.js"></script>
    <script src="scripts/graphs.js?=<?=rand()?>" type="text/javascript"></script>
    <link rel="stylesheet" type="text/css" href="css/normalize.css" />
    <link rel="stylesheet" type="text/css" href="css/skeleton.css" />
    <link rel="stylesheet" type="text/css" href="css/styles.css?=<?=rand()?>" />
    <link rel="icon" type="image/png" href="favicon.png">
    <link rel="apple-touch-icon" sizes="128x128" href="favicon.png">
  </head>
  <body>

    <div class="container">

      <div class="row">
        <div class="column">
        <h3>Rates of Change</h3>
        <p>Cumulative number of cases, by number of days since <span id="first_limit">N</span>th case.</p>
        <p>Data from the <a href="https://www.ecdc.europa.eu/en/publications-data/download-todays-data-geographic-distribution-covid-19-cases-worldwide">European Centre for Disease Prevention and Control</a>.</p>
        <p>Code at <a href="https://github.com/stml/covid-rates-of-change">GitHub</a>.</p>
      </div>
      </div>

      <div class="row">
        <div class="column">
          <div id="graph" class="u-full-width">
        </div>
      </div>

      <div class="row">
        <div class="column">
          <button id="select-all">Select All</button>
          <button id="deselect-all">Deselect All</button>
          <button id="personal">Personal Interest</button>
        </div>
      </div>

      <div class="row">
        <div class="column">
          <h5>Countries (Total Cases / Total Deaths)</h5>
          <ul id="selectors"></ul>
        </div>
      </div>


    </div>

  </body>
</html>
