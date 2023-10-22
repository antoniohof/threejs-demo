import ThreeJs from './ThreeJs.js';
const DEVELOPER_KEY = 'SUPERVIZ_KEY';
import { CommentsComponent } from '../../../sdk/dist/components/index.js';

import SuperViz, {
  MeetingEvent,
  DeviceEvent,
  MeetingState,
  MeetingConnectionStatus,
} from '../../../sdk/dist/index.js';
import { CommentsAdapter, ThreeJsComponent } from '../../../threejs-plugin/dist/index.js';

const SuperVizSDK = (function () {
  // let ::
  let sdk = null;
  let plugin = null;
  // Consts ::
  const MY_PARTICIPANT_JOINED_SDK = 'my_participant_joined';

  const initSDK = async function (userId, roomid, name, userType) {
    sdk = await SuperViz(DEVELOPER_KEY, {
      group: {
        id: '<GROUP-ID>',
        name: '<GROUP-NAME>',
      },
      participant: {
        id: userId,
        name: name,
        type: 'host',
      },
      roomId: roomid,
      camsOff: true,
      layoutPosition: 'center',
      camerasPosition: 'right',
      debug: true,
      environment: 'local',
    });

    PubSub.subscribe(ThreeJs.THREEJS_LOADED, loadPluginSDK);

    sdk.subscribe(SuperVizSdk.MeetingEvent.MY_PARTICIPANT_JOINED, onMyParticipantJoined);
  };

  const onMyParticipantJoined = function (participant) {
    // publish that I've connected ::
    PubSub.publish(MY_PARTICIPANT_JOINED_SDK, { sdk: sdk });
  };

  const loadPluginSDK = async (e, payload) => {
    console.log('load!', payload);
    const threeComponent = new ThreeJsComponent(payload.scene, payload.camera, payload.camera);
    console.log('sdk', sdk);
    sdk.addComponent(threeComponent);

    const pinAdapter = new CommentsAdapter(payload.scene, payload.renderer, payload.camera);

    const comments = new CommentsComponent(pinAdapter);
    sdk.addComponent(comments);
  };

  const unloadPluginSDK = function () {
    sdk.unloadPlugin();
  };

  // Public
  return {
    init: (userId, roomid, name, userType) => initSDK(userId, roomid, name, userType),
    MY_PARTICIPANT_JOINED: MY_PARTICIPANT_JOINED_SDK,
  };
})();

export { SuperVizSDK };
