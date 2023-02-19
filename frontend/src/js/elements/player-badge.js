import html from "../utils/htmlTemplate";
import BaseElement from "./BaseElement";

export default class PlayerBadge extends BaseElement {
  init({ username, points, rank, isdrawing, isplayer, hasguessed }) {
    this.innerHTML = html`
      <div
        class="${isdrawing == "true" &&
        "flex-row-reverse"} flex w-80 items-center justify-between gap-4 rounded-sm bg-gray-100/70 p-4 shadow-sm backdrop-blur ${hasguessed && 'text-green-400'}"
      >
        <div class="relative">
          <img
            class="h-12 w-12 rounded-full object-cover ring-1 ring-gray-50"
            src="https://api.dicebear.com/5.x/bottts-neutral/svg?seed=${username}&radius=50"
          />
          ${isdrawing == "true" &&
          html`
            <div class="absolute -right-3 -bottom-3 animate-wiggle text-2xl">
              <img
                class="h-10 w-10 object-contain"
                src="https://cdn-icons-png.flaticon.com/512/1170/1170177.png"
              />
            </div>
          `}
        </div>
        <div class="flex flex-col items-center ">
          <div class="${isplayer && "text-blue-500"} text-xl font-semibold">
            ${username} ${isplayer && "(You)"}
          </div>
          <div class="text-md">Points: ${points}</div>
        </div>
        <div class="w-12 text-2xl font-bold">#${rank}</div>
      </div>
    `;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.init(this.getAttributesProps());
  }

  static get observedAttributes() {
    return ["isdrawing", "points"];
  }
}

customElements.define("player-badge", PlayerBadge);
