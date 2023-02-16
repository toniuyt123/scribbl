const config = {
    url: 'http://localhost:3000/',
    emitDelay: 10,
};

export const socket = io.connect(config.url, { transports : ['websocket'] });

// function init() {
    
// }
const urlParams = new URLSearchParams(window.location.search);
export const roomId = urlParams.get('roomId');
socket.emit('join', { room: roomId });

export function sendChatMessage(data) {
    socket.emit('msg', data);
}
