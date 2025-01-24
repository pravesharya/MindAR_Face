import * as THREE from "three";
// import { GLTFLoader } from "GLTFLoader";
import { MindARThree } from "mindAR";

let width = window.innerWidth;
let height = window.innerHeight;

// const canvas = document.querySelector("#canvas");
const btnF = document.querySelector("#F");
const btnC = document.querySelector("#C");
const btnS = document.querySelector("#S");
const filters = document.querySelector("#filters");
const btnF1 = document.querySelector("#f1");
const btnF2 = document.querySelector("#f2");
const btnF3 = document.querySelector("#f3");
const btnF4 = document.querySelector("#f4");
const formDiv = document.querySelector("#formDiv");

// const loaderGltf = new GLTFLoader();
// const modelPath = "./assets/eye01.glb";
// const occluderPath = "./assets/head_occluder_01.glb";

// const loaderAudio = new THREE.AudioLoader();
// const audioPath = "./assets/meow.mp3";

let maskPath, filtersVisible, count;
filtersVisible = false;
count = 1;

const textureLoader = new THREE.TextureLoader();
let model, occluder, mindAR, faceMesh, maskTexture, screenCapture;

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

  maskPath = `./assets/myMask${count}.png`;
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
  if (filtersVisible) {
    filters.style.top = "-100vh";
  } else {
    filters.style.top = "10vh";
  }
  filtersVisible ? (filtersVisible = false) : (filtersVisible = true);
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

btnF1.addEventListener("click", () => {
  updateFilter(1);
});
btnF2.addEventListener("click", () => {
  updateFilter(2);
});
btnF3.addEventListener("click", () => {
  updateFilter(3);
});
btnF4.addEventListener("click", () => {
  updateFilter(4);
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
  screenCapture = canvasB.toDataURL("image/png");
  link.download = "capture.png";
  link.click();
}

function shareCapture() {
  if (navigator.share) {
    navigator
      .share({
        title: "Screen Capture",
        text: "Check out this screen capture!",
        files: [
          new File([screenCapture], "capture.png", { type: "image/png" }),
        ],
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

function updateFilter(filter) {
  switch (filter) {
    case 1:
      count = 1;
      resetMask(count);
      break;
    case 2:
      count = 1;
      resetMask(count);
      break;
    case 3:
      checkPin(6969, 3);
      break;
    case 4:
      checkPin(6969, 4);
      break;
    default:
      count = 1;
  }
}

function resetMask(count) {
  maskPath = `./assets/myMask${count}.png`;
  maskTexture = textureLoader.load(maskPath);
  faceMesh.material.map = maskTexture;
}

function checkPin(pin, count) {
  const form = document.createElement("form");
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

  form.appendChild(input);
  form.appendChild(submit);
  formDiv.appendChild(form);
  formDiv.style.display = "block";
  // document.body.appendChild(form);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const userInput = input.value;
    if (userInput == pin) {
      console.log("Correct Pin");
      formDiv.removeChild(form);
      formDiv.style.display = "none";
      resetMask(count);
    } else {
      alert("Incorrect Pin ! Try again...");
      input.value = "";
    }
  });
}
