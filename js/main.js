'use strict';


// Declare app level module which has no dependencies.
// AngjularJS is a client side javascript MVC.
angular.module('mainApp', [])
    .controller('main', function($scope) {

        $scope.objectTypes = [];
        $scope.objectTypes.push({name: 'Cube'},{name: 'Sphere'});
        $scope.selectedObjectType = 'Cube';


        $scope.objects = [];
        $scope.objects.push({id:-1, name: 'Select an Object', data: {}});
        $scope.objectCounter = 0;

        $scope.editableObject = $scope.objects[0];

        $scope.raycaster = new THREE.Raycaster();
        $scope.projector = new THREE.Projector();
        $scope.mouse = new THREE.Vector2()

        $scope.cameraRepresentation = {};


        $scope.basicMaterial = new THREE.MeshNormalMaterial( { shading: THREE.SmoothShading, overdraw: true } )
        $scope.selectedMaterial = new THREE.MeshBasicMaterial( { color: 'red'} );



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
            camera = new THREE.PerspectiveCamera( 70, 1070 / 500, 1, 10000 );
            $scope.nearString = 1;
            $scope.farString = 3000;
            camera.position.set( 0, 1000, 100 );
            camera.lookAt( new THREE.Vector3( 0,0, 0 ) );

            // Set the depth where the camera starts. This can be changed with the user control zoom level
            //camera.position.z = 400;

            // This creates a Scene.  ThreeJS has a specific concept of a Scene which is a container for all things
            // in the viewable space.  Later meshes / camera will be added to the scene.
            scene = new THREE.Scene();

            var grid = new THREE.GridHelper( 600, 30 );
            scene.add(grid);

            var light = new THREE.DirectionalLight( 0xffffff, 2 );
            light.position.set( 500, 500, 500 );

            scene.add(light);



            // This is loading a panoramic image taken with a Nexus 4 360 sphere application. It creates a large
            // 4000x4000 single image stitched together from multiple camera shots.
            var texture = THREE.ImageUtils.loadTexture( 'images/panoramic.jpg' );

            // Just setting the texture to be directionally dependent.  This is important for the layout of the texture
            // to smoothly cover the sphere that will be created later.
            texture.anisotropy = renderer.getMaxAnisotropy();

            // Just creating a material that will be stretched across the spheres created a few lines down
            $scope.sphereMaterial = new THREE.MeshBasicMaterial( { map: texture } );

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


            angular.forEach($scope.objects, function(localObject) {
                if (localObject.data.rotateType === 'cont') {
                    if (angular.isDefined(localObject.data.rotationXAmount))
                        localObject.data.rotation.x += parseFloat(localObject.data.rotationXAmount);
                    if (angular.isDefined(localObject.data.rotationYAmount))
                        localObject.data.rotation.y += parseFloat(localObject.data.rotationYAmount);
                    if (angular.isDefined(localObject.data.rotationZAmount))
                        localObject.data.rotation.z += parseFloat(localObject.data.rotationZAmount);
                }
            })
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
            if (!angular.isDefined(newValue))
                return;
            if ($scope.lookAt000 === true)
                $scope.camera.lookAt( new THREE.Vector3( 0,0, 0 ) );

            $scope.camera.updateProjectionMatrix();
        })
        $scope.$watch('camera.position.y', function(newValue) {
            if (angular.isDefined(newValue) && $scope.lookAt000 === true)
                $scope.camera.lookAt( new THREE.Vector3( 0,0, 0 ) );

            $scope.camera.updateProjectionMatrix();
        })
        $scope.$watch('camera.position.z', function(newValue) {
            if (angular.isDefined(newValue) && $scope.lookAt000 === true)
                $scope.camera.lookAt( new THREE.Vector3( 0,0, 0 ) );

            $scope.camera.updateProjectionMatrix();
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
            var cube = new THREE.Mesh( geometry, $scope.basicMaterial );
            cube.position.y = 150;
            cube.geometry.dynamic = true
            cube.rotateType = 'stat';
            $scope.scene.add( cube );
            $scope.objects.push({id: $scope.objectCounter, name: 'Cube', data: cube});
            $scope.objectCounter++;

        }

        $scope.addSphere = function() {

            // create a new mesh with sphere geometry -
            var sphereGeometry = new THREE.SphereGeometry($scope.radius, $scope.segments, $scope.rings);
            var sphere = new THREE.Mesh(sphereGeometry, $scope.sphereMaterial);
            sphere.geometry.dynamic = true;
            sphere.rotateType = 'stat';
            sphere.isType = "Sphere";
            $scope.scene.add(sphere);
            $scope.objects.push({id:$scope.objectCounter, name: 'Sphere', data: sphere});
            $scope.objectCounter++;
        }

        $scope.$watch('selectedObject', function(newValue) {
            if (!angular.isDefined(newValue))
                return;

            angular.forEach($scope.objects, function(localObject) {
                if (localObject.id == newValue) {

                    // Now that we've found one we want to deselect the past one of there was one.
                    $scope.deSelect($scope.editableObject);
                    $scope.editableObject = localObject.data;

                    $scope.editableObject.material = $scope.selectedMaterial;
                }

            })
        })

//        $scope.test = function(event) {
//
//            var divElement = event.currentTarget;
//            var rect = divElement.getBoundingClientRect();
//
//            $scope.mouse.x = ( (event.clientX - rect.left)/ 1070 ) * 2 - 1;
//            $scope.mouse.y = - ( (event.clientY - rect.top)/ 500) * 2 + 1;
//
//            console.log("X: " + $scope.mouse.x + " Y: " + $scope.mouse.y);
//            var vector = new THREE.Vector3( $scope.mouse.x, $scope.mouse.y, 0.5 );
//            $scope.camera.updateProjectionMatrix();
//            $scope.projector.unprojectVector( vector, $scope.camera );
//
//            $scope.raycaster.set($scope.cleanVector($scope.camera.position), vector.sub($scope.cleanVector($scope.camera.position) ).normalize() );
//
//            var intersects = $scope.raycaster.intersectObjects( $scope.scene.children );
//            if (intersects.length > 0){
//                $scope.editableObject = intersects[0];
//                $scope.editableObject.material.color =  new THREE.Color( "blue");
//
//            }
//            else {
//                if (angular.isDefined($scope.editableObject) && $scope.editableObject.material)
//                    $scope.editableObject.material.color =  new THREE.Color("red");
//            }
//
//
//
//        }

        $scope.cleanVector = function(vector) {
            return new THREE.Vector3(parseInt(vector.x), parseInt(vector.y), parseInt(vector.z));
        }
//        $scope.logPosition = function(event) {
//            var divElement = event.currentTarget;
//            var rect = divElement.getBoundingClientRect();
//
//            $scope.mouse.x = ( (event.clientX - rect.left - 20)/ 1070 ) * 2 - 1;
//            $scope.mouse.y = - ( (event.clientY - rect.top)/ 500) * 2 + 1;
//
//            console.log("X: " + $scope.mouse.x + " Y: " + $scope.mouse.y);
//            var vector = new THREE.Vector3( $scope.mouse.x, $scope.mouse.y, 0.5 );
//            $scope.projector.unprojectVector( vector, $scope.camera );
//
//            $scope.raycaster.set($scope.cleanVector($scope.camera.position), vector.sub($scope.cleanVector($scope.camera.position) ).normalize() );
//
//            var intersects = $scope.raycaster.intersectObjects( $scope.scene.children );
//            if (intersects.length > 0){
//                angular.forEach(intersects, function(intersect) {
//                    if (intersect.object.type != 1){
//                        console.log('I have found it!!!!' + new Date().getTime());
//
//
//                        $scope.editableObject = intersects[0].object;
//                        $scope.editableObject.material.color =  new THREE.Color( "blue");
//
//                    }
//                })
//
//
//            }
//            else {
//                if (angular.isDefined($scope.editableObject) && $scope.editableObject.material)
//
//                    $scope.editableObject.material.color =  new THREE.Color("red");
//            }
//
//            console.log($scope.camera.position)
//        }

        $scope.pickObject = function(event) {
            var divElement = event.currentTarget;
            var rect = divElement.getBoundingClientRect();

            $scope.mouse.x = ( (event.clientX - rect.left - 20)/ 1070 ) * 2 - 1;
            $scope.mouse.y = - ( (event.clientY - rect.top)/ 500) * 2 + 1;

            var vector = new THREE.Vector3( $scope.mouse.x, $scope.mouse.y, 0.5 );
            $scope.projector.unprojectVector( vector, $scope.camera );

            $scope.raycaster.set($scope.cleanVector($scope.camera.position), vector.sub($scope.cleanVector($scope.camera.position) ).normalize() );

            var intersects = $scope.raycaster.intersectObjects( $scope.scene.children );

            if (intersects.length > 0){
                angular.forEach(intersects, function(intersect) {
                    if (intersect.object.type != 1){
                        console.log('I have found it!!!!' + new Date().getTime());

                        $scope.deSelect($scope.editableObject);
                        $scope.editableObject = intersects[0].object;
                        $scope.editableObject.material = $scope.selectedMaterial;
                    }
                })
            }
            else {
                $scope.deSelect($scope.editableObject);
            }
        }

        $scope.deSelect = function(object) {
            if (angular.isDefined(object) && object.material) {
                if ($scope.editableObject.isType == "Sphere")
                    $scope.editableObject.material = $scope.sphereMaterial;
                else
                    $scope.editableObject.material = $scope.basicMaterial;
            }
        }



    })

;
  
