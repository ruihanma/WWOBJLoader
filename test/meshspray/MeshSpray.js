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
	}

	MeshSpray.prototype.init = function ( manager ) {
		THREE.LoaderSupport.Commons.prototype.init.call( this, manager );

		this.setStreamMeshes( true );
		this.requestTerminate = false;
		this.instanceNo = 0;

		var scope = this;
		var scopeBuilderFunc = function ( payload ) {
			scope.builder( payload );
		};
		var scopeFuncComplete = function ( reason ) {
			scope._finalize( reason );
		};
		this.meshProvider = Validator.verifyInput( this.meshProvider, new THREE.LoaderSupport.WW.MeshProvider( scopeBuilderFunc, scopeFuncComplete ) );
		this.meshProvider.reInit( false, this._buildWebWorkerCode, 'WWMeshSpray' );
	};

	MeshSpray.prototype.setRequestTerminate = function ( requestTerminate ) {
		this.requestTerminate = requestTerminate === true;
	};

	MeshSpray.prototype.setInstanceNo = function ( instanceNo ) {
		this.instanceNo = instanceNo;
	};

	MeshSpray.prototype.getInstanceNo = function () {
		return this.instanceNo;
	};

	MeshSpray.prototype.run = function ( prepData ) {
		console.time( 'MeshSpray' );

		this._applyPrepData( prepData );
		this.setMaterials( this.materials );

		this.meshProvider.run(
			{
				cmd: 'run',
				params: {
					debug: this.debug,
					dimension: prepData.dimension,
					quantity: prepData.quantity,
					counter: prepData.counter
				},
				materials: {
					materialNames: this.materialNames
				}
			}
		);
	};

	MeshSpray.prototype._applyPrepData = function ( prepData ) {
		THREE.LoaderSupport.Commons.prototype._applyPrepData.call( this, prepData );

		if ( Validator.isValid( prepData ) ) {

			this.modelName = prepData.modelName;
			this.setRequestTerminate( prepData.requestTerminate );

		}
	};

	MeshSpray.prototype._finalize = function ( reason ) {
		var callback;
		if ( reason === 'complete' ) {

			callback = this.callbacks.onLoad;
			if ( Validator.isValid( callback ) ) callback( this.sceneGraphBaseNode, this.modelName, this.instanceNo );

		} else if ( reason === 'error' ) {

			callback = this.callbacks.onError;
			if ( Validator.isValid( callback ) ) callback( this.sceneGraphBaseNode, this.modelName, this.instanceNo );

		}
		if ( reason === 'terminate' ) {

			if ( this.meshProvider.running ) throw 'Unable to gracefully terminate worker as it is currently running!';
			console.log( 'Finalize is complete. Terminating application on request!' );
			this.meshProvider._terminate();

		}
		console.timeEnd( 'MeshSpray' );
	};

	MeshSpray.prototype._buildWebWorkerCode = function ( funcBuildObject, funcBuildSingelton, existingWorkerCode ) {
		var workerCode = existingWorkerCode;
		if ( Validator.isValid( workerCode ) ) return workerCode;

		var wwMeshSprayDef = (function () {

			function WWMeshSpray() {
			}

			WWMeshSpray.prototype.run = function ( payload ) {
				this.cmdState = 'run';
				this.sizeFactor = 0.5;
				this.localOffsetFactor = 1.0;
				this.globalObjectCount = Validator.verifyInput( payload.params.counter, 0 );
				this.debug = payload.params.debug;
				this.dimension = Validator.verifyInput( payload.params.dimension, 200 );
				this.quantity = Validator.verifyInput( payload.params.quantity, 1 );
				this.materialNames = Validator.verifyInput( payload.materials.materialNames, [] );

				this._buildMesh();

				this.cmdState = 'complete';
				self.postMessage( {
					cmd: this.cmdState,
					msg: null
				} );
			};

			WWMeshSpray.prototype._buildMesh = function () {
				var materialDescription;
				var materialDescriptions = [];
				var materialGroups = [];

				materialDescription = {
					name: 'Gen' + this.globalObjectCount,
					flat: false,
					vertexColors: false,
					default: false
				};
				if ( this.materialNames[ materialDescription.name ] === null ) {

					materialDescription.default = true;
					console.warn( 'object_group "' + materialDescription.name + '" was defined without material! Assigning "defaultMaterial".' );

				}
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
				colorFA.set( colors, 0 );

				if ( colorFA ) {

					colorFA.set( colors, 0 );
					materialDescription.vertexColors = true;

				}

				if ( normalFA ) {

					normalFA.set( normals, 0 );

				}
				if ( uvFA ) {

					uvFA.set( uvs, 0 );

				}

				self.postMessage(
					{
						cmd: 'meshData',
						params: {
							meshName: 'Gen' + this.globalObjectCount,
						},
						materials: {
							multiMaterial: false,
							materialDescriptions: materialDescriptions,
							materialGroups: materialGroups,
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

				this.globalObjectCount++;
			};

			WWMeshSpray.prototype._finalize = function () {
				console.log( 'Global output object count: ' + this.globalObjectCount );
			};

			return WWMeshSpray;
		})();

		workerCode = '';
		workerCode += '/**\n';
		workerCode += '  * This code was constructed by MeshSpray._buildWebWorkerCode\n';
		workerCode += '  */\n\n';

		// web worker construction
		workerCode += funcBuildObject( 'Validator', Validator );
		workerCode += funcBuildSingelton( 'WWMeshSpray', 'WWMeshSpray', wwMeshSprayDef );

		return workerCode;
	};

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

	MeshSprayApp.prototype.initPostGL = function () {
		return true;
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
