import html from "../utils/htmlTemplate";
import BaseElement from "./BaseElement";

const messageTypes = ["joined", "left", "message", "drawing", "guessed"];

export default class Message extends BaseElement {
  init({ type, username, content }) {
    if (!messageTypes.includes(type)) {
      throw new Error(`Invalid message type: ${type}`);
    }

    this.innerHTML = html`
      <div
        class="text-md ${{
          joined: "text-blue-500",
          left: "text-red-500",
          message: "text-black",
          drawing: "text-yellow-500",
          guessed: "text-green-500",
        }[type]} rounded-sm bg-gray-100/70 p-2 shadow-sm backdrop-blur
        "
      >
        <span class="username font-semibold"
          >${username}${type == "message" && ":"}</span
        >
        <span class="content ${type == "message" || "font-semibold"}"
          >${{
            joined: "joined the game.",
            left: "left the game.",
            message: content,
            drawing: "is drawing.",
            guessed: "guessed the word!",
          }[type]}</span
        >
      </div>
    `;
  }
}
customElements.define("scribbl-message", Message);
