import {
  compose,
  explore,
  indicesToDomain,
  listCompositionOffsets,
  Sig,
  sigFromIdcs,
} from "./big";

describe("indicesToDomain", () => {
  test.each([
    { bits: 1, idcs: [], exp: 0b0 },
    { bits: 1, idcs: [1], exp: 0b1 },
    { bits: 1, idcs: [1, 1], exp: 0b11 },
    { bits: 1, idcs: [1, 1, 1], exp: 0b111 },
    { bits: 2, idcs: [], exp: 0b00 },
    { bits: 2, idcs: [1], exp: 0b01 },
    { bits: 2, idcs: [2], exp: 0b10 },
    { bits: 2, idcs: [1, 1], exp: 0b0101 },
    { bits: 2, idcs: [1, 2], exp: 0b1001 },
    { bits: 2, idcs: [2, 1], exp: 0b0110 },
    { bits: 2, idcs: [2, 2], exp: 0b1010 },
  ])("$bits bits: $idcs => $exp", ({ bits, idcs, exp }) => {
    const res = indicesToDomain(idcs.map(BigInt), BigInt(bits));
    expect(res.valueOf()).toBe(BigInt(exp));
    expect(res.arity).toBe(BigInt(idcs.length));
  });
});

describe("listCompositionOffsets", () => {
  test.each([
    { bits: 2, cod: [], dom: [1], exp: [] },
    { bits: 2, cod: [1], dom: [1], exp: [0] },
    { bits: 2, cod: [1, 2, 3], dom: [1], exp: [0] },
    { bits: 2, cod: [2, 1, 3], dom: [1], exp: [1] },
    { bits: 2, cod: [2, 3, 1], dom: [1], exp: [2] },
    { bits: 2, cod: [1, 1, 2, 3], dom: [1], exp: [0, 1] },
    { bits: 2, cod: [1, 2, 1, 3], dom: [1], exp: [0, 2] },
    { bits: 2, cod: [1, 2, 3, 1], dom: [1], exp: [0, 3] },
    { bits: 2, cod: [2, 1, 1, 3], dom: [1], exp: [1, 2] },
    { bits: 2, cod: [2, 1, 3, 1], dom: [1], exp: [1, 3] },
    { bits: 2, cod: [2, 3, 1, 1], dom: [1], exp: [2, 3] },
    { bits: 2, cod: [1, 2, 3, 3], dom: [1, 2], exp: [0] },
    { bits: 2, cod: [3, 1, 2, 3], dom: [1, 2], exp: [1] },
    { bits: 2, cod: [3, 3, 1, 2], dom: [1, 2], exp: [2] },
  ])("$bits bits: $cod accepts $dom at $exp", ({ bits, cod, dom, exp }) => {
    const b = BigInt(bits);
    const lho = indicesToDomain(cod.map(BigInt), b);
    const rho = indicesToDomain(dom.map(BigInt), b);
    const res = listCompositionOffsets(lho, rho, b);
    expect(res).toStrictEqual(exp.map(BigInt));
  });
});

test("compose", () => {
  const bits = 2n;
  const lho = sigFromIdcs([], [1n], bits);
  const rho = sigFromIdcs([1n], [2n, 1n], bits);
  expect(compose(lho, rho, bits)).toStrictEqual([
    [0n, sigFromIdcs([], [2n, 1n], 2n)],
  ]);
});

test("compose moar", () => {
  const bits = 2n;
  const lho = sigFromIdcs([], [1n, 2n, 2n, 1n], bits);
  const rho = sigFromIdcs([1n], [2n, 1n], bits);
  expect(compose(lho, rho, bits)).toStrictEqual([
    [0n, sigFromIdcs([], [...[2n, 1n], 2n, 2n, 1n], 2n)],
    [3n, sigFromIdcs([], [1n, 2n, 2n, ...[2n, 1n]], 2n)],
  ]);
});

// const PAR = {
//   lRoot: sigFromIdcs([], [1n], 2n),
//   lNest: sigFromIdcs([1n], [2n, 1n], 2n),
//   rNest: sigFromIdcs([2n, 1n], [1n], 2n),
//   rRoot: sigFromIdcs([1n], [], 2n),
// };

xtest("explore", () => {
  const start: Sig[] = [Object.assign(0b01n, { arity: 1n })];
  const store = new Map<bigint, Set<bigint>>();
  expect(store).toStrictEqual(new Map());
  explore(start, store, 2n);
  expect(store).toStrictEqual(new Map());
});
