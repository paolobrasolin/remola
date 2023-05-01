import * as joint from "jointjs";

type GestureState =
  | undefined
  | {
      touches: number;
      client: {
        focus: joint.g.Point;
        width: number;
      };
      paper: {
        focus: joint.g.Point;
        scale: number;
        matrix: SVGMatrix;
      };
    };

export default class {
  paper: joint.dia.Paper;

  initialGestureState: GestureState;
  currentGestureState: GestureState;

  constructor(paper: joint.dia.Paper) {
    this.paper = paper;
    this.bindEvents();
  }

  bindEvents() {
    this.paper.on("blank:pointerdblclick", () => {
      this.paper.transformToFitContent({
        useModelGeometry: true,
        verticalAlign: "middle",
        horizontalAlign: "middle",
      });
    });
    this.paper.on("blank:pointerdown", ({ originalEvent }) => {
      if (originalEvent instanceof TouchEvent) {
        this.initialGestureState = this.detectTouchGesture(
          originalEvent.touches
        );
        this.currentGestureState = undefined;
      }
      if (originalEvent instanceof MouseEvent) {
        this.initialGestureState = this.detectMouseGesture(originalEvent);
        this.currentGestureState = undefined;
      }
    });
    this.paper.on("blank:pointermove", ({ originalEvent }) => {
      if (originalEvent instanceof TouchEvent) {
        this.currentGestureState = this.detectTouchGesture(
          originalEvent.touches
        );
        if (
          this.initialGestureState?.touches ===
          this.currentGestureState?.touches
        ) {
          this.applyGestureDelta();
        } else {
          this.initialGestureState = this.currentGestureState;
          this.currentGestureState = undefined;
        }
      }
      if (originalEvent instanceof MouseEvent) {
        this.currentGestureState = this.detectMouseGesture(originalEvent);
        this.applyGestureDelta();
      }
    });
    this.paper.on("blank:pointerup", ({ originalEvent }) => {
      if (originalEvent instanceof TouchEvent) {
        this.initialGestureState = this.detectTouchGesture(
          originalEvent.touches
        );
        this.currentGestureState = undefined;
      }
      if (originalEvent instanceof MouseEvent) {
        this.initialGestureState = this.detectMouseGesture(originalEvent);
        this.currentGestureState = undefined;
      }
    });
  }

  applyGestureDelta() {
    if (!this.initialGestureState) return;
    if (!this.currentGestureState) return;

    const initialState = this.initialGestureState.client;
    const initialPaper = this.initialGestureState.paper;

    const currentState = this.currentGestureState.client;

    const scale = currentState.width / initialState.width;
    const shift = currentState.focus.difference(initialState.focus);

    let matrix = initialPaper.matrix;

    if (scale !== 1)
      matrix = matrix
        .translate(initialPaper.focus.x, initialPaper.focus.y)
        .scale(scale)
        .translate(-initialPaper.focus.x, -initialPaper.focus.y);

    matrix = matrix.translate(
      shift.x / (scale * initialPaper.scale),
      shift.y / (scale * initialPaper.scale)
    );
    this.paper.matrix(matrix);
  }

  touchesToGestureClientState(touches: TouchList) {
    if (touches.length === 1) {
      const fstTouch = touches.item(0)!;
      const focus = new joint.g.Point(fstTouch.clientX, fstTouch.clientY);
      return { focus, width: 1 };
    } else if (touches.length === 2) {
      const fstTouch = touches.item(0)!;
      const sndTouch = touches.item(1)!;
      const fstPoint = new joint.g.Point(fstTouch.clientX, fstTouch.clientY);
      const sndPoint = new joint.g.Point(sndTouch.clientX, sndTouch.clientY);
      const focus = fstPoint.lerp(sndPoint, 0.5);
      const width = fstPoint.distance(sndPoint);
      return { focus, width };
    } else return;
  }

  detectTouchGesture(touches: TouchList) {
    const client = this.touchesToGestureClientState(touches);
    if (!client) return;

    const matrix = this.paper.matrix();

    return {
      touches: touches.length,
      client: client,
      paper: {
        focus: this.paper.clientToLocalPoint(client.focus),
        scale: Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b), // NOTE: assumes uniform scaling
        matrix,
      },
    };
  }

  detectMouseGesture(event: MouseEvent) {
    const focus = new joint.g.Point(event.clientX, event.clientY);
    const matrix = this.paper.matrix();
    return {
      touches: 1,
      client: {
        focus: focus,
        width: 1,
      },
      paper: {
        focus: this.paper.clientToLocalPoint(focus),
        scale: Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b), // NOTE: assumes uniform scaling
        matrix,
      },
    };
  }
}
