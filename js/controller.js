import { pickCard } from "./game.js";

export function handler({ target }) {
  if (!target.classList.contains("card")) return;

  const handleIsBlocking =
    target.classList.contains("hiding") ||
    target.classList.contains("open") ||
    target.classList.contains("closing");

  if (handleIsBlocking) return;

  pickCard([...document.querySelectorAll(".card")].indexOf(target));
}
