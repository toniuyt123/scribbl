import html from "../utils/htmlTemplate";
import BaseElement from "./BaseElement";
import "./player-badge";

export default class Landing extends BaseElement {
  init() {
    this.innerHTML = html`
      <div class="flex flex-col gap-4">
        <div class="mb-4 text-center font-serif text-5xl">SKRIBBL</div>
        <div
          class="flex w-96 flex-col gap-2 rounded-sm bg-gray-100/70 p-12 text-xl shadow-2xl backdrop-blur"
        >
          <input
            class="username-input text-md rounded-sm bg-gray-100/70 p-4 shadow-md backdrop-blur placeholder:text-gray-500 focus:outline-none"
            placeholder="Enter your name"
          />
          <button
            class="play-btn h-16 w-full rounded-sm bg-green-500 py-2 px-4 text-2xl font-bold text-white shadow-md hover:bg-green-600"
          >
            Play
          </button>
          <button
            class="create-room-btn h-12 rounded-sm bg-blue-500 py-2 px-4 text-xl font-bold text-white shadow-md hover:bg-blue-600"
          >
            Create private room
          </button>
        </div>
      </div>
    `;

    this.querySelector(".play-btn").addEventListener("click", () => {
      this.dispatchEvent(
        new CustomEvent("play", {
          bubbles: true,
          detail: { username: this.querySelector(".username-input").value },
        })
      );
    });

    this.querySelector(".create-room-btn").addEventListener("click", () => {
      this.dispatchEvent(
        new CustomEvent("create-room", {
          bubbles: true,
          detail: { username: this.querySelector(".username-input").value },
        })
      );
    });
  }
}

customElements.define("scribbl-landing", Landing);
