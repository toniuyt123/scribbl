import "../index.css";
import { socket, canDraw } from "./socket.js";
import { config } from "./config.js";
import { getCurrentRoom } from "./elements/room";

export function init(roomInfo, base64canvasData) {
  console.log("init called");
  const canvas = document.getElementById("board");
  const ctx = canvas.getContext("2d");

  console.log(base64canvasData);
  const img = new Image();
  img.onload = function () {
    ctx.drawImage(img, 0, 0);
  };
  img.src = base64canvasData;

  const id = Math.round(Date.now() * Math.random());
  let isDrawing = false;
  let prevX, prevY;
  let drawColor = "Black";
  let drawSize = 2;

  canvas.width = canvas.parentNode.clientWidth;
  canvas.height = canvas.parentNode.clientHeight;

  function toCanvasCoords(x, y) {
    const offsets = canvas.getBoundingClientRect();
    return [x - offsets.left, y - offsets.top];
  }

  function drawLine(from, to) {
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.lineCap = "round";
    ctx.lineWidth = to.drawSize || drawSize;
    ctx.strokeStyle = to.drawColor || drawColor;
    ctx.stroke();
  }

  const clients = {};

  function drawData(data) {
    let prevData = clients[data.id];

    if (prevData === undefined) {
      clients[data.id] = data;
      prevData = data;
    }

    if (prevData.drawColor != data.drawColor) {
      ctx.beginPath();
    }

    if (prevData.drawSize != data.drawSize) {
      ctx.beginPath();
    }

    if (data.drawing) {
      drawLine(prevData, data);
    }
    clients[data.id] = data;
  }

  socket.on("drawing", drawData);

  let lastEmit = Date.now();
  canvas.onmousedown = (e) => {
    if (!getCurrentRoom().canDraw()) {
      return;
    }

    isDrawing = true;
    [prevX, prevY] = toCanvasCoords(e.clientX, e.clientY);
    socket.emit("mousemove", {
      id,
      x: prevX,
      y: prevY,
      drawColor: drawColor,
      drawSize: drawSize,
      drawing: false,
    });
  };

  canvas.addEventListener("mousemove", (e) => {
    if (isDrawing && getCurrentRoom().canDraw()) {
      const [newX, newY] = toCanvasCoords(e.clientX, e.clientY);

      if (Date.now() - lastEmit > config.emitDelay) {
        socket.emit("mousemove", {
          id,
          x: newX,
          y: newY,
          drawColor: drawColor,
          drawSize: drawSize,
          drawing: true,
        });
        lastEmit = Date.now();
      }

      drawLine({ x: prevX, y: prevY }, { x: newX, y: newY });
      prevX = newX;
      prevY = newY;
    }
  });

  canvas.addEventListener("mouseup", (e) => {
    if (!getCurrentRoom().canDraw()) {
      return;
    }

    isDrawing = false;
  });

  canvas.addEventListener("mouseleave", () => {
    if (!getCurrentRoom().canDraw()) {
      return;
    }

    isDrawing = false;
  });

  document.querySelectorAll(".color-pick").forEach((el) => {
    console.log("pick");
    el.onclick = () => {
      console.log(el.getAttribute("color-value"));
      drawColor = el.getAttribute("color-value");
      ctx.beginPath();
    };
  });

  document.querySelectorAll(".size-pick").forEach((el) => {
    el.onclick = () => {
      console.log(el.getAttribute("size-value"));
      drawSize = el.getAttribute("size-value");
      ctx.beginPath();
    };
  });
}
