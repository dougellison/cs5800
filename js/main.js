'use strict';


// Declare app level module which depends on filters, and services
angular.module('mainApp', [])
	.controller('main', function($scope) {
		$scope.hello = "Hello World";

		$scope.initCanvas1 = function() {

			// set the scene size
			var WIDTH = 400,
			    HEIGHT = 300;

			// set some camera attributes
			var VIEW_ANGLE = 45,
			    ASPECT = WIDTH / HEIGHT,
			    NEAR = 0.1,
			    FAR = 10000;

			// get the DOM element to attach to
			// - assume we've got jQuery to hand
			var $container = $('#mainDrawLocation');

			// create a WebGL renderer, camera
			// and a scene
			var renderer = new THREE.WebGLRenderer();
			var camera = new THREE.PerspectiveCamera(  VIEW_ANGLE,
			                                ASPECT,
			                                NEAR,
			                                FAR  );
			var scene = new THREE.Scene();

			// the camera starts at 0,0,0 so pull it back
			camera.position.z = 400;
			$scope.camera = camera;

			// start the renderer
			renderer.setSize(WIDTH, HEIGHT);

			// attach the render-supplied DOM element
			$container.append(renderer.domElement);

			// create the sphere's material
			var sphereMaterial = new THREE.MeshLambertMaterial(
			{
			    color: 0xCC0000
			});

			// set up the sphere vars
			var radius = 50, segments = 16, rings = 16;

			// create a new mesh with sphere geometry -
			// we will cover the sphereMaterial next!
			var sphere = new THREE.Mesh(
			   new THREE.SphereGeometry(radius, segments, rings),
			   sphereMaterial);

			// add the sphere to the scene
			scene.add(sphere);

			// and the camera
			scene.add(camera);

			// create a point light
			var pointLight = new THREE.PointLight( 0xFFFFFF );

			// set its position
			pointLight.position.x = 10;
			pointLight.position.y = 50;
			pointLight.position.z = 130;

			// add to the scene
			scene.add(pointLight);

			// draw!
			renderer.render(scene, camera);
			$scope.renderer = renderer;
			$scope.scene = scene;

		


		}


		$scope.initCanvas1();

		$scope.change = function() {
			$scope.camera.position.z = $scope.zoomLevel;
			$scope.renderer.render($scope.scene, $scope.camera);
		}

		$scope.$watch('zoomLevel', function(newValue) {
			if (angular.isDefined(newValue) && newValue > 0) {
				$scope.change();
			}
		})




	})

;
  
