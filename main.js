import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from './OrbitControls.js';

//i just wanted to finish this quickly,
//so it won't have the best code but fast and functional

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const controls = new OrbitControls( camera, renderer.domElement );

let showWireframe = true;
let showblocks = true;
let makeItSphere = false;
let roundNumbers = true;

let blockLength = 10;
let blockSegments = 12;
//cone calculator
let coneHeight = null;

let blockLengthInput = document.querySelector("#block-length");
let blockCountInput = document.querySelector("#smoothness");
let angleInput = document.querySelector("#angle");
let blockWidthInput = document.querySelector("#block-width");
let errorText = document.querySelector("#errors");
let totalBlocks = document.querySelector("#total-blocks");
let currentBlockWidth = document.querySelector("#current-block-width");
let scaleDirection = document.querySelector("#scale-sides-direction");
let scaleDirectionLength = document.querySelector("#scale-sides");
//cone calculator
let coneHeightInput = document.querySelector("#cone-height");
let coneAngleInput = document.querySelector("#cone-angle");
setupListeners();


updateShape();

//controls.update() must be called after any manual changes to the camera's transform
camera.position.set( 2, 3, 3 );
controls.update();

function animate() {

	requestAnimationFrame( animate );

	// required if controls.enableDamping or controls.autoRotate are set to true
	controls.update();

	renderer.render( scene, camera );

}
animate();


function setupListeners() {
	blockLengthInput?.addEventListener("input", (event) => {
		let inputElement = event.target;
		if (inputElement.value < 0) inputElement.value = 0;
		blockLength = parseInt(inputElement.value);
		updateShape();
	});
	blockCountInput?.addEventListener("input", (event) => {
		let inputElement = event.target;
		inputElement.value = Math.floor(inputElement.value);
		if (inputElement.value < 2) inputElement.value = 2;
		blockSegments = inputElement.value * 2;
		updateShape();
	});
	angleInput?.addEventListener("input", (event) => {
		let inputElement = event.target;
		if (inputElement.value > 90) inputElement.value = 90;
		let value = 360 / (inputElement.value * 2);
		if (value % 1 !== 0) {
			errorText.textContent = "Can't create Circle With this Angle.";
			scene.clear();
			return;
		}
		blockSegments = value * 2;
		blockCountInput.value = value;
		updateShape();
	});
	blockWidthInput?.addEventListener("input", (event) => {
		let inputElement = event.target;
		if (inputElement.value < 0) inputElement.value = 0;
		// let radius = (blockLength / 2) / Math.cos(angleRadians / 2);
		// let value = Math.asin(inputElement.value / (2 * radius)) * 2;
		// let blockWidth = blockLength * Math.tan(angleRadians / 2);
		let angleDegrees = 360/blockSegments;
		let angleRadians = angleDegrees * (Math.PI/180);
		let value = inputElement.value / Math.tan(angleRadians / 2);
		if (roundNumbers) value = Math.round(100 * value) / 100;
		blockLength = value;
		blockLengthInput.value = value;
		updateShape();
	});
	currentBlockWidth?.addEventListener("input", (event) => {
		let inputElement = event.target;
		if (inputElement.value < 0) inputElement.value = 0;
		let scaleOffset = blockWidthInput.value - inputElement.value;
		scaleOffset = Math.round(1e10 * scaleOffset) / 1e10;
		if (scaleOffset < 0) {
			scaleOffset = Math.abs(scaleOffset);
			scaleDirection.textContent = "Inwards";
		} else {
			scaleDirection.textContent = "Outwards";
		}
		scaleDirectionLength.textContent = scaleOffset / 2;
	});
	document.querySelector("#hide-wireframe")?.addEventListener("input", (event) => {
		let inputElement = event.target;
		showWireframe = !inputElement.checked;
		updateShape();
	});
	document.querySelector("#hide-blocks")?.addEventListener("input", (event) => {
		let inputElement = event.target;
		showblocks = !inputElement.checked;
		updateShape();
	});
	document.querySelector("#make-it-sphere")?.addEventListener("input", (event) => {
		let inputElement = event.target;
		makeItSphere = inputElement.checked;
		updateShape();
	});
	document.querySelector("#round-numbers")?.addEventListener("input", (event) => {
		let inputElement = event.target;
		roundNumbers = inputElement.checked;
		updateShape();
	});
	
	coneHeightInput?.addEventListener("input", (event) => {
		let inputElement = event.target;
		if (inputElement.value < 0) inputElement.value = 0;
		coneHeight = parseInt(inputElement.value);
		updateShape();
	});
	coneAngleInput?.addEventListener("input", (event) => {
		let inputElement = event.target;
		if (inputElement.value < 0) inputElement.value = 0;
		console.log("running");
		// let radius = (blockLength / 2) / Math.cos(angleRadians / 2);
		// let value = Math.asin(inputElement.value / (2 * radius)) * 2;
		// let blockWidth = blockLength * Math.tan(angleRadians / 2);
		let angleDegrees = inputElement.value;
		let angleRadians = angleDegrees * (Math.PI/180);
		coneHeight = (blockLength/2) * Math.tan(angleRadians);
		coneHeight = Math.round(1e10 * coneHeight) / 1e10;
		if (roundNumbers) coneHeight = Math.round(100 * coneHeight) / 100;
		coneHeightInput.value = coneHeight;
		updateShape();
	});
}


