import "./index.css";
import { greet } from "../lib";

const app = document.querySelector<HTMLDivElement>("#app");
if (app) app.innerHTML = greet("web");

import * as svgjs from "@svgdotjs/svg.js";

const w = 270;
const h = 60;

const svg = svgjs
  .SVG()
  .addTo("body")
  .size(w * 2, 10 * h);

const foo = function (
  n: number,
  ni: number,
  nd: number,
  nc: number,
  nf: number,
  no: number
) {
  for (let k = 0; k <= no - 1; k++) {
    const xi = (w / (2 * ni)) * (1 + 2 * k);
    const xf = (w / (2 * nf)) * (1 + 2 * k);
    svg
      .path(
        `M ${xi} ${0 + n * h} C ${xi} ${h / 2 + n * h}, ${xf} ${
          h / 2 + n * h
        }, ${xf} ${h + n * h}`
      )
      .stroke({ color: "coral", width: 4 })
      .fill("none");
  }

  for (let k = no + nd; k < ni; k++) {
    const xi = (w / (2 * ni)) * (1 + 2 * k);
    const xf = (w / (2 * nf)) * (1 + 2 * (k - nd + nc));
    svg
      .path(
        `M ${xi} ${0 + n * h} C ${xi} ${(1 * h) / 4 + n * h}, ${xf} ${
          (3 * h) / 4 + n * h
        }, ${xf} ${h + n * h}`
      )
      .stroke({ color: "coral", width: 4 })
      .fill("none");
  }

  for (let k = no; k <= no + nd - 1; k++) {
    const xi = (w / (2 * ni)) * (1 + 2 * k);
    svg
      .path(`M ${xi} ${0 + n * h} v ${h / 3}`)
      .stroke({ color: "coral", width: 4 })
      .fill("none");
  }

  for (let k = no; k <= no + nc - 1; k++) {
    const xi = (w / (2 * nf)) * (1 + 2 * k);
    svg
      .path(`M ${xi} ${(2 * h) / 3 + n * h} v ${h / 3}`)
      .stroke({ color: "coral", width: 4 })
      .fill("none");
  }

  svg
    .rect(Math.max(nd / (ni || 1), nc / (nf || 1)) * w, h / 3)
    .move((no * w) / ni, (1 * h) / 3 + n * h)
    .radius(10)
    .fill("teal");
};

// Idx, Sig, Dom, Cod, Cosig, Offset
foo(0, 0, 1, 6, 6, 0);
foo(1, 6, 2, 1, 5, 2);
foo(2, 5, 2, 1, 4, 1);
foo(3, 4, 2, 1, 3, 1);
foo(4, 3, 2, 1, 2, 1);
foo(5, 2, 2, 0, 0, 0);
