import { Controller } from "@hotwired/stimulus";

import * as joint from "jointjs";

const NAMESPACE = {
  ...joint.shapes,
  custom: {
    Model: joint.shapes.devs.Model.define(
      "custom.Model",
      {
        size: {
          width: 40,
          height: 40,
        },
        attrs: {
          ".": {
            magnet: false,
          },
          ".label": {
            text: "?",
            "font-family": "Linux Libertine O",
            "ref-x": 20,
            "ref-y": 20,
            "font-size": 20,
            // "text-anchor": "middle",
            // "dominant-baseline": "central",
            y: "0.3em",
            // fill: "red",
          },
          ".body": {
            "ref-width": "100%",
            "ref-height": "100%",
            stroke: "#000",
          },
        },
        ports: {
          groups: {
            in: {
              attrs: {
                ".port-label": { hidden: "true", "font-size": "xx-small" },
                ".port-body": { fill: "black", stroke: "#000", r: 2 },
              },
              label: { position: { name: "center", args: { y: 0 } } },
            },
            out: {
              attrs: {
                ".port-label": { hidden: "true", "font-size": "xx-small" },
                ".port-body": { fill: "black", stroke: "#000", r: 2 },
              },
              label: { position: { name: "center", args: { y: 0 } } },
            },
          },
        },
      },
      {},
      {
        size: {
          width: 20,
          height: 20,
        },
      }
    ),
    Link: joint.dia.Link.define(
      "custom.Link",
      {
        attrs: {
          line: {
            connection: true,
            stroke: "black",
            strokeWidth: 2,
          },
        },
      },
      {
        markup: [
          {
            tagName: "path",
            selector: "line",
            attributes: {
              fill: "none",
            },
          },
        ],
      }
    ),
  },
};

import PaperNavigator from "../components/paper_navigator";
import {
  Composable,
  HumanGrammar,
  MachineGrammar,
  Signature,
} from "../../lib/encoding";

export default class extends Controller {
  static targets = ["container"];
  declare readonly containerTarget: HTMLDivElement;

  graph!: joint.dia.Graph;
  paper!: joint.dia.Paper;

  connect() {
    this.graph = new joint.dia.Graph({}, { cellNamespace: NAMESPACE });

    this.paper = new joint.dia.Paper({
      el: this.containerTarget,
      width: "100%",
      height: "100%",
      model: this.graph,
      background: {
        color: "rgba(240, 255, 250, 0.5)",
      },
      cellViewNamespace: NAMESPACE,
      // gridSize: 10,
      drawGrid: true,
      interactive: {
        // links
        linkMove: false,
        labelMove: false,
        arrowheadMove: false,
        useLinkTools: false,
        // elements
        elementMove: true,
        addLinkFromMagnet: false,
      },
      defaultConnector: {
        name: "jumpover",
        args: {
          jump: "gap",
        },
      },
      defaultRouter: {
        name: "metro",
        args: {
          step: 1,
          padding: 0,
          startDirections: ["right"],
          endDirections: ["left"],
          maxAllowedDirectionChange: 45,
          maximumLoops: 4,
        },
      },
    });

    new PaperNavigator(this.paper);

    new ResizeObserver(joint.util.debounce(this.refocus.bind(this))).observe(
      this.containerTarget
    );
  }

  disconnect() {
    //
  }

  ingestDiagram({
    detail: { diagram, humanGrammar, machineGrammar },
  }: CustomEvent<{
    diagram: [Signature, [bigint, symbol, Composable]][];
    humanGrammar: HumanGrammar;
    machineGrammar: MachineGrammar;
  }>) {
    console.log(diagram);
    console.log(humanGrammar);

    const cells: any = [];
    diagram.forEach(([sig, [off, lab, com]], index) => {
      const id = index.toString();
      const name = Symbol.keyFor(lab)!;
      const inPorts = humanGrammar[name]["dom"].map((_, i) => `${id}.d.${i}`);
      const outPorts = humanGrammar[name]["cod"].map((_, i) => `${id}.c.${i}`);
      cells.push({
        type: "custom.Model",
        attrs: { ".label": { text: name } },
        inPorts,
        outPorts,
        id: id,
        position: { x: index * 80, y: Number(off) * 40 },
      });
    });

    console.group("1 <= i <", diagram.length);
    for (let i = 1; i < diagram.length; i++) {
      console.group("i ==", i);
      const [, [cO, cS]] = diagram[i];
      const cC = machineGrammar.generators.get(cS)!;

      console.group("0 <= j <", cC.arity);
      for (let j = 0n; j < cC.arity; j++) {
        console.group("j ==", j);
        let idx = j + cO;
        backtracking: for (let k = i - 1; k >= 0; k--) {
          console.log("k", i - 1, ">=", k, ">=", 0);
          const [, [pO, pS]] = diagram[k];
          const pC = machineGrammar.generators.get(pS)!;
          if (idx < pO) continue backtracking;
          if (idx >= pO + pC.coarity) {
            idx += pC.arity - pC.coarity;
            continue backtracking;
          }
          const s = Number(idx - pO);
          const source = { id: k.toString(), port: `${k}.c.${s}` };
          const target = { id: i.toString(), port: `${i}.d.${j}` };
          console.log("S/T", source, target);
          cells.push({ type: "custom.Link", source, target });
          break backtracking;
        }
        console.groupEnd();
      }
      console.groupEnd();
      console.groupEnd();
    }
    console.groupEnd();

    console.log(cells);

    this.graph.fromJSON({ cells });
    this.refocus();
  }

  refocus() {
    this.paper.transformToFitContent({
      useModelGeometry: true,
      verticalAlign: "middle",
      horizontalAlign: "middle",
    });
  }
}
