import { config } from "./config.js";
import * as io from 'socket.io-client';


export const socket = io.connect(config.appUrl, { transports: ["websocket"] });

export function sendChatMessage(data) {
  socket.emit("msg", data);
}
