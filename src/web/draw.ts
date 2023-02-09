import { Svg } from "@svgdotjs/svg.js";

function lerp(t: number, head: number, tail: number): number {
  return (1 - t) * head + t * tail;
}

const drawSlice = function (
  ni: number,
  nd: number,
  nc: number,
  nf: number,
  no: number,
  [l, r, t, b]: [number, number, number, number],
  svg: Svg
) {
  const domPitch = (r - l) / ni;
  const codPitch = (r - l) / nf;
  const domY = t;
  const codY = b;

  for (let k = 0; k <= no - 1; k++) {
    const domX = l + domPitch * (1 / 2 + k);
    const codX = l + codPitch * (1 / 2 + k);
    const path = `\
M ${domX} ${lerp(0 / 2, domY, codY)}\
C ${domX} ${lerp(1 / 2, domY, codY)}\
, ${codX} ${lerp(1 / 2, domY, codY)}\
, ${codX} ${lerp(2 / 2, domY, codY)}`;
    svg.path(path).stroke({ color: "coral", width: 4 }).fill("none");
  }

  for (let k = no + nd; k < ni; k++) {
    const domX = l + domPitch * (1 / 2 + k);
    const codX = l + codPitch * (1 / 2 + (k - nd + nc));
    const path = `\
M ${domX} ${lerp(0 / 4, domY, codY)}\
C ${domX} ${lerp(1 / 4, domY, codY)}\
, ${codX} ${lerp(3 / 4, domY, codY)}\
, ${codX} ${lerp(4 / 4, domY, codY)}`;
    svg.path(path).stroke({ color: "coral", width: 4 }).fill("none");
  }

  for (let k = no; k <= no + nd - 1; k++) {
    const domX = l + domPitch * (1 / 2 + k);
    const path = `\
M ${domX} ${lerp(0 / 3, domY, codY)}\
L ${domX} ${lerp(1 / 3, domY, codY)}`;
    svg.path(path).stroke({ color: "coral", width: 4 }).fill("none");
  }

  for (let k = no; k <= no + nc - 1; k++) {
    const codX = l + codPitch * (1 / 2 + k);
    const path = `\
M ${codX} ${lerp(2 / 3, domY, codY)}\
L ${codX} ${lerp(3 / 3, domY, codY)}`;
    svg.path(path).stroke({ color: "coral", width: 4 }).fill("none");
  }

  svg
    .rect(Math.max(nd / (ni || 1), nc / (nf || 1)) * (r - l), (b - t) / 3)
    .move(l + (no * (r - l)) / (ni || 1), t + (b - t) / 3)
    .radius(10)
    .fill("teal");
};

export const drawDiagram = function (
  slices: [number, number, number, number, number][],
  [l, r, t, b]: [number, number, number, number],
  svg: Svg
) {
  slices.forEach((vs, i, slices) => {
    drawSlice(
      ...vs,
      [
        l,
        r,
        t + (i * (b - t)) / slices.length,
        t + ((i + 1) * (b - t)) / slices.length,
      ],
      svg
    );
  });
};
