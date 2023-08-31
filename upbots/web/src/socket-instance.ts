import io from "socket.io-client";

export default io(process.env.VUE_APP_ROOT_API as string, {
  autoConnect: false,
  reconnectionAttempts: 40, //default infinity
  reconnectionDelay: 4000,
  //   transportOptions: { // jwt is transmitted by the notificationStore action
  //     polling: {
  //       extraHeaders: {
  //         Authorization: "Bearer abc",
  //       },
  //     },
  //   },
});
