import { socket } from "../socket";
import html from "../utils/htmlTemplate";
import BaseElement from "./BaseElement";

export default class Room extends BaseElement {
  init() {
    this.render(new URLSearchParams(window.location.search).get("roomId"));
  }

  render(roomId) {
    if (roomId) {
      window.history.pushState({}, "", `?roomId=${roomId}`);
    }
    
    this.innerHTML = html`
      <div class="h-screen w-screen overflow-hidden">
        <div
          class="absolute h-full w-full bg-[url(https://img.freepik.com/free-photo/art-stuff-around-paper-sheet_23-2147895428.jpg?w=2000)] bg-cover bg-center contrast-75"
        ></div>
        <div class="relative flex h-full items-center justify-center">
          ${roomId
            ? html`<scribbl-room
                id="${roomId}"
                username="${this.username}"
              ></scribbl-room>`
            : html`<scribbl-landing></scribbl-landing>`}
        </div>
      </div>
    `;

    this.addEventListener("play", (e) => {
      this.username = e.detail.username;
      socket.emit(
        "getRandomPublicRoom",
        { username: this.username },
        async ({ roomId }) => {
          this.render(roomId);
        }
      );
    });

    this.addEventListener("create-room", (e) => {
      this.username = e.detail.username;
      socket.emit(
        "createPrivateRoom",
        { username: this.username },
        async ({ roomId }) => {
          this.render(roomId);
        }
      );
    });
  }
}

customElements.define("scribbl-app", Room);
