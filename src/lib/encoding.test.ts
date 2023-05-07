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
