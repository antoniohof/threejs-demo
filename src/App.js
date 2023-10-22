import { THREEJS_LOADED } from './components/ThreeJs.js';
import { SuperVizSDK } from './components/SuperViz.js';

const url = new URL(document.URL);
let userType = url.searchParams.get('user-type');
let roomId = url.searchParams.get('roomId');
let userId = Date.now().toPrecision(20);

class App {
  constructor() {
    this.contentSection = document.getElementById('content-section');
    this.loaderSection = document.getElementById('loader-section');
  }

  init() {
    // check userType ::
    if (userType == null) userType = 'host';

    // Initilize the SDK ::
    SuperVizSDK.init(userId, roomId === null ? '202' : roomId, '', userType);

    // Pubsub - listen for event: When I joined ::
    PubSub.subscribe(SuperVizSDK.MY_PARTICIPANT_JOINED, this.onMyParticipantJoined.bind(this));
    this.loaderSection.classList.add('hide');
    this.contentSection.classList.remove('hide');
  }

  onMyParticipantJoined(e, payload) {
    // show content ::
    this.loaderSection.classList.add('hide');
    this.contentSection.classList.remove('hide');
  }
}
export default App;
