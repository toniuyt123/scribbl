import html from "../utils/htmlTemplate";
import BaseElement from "./BaseElement";
import Message from "./message";

export class Chat extends BaseElement {
  init() {
    this.innerHTML = html`
      <div class="mask-image-fade relative flex h-[488px] w-80">
        <div class="absolute bottom-0 z-10 flex w-full flex-col gap-2">
          <div class="messages-container flex w-full flex-col gap-2"></div>
          <input
            class="text-md rounded-sm bg-gray-100/70 p-4 shadow-md backdrop-blur placeholder:text-gray-500 focus:outline-none"
            placeholder="Type your guess here..."
          />
        </div>
      </div>
    `;
  }

  addMessage(messageData) {
    this.querySelector(".messages-container").appendChild(
      new Message(messageData)
    );
  }

  connectedCallback() {
    this.querySelector("input").addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target.value) {
        const message = e.target.value;
        e.target.value = "";
        console.log("Message sent:", message);
        // TODO send message to server
        this.addMessage({
          username: "Player 2",
          content: message,
          type: "message",
        });
      }
    });

    // vmesto toq set interval callbacka trqq da e se podava na socket modula i toi da go vika pri chat event
    setInterval(() => {
      this.addMessage({
        username: "Player 1",
        content: Math.random(),
        type: ["message", "drawing", "guessed", "joined", "left"][
          Math.floor(Math.random() * 5)
        ],
      });
    }, 1000);
  }
}
customElements.define("scribbl-chat", Chat);
