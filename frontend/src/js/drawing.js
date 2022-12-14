import '../index.css'

const config = {
    url: 'http://localhost:3000/',
    emitDelay: 10,
};

export function init() {
    const canvas = document.getElementById('board');
    const ctx = canvas.getContext('2d');
    const socket = io.connect(config.url, { transports : ['websocket'] });
    const id = Math.round(Date.now()*Math.random());
    let isDrawing = false;
    let prevX, prevY;

    canvas.width = canvas.parentNode.clientWidth;
    canvas.height = canvas.parentNode.clientHeight; 

    function toCanvasCoords(x, y) {
        const offsets = canvas.getBoundingClientRect();
        return [x-offsets.left, y-offsets.top];
    }
    
    function drawLine(from, to) {
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
    }

    const clients = {};
    socket.on('drawing', (data) => {
        let prevData = clients[data.id];

        if (prevData === undefined) {
            clients[data.id] = data;
            prevData = data;
        }

        if (data.drawing) {
            drawLine({ x: prevData.x, y: prevData.y }, { x: data.x, y: data.y });
        }
        clients[data.id] = data;
    });

    let lastEmit = Date.now();
    canvas.onmousedown = (e) => {
        isDrawing = true;
        [prevX, prevY] = toCanvasCoords(e.clientX, e.clientY);
        socket.emit('mousemove', { id, x: prevX, y: prevY, drawing: false });
    };

    canvas.addEventListener('mousemove', (e) => {
        if (isDrawing) {
            const [newX, newY] = toCanvasCoords(e.clientX, e.clientY);

            if (Date.now() - lastEmit > config.emitDelay) {
                socket.emit('mousemove', { id, x: newX, y: newY, drawing: true });
                lastEmit = Date.now();
            }

            drawLine({ x: prevX, y: prevY}, { x: newX, y: newY});
            prevX = newX;
            prevY = newY;
        }
    });

    canvas.addEventListener('mouseup', (e) => {
        isDrawing = false;
    });

    canvas.addEventListener('mouseleave', () =>{
        drawing = false;
    });
}
