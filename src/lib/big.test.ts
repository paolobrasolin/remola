import { compose, explore, indicesToDomain, Sig, sigFromIdcs } from "./big";

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

test("compose", () => {
  const lho = sigFromIdcs([], [1n], 2n);
  const rho = sigFromIdcs([1n], [2n, 1n], 2n);
  expect(compose(lho, rho)).toStrictEqual([
    [0n, sigFromIdcs([], [2n, 1n], 2n)],
  ]);
});

test("compose moar", () => {
  const lho = sigFromIdcs([], [1n, 2n, 2n, 1n], 2n);
  const rho = sigFromIdcs([1n], [2n, 1n], 2n);
  expect(compose(lho, rho)).toStrictEqual([
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
