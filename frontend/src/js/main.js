import "../index.css";
import * as drawing from "./drawing.js";
import * as io from "./socket.js";
import "./elements";
import { config } from "./config";

window.onload = () => {
  //io.init();
  drawing.init();

  const inviteLink = `${config.inviteUrl}/?roomId=${io.roomId}`;
  const inviteLinkInput = document.getElementById('invite-link');
  inviteLinkInput.value = inviteLink;

  document.getElementById('invite-link-btn').onclick = () => {
    if (navigator.clipboard) {
      return navigator.clipboard.writeText(inviteLink);
    }

    inviteLinkInput.focus();
    inviteLinkInput.select();
    console.log('hhh')
    console.log(document.execCommand('copy'));
  };
};