function updateShape() {
	errorText.textContent = "No Errors.";
	scene.clear();
	if (blockSegments % 2 !== 0) blockSegments += 1;

	let angleDegrees = 360/blockSegments;
	if (roundNumbers) angleDegrees = Math.round(100 * angleDegrees) / 100;
	angleInput.value = angleDegrees;
	let angleRadians = angleDegrees * (Math.PI/180);
	// let radius = (blockLength / 2) / Math.cos(angleRadians / 2);
	// let blockWidth = 2 * radius * Math.sin(angleRadians / 2);
	let blockWidth = blockLength * Math.tan(angleRadians / 2);
	blockWidth = Math.round(1e10 * blockWidth) / 1e10;
	if (roundNumbers) blockWidth = Math.round(100 * blockWidth) / 100;
	blockWidthInput.value = blockWidth;
	// blockWidthInput.value = Math.round(100 * (blockWidth + 0.000000000000002)) / 100;
	if (coneHeight != null) {
		coneAngleInput.value = 180 * Math.atan(coneHeight / (blockLength/2)) / Math.PI;
		if (roundNumbers) coneAngleInput.value = Math.round(100 * coneAngleInput.value) / 100;
	}

	let height = 1;
	if (makeItSphere) height = blockWidth / 2;
	let totalBlockCount = 0;

	for (let sliceIndex = 0; sliceIndex < blockSegments / 2; sliceIndex++) {
		const group = new THREE.Group();

		for (let segmentIndex = 0; segmentIndex < blockSegments / 2; segmentIndex++) {
			let totalBlockSize = (blockLength * height * blockWidth) / 4;
			if (Math.floor(totalBlockSize) !== totalBlockSize) totalBlockSize = Math.floor(totalBlockSize) + 1;
			// if (totalBlockSize < blockSegments / 2) totalBlockSize = blockSegments / 2;
			totalBlockCount += totalBlockSize;
			createRectangle(group, [blockLength/2,height,blockWidth / 2], [0,angleRadians * segmentIndex,0]);
		}

		group.rotation.set(0,0,angleRadians * sliceIndex);
		scene.add(group);

		if (makeItSphere !== true) break;
	}

	totalBlocks.textContent = totalBlockCount;

	let scaleOffset = blockWidth - parseInt(currentBlockWidth.value);
	scaleOffset = Math.round(1e10 * scaleOffset) / 1e10;
	if (scaleOffset < 0) {
		scaleOffset = Math.abs(scaleOffset);
		scaleDirection.textContent = "Inwards";
	} else {
		scaleDirection.textContent = "Outwards";
	}
	scaleDirectionLength.textContent = scaleOffset / 2;
}

function createRectangle(group, size = [1,1,1], rotation = [0,0,0], position = [0,0,0]) {
	
	//block
	if (showblocks) {
		const geometryCube = new THREE.BoxGeometry( ...size );
		const material = new THREE.MeshBasicMaterial( { color: 0x00cc00 } );
		const cube = new THREE.Mesh( geometryCube, material );
		cube.rotation.set( ...rotation );
		cube.position.set( ...position );
		group.add( cube );
	}

	//wireframe / lines
	if (showWireframe === false) return;
	const materialline = new THREE.LineBasicMaterial( { color: 0xffffff } );
	const points = [];

	points.push( new THREE.Vector3( -0.5*size[0], -0.5*size[1], -0.5*size[2] ) );
	points.push( new THREE.Vector3( -0.5*size[0], -0.5*size[1],  0.5*size[2] ) );
	points.push( new THREE.Vector3( -0.5*size[0],  0.5*size[1],  0.5*size[2] ) );
	points.push( new THREE.Vector3( -0.5*size[0],  0.5*size[1], -0.5*size[2] ) );

	points.push( new THREE.Vector3(  0.5*size[0],  0.5*size[1], -0.5*size[2] ) );
	points.push( new THREE.Vector3(  0.5*size[0],  0.5*size[1],  0.5*size[2] ) );
	points.push( new THREE.Vector3(  0.5*size[0], -0.5*size[1],  0.5*size[2] ) );
	points.push( new THREE.Vector3(  0.5*size[0], -0.5*size[1], -0.5*size[2] ) );

	points.push( new THREE.Vector3( -0.5*size[0], -0.5*size[1], -0.5*size[2] ) );
	points.push( new THREE.Vector3( -0.5*size[0],  0.5*size[1], -0.5*size[2] ) );
	points.push( new THREE.Vector3(  0.5*size[0],  0.5*size[1], -0.5*size[2] ) );
	points.push( new THREE.Vector3(  0.5*size[0], -0.5*size[1], -0.5*size[2] ) );

	points.push( new THREE.Vector3(  0.5*size[0], -0.5*size[1],  0.5*size[2] ) );
	points.push( new THREE.Vector3( -0.5*size[0], -0.5*size[1],  0.5*size[2] ) );
	points.push( new THREE.Vector3( -0.5*size[0],  0.5*size[1],  0.5*size[2] ) );
	points.push( new THREE.Vector3(  0.5*size[0],  0.5*size[1],  0.5*size[2] ) );

	const geometry = new THREE.BufferGeometry().setFromPoints( points );

	const line = new THREE.Line( geometry, materialline );
	line.rotation.set( ...rotation );
	line.position.set( ...position );
	group.add( line );
}