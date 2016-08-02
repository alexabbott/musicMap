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

.controller('MapCtrl', function($scope, $state, $cordovaGeolocation) {
  var options = {timeout: 10000, enableHighAccuracy: true};

    $cordovaGeolocation.getCurrentPosition(options).then(function(position){

      var mapOptions = {
        center: $scope.latLng,
        zoom: 15,
        mapTypeControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };


      $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

      $scope.user = {
        latLng: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
        radius: 404
      }
      // user marker
      $scope.marker = new google.maps.Marker({
          position: $scope.user.latLng,
          map: $scope.map,
          draggable: true
      });
      // $scope.circle = new google.maps.Circle({
      //   map: $scope.map,
      //   radius: $scope.user.radius,
      //   fillColor: '#AA0000'
      // });
      // $scope.circle.bindTo('center', $scope.marker, 'position');

      $scope.djs = [
        {
          experience: 45,
          name: 'djank yucca',
          lat: 40.730923,
          lng: -73.997232,
          playing: true,
          song: '<iframe width="100%" height="450" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/218081688&amp;auto_play=true&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true"></iframe>'
        },
        {
          experience: 10,
          name: 'albeit',
          lat: 40.748028,
          lng: -73.995755,
          playing: true,
          song: '<iframe width="100%" height="450" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/184815214&amp;auto_play=true&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true"></iframe>'
        },
        {
          experience: 30,
          name: '3lo',
          lat: 40.730823,
          lng: -73.997332,
          playing: true,
          song: '<iframe width="100%" height="450" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/219432939&amp;auto_play=true&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true"></iframe>'
        }
      ];

      $scope.playing = {};

      // dj markers
      $scope.topDJ = 0;
      $scope.djsInRange = [];
      for (var n = 0; n < $scope.djs.length; n++) {
        $scope.djs[n].radius = 10 * $scope.djs[n].experience;
        $scope.djs[n].latLng = new google.maps.LatLng($scope.djs[n].lat, $scope.djs[n].lng);

        if ($scope.djs[n].playing === true) {
          if ($scope.djs[n].experience >= $scope.topDJ && google.maps.geometry.spherical.computeDistanceBetween($scope.user.latLng, $scope.djs[n].latLng) < $scope.djs[n].radius) {
            $scope.topDJ = $scope.djs[n].experience;
          }
          console.log($scope.topDJ);
          var djMarker = new google.maps.Marker({
              position: $scope.djs[n].latLng,
              map: $scope.map,
              icon: '../img/dj.png'
          });
          var djCircle = new google.maps.Circle({
            map: $scope.map,
            radius: $scope.djs[n].radius,
            fillColor: '#00ff00'
          });
          djCircle.bindTo('center', djMarker, 'position');
          if (google.maps.geometry.spherical.computeDistanceBetween($scope.user.latLng, $scope.djs[n].latLng) < $scope.djs[n].radius && $scope.djs[n].playing === true && $scope.djs[n].experience >= $scope.topDJ) {
            document.getElementById('player').innerHTML = $scope.djs[n].song;
            $scope.playing = $scope.djs[n];
          }
          if (google.maps.geometry.spherical.computeDistanceBetween($scope.user.latLng, $scope.djs[n].latLng) < $scope.djs[n].radius && $scope.djs[n].playing === true) {
            checkAndAdd($scope.djs[n].name);
          }
        }
      }

      function checkAndAdd(djname) {
        if ($scope.djsInRange) {
          var id = $scope.djsInRange.length + 1;
          var found = $scope.djsInRange.some(function (el) {
            console.log(el.name);
            return el.name === djname;
          });
          if (!found) { $scope.djsInRange.push($scope.djs[n]); }
        }
      }

      $scope.map.panTo($scope.user.latLng);

      setInterval(function() {
        console.log('range', $scope.djsInRange);
        console.log('user', $scope.user.latLng);
        console.log('marker', $scope.marker);
        $scope.user.latLng = $scope.marker.position;
        // $cordovaGeolocation.getCurrentPosition(options);
        // $scope.user.latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        // console.log('lat: ' + position.coords.latitude + ' | lng: ' + position.coords.longitude);
        // $scope.marker.setPosition({lat: 23.323, lng: -23.344});
        // $scope.map.panTo({lat: 23.323, lng: -23.344});
        // $scope.marker.setPosition($scope.user.latLng);
        // $scope.map.panTo($scope.user.latLng);

        // if ($scope.djsInRange.length > 0 && $scope.playing.name !== $scope.djsInRange[$scope.djsInRange.length - 1].name) {
        //   $scope.djsInRange.push($scope.djs[n]);
        // }



        for (var n = 0; n < $scope.djs.length; n++) {
          if (google.maps.geometry.spherical.computeDistanceBetween($scope.user.latLng, $scope.djs[n].latLng) < $scope.djs[n].radius && $scope.djs[n].playing === true) {
          } else if (google.maps.geometry.spherical.computeDistanceBetween($scope.user.latLng, $scope.djs[n].latLng) > $scope.djs[n].radius && $scope.djs[n].playing === true) {
            console.log('outside', $scope.djs[n].name);
          }
        }
      }, 2000);
    }, function(error){
      console.log("Could not get location");
    });

  $scope.changeStation = function() {
    console.log(this.dj.name);
    var thisName = this.dj.name;
    var result = $scope.djsInRange.filter(function( obj ) {
      return obj.name == thisName;
    });
    $scope.playing = this.dj;
    document.getElementById('player').innerHTML = result[0].song;
  };
});
