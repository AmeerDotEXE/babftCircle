import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from './OrbitControls.js';

window.THREE = THREE;

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const controls = new OrbitControls( camera, renderer.domElement );

let showWireframe = true;
let showblocks = true;

let blockLength = 10;
let blockSegments = 12;

let blockLengthInput = document.querySelector("#block-length");
let blockCountInput = document.querySelector("#smoothness");
let angleInput = document.querySelector("#angle");
let blockWidthInput = document.querySelector("#block-width");
let errorText = document.querySelector("#errors");
blockLengthInput?.addEventListener("input", (event) => {
	let inputElement = event.target;
	if (inputElement.value < 0) inputElement.value = 0;
	blockLength = inputElement.value;
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
	blockLength = value;
	blockLengthInput.value = value;
	updateShape();
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


updateShape();

//controls.update() must be called after any manual changes to the camera's transform
camera.position.set( 2, 3, 3 );
// camera.rotation.set(45,0,0)
// camera.position.z = 5;
controls.update();

function animate() {

	requestAnimationFrame( animate );

	// required if controls.enableDamping or controls.autoRotate are set to true
	controls.update();

	renderer.render( scene, camera );

}
animate();


function updateShape() {
	errorText.textContent = "No Errors.";
	scene.clear();
	if (blockSegments % 2 !== 0) blockSegments += 1;

	let angleDegrees = 360/blockSegments;
	angleInput.value = angleDegrees;
	let angleRadians = angleDegrees * (Math.PI/180);
	// let radius = (blockLength / 2) / Math.cos(angleRadians / 2);
	// let blockWidth = 2 * radius * Math.sin(angleRadians / 2);
	let blockWidth = blockLength * Math.tan(angleRadians / 2);
	if (blockWidth + 0.000000000000002 % 1 === 0) blockWidth += 0.000000000000002;
	blockWidthInput.value = blockWidth;
	// blockWidthInput.value = Math.round(100 * (blockWidth + 0.000000000000002)) / 100;
	// console.log(blockWidth);


	// createCube([2,1,1], [0,1,0])
	// createCube([1,1,2], [0,-1,0])
	// createRectangle([blockLength/2,1,blockWidth / 2], [0,0,0]);
	// createRectangle([blockLength/2,1,blockWidth / 2], [0,angleRadians,0]);

	const group = new THREE.Group();

	for (let segmentIndex = 0; segmentIndex < blockSegments / 2; segmentIndex++) {
		createRectangle(group, [blockLength/2,1,blockWidth / 2], [0,angleRadians * segmentIndex,0]);
	}

	scene.add(group);
}


function createCube(size = [1,1,1], position = [0,0,0]) {
	const geometry = new THREE.BoxGeometry( ...size );
	const material = new THREE.MeshBasicMaterial( { color: 0x00cc00 } );
	const cube = new THREE.Mesh( geometry, material );
	cube.position.set( ...position );
	scene.add( cube );
	const wireframe = new THREE.WireframeGeometry( geometry );
	const line = new THREE.LineSegments( wireframe );
	line.material.depthTest = true;
	line.material.opacity = 0.75;
	line.material.transparent = true;
	line.position.set( ...position );
	scene.add( line );
}

function createRectangle(group, size = [1,1,1], rotation = [0,0,0], position = [0,0,0]) {
	
	//cube
	if (showblocks) {
		const geometryCube = new THREE.BoxGeometry( ...size );
		const material = new THREE.MeshBasicMaterial( { color: 0x00cc00 } );
		const cube = new THREE.Mesh( geometryCube, material );
		cube.rotation.set( ...rotation );
		cube.position.set( ...position );
		group.add( cube );
	}

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