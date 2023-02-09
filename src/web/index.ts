import "./index.css";
import * as svgjs from "@svgdotjs/svg.js";
import { drawDiagram } from "./draw";

const w = 200;
const h = 300;

const svg = svgjs
  .SVG()
  .addTo("body")
  .size(w * 2, h);

drawDiagram(
  [
    // Sig, Dom, Cod, Cosig, Offset
    [0, 1, 6, 6, 0],
    [6, 2, 1, 5, 2],
    [5, 2, 1, 4, 1],
    [4, 2, 1, 3, 1],
    [3, 2, 1, 2, 1],
    [2, 2, 0, 0, 0],
  ],
  [0, w, 0, h],
  svg
);
