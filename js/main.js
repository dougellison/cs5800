'use strict';

//TODO: Things to implement.  Order of importance / whatever
/**
 * 1. Import / Export of Objects
 * 5. Add some kind of recordable rotation
 * 6. Add more meshes
 * 7.
 */
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

        $scope.selectedObject = $scope.objects[0];

        $scope.raycaster = new THREE.Raycaster();
        $scope.projector = new THREE.Projector();
        $scope.mouse = new THREE.Vector2()

        $scope.cameraRepresentation = {};

		$scope.offset = new THREE.Vector3()

        $scope.basicMaterial = new THREE.MeshNormalMaterial( { shading: THREE.SmoothShading, overdraw: true } )
        $scope.selectedMaterial = new THREE.MeshBasicMaterial( {wireframe: true, color: 'red'} );


        $scope.sayHello = function(keyEvent) {
            alert('Hi there');
        }

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
			
			//camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
			
            camera = new THREE.PerspectiveCamera( 70, 1070 / 500, 1, 10000 );
            $scope.nearString = 1;
            $scope.farString = 3000;
			//camera.position.z = 1000;
            camera.position.set( 0, 1000, 100);
            //camera.lookAt( new THREE.Vector3( 0,0, 0 ) );



            var divElement = $('#mainDrawLocation');
			divElement.on('mousewheel')
