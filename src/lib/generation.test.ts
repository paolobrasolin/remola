import {
  Composable,
  HumanGrammar,
  MachineGrammar,
  Signature,
  humanToMachineGrammar,
  indicesToGenerator,
} from "./encoding";
import {
  listCompositions,
  explore,
  listCompositionOffsets,
  exploreWithEdges,
} from "./generation";

describe("listCompositionOffsets", () => {
  test.each([
    { bits: 1, cod: [], dom: [], exp: [0] },
    { bits: 1, cod: [1], dom: [], exp: [0, 1] },
    { bits: 1, cod: [], dom: [1], exp: [] },
    { bits: 1, cod: [1], dom: [1], exp: [0] },
    { bits: 2, cod: [], dom: [], exp: [0] },
    { bits: 2, cod: [1], dom: [], exp: [0, 1] },
    { bits: 2, cod: [], dom: [1], exp: [] },
    { bits: 2, cod: [1], dom: [1], exp: [0] },
    { bits: 2, cod: [1, 2, 3], dom: [], exp: [0, 1, 2, 3] },
    { bits: 2, cod: [1, 2, 3], dom: [1], exp: [0] },
    { bits: 2, cod: [2, 1, 3], dom: [1], exp: [1] },
    { bits: 2, cod: [2, 3, 1], dom: [1], exp: [2] },
    { bits: 2, cod: [1, 1, 2, 3], dom: [1], exp: [0, 1] },
    { bits: 2, cod: [1, 2, 1, 3], dom: [1], exp: [0, 2] },
    { bits: 2, cod: [1, 2, 3, 1], dom: [1], exp: [0, 3] },
    { bits: 2, cod: [2, 1, 1, 3], dom: [1], exp: [1, 2] },
    { bits: 2, cod: [2, 1, 3, 1], dom: [1], exp: [1, 3] },
    { bits: 2, cod: [2, 3, 1, 1], dom: [1], exp: [2, 3] },
    { bits: 2, cod: [1, 2, 3, 3], dom: [], exp: [0, 1, 2, 3, 4] },
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
      bits: 1,
      lho: { dom: [], cod: [1] },
      rho: { dom: [1], cod: [] },
      exp: [[0, { dom: [], cod: [] }]],
    },
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
      [0n, new Set([0b01n])],
      [0b01n, new Set([0b01_01n, 0b01_10n, 0n])],
      [0b10n, new Set([0b10_01n, 0b01_10n])],
      [
        0b01_01_01n,
        new Set([
          0b01_01_01_01n,
          0b01_01_01_10n,
          0b01_01_10_01n,
          0b01_10_01_01n,
          0b01_01n,
        ]),
      ],
      [
        0b01_01_10n,
        new Set([
          0b01_01_10_01n,
          0b01_01_01_10n,
          0b01_01_10_10n,
          0b01_10_01_10n,
          0b01_01n,
          0b01_10n,
        ]),
      ],
      [
        0b01_10_01n,
        new Set([
          0b01_10_01_01n,
          0b01_01_10_01n,
          0b01_10_01_10n,
          0b01_10_10_01n,
          0b01_01n,
          0b01_10n,
          0b10_01n,
        ]),
      ],
      [
        0b01_10_10n,
        new Set([
          0b01_10_10_01n,
          0b01_10_01_10n,
          0b01_01_10_10n,
          0b01_10_10_10n,
          0b01_10n,
          0b10_10n,
        ]),
      ],
      [0b01_01n, new Set([0b01_01_01n, 0b01_01_10n, 0b01_10_01n, 0b01n])],
      [
        0b01_10n,
        new Set([0b01_10_01n, 0b01_01_10n, 0b01_10_10n, 0b01n, 0b10n]),
      ],
    ])
  );
});

