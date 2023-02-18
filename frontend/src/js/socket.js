import { config } from "./config.js";

export const socket = io.connect(config.appUrl, { transports: ["websocket"] });

export function sendChatMessage(data) {
  socket.emit("msg", data);
}
