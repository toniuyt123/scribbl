import html from "../utils/htmlTemplate";
import BaseElement from "./BaseElement";
import "./player-badge";
import * as io from "../socket.js";
import { config } from "../config.js";
import { getCurrentRoom } from "./room";

export default class Leaderboard extends BaseElement {
  init() {
    fetch(`${config.appUrl}/users/${getCurrentRoom().getAttribute("id")}`)
      .then((r) => r.json())
      .then((players) => this.setPlayers(players));
  }

  setPlayers(players) {
    [...players]
      .sort((a, b) => b.points - a.points)
      .forEach((player, i, arr) => {
        if (i === 0) {
          player.rank = 1;
        } else if (arr[i - 1].points === player.points) {
          player.rank = arr[i - 1].rank;
        } else {
          player.rank = arr[i - 1].rank + 1;
        }
      });

    this.players = players;
    this.render();
  }

  render() {
    this.innerHTML = html`
      <div
        class="players-container flex h-[488px] flex-col gap-2 overflow-auto"
      >
        ${this.players.map(
          (player) => html`
            <player-badge
              username="${player.username}"
              points="${player.points}"
              rank="${player.rank}"
              isdrawing="${player.isDrawing}"
              isplayer="${player.socketId === io.socket.id}"
              hasguessed="${player.hasguessed}"
            ></player-badge>
          `
        )}
      </div>
    `;
  }

  async connectedCallback() {
    io.socket.on("joined", (data) => {
      this.setPlayers([
        ...this.players,
        {
          username: data.username,
          points: 0,
          isDrawing: false,
        },
      ]);
    });

    io.socket.on("leave", (data) => {
      this.setPlayers(
        this.players.filter((player) => player.username !== data.username)
      );
    });

    io.socket.on("guessed", (data) => {
      this.setPlayers(
        this.players.map((player) => ({
          ...player,
          hasguessed: player.username === data.username,
          points:
            player.username === data.username ? data.points : player.points,
        }))
      );
    });

    io.socket.on('turnUpdate', () => {
      this.setPlayers(
        this.players.map((player) => ({
          ...player,
          hasguessed: false,
        }))
      );
    });
  }
}

customElements.define("scribbl-leaderboard", Leaderboard);
