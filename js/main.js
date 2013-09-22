'use strict';


// Declare app level module which depends on filters, and services
angular.module('mainApp', [])
	.controller('main', function($scope) {
		$scope.hello = "Hello World";



		$scope.initCanvas1 = function() {

			// set the scene size
			var WIDTH = 800,
			    HEIGHT = 500;

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


		//$scope.initCanvas1();

		$scope.change = function() {
			$scope.camera.position.z = $scope.zoomLevel;
			$scope.renderer.render($scope.scene, $scope.camera);
		}

		$scope.$watch('zoomLevel', function(newValue) {
			if (angular.isDefined(newValue) && newValue > 0) {
				$scope.change();
			}
		})

		// $scope.$watch('rotateHorizontal', function(newValue) {
		// 	if (angular.isDefined(newValue)) {
		// 		$scope.reDraw();
		// 	}
		// })

		// $scope.


		$scope.initCanvas2 = function() {

			var camera, scene, renderer;
			var mesh;


			renderer = new THREE.WebGLRenderer();
			renderer.setSize( 800, 500 );
			var mainDiv = $('#mainDrawLocation');
			mainDiv.append(renderer.domElement);

			camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
			camera.position.z = 400;

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







			mesh = new THREE.Mesh( sphere, material );
			scene.add( mesh );
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
		$scope.animate = function animate() {

				requestAnimationFrame( animate );

				 //$scope.mesh.rotation.x += 0.005;
				 if ($scope.rotate === true)
				 	$scope.mesh.rotation.y -= 0.01;

				$scope.renderer.render( $scope.scene, $scope.camera );

		}

		$scope.initCanvas2();

		$scope.animate();




	})

;
  