describe("exploreWithEdges", () => {
  test.each<{
    grammarName: string;
    humanGrammar: HumanGrammar;
    reducedGraphStore: Map<Signature, Map<Signature, [bigint, symbol][]>>;
  }>([
    {
      grammarName: "Empty",
      humanGrammar: {},
      reducedGraphStore: new Map([[0n, new Map()]]),
    },
    {
      grammarName: "Dust",
      humanGrammar: {
        "*": { dom: [], cod: [] },
      },
      reducedGraphStore: new Map([
        [0n, new Map([[0n, [[0n, Symbol.for("*")]]]])],
      ]),
    },
    {
      grammarName: "Line",
      humanGrammar: {
        "0": { dom: [], cod: ["A"] },
        "*": { dom: ["A"], cod: ["A"] },
        "1": { dom: ["A"], cod: [] },
      },
      reducedGraphStore: new Map([
        [0n, new Map([[1n, [[0n, Symbol.for("0")]]]])],
        [
          1n,
          new Map([
            [
              3n,
              [
                [0n, Symbol.for("0")],
                [1n, Symbol.for("0")],
              ],
            ],
            [0n, [[0n, Symbol.for("1")]]],
            [1n, [[0n, Symbol.for("*")]]],
          ]),
        ],
      ]),
    },
    {
      grammarName: "Parallel roads",
      humanGrammar: {
        "0": { dom: [], cod: ["a", "z"] },
        A: { dom: ["a"], cod: ["a"] },
        Z: { dom: ["z"], cod: ["z"] },
        "1": { dom: ["a", "z"], cod: [] },
      },
      reducedGraphStore: new Map([
        [0n, new Map([[0b10_01n, [[0n, Symbol.for("0")]]]])],
        [
          0b10_01n,
          new Map([
            [0n, [[0n, Symbol.for("1")]]],
            [
              0b10_01_10_01n,
              [
                [0n, Symbol.for("0")],
                [2n, Symbol.for("0")],
              ],
            ],
            [0b10_10_01_01n, [[1n, Symbol.for("0")]]],
            [
              0b10_01n,
              [
                [0n, Symbol.for("A")],
                [1n, Symbol.for("Z")],
              ],
            ],
          ]),
        ],
      ]),
    },
    {
      grammarName: "Forks",
      humanGrammar: {
        "0": { dom: [], cod: ["A"] },
        X: { dom: ["A"], cod: ["A", "A"] },
        "1": { dom: ["A"], cod: [] },
      },
      reducedGraphStore: new Map([
        [0n, new Map([[0b1n, [[0n, Symbol.for("0")]]]])],
        [
          0b1n,
          new Map([
            [
              0b1_1n,
              [
                [0n, Symbol.for("0")],
                [1n, Symbol.for("0")],
                [0n, Symbol.for("X")],
              ],
            ],
            [0n, [[0n, Symbol.for("1")]]],
          ]),
        ],
      ]),
    },
    {
      grammarName: "Balanced parentheses",
      humanGrammar: {
        "0": { dom: [], cod: ["A", "X"] },
        "(": { dom: ["A"], cod: ["B", "A"] },
        ")": { dom: ["B", "A"], cod: ["A"] },
        "1": { dom: ["A", "X"], cod: [] },
      },
      reducedGraphStore: new Map([
        [0n, new Map([[0b10_01n, [[0n, Symbol.for("0")]]]])],
        [
          0b10_01n,
          new Map([
            [
              0b10_01_10_01n,
              [
                [0n, Symbol.for("0")],
                [2n, Symbol.for("0")],
              ],
            ],
            [0b10_10_01_01n, [[1n, Symbol.for("0")]]],
            [0n, [[0n, Symbol.for("1")]]],
            [0b10_01_11n, [[0n, Symbol.for("(")]]],
          ]),
        ],
      ]),
    },
    // {
    //   grammarName: "Brick walls",
    // humanGrammar: {
    //   "0": { dom: [], cod: ["H", "V"] },
    //   "*": { dom: ["H", "V"], cod: ["V", "H"] },
    //   "1": { dom: ["V", "H"], cod: [] },
    // },
    // },
  ])(
    "$grammarName",
    ({
      grammarName,
      humanGrammar,
      reducedGraphStore,
      // flatMachineGrammar: { bits, alphabet, generators },
    }) => {
      const machineGrammar: MachineGrammar =
        humanToMachineGrammar(humanGrammar);

      const graphStore = new Map<
        Signature,
        Map<Signature, [bigint, symbol, Composable][]>
      >();

      const head: Composable = {
        arity: 0n,
        domain: 0n,
        coarity: 0n,
        codomain: 0n,
      };

      exploreWithEdges(
        [head],
        graphStore,
        2n,
        [...machineGrammar.generators.values()],
        machineGrammar.bits
      );

      graphStore.forEach((u) => u.forEach((v) => v.forEach((w) => w.pop())));

      expect(graphStore).toStrictEqual(reducedGraphStore);
    }
  );
});
