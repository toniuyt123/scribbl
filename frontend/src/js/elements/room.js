import html from "../utils/htmlTemplate";
import BaseElement from "./BaseElement";
import "./player-badge";
import { socket } from "../socket";
import { config } from "../config.js";
import * as drawing from "../drawing.js";

export default class Room extends BaseElement {
  init({ id, username }) {
    this.innerHTML = html`
      <div class="flex flex-col gap-4">
        <div class="mb-4 text-center font-serif text-5xl">SKRIBBL</div>
        <div
          class="flex justify-between rounded-sm bg-gray-100/70 p-4 text-5xl tracking-tighter shadow-sm backdrop-blur"
        >
          <!-- <p class="text-lg tracking-tight text-left">Invite: <br><span id="invite-link"></span></p> -->
          <div class="text-xs">
            <p class="text-sm tracking-tight">Invite:</p>
            <input
              class="max-w-xs rounded-l border border-solid border-blue-500 py-1 px-2"
              type="text"
              id="invite-link"
              readonly
            />
            <button
              class="rounded-r border border-blue-700 bg-blue-500 py-1 px-2 font-bold text-white hover:bg-blue-700"
              id="invite-link-btn"
            >
              <i class="fa-solid fa-copy"></i>
            </button>
          </div>
          <div id="word-placeholder">Waiting for owner to start...</div>
          <p
            class="rounded-full border-2 border-black p-3 text-center text-2xl"
            id="timer"
          >
            *
          </p>
        </div>
        <div class="flex gap-4">
          <scribbl-leaderboard></scribbl-leaderboard>
          <div class="flex h-fit flex-col">
            <div
              class="relative z-20 h-[488px] w-[512px] rounded-sm bg-gray-100/70 shadow-2xl backdrop-blur"
            >
              <button
                class="mx-auto rounded bg-blue-500 py-2 px-4 text-2xl font-bold text-white hover:bg-blue-700"
                id="room-start-btn"
                hidden
              >
                START
              </button>
              <canvas id="board"> </canvas>
              <div
                id="drawing-tools"
                class="ml-5 flex hidden flex-row space-x-2"
              >
                <div
                  class="color-pick h-8 w-8 cursor-pointer rounded-full border-4 border-white bg-black drop-shadow-lg"
                  color-value="black"
                ></div>
                <div
                  class="color-pick h-8 w-8 cursor-pointer rounded-full border-4 border-white bg-green-500 drop-shadow-lg"
                  color-value="rgb(34 197 94)"
                ></div>
                <div
                  class="color-pick h-8 w-8 cursor-pointer rounded-full border-4 border-white bg-red-600 drop-shadow-lg"
                  color-value="rgb(220 38 38)"
                ></div>
                <div
                  class="color-pick h-8 w-8 cursor-pointer rounded-full border-4 border-white bg-yellow-300 drop-shadow-lg"
                  color-value="rgb(253 224 71)"
                ></div>
                <div
                  class="color-pick h-8 w-8 cursor-pointer rounded-full border-4 border-white bg-sky-500 drop-shadow-lg"
                  color-value="rgb(14 165 233)"
                ></div>
                <div
                  class="color-pick h-8 w-8 cursor-pointer rounded-full border-4 border-white bg-fuchsia-500 drop-shadow-lg"
                  color-value="rgb(217 70 239)"
                ></div>
                <div
                  class="color-pick h-8 w-8 cursor-pointer rounded-full border-4 border-white bg-white drop-shadow-lg"
                  color-value="white"
                ></div>
              </div>
            </div>
          </div>
          <scribbl-chat username=${username}></scribbl-chat>
        </div>
      </div>
    `;

    drawing.init(); // TODO move this to the drawing element

    const roomId = id;

    socket.emit("join", { roomId, username }, async (res) => {
      // roomId = res.roomId;
      this.roomInfo = await (
        await fetch(`${config.appUrl}/rooms/${roomId}`)
      ).json();

      console.log(this.roomInfo);
      if (this.roomInfo.users[0].socketId === socket.id) {
        console.log("tttt");
        const startBtn = document.getElementById("room-start-btn");
        startBtn.style.display = "block";

        startBtn.onclick = () => {
          socket.emit("startRoom", {});
          startBtn.style.display = "none";
        };
      }
    });

    socket.on("turnUpdate", (data) => {
      this.roomInfo = data;
      console.log(this.roomInfo);
      updateFrontend();
    });

    let timerInterval;
    const updateFrontend = () => {
      document.getElementById("chat-input").disabled = this.canDraw();
      document.getElementById("drawing-tools").style.display = this.canDraw()
        ? "flex"
        : "none";

      const canvas = document.getElementById("board");
      const context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.beginPath();

      this.querySelector("scribbl-leaderboard").setPlayers(this.roomInfo.users);

      const wordPlaceholder = document.getElementById("word-placeholder");
      //TODO: hide room on server
      wordPlaceholder.innerHTML = this.canDraw()
        ? this.roomInfo.word
        : this.roomInfo.word.replaceAll(/\w/g, "_ ");

      clearInterval(timerInterval);
      const timer = document.getElementById("timer");
      timer.innerHTML = this.roomInfo.turnTime / 1000;

      timerInterval = setInterval(() => {
        const newTime = parseInt(timer.innerHTML) - 1;
        timer.innerHTML = newTime;

        if (newTime === 0) {
          console.log(clearInterval);
          clearInterval(timerInterval);
        }
      }, 1000);
    };
  }

  canDraw() {
    return (
      this.roomInfo.users[this.roomInfo.drawingUser]?.socketId === socket.id
    );
  }
}

customElements.define("scribbl-room", Room);

export function getCurrentRoom() {
  return document.querySelector("scribbl-room");
}
