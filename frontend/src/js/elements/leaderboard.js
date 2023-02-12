import html from "../utils/htmlTemplate";
import BaseElement from "./BaseElement";
import "./player-badge";

export default class Leaderboard extends BaseElement {
  init() {
    this.innerHTML = `
        <div class="players-container h-fit flex flex-col gap-2">
        </div>
    `;
  }

  connectedCallback() {
    // fetch players from server
    const players = [
      {
        username: `&<>"'`,
        points: 5678,
        rank: 1,
        isDrawing: false,
      },
      {
        username: "Player 2",
        points: 1234,
        rank: 3,
        isDrawing: true,
      },
      {
        username: "Player 3",
        points: 3456,
        rank: 2,
        isDrawing: false,
      },
    ];

    this.querySelector(".players-container").innerHTML = html`
      ${players.map(
        (player) => html`
          <player-badge
            username="${player.username}"
            points="${player.points}"
            rank="${player.rank}"
            isdrawing="${player.isDrawing}"
          ></player-badge>
        `
      )}
    `;
  }
}

customElements.define("scribbl-leaderboard", Leaderboard);
