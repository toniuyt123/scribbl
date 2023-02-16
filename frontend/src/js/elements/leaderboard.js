import html from "../utils/htmlTemplate";
import BaseElement from "./BaseElement";
import "./player-badge";
import * as io from "../socket.js";

export default class Leaderboard extends BaseElement {
  init() {
    this.innerHTML = `
        <div class="players-container h-fit flex flex-col gap-2">
        </div>
    `;
  }

  makePlayerBadge(player) {
    return html`
      <player-badge
        username="${player.username}"
        points="${player.points}"
        rank="${player.rank}"
        isdrawing="${player.isDrawing}"
      ></player-badge>
    `;
  }

  async connectedCallback() {
    //TODO: remove hardcode
    console.log('test');
    const players = await (await fetch(`http://localhost:3000/users/${io.roomId}`)).json();
    console.log(players);

    this.querySelector(".players-container").innerHTML = html`
      ${players.map(
        (player) => this.makePlayerBadge(player)
      )}
    `;

    io.socket.on('joined', (data) => {
      this.querySelector(`.players-container`).innerHTML += (this.makePlayerBadge({
        username: data.username,
        points: 0,
        isDrawing: false,
        rank: 0 //TODO
      }));
    });

    io.socket.on('leave', (data) => {
      this.querySelector(`.players-container player-badge[username="${data.username}"]`).remove();
    });
  }
}

customElements.define("scribbl-leaderboard", Leaderboard);
