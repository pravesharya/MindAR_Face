import * as THREE from "three";
import { GLTFLoader } from "GLTFLoader";
import { MindARThree } from "mindAR";

// const canvas = document.querySelector("#canvas");
const btnF = document.querySelector("#F");
const btnC = document.querySelector("#C");
const btnS = document.querySelector("#S");

const loaderGltf = new GLTFLoader();
const modelPath = "./assets/eye01.glb";
const occluderPath = "./assets/head_occluder_01.glb";

// const loaderAudio = new THREE.AudioLoader();
// const audioPath = "./assets/meow.mp3";

let model, occluder;
// , animations, mixer, audio, listener;
async function startMindAR() {
  const mindAR = new MindARThree({
    container: document.body,
  });
  const { renderer, camera, scene } = mindAR;
  
  const light = new THREE.HemisphereLight(0xffffff, 10);
  scene.add(light);
  
  const geometry = new THREE.SphereGeometry(0.1, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const sphere = new THREE.Mesh(geometry, material);
  const anchorNose = mindAR.addAnchor(1);
  anchorNose.group.add(sphere);

  // Wait for model to load
  const gltf = await new Promise((resolve) => {
    loaderGltf.load(modelPath, (gltf) => {
      resolve(gltf);
    });
  });
  model = gltf.scene;
  const anchorEye = mindAR.addAnchor(168);
  anchorEye.group.add(model);
  let size = 0.125;
  model.scale.set(size, size, size);
  
  const gltfOccluder = await new Promise((resolve) => {
    loaderGltf.load(occluderPath, (gltf) => {
      resolve(gltf);
    });
  });
  occluder = gltfOccluder.scene;
  const occluderMat = new THREE.MeshStandardMaterial({
    transparent: true,
    opacity: 0.25
    // colorWrite: false
  });
  occluder.traverse((child) => {
    if (child.isMesh) {
      child.material = occluderMat;
    }
  });
  const anchorOccluder = mindAR.addAnchor(168);
  anchorOccluder.group.add(occluder);
  let sizeOccluder = 0.125;
  occluder.scale.set(sizeOccluder, sizeOccluder, sizeOccluder);
  occluder.position.set(0, -0.5, 0);




  // animations = gltf.animations;
  // mixer = new THREE.AnimationMixer(model);
  // const action = mixer.clipAction(animations[0]);
  // action.play();

  // const audioClip = await new Promise((resolve) => {
  //   loaderAudio.load(audioPath, (buffer) => {
  //     resolve(buffer);
  //   });
  // });

  // listener = new THREE.AudioListener();
  // camera.add(listener);
  // audio = new THREE.PositionalAudio(listener);
  // audio.setBuffer(audioClip);
  // audio.setRefDistance(100);
  // // audio.setLoop(true);
  
  // anchor.onTargetFound = () => {
  //   setInterval(() => {
  //     audio.isPlaying ? audio.pause() : audio.play();
  //   }, 5000);
  //   // audio.play();
  // } 
  // anchor.onTargetLost = () => {
  //   audio.pause();
  // } 

  await mindAR.start();

  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
}
startMindAR();

btnF.addEventListener("click", () => {
  console.log("Filters");
});
btnC.addEventListener("click", () => {
  console.log("Capture");
});
btnS.addEventListener("click", () => {
  console.log("Switch");
});
