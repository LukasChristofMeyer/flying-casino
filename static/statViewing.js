import { LocalPlayerData } from "./player-api.js";

const statHover = document.getElementById("statHover");
const popup = document.getElementbyId("popup");

function showStats () {
    popup.innerHTML = "Name: " + LocalPlayerData.getName() + "<br>" + "Number of Wins: " + LocalPlayerData.getWins() + "<br>" + "Total Chips: " + LocalPlayerData.getChips();
    popup.style.visibility = 'visible';
}

statHover.addEventListener("mouseover", showStats())
statHover.addEventListener("mouseout", () =>{
    popup.style.visibility = 'hidden';
} )
