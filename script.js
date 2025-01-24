import * as THREE from "three";
import { TextureLoader } from "three";
// import { GLTFLoader } from "GLTFLoader";
import { MindARThree } from "mindAR";

let width = window.innerWidth;
let height = window.innerHeight;

// const canvas = document.querySelector("#canvas");
const btnF = document.querySelector("#F");
const btnC = document.querySelector("#C");
const btnS = document.querySelector("#S");

// const loaderGltf = new GLTFLoader();
// const modelPath = "./assets/eye01.glb";
// const occluderPath = "./assets/head_occluder_01.glb";

// const loaderAudio = new THREE.AudioLoader();
// const audioPath = "./assets/meow.mp3";

let maskPath, count = 0;
const textureLoader = new THREE.TextureLoader();

let model, occluder, mindAR, faceMesh, maskTexture;
async function startMindAR() {
  mindAR = new MindARThree({
    container: document.body,
  });
  const { renderer, camera, scene } = mindAR;
  renderer.setSize(width, height);

  const light = new THREE.HemisphereLight(0xffffff, 10);
  scene.add(light);

  // const geometry = new THREE.SphereGeometry(0.1, 32, 32);
  // const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  // const sphere = new THREE.Mesh(geometry, material);
  // const anchorNose = mindAR.addAnchor(1);
  // anchorNose.group.add(sphere);

  // Wait for model to load
  // const gltf = await new Promise((resolve) => {
  //   loaderGltf.load(modelPath, (gltf) => {
  //     resolve(gltf);
  //   });
  // });
  // model = gltf.scene;
  // const anchorEye = mindAR.addAnchor(168);
  // anchorEye.group.add(model);
  // let size = 0.125;
  // model.scale.set(size, size, size);
  // model.position.set(0,-0.1,-0.05);

  // const gltfOccluder = await new Promise((resolve) => {
  //   loaderGltf.load(occluderPath, (gltf) => {
  //     resolve(gltf);
  //   });
  // });
  // occluder = gltfOccluder.scene;
  // const occluderMat = new THREE.MeshStandardMaterial({
  //   colorWrite: false
  // });
  // occluder.traverse((child) => {
  //   if (child.isMesh) {
  //     child.material = occluderMat;
  //   }
  // });
  // const anchorOccluder = mindAR.addAnchor(168);
  // anchorOccluder.group.add(occluder);
  // let sizeOccluder = 0.125;
  // occluder.scale.set(sizeOccluder, sizeOccluder, sizeOccluder);
  // occluder.position.set(0, -0.5, 0);

  maskPath = `./assets/myMask0${count}.png`;
  faceMesh = mindAR.addFaceMesh();
  maskTexture = textureLoader.load(maskPath);
  faceMesh.material.map = maskTexture;
  faceMesh.material.transparent = true;
  faceMesh.material.needsUpdate = true;
  scene.add(faceMesh);

  await mindAR.start();

  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
}
startMindAR();

btnF.addEventListener("click", () => {
  console.log("Filters");
  count === 0 ? (count = 1) : (count = 0);
  maskPath = `./assets/myMask0${count}.png`;
  maskTexture = textureLoader.load(maskPath);
  faceMesh.material.map = maskTexture;
});
btnC.addEventListener("click", () => {
  console.log("Capture");
  capture();
});

btnS.addEventListener("click", () => {
  console.log("Switch Camera");
  mindAR.switchCamera();
});

function capture () {
  const {renderer, video, scene, camera} = mindAR;
  
  const canvasA = renderer.domElement;
  const canvasB = document.createElement('canvas');
  const context = canvasB.getContext('2d');
  
  console.log(canvasA,video);
  canvasB.width = canvasA.width;
  canvasB.height = canvasA.height;

  let aX,aY,aW,aH,bX,bY,bW,bH;
  aX = aY = aW = aH = bX = bY = bW = bH = 0 ;

  aX = (video.clientWidth - canvasA.clientWidth) / 2 * (video.videoWidth / video.clientWidth);
  aY = (video.clientHeight - canvasA.clientHeight) / 2 * (video.videoHeight / video.clientHeight);
  aW = video.videoWidth - aX * 2;
  aH = video.videoHeight - aY * 2;

  context.drawImage(video, aX,aY,aW,aH, 0, 0, canvasB.width, canvasB.height);
  renderer.preserveDrawingBuffer = true;
  renderer.render(scene, camera);
  context.drawImage(canvasA, 0, 0, canvasA.width, canvasA.height);
  renderer.preserveDrawingBuffer = false;

  const link = document.createElement('a');
  link.href = canvasB.toDataURL('image/png');
  link.download = 'capture.png';
  link.click();
}


