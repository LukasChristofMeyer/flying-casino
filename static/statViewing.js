import { retrievePlayerData } from "./player-api.js";

const statHover = document.getElementById("statHover");
const popup = document.getElementById("popup");
console.log(statHover);

function showStats () {
    popup.innerHTML = "Name: " + retrievePlayerData().getName() + "<br>" + "Number of Wins: " + retrievePlayerData().getWins() + "<br>" + "Total Chips: " + retrievePlayerData().getChips();
    popup.style.visibility = 'visible';
    console.log("hovering");
}

statHover.addEventListener("mouseover", showStats());
