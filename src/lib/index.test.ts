import { compose, indicesToDomain, sigFromIdxs } from "./index";

(
  [
    [1, [], 0b0],
    [1, [1], 0b1],
    [1, [1, 1], 0b11],
    [1, [1, 1, 1], 0b111],
    [2, [], 0b00],
    [2, [1], 0b01],
    [2, [2], 0b10],
    [2, [1, 1], 0b0101],
    [2, [1, 2], 0b1001],
    [2, [2, 1], 0b0110],
    [2, [2, 2], 0b1010],
  ] as [number, number[], number][]
).forEach(([bits, idcs, dom]) => {
  test(`${bits} bits: ${JSON.stringify(idcs)} => ${dom}`, () => {
    expect(indicesToDomain(idcs, bits)).toBe(dom);
  });
});

test("empty", () => {
  expect(sigFromIdxs([], [], 2)).toStrictEqual({
    arity: 0,
    domain: 0,
    coarity: 0,
    codomain: 0,
  });
});

test("nonempty", () => {
  expect(sigFromIdxs([2, 3], [1, 2, 2, 1], 2)).toStrictEqual({
    arity: 2,
    domain: 0b1110,
    coarity: 4,
    codomain: 0b01101001,
  });
});

const PAR = {
  lRoot: sigFromIdxs([], [1], 2),
  lNest: sigFromIdxs([1], [2, 1], 2),
  rNest: sigFromIdxs([2, 1], [1], 2),
  rRoot: sigFromIdxs([1], [], 2),
};

test("compose", () => {
  expect(compose(PAR.lRoot, PAR.lNest)).toStrictEqual([
    [0, sigFromIdxs([], [2, 1], 2)],
  ]);
});

test("compose moar", () => {
  expect(
    compose(
      {
        arity: 0,
        domain: 0b0,
        coarity: 4,
        codomain: 0b01101001,
      },
      PAR.lNest
    )
  ).toStrictEqual([
    [0, sigFromIdxs([], [...[2, 1], 2, 2, 1], 2)],
    [3, sigFromIdxs([], [1, 2, 2, ...[2, 1]], 2)],
  ]);
});
