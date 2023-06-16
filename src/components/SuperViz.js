import { DEVELOPER_KEY } from '../../env.js';
import ThreeJs from './ThreeJs.js';

const SuperViz = (function () {
   // let ::
   let sdk = null;
   let plugin = null;
   // Consts ::
   const MY_PARTICIPANT_JOINED_SDK = 'my_participant_joined';

   const initSDK = async function (userId, roomid, name, userType) {
      sdk = await SuperVizSdk.init(DEVELOPER_KEY, {
         group: {
            id: '<GROUP-ID>',
            name: '<GROUP-NAME>',
         },
         participant: {
            id: userId,
            name: name,
            type: userType,
         },
         roomId: roomid,
         defaultAvatars: true,
         enableFollow: true,
         enableGoTo: true,
         enableGather: true,
         camsOff: false,
         layoutPosition: 'center',
         camerasPosition: 'right',
      });

      PubSub.subscribe(ThreeJs.THREEJS_LOADED, loadPluginSDK);

      sdk.subscribe(SuperVizSdk.MeetingEvent.MY_PARTICIPANT_JOINED, onMyParticipantJoined);
   };

   const onMyParticipantJoined = function (participant) {
      // publish that I've connected ::
      PubSub.publish(MY_PARTICIPANT_JOINED_SDK, { sdk: sdk, participant: participant });
   };

   const loadPluginSDK = async (e, payload) => {
      plugin = new window.ThreeJsPlugin(payload.scene, payload.camera, payload.camera);

      sdk.loadPlugin(plugin, {
         avatarConfig: {
            height: 0,
            scale: 1,
         },
         isAvatarsEnabled: true,
         isLaserEnabled: false,
         isMouseEnabled: true,
         isNameEnabled: true,
         renderLocalAvatar: false,
      });
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

export { SuperViz };
