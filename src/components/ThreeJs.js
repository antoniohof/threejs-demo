import { SuperViz } from './SuperViz.js';
import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
export const THREEJS_LOADED = 'threejs_loaded';

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

let scene;
let camera;
let controls;
let renderer;

class ThreeJs {
   constructor() {
      this.contentSection = document.getElementById('content-section');

      PubSub.subscribe(SuperViz.MY_PARTICIPANT_JOINED, this.onMyParticipantJoined.bind(this));
   }

   onMyParticipantJoined(e, payload) {
      this.loadModel();
   }

   loadModel() {
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.outputEncoding = THREE.sRGBEncoding;
      this.contentSection.appendChild(renderer.domElement);

      const pmremGenerator = new THREE.PMREMGenerator(renderer);

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xb6b7b8);
      scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

      camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 300);
      camera.position.set(2, 0, 2);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 0.5, 0);
      controls.update();
      controls.enablePan = false;
      controls.enableDamping = true;
      const loader = new GLTFLoader();
      loader.load('./../../models/Superviz.glb', this.onModelLoaded.bind(this), undefined, function (e) {
         console.error(e);
      });
   }

   animate(e) {
      requestAnimationFrame(this.animate.bind(this));
      controls.update();
      renderer.render(scene, camera);
   }

   async onModelLoaded(e) {
      const model = e.scene;
      scene.add(model);
      scene.traverse(function (obj) {
         if (obj.type === 'Mesh') {
            obj.geometry.computeBoundsTree();
         }
      });
      this.animate();

      PubSub.publish(THREEJS_LOADED, { scene: scene, camera: camera });
   }

   static get THREEJS_LOADED() {
      return THREEJS_LOADED;
   }
}
export default ThreeJs;
