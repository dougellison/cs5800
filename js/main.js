'use strict';

// Declare app level module which has no dependencies.
// AngjularJS is a client side javascript MVC.
angular.module('mainApp', [])
    .controller('main', function($scope) {

        $scope.objectTypes = [];
        $scope.objectTypes.push({name: 'Cube'},{name: 'Sphere'});
        $scope.selectedObjectType = 'Cube';


		// Stores the list of added objects
        $scope.objects = [];
		// This is the default that shows up in the select box for addition.
        $scope.objects.push({id:-1, name: 'Select an Object', data: {}});
        $scope.objectCounter = 0;

        $scope.selectedObject = $scope.objects[0];

		// The next section just sets up a bunch of variables that will be used across many different functions.
        $scope.raycaster = new THREE.Raycaster();
        $scope.projector = new THREE.Projector();
        $scope.mouse = new THREE.Vector2()
        $scope.cameraRepresentation = {};
		$scope.offset = new THREE.Vector3()

		// The following are the two basic materials used in the system.
        $scope.basicMaterial = new THREE.MeshNormalMaterial( { shading: THREE.SmoothShading, overdraw: true } )
        $scope.selectedMaterial = new THREE.MeshBasicMaterial( {wireframe: true, color: 'red'} );

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
            camera = new THREE.PerspectiveCamera( 70, 1070 / 500, 1, 10000 );
            $scope.nearString = 1;
            $scope.farString = 3000;
            camera.position.set( 0, 1000, 100);

			// Get a reference do the div element where the canvas is being drawn and pass it to controls.  Controls is what allows dragging and manipulation of the camera.
            var divElement = $('#mainDrawLocation');
			divElement.on('mousewheel')
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

            // This creates a Scene.  ThreeJS has a specific concept of a Scene which is a container for all things
            // in the viewable space.  Later meshes / camera will be added to the scene.
            scene = new THREE.Scene();

			// This sets up a grid that displays in the background for perspective.
            var grid = new THREE.GridHelper( 1000, 40 );
            scene.add(grid);

			// Sets a very generic light source just so that things have something that lights them up.
            var light = new THREE.DirectionalLight( 0xffffff, 2 );
            light.position.set( 500, 500, 500 );

            scene.add(light);

			// This is what will be used for dragging and dropping various elements. Because the camera can be rotated many different ways this gives some idea of how an object will move when dragged.
			$scope.plane = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000, 8, 8 ), new THREE.MeshBasicMaterial( { color: 'red', wireframe: true } ) );
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


		// This watches the UI for any changes in where the camera is directed.  If changes occur I want to see if look at is checked and then update the projection matrix.
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

		// This is watching the frustum controls.  The UI takes data in string form and ThreeJS needs the data to be in float format.
        $scope.$watch('fovString', function(newValue) {
            if (angular.isDefined(newValue)) {
                $scope.camera.fov = parseFloat(newValue);
                $scope.camera.updateProjectionMatrix();
            }
        })

		// Watches the nearString and updates the camera if a user types in a value.
        $scope.$watch('nearString', function(newValue) {
            if (angular.isDefined(newValue)) {
                $scope.camera.near = parseFloat(newValue);
                $scope.camera.updateProjectionMatrix();
            }
        })

		// This watches the far string and if the user makes a changes converts it to a float for updating in the camera settings.
        $scope.$watch('farString', function(newValue) {
            if (angular.isDefined(newValue)) {
                $scope.camera.far = parseFloat(newValue);
                $scope.camera.updateProjectionMatrix();
            }
        })

		// Same as above except watches aspect.
        $scope.$watch('camera.aspect', function(newValue) {
            if (angular.isDefined(newValue))
                $scope.camera.updateProjectionMatrix();
        })

		// This is entry point for a user clicking the button to add an element to the canvas.
        $scope.addObject = function() {
            if ($scope.selectedObjectType == 'Cube')
                $scope.addCube();
            else if ($scope.selectedObjectType == 'Sphere')
                $scope.addSphere();
        }

		/*
		*	Method that gets called both on importing and when a user wants to add a new element.  If import is the origination of execution the variable element will have a value that I want to pull in and base the new object off of.  If it has no
		*	value then its new and I just set some defaults.
		*/
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
				_.extend(cube.rotation, element.rotation);
			}
            
			cube.geometry.dynamic = true
            cube.listID = $scope.objectCounter;
			cube.isType = "Cube";
            $scope.scene.add( cube );
            $scope.objects.push({id: $scope.objectCounter, name: 'Cube', data: cube});
            $scope.objectCounter++;

        }

		/*
		*	Same as addCube just with spheres
		*/
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
				_.extend(sphere.rotation, element.rotation);
			}
            
            sphere.isType = "Sphere";
            sphere.listID = $scope.objectCounter;
            $scope.scene.add(sphere);
            $scope.objects.push({id:$scope.objectCounter, name: 'Sphere', data: sphere});
            $scope.objectCounter++;
        }

		/*
		*	Keeps track of the UI element for selecting an element.  If the user selects the object using the select box within edit I want to know about it.  The object that gets selected will need to be displayed differently within the canvas
		*	to account for this I use a wireFrame material to show that it is selected yet keep some idea of what the object is.
		*/
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

		/*
		*	This method rounds and parses to an int user input.  When a user types in a value such as 1.23423423423432 it comes in both as a string and non-useful.  For the purpose of calculation whole numbers is all that can be distinguised. 
		*	Instead of disallowing I simply choose to round to the nearest whole.
		*/
        $scope.cleanVector = function(vector) {
            return new THREE.Vector3(parseInt(Math.round(vector.x)), parseInt(Math.round(vector.y)), parseInt(Math.round(vector.z)));
        }
		
		/*
		*	This method has a few important functions.  For drag and drop of an element it is important to update the plane with an offset to get some idea of how an object will move given the current camera rotation.
		*	Secondly I need to check and see if the user has a mousedown operation so I know if the user is dragging an object around.  If the user is dragging an object around I need to update its position with each
		*	call to this function.  
		*/
		$scope.updatePlaneAndOverObject = function(event) {
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
				$scope.overObject = intersects[0].object;
				$scope.plane.position.copy( $scope.overObject.position );
				$scope.plane.lookAt( $scope.camera.position );
            }
            
        }

		/*
		*	This controls finding an object.  It uses a raycaster to normalive the view given the position of the camera to see what object was selected.  Also it sets $scope.selectedObject so that other methods know when
		*	an object is being drug.  Lastly it does one final update of the plane and bounds the drag operation within that plane.
		*/
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

		/*
		*	Controls the deselection of elements that were not clicked on.  This function gets triggered anytime a click occurs.  It assumes that a selection operation will get called immediately after this gets called.  
		*	The benefit of that assumption is that it attempts to remove and reset all materials to their original.
		*/
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
				var rotation = {};
				_.extend(rotation, _.pick(meshData.rotation, ['x', 'y', 'z']));
				
				objectProperties.rotation = rotation;
				
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
		
		/*
		*	This function gets called when a user clicks import.  It parses any data input in the text area and builds objects out of the input.  
		*	If all goes well and the user entered valid data then it will build the corresponding objects to be added to the canvas.
		*/
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
					if (angular.isDefined(jsonObject.rotation)) {
						jsonObject.rotation.x = parseFloat(jsonObject.rotation.x);
						jsonObject.rotation.y = parseFloat(jsonObject.rotation.y);
						jsonObject.rotation.z = parseFloat(jsonObject.rotation.z);
					}
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
		
		// This resets the camera back to default.
		$scope.resetCamera = function() {
		
			$scope.nearString = 1;
			$scope.farString = 3000;
			$scope.fovString = 70;
			$scope.controls.reset();
			$scope.camera.fov = 70;
			$scope.camera.aspect = 2.14;
			$scope.camera.near = 1;
			$scope.camera.far = 3000;
			$scope.camera.updateProjectionMatrix();
		
		
		}



    })

;
  
