// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
  .state('map', {
    url: '/',
    templateUrl: 'templates/map.html',
    controller: 'MapCtrl'
  });

  $urlRouterProvider.otherwise("/");

})

.controller('MapCtrl', function($scope, $state, $cordovaGeolocation, $http) {

    var infowindow = new google.maps.InfoWindow({pixelOffset: new google.maps.Size(-25, 0)});

    // check if an element exists in array using a comparer function
    // comparer : function(currentElement)
    Array.prototype.inArray = function(comparer) {
        for(var i=0; i < this.length; i++) {
            if(comparer(this[i])) return true;
        }
        return false;
    };

    // adds an element to the array if it does not already exist using a comparer
    // function
    Array.prototype.pushIfNotExist = function(element, comparer) {
        if (!this.inArray(comparer)) {
            this.push(element);
        }
    };

    function createMarker(icon, latlng, radius, color, html){
      var image = {
        url: icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(12, 13),
        scaledSize: new google.maps.Size(25, 25)
      };
      var stationMarker = new google.maps.Marker({
          position: latlng,
          map: $scope.map,
          icon: image
      });
      var stationCircle = new google.maps.Circle({
        map: $scope.map,
        radius: radius,
        fillColor: color
      });

      google.maps.event.addListener(stationMarker, 'click', function() {
        infowindow.setContent(html);
        infowindow.open($scope.map, stationMarker);
      });

      google.maps.event.addListener($scope.map, 'click', function() {
        infowindow.close();
      });

      stationCircle.bindTo('center', stationMarker, 'position');
    }

    var options = {timeout: 10000, enableHighAccuracy: true};


    $cordovaGeolocation.getCurrentPosition(options).then(function(position){

      $scope.user = {
        latLng: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
        radius: 404
      }

      $scope.stations = [];
      $http({
        url: 'https://sheets.googleapis.com/v4/spreadsheets/10w2lO6wz7amKq8taWrsh6qN-bBXHyya46Z-__8TK0Uc/values/Sheet1!A2:M99?key=AIzaSyD9e_lkQIiKtphl0vGK3MjbC589jQcRtvk'
      }).then(function successCallback(response) {

        $scope.latLng = {lat: 40.748028, lng: -73.997232};

        $scope.mapOptions = {
            center: $scope.latLng,
            zoom: 15,
            zoomControl: false,
            mapTypeControl: false,
            scaleControl: false,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: false,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };
        $scope.map = new google.maps.Map(document.getElementById("map"), $scope.mapOptions);
        $scope.map.setTilt(45);

        // user marker
        $scope.marker = new google.maps.Marker({
            position: $scope.user.latLng,
            map: $scope.map,
            draggable: true,
            zIndex: 99
        });
        $scope.map.panTo($scope.user.latLng);

          for (var n = 0; n < response['data']['values'].length; n++) {
            $scope.stations[n] = {};
            $scope.stations[n]['name'] = response['data']['values'][n][1]
            $scope.stations[n]['experience'] = response['data']['values'][n][2]
            $scope.stations[n]['featured'] = response['data']['values'][n][3]
            $scope.stations[n]['color'] = response['data']['values'][n][4]
            $scope.stations[n]['icon'] = response['data']['values'][n][5]
            $scope.stations[n]['lat'] = response['data']['values'][n][6]
            $scope.stations[n]['lng'] = response['data']['values'][n][7]
            $scope.stations[n]['playing'] = response['data']['values'][n][8]
            $scope.stations[n]['vibes'] = response['data']['values'][n][9]
            $scope.stations[n]['stream'] = response['data']['values'][n][10]
          }
          $scope.playing = {};


          // station markers
          $scope.topStation = 0;
          $scope.stationsInRange = [];
          for (var n = 0; n < $scope.stations.length; n++) {
            $scope.stations[n].radius = 10 * $scope.stations[n].experience;
            $scope.stations[n].latLng = new google.maps.LatLng($scope.stations[n].lat, $scope.stations[n].lng);

            if ($scope.stations[n].playing == "TRUE") {
              if ($scope.stations[n].experience >= $scope.topStation && google.maps.geometry.spherical.computeDistanceBetween($scope.user.latLng, $scope.stations[n].latLng) < $scope.stations[n].radius) {
                $scope.topStation = $scope.stations[n].experience;
              }
              createMarker($scope.stations[n].icon, $scope.stations[n].latLng, $scope.stations[n].radius, $scope.stations[n].color, $scope.stations[n].name);
              if (google.maps.geometry.spherical.computeDistanceBetween($scope.user.latLng, $scope.stations[n].latLng) < $scope.stations[n].radius && $scope.stations[n].playing == "TRUE" && $scope.stations[n].experience >= $scope.topStation) {
                document.getElementById('player').innerHTML = $scope.stations[n].stream;
                $scope.playing = $scope.stations[n];
              }
              if (google.maps.geometry.spherical.computeDistanceBetween($scope.user.latLng, $scope.stations[n].latLng) < $scope.stations[n].radius && $scope.stations[n].playing == "TRUE") {
                $scope.stationsInRange.pushIfNotExist($scope.stations[n], function(e) {
                    return e.name === $scope.stations[n].name;
                });
              }
            }
          }

          setInterval(function() {
            $scope.user.latLng = $scope.marker.position;
            // $cordovaGeolocation.getCurrentPosition(options);
            // $scope.user.latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            // console.log('lat: ' + position.coords.latitude + ' | lng: ' + position.coords.longitude);
            // $scope.marker.setPosition({lat: 23.323, lng: -23.344});
            // $scope.map.panTo({lat: 23.323, lng: -23.344});
            // $scope.marker.setPosition($scope.user.latLng);
            // $scope.map.panTo($scope.user.latLng);



            for (var n = 0; n < $scope.stations.length; n++) {
              if (google.maps.geometry.spherical.computeDistanceBetween($scope.user.latLng, $scope.stations[n].latLng) < $scope.stations[n].radius && $scope.stations[n].playing == "TRUE") {
                $scope.stationsInRange.pushIfNotExist($scope.stations[n], function(e) {
                    return e.name === $scope.stations[n].name;
                });
              } else if (google.maps.geometry.spherical.computeDistanceBetween($scope.user.latLng, $scope.stations[n].latLng) > $scope.stations[n].radius && $scope.stations[n].playing == "TRUE") {
                var result = $scope.stationsInRange.filter(function(obj) {
                  return obj.name !== $scope.stations[n].name
                });
                $scope.stationsInRange = result;
              }
            }
          }, 2000);
        }, function errorCallback(response) {
          console.log(response);
        });

      function setFormPosition() {
        document.getElementById('input-lat').value = position.coords.latitude;
        document.getElementById('input-lng').value = position.coords.longitude;
      }
      setFormPosition();


      // $scope.circle = new google.maps.Circle({
      //   map: $scope.map,
      //   radius: $scope.user.radius,
      //   fillColor: '#AA0000'
      // });
      // $scope.circle.bindTo('center', $scope.marker, 'position');

      // $scope.stations = [
      //   {
      //     name: 'djank yucca',
      //     experience: 45,
      //     featured: true,
      //     color: '#33cd5f',
      //     icon: '../img/dj.png',
      //     lat: 40.730923,
      //     lng: -73.997232,
      //     playing: true,
      //     vibes: 'jungle',
      //     stream: '<iframe width="100%" height="100" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/218081688&amp;auto_play=true&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true"></iframe>'
      //   },
      //   {
      //     name: 'albeit',
      //     experience: 10,
      //     featured: true,
      //     color: '#33cd5f',
      //     icon: '../img/dj.png',
      //     lat: 40.748028,
      //     lng: -73.995755,
      //     playing: true,
      //     vibes: 'chill',
      //     stream: '<iframe width="100%" height="100" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/184815214&amp;auto_play=true&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true"></iframe>'
      //   },
      //   {
      //     name: '3lo',
      //     experience: 30,
      //     featured: true,
      //     color: '#33cd5f',
      //     icon: '../img/dj.png',
      //     lat: 40.750823,
      //     lng: -73.987332,
      //     playing: true,
      //     vibes: 'hip hop',
      //     stream: '<iframe width="100%" height="100" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/219432939&amp;auto_play=true&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true"></iframe>'
      //   }
      // ];

    }, function(error){
      console.log("Could not get location");
    });

  $scope.changeStation = function() {
    var thisName = this.station.name;
    var result = $scope.stationsInRange.filter(function( obj ) {
      return obj.name == thisName;
    });
    $scope.playing = this.station;
    document.getElementById('player').innerHTML = result[0].stream;
  };

  $scope.showThanks = function() {
    document.querySelector('.create-station').innerHTML = 'Thank you for adding your station!<br>Your station will expire in 24 hours';
  };
});
