'use strict';


// Declare app level module which has no dependencies.
// AngjularJS is a client side javascript MVC.
angular.module('mainApp', [])
	.controller('main', function($scope) {
		
		
		// This is defining a function called change that when called updates the rendered view.
		$scope.change = function() {
			$scope.camera.position.z = $scope.zoomLevel;
			$scope.renderer.render($scope.scene, $scope.camera);
		}

		// Angular uses the idea of watches to keep track of value changes.  Within the HTMl there is a special
		// html attribute called ng-model.  When it changes the below function gets called. in this case it 
		// verifies that the new zoomLevel value is defined and above 0.  If both criteria are met
		// it calls change to render the new zoom level.
		$scope.$watch('zoomLevel', function(newValue) {
			if (angular.isDefined(newValue) && newValue > 0) {
				$scope.change();
			}
		})

		// nonRotatingMesh is a mesh that has been added to the ThreeJS scene.  When any of its values change
		// it has been given x / y / z user controls within the HTML it updates the view to reflect the changes
		$scope.$watch('nonRotatingMesh', function(newValue) {
			if (angular.isDefined(newValue)) {
				$scope.change();
			}
		})
		
		// This is the main init of the ThreeJS library.  It sets up the scene / camera and adds the objects
		$scope.initCanvas = function() {

			var camera, scene, renderer, controls;
			var mesh;


			// This project is going to be using WebGL so this requests a WebGLRenderer
			renderer = new THREE.WebGLRenderer();
			
			// Hard codes the size of the div containing the ThreeJS drawing area.  Later versions will scale with window sizing
			renderer.setSize( 800, 500 );
			
			// Get the Div element from the HTML
			var mainDiv = $('#mainDrawLocation');
			
			// Add the domElement that the WebGLRendered has created.
			mainDiv.append(renderer.domElement);
			
			// This creates a camera that is controlled by the user
			camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
			
			// Set the depth where the camera starts. This can be changed with the user control zoom level
			camera.position.z = 400;

			// This includes trackBallControls.  Its an additional library that can be included that is provided with but separately from ThreeJS
			// It handles rotation and zoom in and out based purely on mouse controls.
			controls = new THREE.TrackballControls( camera);
				controls.rotateSpeed = 1.0;
				controls.zoomSpeed = 1.2;
				controls.panSpeed = 0.8;
				controls.noZoom = false;
				controls.noPan = false;
				controls.staticMoving = true;
				controls.dynamicDampingFactor = 0.3;

			// In more than a few places there will be code that doesn't seem to do much like that below.  
			// It serves a very specific purpose which is to mesh the AngularJS framework with the standard
			// global environment variables JavaScript uses by default.
			$scope.controls = controls;

			// This creates a Scene.  ThreeJS has a specific concept of a Scene which is a container for all things
			// in the viewable space.  Later meshes / camera will be added to the scene.
			scene = new THREE.Scene();


			// This is loading a panoramic image taken with a Nexus 4 360 sphere application. It creates a large
			// 4000x4000 single image stitched together from multiple camera shots.
			var texture = THREE.ImageUtils.loadTexture( 'images/panoramic.jpg' );

			// Just setting the texture to be directionally dependent.  This is important for the layout of the texture
			// to smoothly cover the sphere that will be created later.
			texture.anisotropy = renderer.getMaxAnisotropy();

			// Just creating a material that will be stretched across the spheres created a few lines down
			var material = new THREE.MeshBasicMaterial( { map: texture } );

			// Defining how big and how smooth the spheres should be.  As the number of segments / rings increases
			// the smoothness of the sphere increases.  
			var radius = 100, segments = 160, rings = 160;

			// create a new mesh with sphere geometry -
			var sphere = new THREE.SphereGeometry(radius, segments, rings);

			// This sphere is the one seen in the default scene in the background and non-rotating.
			var sphereBackground = new THREE.SphereGeometry(radius, segments, rings);

			// ThreeJS has a concept of a Mesh.  A Mesh is what is drawn.  It can be comprised of a number of different attributes
			// It has a material and a shape.  It also has a position and if its rendered ect.
			var mesh = new THREE.Mesh( sphere, material );
			
			// Setting the start positions of the mesh.
			mesh.position.x = -100;
			mesh.position.y = -100;
			mesh.position.z = 0;

			var nonRotatingMesh = new THREE.Mesh( sphereBackground, material );

			// Setting the start positions of the mesh.
			nonRotatingMesh.position.x = 100;
			nonRotatingMesh.position.y = 100;
			nonRotatingMesh.position.z = 50;

			// Specifying geometry.dynamic means that a meshes attributes can change.  This is important for ThreeJS
			// because mesh objects that do not have this flag set will not be checked for updates when the renderer is called
			// This allows ThreeJS to cache and do less work for each render call.
			nonRotatingMesh.geometry.dynamic = true;
			
			// Copy a reference from the local variable and make it available within scope.  Anything assigned to 
			// $scope will be accessiable through special calls within the HTML
			$scope.nonRotatingMesh = nonRotatingMesh;

			// Add the meshes to the scene
			scene.add( mesh );
			scene.add( nonRotatingMesh );
			$scope.mesh = mesh;
			
			// Use scene and the camera to render what is viewable by the user.
			renderer.render(scene, camera);

			// This is just doing some heavy lifting with making the scene / camera / rendered which are all local
			// variables accessiable on the scope to other functions.
			$scope.scene = scene;
			$scope.camera = camera;
			$scope.renderer = renderer;

		}
		
		// There is a checkbox enabled within the HTML which controls if the sphere on the left automatically
		// rotates.  Just defaulting to true.
		$scope.rotate = true;
		$scope.animate = function() {
				
				// This is setting up a looping callback.  What that means is there is a recursive set of 
				// callbacks that will get called so that the drawing continuously updates without blocking
				requestAnimationFrame( animate );

				 
				 // Checks to see if rotate is set if so then disable the trackball controls  and decrement the rotation.y
				 // on the mesh. 
				 if ($scope.rotate === true) {
				 	//$scope.mesh.rotation.x += 0.005;
				 	$scope.mesh.rotation.y -= 0.01;
				 	$scope.controls.enabled = false;
				 }
				 // If rotation is not enabled the user is allowed to do the rotation themselves. Turn on trackball controls
				 // and call update. Update will just re-render the scene.
				 else {
				 	$scope.controls.enabled = true;
				 	$scope.controls.update();
				 }
				
				// Regardless of if the user initialized rotation or the automatic rotation occurred go ahead and render again
				// If nothing has changed this is an idempotent call.
				$scope.renderer.render( $scope.scene, $scope.camera );
				

		}
		
		// Watch the scope variable rotate and if it has changed switch controls to either allow the user to rotate or begin
		// automatic rotation again.
		$scope.$watch('rotate', function(newValue) {
			if (newValue == true)
				$scope.controls.reset();
		})
		
		// The requestAnimationFrame is expecting to recursively call a function called animation. This is hard coded 
		// into ThreeJS.  Since I'm using AngularJS to reduce scope to more local methods I have to expose the animation
		// function to global scope so that requestAnimationFrame will work.
		var animate = $scope.animate;

		// All the functions that have been defined are called later. They are just setting up what can be called.  
		// This actually starts the whole process.  
		$scope.initCanvas();

		// Start calling the animation cycle.  In order for the recurvie call to work you must call it at least once so that
		// it becomes a cycle.
		$scope.animate();




	})

;
  
