import cytoscape, { Stylesheet } from "cytoscape";
import { explore } from "../../lib/generation";

import { Controller } from "@hotwired/stimulus";
import { Composable, indicesToGenerator } from "../../lib/encoding";

const STYLE: Stylesheet[] = [
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
];

export default class extends Controller {
  static targets = ["container"];
  declare readonly containerTarget: HTMLDivElement;

  connect() {
    const bits = 2n;
    const balParLangGenerators = [
      indicesToGenerator([], [0b01n], bits),
      indicesToGenerator([0b01n], [0b10n, 0b01n], bits),
      indicesToGenerator([0b10n, 0b01n], [0b01n], bits),
      indicesToGenerator([0b01n], [], bits),
    ];
    const start: Composable[] = [indicesToGenerator([], [], bits)];
    const store = new Map<bigint, Set<bigint>>();
    explore(start, store, 6n, balParLangGenerators, bits);

    const cy = cytoscape({
      container: this.containerTarget,
      // elements: [{ data: { id: "a" } }, { data: { id: "b" } }],
      style: STYLE,
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
  }

  disconnect() {}
}
