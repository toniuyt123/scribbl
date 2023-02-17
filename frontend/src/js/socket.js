const config = {
    url: 'http://localhost:3000/',
    emitDelay: 10,
};

export const socket = io.connect(config.url, { transports : ['websocket'] });

// function init() {
    
// }
const urlParams = new URLSearchParams(window.location.search);
export const roomId = urlParams.get('roomId');
export let roomInfo = {};

console.log(socket);
export function canDraw() {
    return roomInfo.users[roomInfo.drawingUser]?.socketId === socket.id;
}

socket.emit('join', { roomId }, async (res) => {
    roomInfo = await (await fetch(`http://localhost:3000/rooms/${roomId}`)).json();
    
    console.log(roomInfo);
    if (roomInfo.users[0].socketId === socket.id) {
        console.log('tttt');
        const startBtn = document.getElementById('room-start-btn');
        startBtn.style.display = 'block';

        startBtn.onclick = () => {
            socket.emit('startRoom', {});
            startBtn.style.display = 'none';
        };
    }
});

socket.on('turnUpdate', (data) => {
    roomInfo = data;
    console.log(roomInfo);
    updateFrontend();
});

let timerInterval;
function updateFrontend() {
    const canvas = document.getElementById('board');
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    document.querySelector('player-badge[isdrawing=true]')?.setAttribute('isdrawing', false);
    console.log(roomInfo.drawingUser, document.querySelectorAll('player-badge'), document.querySelectorAll('player-badge')[roomInfo.drawingUser]);
    document.querySelectorAll('player-badge')[roomInfo.drawingUser].setAttribute('isdrawing', true);

    clearInterval(timerInterval);
    const timer = document.getElementById('timer');
    timer.innerHTML = roomInfo.turnTime / 1000;

    timerInterval = setInterval(() => {
        const newTime = parseInt(timer.innerHTML) - 1;
        timer.innerHTML = newTime;

        if (newTime === 0) {
            console.log(clearInterval);
            clearInterval(timerInterval);
        }
    }, 1000);
}

export function sendChatMessage(data) {
    socket.emit('msg', data);
}
