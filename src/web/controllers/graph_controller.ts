import cytoscape, { Stylesheet } from "cytoscape";

import { Controller } from "@hotwired/stimulus";
import { Composable, HumanGrammar, MachineGrammar } from "../../lib/encoding";

const STYLE: Stylesheet[] = [
  {
    selector: "node",
    style: {
      // width: "label",
      // height: "label",
      // "padding-top": "2",
      // "padding-bottom": "2",
      // "padding-left": "4",
      // "padding-right": "4",
      "background-color": "darkgray",
      width: "1em",
      height: "1em",
      shape: "ellipse",
      "border-color": "white",
      "border-width": ".4em",
    },
  },
  // {
  //   selector: "node[label]",
  //   style: {
  //     label: "data(label)",
  //     // color: "black",
  //     "font-size": "1em",
  //     "text-halign": "center",
  //     "text-valign": "center",
  //   },
  // },
  {
    selector: "edge",
    style: {
      "curve-style": "bezier",
      "target-arrow-shape": "triangle",
      "target-arrow-color": "black",
      width: 1,
    },
  },
  {
    selector: "edge[label]",
    style: {
      label: "data(label)",
      "font-size": "1em",
      "font-family": "Linux Libertine O",
      "text-background-color": "white",
      "text-background-opacity": 1,
      "text-background-padding": "2px",
      "text-events": "yes",
      "line-color": "black",
      shape: "round-tag",
    },
  },
];

export default class extends Controller {
  static targets = ["container"];
  declare readonly containerTarget: HTMLDivElement;

  cy!: cytoscape.Core;

  connect() {
    this.cy = cytoscape({
      container: this.containerTarget,
      style: STYLE,
    });
  }

  disconnect() {}

  ingestGraph({
    detail: { graph, humanGrammar, machineGrammar },
  }: CustomEvent<{
    graph: Map<bigint, Map<bigint, [bigint, symbol, Composable][]>>;
    humanGrammar: HumanGrammar;
    machineGrammar: MachineGrammar;
  }>) {
    this.cy.remove(this.cy.elements());

    for (const k of graph.keys()) {
      const data = {
        id: k.toString(36),
        label: null, // "●", // k.toString(2),
      };
      this.cy.add({ data });
    }

    for (const [source, targets] of graph.entries()) {
      for (const [target, complist] of targets) {
        for (const [off, s, dee] of complist) {
          // NOTE: we need to check cy here, not the graph store
          if (!this.cy.hasElementWithId(target.toString(36))) {
            const data = {
              id: target.toString(36),
              label: null,
            };
            this.cy.add({ data });
          }

          const sup = off
            .toString()
            .split("")
            .map((d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[parseInt(d)]);

          const sub = (
            dee.coarity -
            off -
            machineGrammar.generators.get(s)!.coarity
          )
            .toString()
            .split("")
            .map((d) => "₀₁₂₃₄₅₆₇₈₉"[parseInt(d)]);

          // TODO: interleave sub/sup when they're more than a character long

          const data = {
            source: source.toString(36),
            target: target.toString(36),
            label: `${Symbol.keyFor(s)}${sub}${sup}`,
          };
          this.cy.add({ data });
        }
      }
    }

    this.cy.layout({ name: "cose", numIter: 10000 }).run();
  }
}
