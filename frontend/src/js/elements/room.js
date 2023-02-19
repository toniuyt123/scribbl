import html from "../utils/htmlTemplate";
import BaseElement from "./BaseElement";
import "./player-badge";
import { socket } from "../socket";
import { config } from "../config.js";
import * as drawing from "../drawing.js";

export default class Room extends BaseElement {
  init({ id, username }) {
    const roomId = id;

    socket.emit(
      "join",
      { roomId, username },
      async (roomInfo, username, base64canvasData) => {
        console.log(username);
        this.base64canvasData = base64canvasData;
        this.roomInfo = roomInfo;
        this.inviteLink = `${config.inviteUrl}/?roomId=${this.roomInfo.roomId}`;
        this.props.username = username;
        this.render();
      }
    );

    socket.on("turnUpdate", (data) => {
      this.roomInfo = data;
      this.render();

      this.querySelector("scribbl-leaderboard").setPlayers(this.roomInfo.users);
      const canvas = document.getElementById("board");
      const context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.beginPath();

      //this.initTimerInterval();
    });

    socket.on("endRoom", (data) => {
      this.roomInfo = data;
      this.gameEnded = true;
      this.winners = [];

      this.roomInfo.users
        .sort((a, b) => b.points - a.points)
        .forEach((player, i, arr) => {
          if (i === 0) {
            this.winners.push(player);
          }
        });

      this.render();
    });
  }

  initTimerInterval() {
    clearInterval(this.timerInterval);
    const timer = document.getElementById("timer");
    timer.innerHTML = this.roomInfo.time;

    this.timerInterval = setInterval(() => {
      const newTime = parseInt(timer.innerHTML) - 1;
      timer.innerHTML = newTime;

      if (newTime === 0) {
        clearInterval(timerInterval);
      }
    }, 1000);
  }

  render() {
    this.innerHTML = html`
      <div class="flex flex-col gap-4">
        <div class="mb-4 text-center font-serif text-5xl">SKRIBBL</div>
        <div
          class="flex justify-between rounded-sm bg-gray-100/70 p-4 text-5xl tracking-tighter shadow-sm backdrop-blur"
        >
          <div class="text-xs">
            <p class="text-sm tracking-tight">Invite:</p>
            <input
              class="max-w-xs rounded-l border border-solid border-blue-500 py-1 px-2"
              type="text"
              id="invite-link"
              value="${this.inviteLink}"
              readonly
            />
            <button
              class="rounded-r border border-blue-700 bg-blue-500 py-1 px-2 font-bold text-white hover:bg-blue-700"
              id="invite-link-btn"
            >
              <i class="fa-solid fa-copy"></i>
            </button>
          </div>
          <!-- prettier-ignore -->
          <div id="word-placeholder">${this.roomInfo.word ||
          "Waiting for owner to start..."}</div>
          <p
            class="rounded-full border-2 border-black p-3 text-center text-2xl"
            id="timer"
          >
            ${this.roomInfo.time || "*"}
          </p>
        </div>
        <div class="flex gap-4">
          <scribbl-leaderboard></scribbl-leaderboard>
          <div class="flex h-fit flex-col">
            <div
              class="relative z-20 h-[488px] w-[512px] items-center rounded-sm bg-gray-100/70 shadow-2xl backdrop-blur"
            >
              ${this.roomInfo.users[0].socketId === socket.id &&
              !this.roomInfo.word &&
              html`
                <button
                  class="absolute inset-0 m-auto h-16 w-32 rounded bg-blue-500 py-2 px-4 text-2xl font-bold text-white hover:bg-blue-700"
                  id="room-start-btn"
                >
                  START
                </button>
              `}
              <canvas id="board"> </canvas>
              ${this.gameEnded &&
              html`
                <div
                  class="absolute top-0 h-full w-full space-y-2 bg-gray-500 py-40 text-center"
                >
                  <p class="text-xl">Game Ended. Winners:</p>
                  <div class="flex justify-center gap-4">
                    ${this.winners.map((player) => {
                      return html`
                        <div>
                          <p class="font-bold">
                            ${player.username}, ${player.points} points
                          </p>
                          <img
                            class="h-12 w-12 rounded-full object-cover ring-1 ring-gray-50"
                            src="https://api.dicebear.com/5.x/bottts-neutral/svg?seed=${player.socketid}&radius=50"
                          />
                        </div>
                      `;
                    })}
                  </div>
                </div>
              `}
              <div
                id="drawing-tools"
                class="${this.canDraw()
                  ? "flex"
                  : "hidden"} w-full flex-row justify-between"
              >
                <div class="flex flex-row gap-2 pl-4">
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
                <div class="flex flex-row gap-2 pr-4">
                  <div
                    class="size-pick relative h-8 w-8 cursor-pointer rounded-full bg-white drop-shadow-lg"
                    size-value="2"
                  >
                    <div
                      class="absolute inset-0 m-auto h-[3px] w-[3px] rounded-full bg-black drop-shadow-lg"
                    ></div>
                  </div>
                  <div
                    class="size-pick relative h-8 w-8 cursor-pointer rounded-full bg-white drop-shadow-lg"
                    size-value="10"
                  >
                    <div
                      class="absolute inset-0 m-auto h-[10px] w-[10px] rounded-full bg-black drop-shadow-lg"
                    ></div>
                  </div>
                  <div
                    class="size-pick relative h-8 w-8 cursor-pointer rounded-full bg-white drop-shadow-lg"
                    size-value="20"
                  >
                    <div
                      class="absolute inset-0 m-auto h-[20px] w-[20px] rounded-full bg-black drop-shadow-lg"
                    ></div>
                  </div>
                  <div
                    class="size-pick relative h-8 w-8 cursor-pointer rounded-full bg-white drop-shadow-lg"
                    size-value="30"
                  >
                    <div
                      class="absolute inset-0 m-auto h-[30px] w-[30px] rounded-full bg-black drop-shadow-lg"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <scribbl-chat
            username="${this.props.username}"
            canchat="${!this.canDraw()}"
          ></scribbl-chat>
        </div>
      </div>
    `;

    this.querySelector("#room-start-btn")?.addEventListener("click", () => {
      socket.emit("startRoom");
    });

    this.querySelector("#invite-link-btn").addEventListener("click", () => {
      if (navigator.clipboard) {
        return navigator.clipboard.writeText(this.inviteLink);
      }
      this.querySelector("#invite-link").focus();
      this.querySelector("#invite-link").select();
      document.execCommand("copy");
    });

    if (this.roomInfo.word) {
      this.initTimerInterval();
    }
    drawing.init(this.roomInfo, this.base64canvasData); // TODO move this to the drawing element
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
