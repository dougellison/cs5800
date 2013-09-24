'use strict';


// Declare app level module which depends on filters, and services
angular.module('mainApp', [])
	.controller('main', function($scope) {
		$scope.hello = "Hello World";



		// $scope.initCanvas1 = function() {

		// 	// set the scene size
		// 	var WIDTH = 800,
		// 	    HEIGHT = 500;

		// 	// set some camera attributes
		// 	var VIEW_ANGLE = 45,
		// 	    ASPECT = WIDTH / HEIGHT,
		// 	    NEAR = 0.1,
		// 	    FAR = 10000;

		// 	// get the DOM element to attach to
		// 	// - assume we've got jQuery to hand
		// 	var $container = $('#mainDrawLocation');

		// 	// create a WebGL renderer, camera
		// 	// and a scene
		// 	var renderer = new THREE.WebGLRenderer();
		// 	var camera = new THREE.PerspectiveCamera(  VIEW_ANGLE,
		// 	                                ASPECT,
		// 	                                NEAR,
		// 	                                FAR  );

		// 	//controls = new THREE.TrackballControls( camera );
		// 	var scene = new THREE.Scene();

		// 	// the camera starts at 0,0,0 so pull it back
		// 	camera.position.z = 400;
		// 	$scope.camera = camera;

		// 	// start the renderer
		// 	renderer.setSize(WIDTH, HEIGHT);

		// 	// attach the render-supplied DOM element
		// 	$container.append(renderer.domElement);

		// 	// create the sphere's material
		// 	var sphereMaterial = new THREE.MeshLambertMaterial(
		// 	{
		// 	    color: 0xCC0000
		// 	});

		// 	// set up the sphere vars
		// 	var radius = 50, segments = 16, rings = 16;

		// 	// create a new mesh with sphere geometry -
		// 	// we will cover the sphereMaterial next!
		// 	var sphere = new THREE.Mesh(
		// 	   new THREE.SphereGeometry(radius, segments, rings),
		// 	   sphereMaterial);

		// 	// add the sphere to the scene
		// 	scene.add(sphere);

		// 	// and the camera
		// 	scene.add(camera);

		// 	// create a point light
		// 	var pointLight = new THREE.PointLight( 0xFFFFFF );

		// 	// set its position
		// 	pointLight.position.x = 10;
		// 	pointLight.position.y = 50;
		// 	pointLight.position.z = 130;

		// 	// add to the scene
		// 	scene.add(pointLight);

		// 	// draw!
		// 	renderer.render(scene, camera);
		// 	$scope.renderer = renderer;
		// 	$scope.scene = scene;

		// }

		$scope.change = function() {
			$scope.camera.position.z = $scope.zoomLevel;
			$scope.renderer.render($scope.scene, $scope.camera);
		}

		$scope.$watch('zoomLevel', function(newValue) {
			if (angular.isDefined(newValue) && newValue > 0) {
				$scope.change();
			}
		})

		$scope.$watch('mesh2', function(newValue) {
			if (angular.isDefined(newValue)) {
				$scope.change();
			}
		})

		$scope.initCanvas2 = function() {

			var camera, scene, renderer, controls;
			var mesh;


			renderer = new THREE.WebGLRenderer();
			renderer.setSize( 800, 500 );
			var mainDiv = $('#mainDrawLocation');
			mainDiv.append(renderer.domElement);

			camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
			camera.position.z = 400;

			controls = new THREE.TrackballControls( camera);
				controls.rotateSpeed = 1.0;
				controls.zoomSpeed = 1.2;
				controls.panSpeed = 0.8;
				controls.noZoom = false;
				controls.noPan = false;
				controls.staticMoving = true;
				controls.dynamicDampingFactor = 0.3;
			//controls = new THREE.TrackballControls( camera, mainDiv);
			$scope.controls = controls;

			scene = new THREE.Scene();

			var geometry = new THREE.CubeGeometry( 200, 200, 200 );

			var texture = THREE.ImageUtils.loadTexture( 'images/panoramic.jpg' );
			//var texture = THREE.ImageUtils.loadTexture( 'images/mountaintop.jpg' );
			texture.anisotropy = renderer.getMaxAnisotropy();

			var material = new THREE.MeshBasicMaterial( { map: texture } );

			var radius = 100, segments = 160, rings = 160;

			// create a new mesh with sphere geometry -
			// we will cover the sphereMaterial next!
			var sphere = new THREE.SphereGeometry(radius, segments, rings);
			var sphereBackground = new THREE.SphereGeometry(radius, segments, rings);






			var mesh = new THREE.Mesh( sphere, material );
			mesh.position.x = -100;
			mesh.position.y = -100;
			mesh.position.z = 0;



			var mesh2 = new THREE.Mesh( sphereBackground, material );

			mesh2.position.x = 100;
			mesh2.position.y = 100;
			mesh2.position.z = 50;

			mesh2.geometry.dynamic = true;
			$scope.mesh2 = mesh2;

			scene.add( mesh );
			scene.add( mesh2 );
			$scope.mesh = mesh;
			renderer.render(scene, camera);

			//

//			window.addEventListener( 'resize', onWindowResize, false );

			// function onWindowResize() {

			// 	camera.aspect = window.innerWidth / window.innerHeight;
			// 	camera.updateProjectionMatrix();

			// 	renderer.setSize( window.innerWidth, window.innerHeight );

			// }
			$scope.scene = scene;
			$scope.camera = camera;
			$scope.renderer = renderer;

		}

		$scope.rotate = true;
		$scope.animate = function() {

				requestAnimationFrame( animate );

				 
				 if ($scope.rotate === true) {
				 	//$scope.mesh.rotation.x += 0.005;
				 	$scope.mesh.rotation.y -= 0.01;
				 	$scope.controls.enabled = false;
				 }
				 else {
				 	$scope.controls.enabled = true;
				 	$scope.controls.update();
				 }
				 	
				$scope.renderer.render( $scope.scene, $scope.camera );
				

		}
		$scope.$watch('rotate', function(newValue) {
			if (newValue == true)
				$scope.controls.reset();
		})
		var animate = $scope.animate;

		$scope.initCanvas2();

		$scope.animate();




	})

;
  
