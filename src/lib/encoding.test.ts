import {
  encodeTypesInGrammar,
  humanToMachineGrammar,
  indicesToSignature,
  listTypesInGrammar,
  HumanGrammar,
  MachineGrammar,
} from "./encoding";

describe("indicesToSignature", () => {
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
    const res = indicesToSignature(idcs.map(BigInt), BigInt(bits));
    expect(res).toBe(BigInt(exp));
  });
});

test("listTypesInGrammar", () => {
  const grammar: HumanGrammar = {
    "0": { dom: [], cod: ["A"] },
    "(": { dom: ["A"], cod: ["B", "A"] },
    ")": { dom: ["B", "A"], cod: ["A"] },
    "1": { dom: ["A"], cod: [] },
  };
  expect(listTypesInGrammar(grammar)).toStrictEqual(
    new Set([Symbol.for("A"), Symbol.for("B")])
  );
});

test("encodeTypesInGrammar", () => {
  const grammar: HumanGrammar = {
    "0": { dom: [], cod: ["A"] },
    "(": { dom: ["A"], cod: ["B", "A"] },
    ")": { dom: ["B", "A"], cod: ["A"] },
    "1": { dom: ["A"], cod: [] },
  };
  expect(encodeTypesInGrammar(grammar)).toStrictEqual(
    new Map([
      [Symbol.for("A"), 0b01n],
      [Symbol.for("B"), 0b10n],
    ])
  );
});

describe("humanToMachineGrammar", () => {
  test.each<{
    grammarName: string;
    humanGrammar: HumanGrammar;
    flatMachineGrammar: {
      bits: bigint;
      alphabet: [symbol, bigint][];
      generators: [symbol, bigint, bigint, bigint, bigint][];
    };
  }>([
    {
      grammarName: "Empty",
      humanGrammar: {},
      flatMachineGrammar: {
        bits: 0n,
        alphabet: [],
        generators: [],
      },
    },
    {
      grammarName: "Dust",
      humanGrammar: {
        "*": { dom: [], cod: [] },
      },
      flatMachineGrammar: {
        bits: 0n,
        alphabet: [],
        generators: [[Symbol.for("*"), 0n, 0n, 0n, 0n]],
      },
    },
    {
      grammarName: "Loop",
      humanGrammar: {
        "*": { dom: ["X"], cod: ["X"] },
      },
      flatMachineGrammar: {
        bits: 1n,
        alphabet: [[Symbol.for("X"), 0b1n]],
        generators: [[Symbol.for("*"), 1n, 0b1n, 1n, 0b1n]],
      },
    },
    {
      grammarName: "Cycle",
      humanGrammar: {
        f: { dom: ["A"], cod: ["B"] },
        b: { dom: ["B"], cod: ["A"] },
      },
      flatMachineGrammar: {
        bits: 2n,
        alphabet: [
          [Symbol.for("A"), 0b01n],
          [Symbol.for("B"), 0b10n],
        ],
        generators: [
          [Symbol.for("f"), 1n, 0b01n, 1n, 0b10n],
          [Symbol.for("b"), 1n, 0b10n, 1n, 0b01n],
        ],
      },
    },
    {
      grammarName: "Bubbles",
      humanGrammar: {
        "<": { dom: ["A"], cod: ["A", "A"] },
        ">": { dom: ["A", "A"], cod: ["A"] },
      },
      flatMachineGrammar: {
        bits: 1n,
        alphabet: [[Symbol.for("A"), 0b01n]],
        generators: [
          [Symbol.for("<"), 1n, 0b1n, 2n, 0b1_1n],
          [Symbol.for(">"), 2n, 0b1_1n, 1n, 0b1n],
        ],
      },
    },
    {
      grammarName: "Balanced parentheses",
      humanGrammar: {
        "0": { dom: [], cod: ["A"] },
        "(": { dom: ["A"], cod: ["B", "A"] },
        ")": { dom: ["B", "A"], cod: ["A"] },
        "1": { dom: ["A"], cod: [] },
      },
      flatMachineGrammar: {
        bits: 2n,
        alphabet: [
          [Symbol.for("A"), 0b01n],
          [Symbol.for("B"), 0b10n],
        ],
        generators: [
          [Symbol.for("0"), 0n, 0b0n, 1n, 0b01n],
          [Symbol.for("("), 1n, 0b01n, 2n, 0b01_10n],
          [Symbol.for(")"), 2n, 0b01_10n, 1n, 0b01n],
          [Symbol.for("1"), 1n, 0b01n, 0n, 0b0n],
        ],
      },
    },
    {
      grammarName: "Brick walls",
      humanGrammar: {
        "0": { dom: [], cod: ["H", "V"] },
        "*": { dom: ["H", "V"], cod: ["V", "H"] },
        "1": { dom: ["V", "H"], cod: [] },
      },
      flatMachineGrammar: {
        bits: 2n,
        alphabet: [
          [Symbol.for("H"), 0b01n],
          [Symbol.for("V"), 0b10n],
        ],
        generators: [
          [Symbol.for("0"), 0n, 0b0n, 2n, 0b10_01n],
          [Symbol.for("*"), 2n, 0b10_01n, 2n, 0b01_10n],
          [Symbol.for("1"), 2n, 0b01_10n, 0n, 0b0n],
        ],
      },
    },
    {
      grammarName: "Sierpiński gasket",
      humanGrammar: {
        X0: { dom: [], cod: ["H1", "V1"] },
        B0: { dom: ["H1", "V1"], cod: ["V0", "H0"] },
        B1: { dom: ["H0", "V0"], cod: ["V0", "H0"] },
        Y0: { dom: ["H0", "V1"], cod: ["V1", "H1"] },
        Y1: { dom: ["H1", "V0"], cod: ["V1", "H1"] },
        X1: { dom: ["V1", "H1"], cod: [] },
      },
      flatMachineGrammar: {
        bits: 3n,
        alphabet: [
          [Symbol.for("H1"), 0b001n],
          [Symbol.for("V1"), 0b010n],
          [Symbol.for("V0"), 0b011n],
          [Symbol.for("H0"), 0b100n],
        ],
        generators: [
          [Symbol.for("X0"), 0n, 0n, 2n, 0b010_001n],
          [Symbol.for("B0"), 2n, 0b010_001n, 2n, 0b100_011n],
          [Symbol.for("B1"), 2n, 0b011_100n, 2n, 0b100_011n],
          [Symbol.for("Y0"), 2n, 0b010_100n, 2n, 0b001_010n],
          [Symbol.for("Y1"), 2n, 0b011_001n, 2n, 0b001_010n],
          [Symbol.for("X1"), 2n, 0b001_010n, 0n, 0b0n],
        ],
      },
    },
  ])(
    "$grammarName",
    ({
      grammarName,
      humanGrammar,
      flatMachineGrammar: { bits, alphabet, generators },
    }) => {
      const machineGrammar: MachineGrammar = {
        bits,
        alphabet: new Map(alphabet),
        generators: new Map(
          generators.map(([name, arity, domain, coarity, codomain]) => {
            return [name, { name, arity, domain, coarity, codomain }];
          })
        ),
      };
      expect(humanToMachineGrammar(humanGrammar)).toStrictEqual(machineGrammar);
    }
  );
});
