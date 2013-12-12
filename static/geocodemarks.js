
    var geocoder;
    var map;
    var yourLocationMarker
    var markersArray = [];
    var positionArray = [];
    var bounds;

    var destinationIcon = 'https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=D|FF0000|000000';
    var originIcon = 'https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=O|FFFF00|000000';

    //Would be an array of marker objects that contain lat long, title based off of spreadsheet info.
    var nyCenter;
    var mark1;
    var mark2;
    var mark3;


    function loadAPI()
    {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://maps.googleapis.com/maps/api/js?v=3&key=AIzaSyDjtvRTyBjkL1ZWiYwkvSoZWBkL9AR5Pf0&sensor=false&' +
            'callback=loadVisual';
        document.body.appendChild(script);

    }

    function loadVisual()
    {

    google.load("visualization", "1", {"callback" : initialize});
    }

    function loadMaps()
    {
        loadAPI();

        //AJAX API is loaded successfully. Now lets initialize the map


    }


    function initialize() {

        bounds = new google.maps.LatLngBounds();
        nyCenter = new google.maps.LatLng(40.6827785, -73.98247179);
        geocoder = new google.maps.Geocoder();
        var mapOptions = {
            center: nyCenter,
            zoom: 14,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(document.getElementById("map-canvas"),mapOptions);


        //add markers to array
        getQuery();

        //set hard coded markers on map
        setAllMap(map)

    }

  function codeAddress() {
      var address = document.getElementById("address").value;
      geocoder.geocode( { 'address': address}, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
          map.setCenter(results[0].geometry.location);
          yourLocation = results[0].geometry.location;
          calculateDistances();
          } else {
              alert("Geocode was not successful for the following reason: " + status);
          }
      });
    }

    function calculateDistances() {
      var service = new google.maps.DistanceMatrixService();
      service.getDistanceMatrix(
        {
          origins: [yourLocation],
          destinations: positionArray,
          travelMode: google.maps.TravelMode.WALKING,
          unitSystem: google.maps.UnitSystem.IMPERIAL,
          avoidHighways: false,
          avoidTolls: false
        }, callback);
    }

    function callback(response, status) {
      if (status != google.maps.DistanceMatrixStatus.OK) {
        alert('Error was: ' + status);
      } else {
        var origins = response.originAddresses;
        var destinations = response.destinationAddresses;
        var outputDiv = document.getElementById('outputDiv');
        outputDiv.innerHTML = '';
        deleteOverlays();

        for (var i = 0; i < origins.length; i++) {
          var results = response.rows[i].elements;
          addMarker(origins[i], false);
          for (var j = 0; j < results.length; j++) {
            addMarker(destinations[j], true);
            outputDiv.innerHTML += origins[i] + ' to ' + destinations[j]
                + ': ' + results[j].distance.text + ' in '
                + results[j].duration.text + '<br>';
          }
        }
      }
    }

    function addMarker(location, isDestination) {
      var icon;
      if (isDestination) {
        icon = destinationIcon;
      } else {
        icon = originIcon;
      }
      geocoder.geocode({'address': location}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          bounds.extend(results[0].geometry.location);
          map.fitBounds(bounds);
          var marker = new google.maps.Marker({
            map: map,
            position: results[0].geometry.location,
            icon: icon
          });
          markersArray.push(marker);
        } else {
          alert('Geocode was not successful for the following reason: '
            + status);
        }
      });
    }

    function deleteOverlays() {
      for (var i = 0; i < markersArray.length; i++) {
        markersArray[i].setMap(null);
      }
      markersArray = [];
    }

    // Sets the map on all markers in the array.
    function setAllMap(map) {
      for (var i = 0; i < markersArray.length; i++) {
        markersArray[i].setMap(map);
      }
    }

    // Add a marker to the map and push to the array.
    //TODO: Add name as parameter to input so marker has a name
    function addHardMarker(location) {
      var marker = new google.maps.Marker({
        position: location,
        map: map
      });
      markersArray.push(marker);
    }

  function getQuery() {
        // To see the data that this visualization uses, browse to
        // http://spreadsheets.google.com/ccc?key=pCQbetd-CptGXxxQIG7VFIQ
        var query = new google.visualization.Query(
            'https://docs.google.com/spreadsheet/ccc?key=0Aj8GFQaFqHn6dFZ3SzhFc3Z1QlJrQV80RTN0UnF6V1E#gid=0');

        // Apply query language.
        query.setQuery('SELECT A, B, C, D');

        // Send the query with a callback function.
        query.send(handleQueryResponse);

      }

  function handleQueryResponse(response) {
    if (response.isError()) {
      alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
      return;
    }
    //var outputDiv = document.getElementById('outputDiv2');
    //    outputDiv.innerHTML = '';
    var data = response.getDataTable();
    var numRows = data.getNumberOfRows();
    //outputDiv.innerHTML = "This should be lat Value: " +  data.getFormattedValue(0, 3);
    for (var i = 0; i < numRows; i++) {
     var lat = data.getFormattedValue(i, 2);
     var long = data.getFormattedValue(i, 3);
     var address = data.getFormattedValue(i, 1)
     if((lat == null || long == null) &&  address != null) {
         geocoder.geocode( { 'address': address}, function(results, status) {
                 if (status == google.maps.GeocoderStatus.OK) {
                  yourLocation = results[0].geometry.location;
                  data.setCell(i, 2) = yourLocation.lat();
                  data.setCell(i, 3) = yourLocation.lng();
                  var mark = new google.maps.LatLng(data.getFormattedValue(i, 2), data.getFormattedValue(i, 3));
                  positionArray.push(mark);
                  addHardMarker(mark);
                 } else {
                     alert("Geocode was not successful for the following reason: " + status);
                 }

         });
     } else {
     var mark = new google.maps.LatLng(lat, long);
     //outputDiv.innerHTML = "This should be location Value: " +  mark1;
     positionArray.push(mark);
     addHardMarker(mark);
    }
   }

 }

