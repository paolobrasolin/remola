import { Controller } from "@hotwired/stimulus";
import { ExportJpgBlobPromiseOptions } from "cytoscape";
import { fstat } from "fs";

import * as joint from "jointjs";

type PanState = {
  focus: joint.g.Point;
};

type PinchState = {
  focus: joint.g.Point;
  range: number;
};

export default class extends Controller {
  static targets = ["container"];
  declare readonly containerTarget: HTMLDivElement;

  touchTracker:
    | {
        mouse: joint.g.PlainPoint;
        paper: joint.Vectorizer.Translation;
      }
    | undefined = undefined;

  paperMatrix: SVGMatrix | undefined;
  panGesture:
    | {
        panState: PanState;
        localFocus: joint.g.Point;
      }
    | undefined;
  pinchGesture:
    | {
        pinchState: PinchState;
        localFocus: joint.g.Point;
      }
    | undefined;

  connect() {
    const namespace = joint.shapes;

    const graph = new joint.dia.Graph({}, { cellNamespace: namespace });

    const paper = new joint.dia.Paper({
      el: this.containerTarget,
      width: "100%",
      height: "100%",
      model: graph,
      background: {
        color: "rgba(240, 255, 250, 0.5)",
      },
      cellViewNamespace: namespace,
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

    // this.bindPaperDrag(paper);

    paper.svg.addEventListener("touchstart", ({ touches }: TouchEvent) => {
      console.log("S", touches.length);

      if (touches.length === 1) {
        const currentPan = this.touchesToPanState(touches);
        if (!currentPan) return;

        this.panGesture = {
          panState: currentPan,
          localFocus: paper.clientToLocalPoint(currentPan.focus),
        };

        this.paperMatrix = paper.matrix();
      } else if (touches.length === 2) {
        const currentPinch = this.touchesToPinchState(touches);
        if (!currentPinch) return;

        this.pinchGesture = {
          pinchState: currentPinch,
          localFocus: paper.clientToLocalPoint(currentPinch.focus),
        };

        this.paperMatrix = paper.matrix();
      }
    });

    paper.svg.addEventListener("touchmove", ({ touches }: TouchEvent) => {
      console.log("M", touches.length);

      if (touches.length === 1) {
        if (!this.panGesture) return;
        if (!this.paperMatrix) return;
        const initialPan = this.panGesture.panState;
        const currentPan = this.touchesToPanState(touches);
        if (!currentPan) return;

        const d = currentPan.focus.difference(initialPan.focus);
        const currentMatrix = this.paperMatrix.translate(d.x, d.y);
        paper.matrix(currentMatrix);
      } else if (touches.length === 2) {
        if (!this.pinchGesture) return;
        if (!this.paperMatrix) return;
        const initialPinch = this.pinchGesture.pinchState;
        const currentPinch = this.touchesToPinchState(touches);
        if (!currentPinch) return;

        const scale = currentPinch.range / initialPinch.range;
        const d = currentPinch.focus.difference(initialPinch.focus);

        // NOTE: this formula assumes a uniform scaling, but that's our case
        const initialScale = Math.sqrt(
          this.paperMatrix.a * this.paperMatrix.a +
            this.paperMatrix.b * this.paperMatrix.b
        );

        const currentMatrix = this.paperMatrix
          .translate(
            this.pinchGesture.localFocus.x,
            this.pinchGesture.localFocus.y
          )
          .scale(scale)
          .translate(
            -this.pinchGesture.localFocus.x,
            -this.pinchGesture.localFocus.y
          )
          .translate(
            d.x / (scale * initialScale),
            d.y / (scale * initialScale)
          );

        paper.matrix(currentMatrix);
      }
    });

    // Touchend event for resetting initial touch points and distances
    paper.svg.addEventListener("touchend", ({ touches }: TouchEvent) => {
      console.log("E", touches.length);
      if (touches.length === 0) {
        this.pinchGesture = undefined;
        this.panGesture = undefined;
      } else if (touches.length === 1) {
        //
      } else if (touches.length === 2) {
        //
      }
    });

    // paper.fitToContent({
    //   useModelGeometry: true,
    //   padding: 100,
    //   allowNewOrigin: "any",
    // });

    paper.on(
      "blank:wheel",
      (event: any, x: number, y: number, delta: number) => {
        // console.log(event);
        event.preventDefault();
        const scale = 1 + (delta > 0 ? 0.1 : -0.1);
        this.zoom(paper, scale);
      }
    );
  }

  touchesToPinchState(touches: TouchList): PinchState | undefined {
    if (touches.length !== 2) return;

    const fstTouch = touches.item(0)!;
    const sndTouch = touches.item(1)!;

    const fstPoint = new joint.g.Point(fstTouch.clientX, fstTouch.clientY);
    const sndPoint = new joint.g.Point(sndTouch.clientX, sndTouch.clientY);

    const focus = fstPoint.lerp(sndPoint, 0.5);
    const range = fstPoint.distance(sndPoint);

    return { focus, range };
  }

  touchesToPanState(touches: TouchList): PanState | undefined {
    if (touches.length !== 1) return;

    const fstTouch = touches.item(0)!;

    const focus = new joint.g.Point(fstTouch.clientX, fstTouch.clientY);

    return { focus };
  }

  zoom(paper: joint.dia.Paper, scale: number) {
    const currentScale = paper.scale().sx;

    if (
      (currentScale >= 0.2 || scale > 1) &&
      (currentScale <= 4 || scale < 1)
    ) {
      paper.scale(currentScale * scale, currentScale * scale);
    }
  }

  bindPaperDrag(paper: joint.dia.Paper) {
    paper.on("blank:pointerdown", (evt) => {
      console.log(evt.touches);
      this.touchTracker = {
        mouse: { x: evt.clientX, y: evt.clientY },
        paper: paper.translate(),
      };
    });

    paper.on(
      "blank:pointermove",
      (evt: { clientX: number; clientY: number }) => {
        if (!this.touchTracker) return;
        // TODO: account for paper.scale());
        paper.translate(
          this.touchTracker.paper.tx +
            (evt.clientX - this.touchTracker.mouse.x),
          this.touchTracker.paper.ty + (evt.clientY - this.touchTracker.mouse.y)
        );
      }
    );

    paper.on("blank:pointerup", () => {
      this.touchTracker = undefined;
    });
  }

  disconnect() {
    console.log("BYE");
  }
}
