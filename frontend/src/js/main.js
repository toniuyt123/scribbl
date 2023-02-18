import "../index.css";
import * as io from "./socket.js";
import "./elements";
import { config } from "./config";

window.onload = () => {
  //io.init();

  document.getElementById("invite-link-btn").onclick = () => {
    if (navigator.clipboard) {
      return navigator.clipboard.writeText(inviteLink);
    }

    inviteLinkInput.focus();
    inviteLinkInput.select();
    console.log("hhh");
    console.log(document.execCommand("copy"));
  };
};
