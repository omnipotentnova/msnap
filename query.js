function setQueryType() {
  // To see the data that this visualization uses, browse to
  // http://spreadsheets.google.com/ccc?key=pCQbetd-CptGXxxQIG7VFIQ
  var query = new google.visualization.Query(
      'https://docs.google.com/spreadsheet/ccc?key=0Aj8GFQaFqHn6dFZ3SzhFc3Z1QlJrQV80RTN0UnF6V1E#gid=0');

  // Apply query language.
  query.setQuery('SELECT Name, Latitude, Longitude);

  // Send the query with a callback function.
  query.send(handleQueryResponse);

}

function handleQueryResponse(response) {
  if (response.isError()) {
    alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
    return;
  }

  var data = response.getDataTable();

}

function getQuery() {
    // To see the data that this visualization uses, browse to
    // http://spreadsheets.google.com/ccc?key=pCQbetd-CptGXxxQIG7VFIQ
    var query = new google.visualization.Query(
        'https://docs.google.com/spreadsheet/ccc?key=0Aj8GFQaFqHn6dFZ3SzhFc3Z1QlJrQV80RTN0UnF6V1E#gid=0');

    // Apply query language.
    query.setQuery('SELECT Name, Latitude, Longitude);

    // Send the query with a callback function.
    query.send(handleQueryResponse);

  }

  function handleQueryResponse(response) {
    if (response.isError()) {
      alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
      return;
    }
    var outputDiv = document.getElementById('outputDiv2');
          outputDiv.innerHTML = '';
    var data = response.getDataTable();
    var numRows = data.getNumberOfRows();
    outputDiv.innerHTML = "This should be lat Value: " +  data.getProperties(i, 3);
    //for (var i = 0; i < ; i++) {
     //   var mark1 = new google.maps.LatLng(data.getProperties(i, 3), data.getProperties(i, 4));
    //}
 }
