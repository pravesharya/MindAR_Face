import * as THREE from "three";
import { GLTFLoader } from "GLTFLoader";
import { MindARThree } from "mindAR";

let width = window.innerWidth;
let height = window.innerHeight;

// const canvas = document.querySelector("#canvas");
const btnF = document.querySelector("#F");
const btnC = document.querySelector("#C");
const btnS = document.querySelector("#S");
const filters = document.querySelector("#filters");
const btnF0 = document.querySelector("#f0");
const btnF1 = document.querySelector("#f1");
const btnF2 = document.querySelector("#f2");
const btnF3 = document.querySelector("#f3");
const btnF4 = document.querySelector("#f4");
const formDiv = document.querySelector("#formDiv");

const gltfLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();

const modelPath = "./assets/eye0.glb";
const occluderPath = "./assets/head_occluder.glb";

let filtersVisible, form, formExist, is3D, screenShot;
filtersVisible = formExist = false;
is3D = true;

let mindAR, renderer, camera, scene;
let occluder, occluderAnchor, model, modelAnchor;
let faceMesh, maskPath, maskTexture, count;
count = 1;

async function startMindAR() {
  mindAR = new MindARThree({
    container: document.body,
  });

  ({ renderer, camera, scene } = mindAR);
  renderer.setSize(width, height);

  const light = new THREE.HemisphereLight(0xffffff, 10);
  scene.add(light);

  modelAnchor = mindAR.addAnchor(168); // 3D model anchor
  faceMesh = mindAR.addFaceMesh(); // 2D mask

  setOcculuder();
  setMask3D();

  await mindAR.start();

  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
}
startMindAR();

btnF.addEventListener("click", () => {
  console.log("Filters");
  if (filtersVisible) {
    filters.style.top = "-100vh";
    if(formExist){
      formDiv.removeChild(form);
      formDiv.style.display = "none";
      formExist = false;
    } 
  } else {
    filters.style.top = "10vh";
  }
  filtersVisible = !filtersVisible;
});

btnC.addEventListener("click", () => {
  console.log("Capture");
  capture();
  shareCapture();
});

btnS.addEventListener("click", () => {
  console.log("Switch Camera");
  mindAR.switchCamera();
});

btnF0.addEventListener("click", () => {
  resetFilter2D();
  setMask3D();
});
btnF1.addEventListener("click", () => {
  if(is3D) resetFilter3D();
  setMask2D(1);
});
btnF2.addEventListener("click", () => {
  if(is3D) resetFilter3D();
  setMask2D(1);
});
btnF3.addEventListener("click", () => {
  if(is3D) resetFilter3D();
  if (formExist) {
    formDiv.removeChild(form);
    formDiv.style.display = "none";
    formExist = false;
  }
  checkPin(6969, 3);
});
btnF4.addEventListener("click", () => {
  if(is3D) resetFilter3D();
  if (formExist) {
    formDiv.removeChild(form);
    formDiv.style.display = "none";
    formExist = false;
  }
  checkPin(6969, 4);
});

function capture() {
  const { renderer, video, scene, camera } = mindAR;

  const canvasA = renderer.domElement;
  const canvasB = document.createElement("canvas");
  const context = canvasB.getContext("2d");

  console.log(canvasA, video);
  canvasB.width = canvasA.width;
  canvasB.height = canvasA.height;

  let aX, aY, aW, aH;
  aX = aY = aW = aH = 0;

  aX =
    ((video.clientWidth - canvasA.clientWidth) / 2) *
    (video.videoWidth / video.clientWidth);
  aY =
    ((video.clientHeight - canvasA.clientHeight) / 2) *
    (video.videoHeight / video.clientHeight);
  aW = video.videoWidth - aX * 2;
  aH = video.videoHeight - aY * 2;

  context.drawImage(video, aX, aY, aW, aH, 0, 0, canvasB.width, canvasB.height);
  renderer.preserveDrawingBuffer = true;
  renderer.render(scene, camera);
  context.drawImage(canvasA, 0, 0, canvasA.width, canvasA.height);
  renderer.preserveDrawingBuffer = false;

  const link = document.createElement("a");
  link.href = canvasB.toDataURL("image/png");
  screenShot = canvasB.toDataURL("image/png");
  link.download = "capture.png";
  link.click();
}

function shareCapture() {
  if (navigator.share) {
    navigator
      .share({
        title: "Screen Capture",
        text: "Check out this screen capture!",
        files: [new File([screenShot], "capture.png", { type: "image/png" })],
      })
      .then(() => {
        console.log("Share successful");
      })
      .catch((error) => {
        console.error("Error sharing:", error);
      });
  } else {
    console.error("Web Share API not supported in this browser.");
  }
}

async function setOcculuder() {
  const occluderGLTF = await new Promise((resolve) => {
    gltfLoader.load(occluderPath, (gltf) => {
      resolve(gltf);
    });
  });
  occluder = occluderGLTF.scene;
  const occluderMat = new THREE.MeshStandardMaterial({
    colorWrite: false,
  });
  occluder.traverse((child) => {
    if (child.isMesh) {
      child.material = occluderMat;
    }
  });
  occluderAnchor = mindAR.addAnchor(168);
  occluderAnchor.group.add(occluder);
  let size = 0.125;
  occluder.scale.set(size, size, size);
  occluder.position.set(0, -0.5, 0);
}

function resetFilter2D() {
  scene.remove(faceMesh);
  is3D = true;
  console.log("2D removed");
}

function resetFilter3D() {
  modelAnchor.group.remove(model);
  is3D = false;
  console.log("3D removed");
}

function setMask2D(count) {
  maskPath = `./assets/myMask${count}.png`;
  maskTexture = textureLoader.load(maskPath);
  faceMesh.material.map = maskTexture;
  faceMesh.material.transparent = true;
  faceMesh.material.needsUpdate = true;
  scene.add(faceMesh);
  is3D = false;
}

async function setMask3D() {
  const modelGLTF = await new Promise((resolve) => {
    gltfLoader.load(modelPath, (gltf) => {
      resolve(gltf);
    });
  });
  model = modelGLTF.scene;
  // modelAnchor = mindAR.addAnchor(168);
  modelAnchor.group.add(model);
  let size = 0.125;
  model.scale.set(size, size, size);
  model.position.set(0, -0.05, -0.25);
  is3D = true;
}

function checkPin(pin, count) {
  formExist = true;
  form = document.createElement("form");
  form.style.display = "flex";
  form.style.flexDirection = "column";
  const input = document.createElement("input");
  input.type = "text";
  input.maxLength = 4;
  input.pattern = "\\d{4}";
  input.placeholder = "Enter 4 digit code";
  const submit = document.createElement("button");
  submit.type = "submit";
  submit.textContent = "Submit";
  const close = document.createElement("button");
  close.textContent = "[X]";

  form.appendChild(input);
  form.appendChild(submit);
  form.appendChild(close);
  formDiv.appendChild(form);
  formDiv.style.display = "block";

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const userInput = input.value;
    if (userInput == pin) {
      console.log("Correct Pin");
      formDiv.removeChild(form);
      formDiv.style.display = "none";
      formExist = false;
      setMask2D(count);
    } else {
      alert("Incorrect Pin ! Try again...");
      input.value = "";
    }
  });

  close.addEventListener("click", () => {
    formDiv.removeChild(form);
    formDiv.style.display = "none";
    formExist = false;
  });
}