//            var divElement = document.getElementById('mainDrawLocation');
            // This includes trackBallControls.  Its an additional library that can be included that is provided with but separately from ThreeJS
            // It handles rotation and zoom in and out based purely on mouse controls.
			
            //var controls = new THREE.TrackballControls(camera);
			var controls = new THREE.TrackballControls(camera, divElement);
            controls.rotateSpeed = 1.0;
            controls.zoomSpeed = 1.2;
            controls.panSpeed = 0.8;
            controls.noZoom = false;
            controls.noPan = false;
            controls.staticMoving = true;
            controls.dynamicDampingFactor = 0.3;
			
            $scope.controls = controls;
			$scope.controls.enabled = true;

            // Set the depth where the camera starts. This can be changed with the user control zoom level
            //camera.position.z = 400;

            // This creates a Scene.  ThreeJS has a specific concept of a Scene which is a container for all things
            // in the viewable space.  Later meshes / camera will be added to the scene.
            scene = new THREE.Scene();

            var grid = new THREE.GridHelper( 1000, 40 );
            scene.add(grid);

            var light = new THREE.DirectionalLight( 0xffffff, 2 );
            light.position.set( 500, 500, 500 );

            scene.add(light);

			//$scope.plane = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000, 8, 8 ), new THREE.MeshBasicMaterial( { color: 'red', wireframe: true } ) );
			$scope.plane = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.25, transparent: true, wireframe: true } ) );
			$scope.plane.visible = false;
			scene.add( $scope.plane );


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

            $scope.controls.update();

            angular.forEach($scope.objects, function(localObject) {
                if (localObject.data.rotateType === 'cont') {
                    if (angular.isDefined(localObject.data.rotationXAmount))
                        localObject.data.rotation.x = parseFloat(localObject.data.rotation.x) + parseFloat(localObject.data.rotationXAmount);
                    if (angular.isDefined(localObject.data.rotationYAmount))
                        localObject.data.rotation.y = parseFloat(localObject.data.rotation.y) + parseFloat(localObject.data.rotationYAmount);
                    if (angular.isDefined(localObject.data.rotationZAmount))
                        localObject.data.rotation.z = parseFloat(localObject.data.rotation.z) + parseFloat(localObject.data.rotationZAmount);
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
				
			$scope.camera.position.x = Math.round($scope.camera.position.x);
            if ($scope.lookAt000 === true)
                $scope.camera.lookAt( new THREE.Vector3( 0,0, 0 ) );

            $scope.camera.updateProjectionMatrix();
        })
        $scope.$watch('camera.position.y', function(newValue) {
		
			if (!angular.isDefined(newValue))
				return;
		
			$scope.camera.position.y = Math.round($scope.camera.position.y);
		
            if (angular.isDefined(newValue) && $scope.lookAt000 === true)
                $scope.camera.lookAt( new THREE.Vector3( 0,0, 0 ) );

            $scope.camera.updateProjectionMatrix();
        })
        $scope.$watch('camera.position.z', function(newValue) {
			
			if (!angular.isDefined(newValue))
				return;
				
			$scope.camera.position.z = Math.round($scope.camera.position.z);
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

        $scope.addCube = function(element) {
            var geometry = {};
			if (angular.isUndefined(element))
				geometry = new THREE.CubeGeometry( $scope.xValue, $scope.yValue, $scope.zValue );
			else
				geometry = new THREE.CubeGeometry( element.geometry.width, element.geometry.height, element.geometry.depth);

            var cube = new THREE.Mesh( geometry, $scope.basicMaterial );
			
			if (angular.isUndefined(element)) {
				cube.position.y = 150;
				cube.rotateType = 'stat';
			}
			else {
				cube.position = new THREE.Vector3(element.position.x, element.position.y, element.position.z);
				_.extend(cube, _.pick(element, ['rotateType', 'rotationXAmount', 'rotationYAmount', 'rotationZAmount']));
			}
            
			cube.geometry.dynamic = true
            cube.listID = $scope.objectCounter;
			cube.isType = "Cube";
            $scope.scene.add( cube );
            $scope.objects.push({id: $scope.objectCounter, name: 'Cube', data: cube});
            $scope.objectCounter++;

        }

        $scope.addSphere = function(element) {

			var sphereGeometry = {};
			// create a new mesh with sphere geometry -
			if (angular.isUndefined(element)) 
				sphereGeometry = new THREE.SphereGeometry($scope.radius, $scope.segments, $scope.rings);
			else
				sphereGeometry = new THREE.SphereGeometry(element.geometry.radius, element.geometry.widthSegments, element.geometry.heightSegments);
            
			var sphere = new THREE.Mesh(sphereGeometry, $scope.sphereMaterial);
            sphere.geometry.dynamic = true;
			if (angular.isUndefined(element)) {
				sphere.rotateType = 'stat';	
			}
			else {
				sphere.position = new THREE.Vector3(element.position.x, element.position.y, element.position.z);
				_.extend(sphere, _.pick(element, ['rotateType', 'rotationXAmount', 'rotationYAmount', 'rotationZAmount']));
			}
            
            sphere.isType = "Sphere";
            sphere.listID = $scope.objectCounter;
            $scope.scene.add(sphere);
            $scope.objects.push({id:$scope.objectCounter, name: 'Sphere', data: sphere});
            $scope.objectCounter++;
        }

        $scope.$watch('selectedObject', function(newValue) {
            if (!angular.isDefined(newValue))
                return;

            angular.forEach($scope.objects, function(localObject) {
                if (localObject.id == newValue.id) {

                    // Now that we've found one we want to deselect the past one of there was one.
                    $scope.deSelect($scope.editableObject, false);
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
            return new THREE.Vector3(parseInt(Math.round(vector.x)), parseInt(Math.round(vector.y)), parseInt(Math.round(vector.z)));
        }
		
		$scope.logPosition = function(event) {
            var divElement = event.currentTarget;
            var rect = divElement.getBoundingClientRect();

            $scope.mouse.x = ( (event.clientX - rect.left - 20)/ 1070 ) * 2 - 1;
            $scope.mouse.y = - ( (event.clientY - rect.top)/ 500) * 2 + 1;

            //console.log("X: " + $scope.mouse.x + " Y: " + $scope.mouse.y);
            var vector = new THREE.Vector3( $scope.mouse.x, $scope.mouse.y, 0.5 );
            $scope.projector.unprojectVector( vector, $scope.camera );

            $scope.raycaster.set($scope.cleanVector($scope.camera.position), vector.sub($scope.cleanVector($scope.camera.position) ).normalize() );

			// We only want to consider children that have been added by the system and not by setting up background objects such as the grid / lightsource.
			var validChildren = _.filter($scope.scene.children, function(child){ return angular.isDefined(child.listID)});

            var intersects = $scope.raycaster.intersectObjects( validChildren );
			
			if (angular.isDefined($scope.selectedObject) && $scope.selectedObject.id != -1 && $scope.enableDragging) {

				var intersects = $scope.raycaster.intersectObject( $scope.plane );
				if (!angular.isDefined(intersects[0]))
					return;
				$scope.overObject.position.copy( intersects[0].point.sub( $scope.offset ) );
				return;

			}
			
            if (intersects.length > 0){
  //              _.any(intersects, function(intersect) {
//                    if (angular.isDefined(intersect.object.listID)){
                        console.log('I have found it!!!!');
						$scope.overObject = intersects[0].object;
						$scope.plane.position.copy( $scope.overObject.position );
						$scope.plane.lookAt( $scope.camera.position );
//                    }
//                })
				
				// This means the cursor has been placed over an object.  Need to update plane
            }
            
        }

        $scope.pickObject = function(event) {
            var divElement = event.currentTarget;
            var rect = divElement.getBoundingClientRect();

            $scope.mouse.x = ( (event.clientX - rect.left - 20)/ 1070 ) * 2 - 1;
            $scope.mouse.y = - ( (event.clientY - rect.top)/ 500) * 2 + 1;

            var vector = new THREE.Vector3( $scope.mouse.x, $scope.mouse.y, 0.5 );
            $scope.projector.unprojectVector( vector, $scope.camera );

            $scope.raycaster.set($scope.cleanVector($scope.camera.position), vector.sub($scope.cleanVector($scope.camera.position) ).normalize() );
			
			// There are ThreeJS elements that we don't want to pick from.  So I exclude those.  The criteria I use is if the object has a listID.  This is unique to my code and added upon object creation
			// if this attribute is not present it is not a selectable element for picking.
			var validChildren = _.filter($scope.scene.children, function(child){ return angular.isDefined(child.listID)});
			
			// Gets the list of objects that could possibly be selected.
            var intersects = $scope.raycaster.intersectObjects( validChildren);

            if (intersects.length > 0){
                _.any(intersects, function(intersect) {
					// If we've found it lets say where we are.
					console.log('I have found it!!!!'  + 'X: ' + $scope.mouse.x + ' Y: ' + $scope.mouse.y);

					// This removes selection for any other nodes that might have been selected in the past.
					$scope.deSelect($scope.editableObject, false);
					
					
					if (_.any($scope.objects, function(localObject) {
						// This means the ThreeJS object has been found in my local object list.  Select this object.
						if (localObject.id == intersect.object.listID) {
							console.log("Found in the list as well");
							$scope.selectedObject = localObject;
							$scope.enableDragging = true;
							return true;
						}
					})) {
						// This means an object was found and selected.  So we copy the ThreeJS object to $scope.editableObject and then set the material for selected objects.
						$scope.editableObject = intersects[0].object;
						$scope.editableObject.material = $scope.selectedMaterial;
					}
					
                })
				
				// If an object was found then we need to calculate the offset using the plane.  The plain gets updated each time an object is moused over.
				if ($scope.selectedObject && $scope.selectedObject.id != -1) {
					$scope.controls.enabled = false;
					var intersectsPlane = $scope.raycaster.intersectObject( $scope.plane );
					$scope.offset.copy( intersectsPlane[ 0 ].point ).sub( $scope.plane.position );
				}
            }
            else {
                $scope.deSelect($scope.editableObject);
                $scope.selectedObject = $scope.objects[0];

            }
        }

        $scope.deSelect = function(object, clearDropdown) {
            if (angular.isDefined(object) && object.material) {
                if ($scope.editableObject.isType == "Sphere")
                    $scope.editableObject.material = $scope.sphereMaterial;
                else
                    $scope.editableObject.material = $scope.basicMaterial;
            }
            if (clearDropdown)
                $scope.selectedObject = $scope.objects[0];
        }
		
		// This method gets called on a mouse up event.  If the user has released the mouse even if we have a selected object I want to re-enabled the dragging controls for rotation.
		// Also want to set a flag stating that the selected object although selected is no longer valid for dragging.
		$scope.enableControls = function() {
			$scope.enableDragging = false;
			$scope.controls.enabled = true;
		}
		
		
		// This method gets called when a user selects to export data from the canvas.
		$scope.performExport = function() {
			
			if ($scope.exportOption == 'all') {
				// Do export for all objects
				// I know the first item in the objects list is actually a blank place holder for the select box.  I will just splice that one out.
				
				$scope.exportJSON = $scope.buildExportable(_.filter($scope.objects, function(object){return object.id != -1}));
			}
			else {
				// Check and make sure the user has something selected if not put a message on the export box and bail.
				if (angular.isUndefined($scope.selectedObject) || $scope.selectedObject.id == -1) {
					$scope.exportJSON = "Cannot export selected as there is nothing selected";
					return;
				}
				
				$scope.exportJSON = $scope.buildExportable([$scope.selectedObject]);
				
				
				
			}
		}
		
		// This method takes a list of items and returns the export JSON for each item in the list.
		$scope.buildExportable = function(exportableElements) {
			var returnString = "";
			
			// We'll store each string representation in the array.  And then at the very end do a .join with a special separator | that we can parse out later.
			var builtArray = [];
			// This iterates over all the passed in elements and picks out the data that we care about for exporting.  Right now its position information type and a sizes.
			_.each(exportableElements, function(element) {

				var meshData = element.data;
				// This is going to carry the object properties I care about that I will stringify at the end.
				var objectProperties = {};
				_.extend(objectProperties, _.pick(meshData, ['position', 'rotateType', 'rotationXAmount', 'rotationYAmount', 'rotationZAmount', 'isType']));
				
				var geometry = {};
				
				if (meshData.isType == 'Cube') {
					// This is the case where it is a cube.
					_.extend(geometry, _.pick(meshData.geometry, ['width', 'height', 'depth']));
					
					
				}
				else if (meshData.isType == 'Sphere') {
					// This is the case where the element is a sphere.
					_.extend(geometry, _.pick(meshData.geometry, ['widthSegments', 'heightSegments', 'radius']));						
				}
				
				objectProperties.geometry = geometry;
				
				console.log(JSON.stringify(objectProperties));
				builtArray.push(JSON.stringify(objectProperties));
			})
			
			returnString = builtArray.join('|');
			
			
			return returnString;
		}
		
		$scope.import = function() {
			if (angular.isUndefined($scope.importJSON) || $scope.importJSON.length < 1) {
				alert('You must paste valid JSON into the import textarea');
				return;
			}
			
			var elements = $scope.importJSON.split('|');
			_.each(elements, function(element){
				var jsonObject = {};
				try {
					jsonObject = JSON.parse(element);
				}
				catch(error) {
					alert('The following element was not valid JSON: ' + element);
				}
				
				// Make sure I have a valid jsonVersion.  Its possible the user could have messed up the JSON and therefore importing would fail on parsing.
				if (angular.isDefined(jsonObject)) {
					if (jsonObject.isType == 'Cube') {
						$scope.addCube(jsonObject);
					}
					else if (jsonObject.isType == 'Sphere') {
						$scope.addSphere(jsonObject);
					}
				}
				
			})
			
		}
		
		// This will remove the selected object from the canvas.
		$scope.removeObject = function() {
		
			// If the user doesn't have one selected just return because there is nothing to delete.
			if (angular.isUndefined($scope.selectedObject)) 
				return;
				
			var indexToRemove = 0;
			$scope.scene.remove($scope.selectedObject.data);
			_.any($scope.objects, function(object, index){
				if (object.id == $scope.selectedObject.id) {
					indexToRemove = index;
					return true;
				}
			})
			
			$scope.objects.splice(indexToRemove, 1);
			$scope.selectedObject = $scope.objects[0];
		}



    })

;
  
