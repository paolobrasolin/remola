import { Composable, indicesToGenerator } from "./encoding";
import {
  listCompositions,
  explore,
  listCompositionOffsets,
} from "./generation";

describe("listCompositionOffsets", () => {
  test.each([
    { bits: 2, cod: [], dom: [], exp: [0] }, // TODO: debatable
    { bits: 2, cod: [1], dom: [], exp: [] }, // TODO: debatable
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
    const lho = indicesToGenerator([], cod.map(BigInt), b);
    const rho = indicesToGenerator(dom.map(BigInt), [], b);
    const res = listCompositionOffsets(lho, rho, b);
    expect(res).toStrictEqual(exp.map(BigInt));
  });
});

describe("listCompositions", () => {
  test.each<{
    bits: number;
    lho: { dom: number[]; cod: number[] };
    rho: { dom: number[]; cod: number[] };
    exp: [number, { dom: number[]; cod: number[] }][];
  }>([
    {
      bits: 2,
      lho: { dom: [], cod: [1] },
      rho: { dom: [2], cod: [] },
      exp: [],
    },
    {
      bits: 2,
      lho: { dom: [], cod: [1] },
      rho: { dom: [1], cod: [2] },
      exp: [[0, { dom: [], cod: [2] }]],
    },
    {
      bits: 2,
      lho: { dom: [], cod: [1, 1, 1] },
      rho: { dom: [1], cod: [2] },
      exp: [
        [0, { dom: [], cod: [2, 1, 1] }],
        [1, { dom: [], cod: [1, 2, 1] }],
        [2, { dom: [], cod: [1, 1, 2] }],
      ],
    },
    {
      bits: 2,
      lho: { dom: [], cod: [1, 2, 1, 2, 1] },
      rho: { dom: [1], cod: [3, 3] },
      exp: [
        [0, { dom: [], cod: [...[3, 3], 2, 1, 2, 1] }],
        [2, { dom: [], cod: [1, 2, ...[3, 3], 2, 1] }],
        [4, { dom: [], cod: [1, 2, 1, 2, ...[3, 3]] }],
      ],
    },
    {
      bits: 2,
      lho: { dom: [], cod: [1, 2, 1, 2] },
      rho: { dom: [1, 2], cod: [3] },
      exp: [
        [0, { dom: [], cod: [...[3], 1, 2] }],
        [2, { dom: [], cod: [1, 2, ...[3]] }],
      ],
    },
  ])(
    "$bits bits: $lho.dom>$lho.cod composes with $rho.dom>$rho.cod in $exp.length ways",
    ({ bits, lho, rho, exp }) => {
      const bN = BigInt(bits);
      const lhoN = indicesToGenerator(
        lho.dom.map(BigInt),
        lho.cod.map(BigInt),
        bN
      );
      const rhoN = indicesToGenerator(
        rho.dom.map(BigInt),
        rho.cod.map(BigInt),
        bN
      );
      const resN = listCompositions(lhoN, rhoN, bN);
      const expN = exp.map(([offset, { dom, cod }]) => [
        BigInt(offset),
        indicesToGenerator(dom.map(BigInt), cod.map(BigInt), bN),
      ]);
      expect(resN).toStrictEqual(expN);
    }
  );
});

test("explore", () => {
  const bits = 2n;
  const balParLangGenerators = [
    indicesToGenerator([], [0b01n], bits),
    indicesToGenerator([0b01n], [0b10n, 0b01n], bits),
    indicesToGenerator([0b10n, 0b01n], [0b01n], bits),
    indicesToGenerator([0b01n], [], bits),
  ];
  const start: Composable[] = [indicesToGenerator([], [], bits)];
  const store = new Map<bigint, Set<bigint>>();
  expect(store).toStrictEqual(new Map());
  explore(start, store, 4n, balParLangGenerators, bits);
  expect(store).toStrictEqual(
    new Map([
      [0b00n, new Set([0b01n])],
      [0b01n, new Set([0b00n, 0b01_10n])],
      [0b10n, new Set([])],
      [0b01_10n, new Set([0b01n, 0b10n, 0b01_10_10n])],
      [0b01_10_10n, new Set([0b01_10n, 0b10_10n, 0b01_10_10_10n])],
    ])
  );
});
