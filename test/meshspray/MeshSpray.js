/**
 * @author Kai Salmen / www.kaisalmen.de
 */

'use strict';

var MeshSpray = (function () {

	var Validator = THREE.LoaderSupport.Validator;

	MeshSpray.prototype = Object.create( THREE.LoaderSupport.Commons.prototype );
	MeshSpray.prototype.constructor = MeshSpray;

	function MeshSpray( manager ) {
		THREE.LoaderSupport.Commons.call( this, manager );
		this.workerSupport = null;
	};

	MeshSpray.prototype.setWorkerSupport = function ( workerSupport ) {
		this.workerSupport = Validator.verifyInput( workerSupport, this.workerSupport );

	};

	MeshSpray.prototype.run = function ( prepData ) {
		console.time( 'MeshSpray' );

		this._applyPrepData( prepData );

		var scope = this;
		var scopeBuilderFunc = function ( payload ) {
			var meshes = scope.builder.buildMeshes( payload );
			var mesh;
			for ( var i in meshes ) {
				mesh = meshes[ i ];
				scope.loaderRootNode.add( mesh );
			}
		};
		var scopeFuncComplete = function ( message ) {
			var callback = scope.callbacks.onLoad;
			if ( Validator.isValid( callback ) ) callback( scope.loaderRootNode, scope.modelName, scope.instanceNo, message );
			console.timeEnd( 'MeshSpray' );
		};

		this.workerSupport = Validator.verifyInput( this.workerSupport, new THREE.LoaderSupport.WorkerSupport() );
		var buildCode = function ( funcBuildObject, funcBuildSingelton ) {
			var workerCode = '';
			workerCode += '/**\n';
			workerCode += '  * This code was constructed by MeshSpray buildWorkerCode.\n';
			workerCode += '  */\n\n';
			workerCode += funcBuildObject( 'Validator', Validator );
			workerCode += funcBuildSingelton( 'Parser', 'Parser', Parser );

			return workerCode;
		};
		this.workerSupport.validate( buildCode, false );
		this.workerSupport.setCallbacks( scopeBuilderFunc, scopeFuncComplete );
		this.workerSupport.run(
			{
				cmd: 'run',
				params: {
					debug: this.debug,
					dimension: prepData.dimension,
					quantity: prepData.quantity,
					globalObjectCount: prepData.globalObjectCount
				},
				materials: {
					materialNames: this.materialNames
				},
				buffers: {
					input: null
				}
			}
		);
	};

	var Parser  = ( function () {

		function Parser() {
			this.sizeFactor = 0.5;
			this.localOffsetFactor = 1.0;
			this.globalObjectCount = 0;
			this.debug = false;
			this.dimension = 200;
			this.quantity = 1;
			this.callbackBuilder = null;
		};

		Parser.prototype.parse = function () {
			var materialDescription;
			var materialDescriptions = [];
			var materialGroups = [];

			materialDescription = {
				name: 'Gen',
				flat: false,
				vertexColors: true,
				default: true
			};
			materialDescriptions.push( materialDescription );

			var baseTriangle = [ 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 0.0, -1.0, 1.0 ];
			var vertices = [];
			var colors = [];
			var normals = [];
			var uvs = [];

			var dimensionHalf = this.dimension / 2;
			var fixedOffsetX;
			var fixedOffsetY;
			var fixedOffsetZ;
			var s, t;
			// complete triagle
			var sizeVaring = this.sizeFactor * Math.random();
			// local coords offset
			var localOffsetFactor = this.localOffsetFactor;

			for ( var i = 0; i < this.quantity; i++ ) {
				sizeVaring = this.sizeFactor * Math.random();

				s = 2 * Math.PI * Math.random();
				t = Math.PI * Math.random();

				fixedOffsetX = dimensionHalf * Math.random() * Math.cos( s ) * Math.sin( t );
				fixedOffsetY = dimensionHalf * Math.random() * Math.sin( s ) * Math.sin( t );
				fixedOffsetZ = dimensionHalf * Math.random() * Math.cos( t );
				for ( var j = 0; j < baseTriangle.length; j += 3 ) {
					vertices.push( baseTriangle[ j ] * sizeVaring + localOffsetFactor * Math.random() + fixedOffsetX );
					vertices.push( baseTriangle[ j + 1 ] * sizeVaring + localOffsetFactor * Math.random() + fixedOffsetY );
					vertices.push( baseTriangle[ j + 2 ] * sizeVaring + localOffsetFactor * Math.random() + fixedOffsetZ );
					colors.push( Math.random() );
					colors.push( Math.random() );
					colors.push( Math.random() );
				}
			}

			var absoluteVertexCount = vertices.length;
			var absoluteColorCount = colors.length;
			var absoluteNormalCount = 0;
			var absoluteUvCount = 0;

			var vertexFA = new Float32Array( absoluteVertexCount );
			var colorFA = ( absoluteColorCount > 0 ) ? new Float32Array( absoluteColorCount ) : null;
			var normalFA = ( absoluteNormalCount > 0 ) ? new Float32Array( absoluteNormalCount ) : null;
			var uvFA = ( absoluteUvCount > 0 ) ? new Float32Array( absoluteUvCount ) : null;

			vertexFA.set( vertices, 0 );
			if ( colorFA ) {

				colorFA.set( colors, 0 );

			}

			if ( normalFA ) {

				normalFA.set( normals, 0 );

			}
			if ( uvFA ) {

				uvFA.set( uvs, 0 );

			}

			this.globalObjectCount++;
			this.callbackBuilder(
				{
					cmd: 'meshData',
					params: {
						meshName: 'Gen' + this.globalObjectCount
					},
					materials: {
						multiMaterial: false,
						materialDescriptions: materialDescriptions,
						materialGroups: materialGroups
					},
					buffers: {
						vertices: vertexFA,
						colors: colorFA,
						normals: normalFA,
						uvs: uvFA
					}
				},
				[ vertexFA.buffer ],
				colorFA !== null ? [ colorFA.buffer ] : null,
				normalFA !== null ? [ normalFA.buffer ] : null,
				uvFA !== null ? [ uvFA.buffer ] : null
			);

			console.log( 'Global output object count: ' + this.globalObjectCount );
		};

		return Parser;
	})();

	return MeshSpray;

})();

