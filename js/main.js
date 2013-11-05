'use strict';


// Declare app level module which has no dependencies.
// AngjularJS is a client side javascript MVC.
angular.module('mainApp', [])
    .controller('main', function($scope) {

        $scope.objectTypes = [];
        $scope.objectTypes.push({name: 'Cube'},{name: 'Sphere'});
        $scope.selectedObjectType = 'Cube';


        $scope.objects = [];
        $scope.objectCounter = 0;
        // This is the main init of the ThreeJS library.  It sets up the scene / camera and adds the objects
        $scope.initCanvas = function() {

            var camera, scene, renderer, controls;
            var mesh;


            // This project is going to be using WebGL so this requests a WebGLRenderer
            renderer = new THREE.WebGLRenderer();

            // Hard codes the size of the div containing the ThreeJS drawing area.  Later versions will scale with window sizing
            renderer.setSize( 1070, 500 );

            // Get the Div element from the HTML
            var mainDiv = $('#mainDrawLocation');

            // Add the domElement that the WebGLRendered has created.
            mainDiv.append(renderer.domElement);

            // This creates a camera that is controlled by the user
            //camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
            camera = new THREE.PerspectiveCamera( 70, 1070 / 500, 1, 3000 );
            $scope.nearString = 1;
            $scope.farString = 3000;
            camera.position.set( 0, 1000, 1000 );
            camera.lookAt( new THREE.Vector3( 0,0, 0 ) );

            // Set the depth where the camera starts. This can be changed with the user control zoom level
            //camera.position.z = 400;

            // This creates a Scene.  ThreeJS has a specific concept of a Scene which is a container for all things
            // in the viewable space.  Later meshes / camera will be added to the scene.
            scene = new THREE.Scene();

            var grid = new THREE.GridHelper( 600, 30 );
            scene.add(grid);

            var light = new THREE.DirectionalLight( 0xffffff, 2 );
            light.position.set( 1, 1, 1 );

            scene.add(light);

            // Use scene and the camera to render what is viewable by the user.
            renderer.render(scene, camera);

            // This is just doing some heavy lifting with making the scene / camera / rendered which are all local
            // variables accessiable on the scope to other functions.
            $scope.scene = scene;
            $scope.camera = camera;
            $scope.renderer = renderer;

//            controls = new THREE.OrbitControls( camera );
//            controls.addEventListener( 'change', $scope.renderer );

        }

        // There is a checkbox enabled within the HTML which controls if the sphere on the left automatically
        // rotates.  Just defaulting to true.
        $scope.rotate = true;
        $scope.animate = function() {

            // This is setting up a looping callback.  What that means is there is a recursive set of
            // callbacks that will get called so that the drawing continuously updates without blocking
            requestAnimationFrame( animate );


            // Regardless of if the user initialized rotation or the automatic rotation occurred go ahead and render again
            // If nothing has changed this is an idempotent call.
            $scope.renderer.render( $scope.scene, $scope.camera );


        }


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


        $scope.$watch('camera.position.x', function(newValue) {
            if (angular.isDefined(newValue) && $scope.lookAt000 === true)
                $scope.camera.lookAt( new THREE.Vector3( 0,0, 0 ) );
        })
        $scope.$watch('camera.position.y', function(newValue) {
            if (angular.isDefined(newValue) && $scope.lookAt000 === true)
                $scope.camera.lookAt( new THREE.Vector3( 0,0, 0 ) );
        })
        $scope.$watch('camera.position.z', function(newValue) {
            if (angular.isDefined(newValue) && $scope.lookAt000 === true)
                $scope.camera.lookAt( new THREE.Vector3( 0,0, 0 ) );
        })

//        $scope.$watch('camera.near', function(newValue){
//            if (angular.isDefined(newValue)) {
//                $scope.camera.near =
//                $scope.camera.updateProjectionMatrix();
//            }
//        })
        $scope.$watch('fovString', function(newValue) {
            if (angular.isDefined(newValue)) {
                $scope.camera.fov = parseFloat(newValue);
                $scope.camera.updateProjectionMatrix();
            }
        })


        $scope.$watch('nearString', function(newValue) {
            if (angular.isDefined(newValue)) {
                $scope.camera.near = parseFloat(newValue);
                $scope.camera.updateProjectionMatrix();
            }
        })

        $scope.$watch('farString', function(newValue) {
            if (angular.isDefined(newValue)) {
                $scope.camera.far = parseFloat(newValue);
                $scope.camera.updateProjectionMatrix();
            }
        })


        $scope.$watch('camera.aspect', function(newValue) {
            if (angular.isDefined(newValue))
                $scope.camera.updateProjectionMatrix();
        })

        $scope.addObject = function() {
            if ($scope.selectedObjectType == 'Cube')
                $scope.addCube();
            else if ($scope.selectedObjectType == 'Sphere')
                $scope.addSphere();
        }

        $scope.addCube = function() {
            var geometry = new THREE.CubeGeometry( $scope.xValue, $scope.yValue, $scope.zValue );

//            for ( var i = 0; i < geometry.faces.length; i += 2 ) {
//
//                var hex = Math.random() * 0xffffff;
//                geometry.faces[ i ].color.setHex( hex );
//                geometry.faces[ i + 1 ].color.setHex( hex );
//
//            }
//
            var material = new THREE.MeshBasicMaterial( { color: 'red'} );
//
            var cube = new THREE.Mesh( geometry, material );
            cube.position.y = 150;
            cube.geometry.dynamic = true
            $scope.scene.add( cube );
            $scope.objects.push({id: $scope.objectCounter, name: 'Cube', data: cube});
            $scope.objectCounter++;

        }

        $scope.addSphere = function() {

            // create a new mesh with sphere geometry -
            var sphereGeometry = new THREE.SphereGeometry($scope.radius, $scope.segments, $scope.rings);
            var material = new THREE.MeshBasicMaterial({color: 'blue'});
            var sphere = new THREE.Mesh(sphereGeometry, material);
            sphere.geometry.dynamic = true;
            $scope.scene.add(sphere);
            $scope.objects.push({id:$scope.objectCounter, name: 'Sphere', data: sphere});
            $scope.objectCounter++;
        }

        $scope.$watch('selectedObject', function(newValue) {
            if (!angular.isDefined(newValue))
                return;

            angular.forEach($scope.objects, function(localObject) {
                if (localObject.id == newValue)
                    $scope.editableObject = localObject.data;
                    $scope.editableObjectId = newValue;
            })
        })



    })

;
  
