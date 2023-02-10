import {
  compose,
  explore,
  indicesToDomain,
  listCompositionOffsets,
  Sig,
  sigFromIdcs,
} from "./big";

(
  [
    [1n, [], 0b0n],
    [1n, [1n], 0b1n],
    [1n, [1n, 1n], 0b11n],
    [1n, [1n, 1n, 1n], 0b111n],
    [2n, [], 0b00n],
    [2n, [1n], 0b01n],
    [2n, [2n], 0b10n],
    [2n, [1n, 1n], 0b0101n],
    [2n, [1n, 2n], 0b1001n],
    [2n, [2n, 1n], 0b0110n],
    [2n, [2n, 2n], 0b1010n],
  ] as [bigint, bigint[], bigint][]
).forEach(([bits, idcs, dom]) => {
  test(`${bits} bits: [${idcs}] => ${dom}`, () => {
    expect(indicesToDomain(idcs, bits).valueOf()).toBe(dom);
  });
});

test("empty", () => {
  expect(sigFromIdcs([], [], 2n)).toStrictEqual({
    dom: Object.assign(0n, { arity: 0n }),
    cod: Object.assign(0n, { arity: 0n }),
  });
});

test("nonempty", () => {
  expect(sigFromIdcs([2n, 3n], [1n, 2n, 2n, 1n], 2n)).toStrictEqual({
    dom: Object.assign(0b1110n, { arity: 2n }),
    cod: Object.assign(0b01101001n, { arity: 4n }),
  });
});

describe("listCompositionOffsets", () => {
  test.each([
    { cod: [], dom: [1], exp: [] },
    { cod: [1], dom: [1], exp: [0] },
    { cod: [1, 2, 3], dom: [1], exp: [0] },
    { cod: [2, 1, 3], dom: [1], exp: [1] },
    { cod: [2, 3, 1], dom: [1], exp: [2] },
    { cod: [1, 1, 2, 3], dom: [1], exp: [0, 1] },
    { cod: [1, 2, 1, 3], dom: [1], exp: [0, 2] },
    { cod: [1, 2, 3, 1], dom: [1], exp: [0, 3] },
    { cod: [2, 1, 1, 3], dom: [1], exp: [1, 2] },
    { cod: [2, 1, 3, 1], dom: [1], exp: [1, 3] },
    { cod: [2, 3, 1, 1], dom: [1], exp: [2, 3] },
    { cod: [1, 2, 3, 4], dom: [1, 2], exp: [0] },
    { cod: [3, 1, 2, 4], dom: [1, 2], exp: [1] },
    { cod: [3, 4, 1, 2], dom: [1, 2], exp: [2] },
  ])("$cod accepts $dom at $exp", ({ cod, dom, exp }) => {
    const bits = 2n;
    const lho = sigFromIdcs([], cod.map(BigInt), bits);
    const rho = sigFromIdcs(dom.map(BigInt), [], bits);
    const result = listCompositionOffsets(lho, rho, bits);
    expect(result).toStrictEqual(exp.map(BigInt));
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