var MeshSprayApp = (function () {

	function MeshSprayApp( elementToBindTo ) {
		this.renderer = null;
		this.canvas = elementToBindTo;
		this.aspectRatio = 1;
		this.recalcAspectRatio();

		this.scene = null;
		this.cameraDefaults = {
			posCamera: new THREE.Vector3( 500.0, 500.0, 1000.0 ),
			posCameraTarget: new THREE.Vector3( 0, 0, 0 ),
			near: 0.1,
			far: 10000,
			fov: 45
		};
		this.camera = null;
		this.cameraTarget = this.cameraDefaults.posCameraTarget;

		this.controls = null;

		this.cube = null;
		this.pivot = null;
	}

	MeshSprayApp.prototype.initGL = function () {
		this.renderer = new THREE.WebGLRenderer( {
			canvas: this.canvas,
			antialias: true,
			autoClear: true
		} );
		this.renderer.setClearColor( 0x050505 );

		this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera( this.cameraDefaults.fov, this.aspectRatio, this.cameraDefaults.near, this.cameraDefaults.far );
		this.resetCamera();
		this.controls = new THREE.TrackballControls( this.camera, this.renderer.domElement );

		var ambientLight = new THREE.AmbientLight( 0x404040 );
		var directionalLight1 = new THREE.DirectionalLight( 0xC0C090 );
		var directionalLight2 = new THREE.DirectionalLight( 0xC0C090 );

		directionalLight1.position.set( -100, -50, 100 );
		directionalLight2.position.set( 100, 50, -100 );

		this.scene.add( directionalLight1 );
		this.scene.add( directionalLight2 );
		this.scene.add( ambientLight );

		var helper = new THREE.GridHelper( 1200, 60, 0xFF4444, 0x404040 );
		this.scene.add( helper );

		var geometry = new THREE.BoxGeometry( 10, 10, 10 );
		var material = new THREE.MeshNormalMaterial();
		this.cube = new THREE.Mesh( geometry, material );
		this.cube.position.set( 0, 0, 0 );
		this.scene.add( this.cube );

		this.pivot = new THREE.Object3D();
		this.pivot.name = 'Pivot';
		this.scene.add( this.pivot );
	};

	MeshSprayApp.prototype.initContent = function () {
		var maxQueueSize = 1024;
		var maxWebWorkers = 4;
		var radius = 640;
		this.workerDirector = new THREE.LoaderSupport.WorkerDirector( MeshSpray );
		this.workerDirector.setCrossOrigin( 'anonymous' );

		var scope = this;
		var callbackOnLoad = function ( sceneGraphBaseNode, modelName, instanceNo ) {
			var msg = 'Worker #' + instanceNo + ': Completed loading. (#' + scope.workerDirector.objectsCompleted + ')';
			console.log( msg );
		};
		var reportProgress = function( content, modelName, instanceNo ) {
			if ( THREE.LoaderSupport.Validator.isValid( content ) && content.length > 0 ) {

				document.getElementById( 'feedback' ).innerHTML = content;
				console.log( content );

			}
		};
		var callbackMeshAlter = function ( name, bufferGeometry, material ) {
			var override = new THREE.LoaderSupport.LoadedMeshUserOverride( false, true );

			var mesh = new THREE.Mesh( bufferGeometry, material );
			material.side = THREE.DoubleSide;
			mesh.name = name;
			override.addMesh( mesh );

			return override;
		};


		var callbacks = new THREE.LoaderSupport.Callbacks();
		callbacks.setCallbackOnMeshAlter( callbackMeshAlter );
		callbacks.setCallbackOnLoad( callbackOnLoad );
		callbacks.setCallbackOnProgress( reportProgress );
		this.workerDirector.prepareWorkers( callbacks, maxQueueSize, maxWebWorkers );

		var prepData;
		var pivot;
		var s, t, r, x, y, z;
		var globalObjectCount = 0;
		for ( var i = 0; i < maxQueueSize; i++ ) {
			prepData = new THREE.LoaderSupport.PrepData( 'Triangles_' + i );

			pivot = new THREE.Object3D();
			s = 2 * Math.PI * Math.random();
			t = Math.PI * Math.random();
			r = radius * Math.random();
			x = r * Math.cos( s ) * Math.sin( t );
			y = r * Math.sin( s ) * Math.sin( t );
			z = r * Math.cos( t );
			pivot.position.set( x, y, z );
			this.scene.add( pivot );
			prepData.setStreamMeshesTo( pivot );

			prepData.quantity = 8192;
			prepData.dimension = Math.max( Math.random() * 500, 100 );
			prepData.globalObjectCount = globalObjectCount++;

			this.workerDirector.enqueueForRun( prepData );
		}
		this.workerDirector.processQueue();
	};

	MeshSprayApp.prototype.resizeDisplayGL = function () {
		this.controls.handleResize();

		this.recalcAspectRatio();
		this.renderer.setSize( this.canvas.offsetWidth, this.canvas.offsetHeight, false );

		this.updateCamera();
	};

	MeshSprayApp.prototype.recalcAspectRatio = function () {
		this.aspectRatio = ( this.canvas.offsetHeight === 0 ) ? 1 : this.canvas.offsetWidth / this.canvas.offsetHeight;
	};

	MeshSprayApp.prototype.resetCamera = function () {
		this.camera.position.copy( this.cameraDefaults.posCamera );
		this.cameraTarget.copy( this.cameraDefaults.posCameraTarget );

		this.updateCamera();
	};

	MeshSprayApp.prototype.updateCamera = function () {
		this.camera.aspect = this.aspectRatio;
		this.camera.lookAt( this.cameraTarget );
		this.camera.updateProjectionMatrix();
	};

	MeshSprayApp.prototype.render = function () {
		if ( ! this.renderer.autoClear ) this.renderer.clear();

		this.controls.update();

		this.cube.rotation.x += 0.05;
		this.cube.rotation.y += 0.05;

		this.renderer.render( this.scene, this.camera );
	};

	return MeshSprayApp;

})();
