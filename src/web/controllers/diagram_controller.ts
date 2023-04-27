import { Controller } from "@hotwired/stimulus";

import * as joint from "jointjs";

export default class extends Controller {
  static targets = ["container"];
  declare readonly containerTarget: HTMLDivElement;

  connect() {
    const namespace = joint.shapes;

    const graph = new joint.dia.Graph({}, { cellNamespace: namespace });

    const paper = new joint.dia.Paper({
      el: this.containerTarget,
      width: 600,
      height: 600,
      model: graph,
      background: {
        color: "antiquewhite",
      },
      cellViewNamespace: namespace,
      gridSize: 1,
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
          step: 10,
          padding: 10,
          startDirections: ["right"],
          endDirections: ["left"],
          maxAllowedDirectionChange: 45,
          maximumLoops: 4,
        },
      },
    });

    (namespace as any).custom = {
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
              text: "β",
              "ref-x": 20,
              "ref-y": 0,
              "font-size": 18,
              "text-anchor": "middle",
              "dominant-baseline": "central",
              fill: "red",
            },
            ".body": {
              "ref-width": "100%",
              "ref-height": "100%",
              stroke: "#000",
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
    };

    graph.fromJSON({
      cells: [
        {
          type: "custom.Model",
          inPorts: [],
          outPorts: ["Ao"],
          id: "0",
          position: { x: 0, y: 0 },
        },
        {
          type: "custom.Model",
          inPorts: ["Ai"],
          outPorts: ["Bo", "Ao", "X"],
          id: "(",
          position: { x: 200, y: 0 },
        },
        {
          type: "custom.Model",
          inPorts: ["Bi", "Ai"],
          outPorts: ["Ao"],
          id: ")",
          position: { x: 400, y: 0 },
        },
        {
          type: "custom.Model",
          inPorts: ["Ai"],
          outPorts: [],
          id: "1",
          position: { x: 600, y: 0 },
        },
        {
          type: "custom.Link",
          source: { id: "0", port: "Ao" },
          target: { id: "(", port: "Ai" },
        },
        {
          type: "custom.Link",
          source: { id: "(", port: "Ao" },
          target: { id: ")", port: "Ai" },
        },
        {
          type: "custom.Link",
          source: { id: "(", port: "Bo" },
          target: { id: ")", port: "Bi" },
        },
        {
          type: "custom.Link",
          source: { id: ")", port: "Ao" },
          target: { id: "1", port: "Ai" },
        },
      ],
    });

    paper.fitToContent({
      useModelGeometry: true,
      padding: 100,
      allowNewOrigin: "any",
    });
  }

  disconnect() {
    console.log("BYE");
  }
}
