import cytoscape from "cytoscape";
import "./index.css";
import { sigFromIdcs, Sig, explore } from "../lib/index";

const bits = 2n;
const balParLangGenerators = [
  sigFromIdcs([], [0b01n], bits),
  sigFromIdcs([0b01n], [0b10n, 0b01n], bits),
  sigFromIdcs([0b10n, 0b01n], [0b01n], bits),
  sigFromIdcs([0b01n], [], bits),
];
const start: Sig[] = [sigFromIdcs([], [], bits).cod];
const store = new Map<bigint, Set<bigint>>();
explore(start, store, 6n, balParLangGenerators, bits);

const cy = cytoscape({
  container: document.getElementById("app"),
  // elements: [{ data: { id: "a" } }, { data: { id: "b" } }],
  style: [
    {
      selector: "node",
      style: {
        "background-color": "goldenrod",
        width: "label",
        height: "label",
        "padding-top": "4",
        "padding-bottom": "4",
        "padding-left": "4",
        "padding-right": "4",
        shape: "round-rectangle",
      },
    },
    {
      selector: "node[label]",
      style: {
        label: "data(label)",
        color: "white",
        "font-size": "16",
        "text-halign": "center",
        "text-valign": "center",
      },
    },
    {
      selector: "edge",
      style: {
        "curve-style": "bezier",
        "target-arrow-shape": "triangle",
        width: 1.6,
      },
    },
    {
      selector: "edge[label]",
      style: {
        label: "data(label)",
        "font-size": "12",
        "text-background-color": "white",
        "text-background-opacity": 1,
        "text-background-padding": "2px",
        "text-events": "yes",
      },
    },
  ],
});

for (const k of store.keys()) {
  const data = { id: k.toString(36), label: k.toString(2) };
  cy.add({ data: data });
}

for (const [source, targets] of store.entries()) {
  for (const target of targets) {
    if (!store.has(target)) cy.add({ data: { id: target.toString(36) } });

    const data = {
      source: source.toString(36),
      target: target.toString(36),
      label: "01/0",
    };
    cy.add({ data });
  }
}

cy.layout({ name: "cose" }).run();

// import * as svgjs from "@svgdotjs/svg.js";
// import { drawDiagram } from "./draw";

// const w = 200;
// const h = 300;

// const svg = svgjs
//   .SVG()
//   .addTo("body")
//   .size(w * 2, h);

// drawDiagram(
//   [
//     // Sig, Dom, Cod, Cosig, Offset
//     [0, 1, 6, 6, 0],
//     [6, 2, 1, 5, 2],
//     [5, 2, 1, 4, 1],
//     [4, 2, 1, 3, 1],
//     [3, 2, 1, 2, 1],
//     [2, 2, 0, 0, 0],
//   ],
//   [0, w, 0, h],
//   svg
// );
