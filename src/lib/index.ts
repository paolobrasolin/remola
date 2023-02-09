export const greet = (name: string): string => `Hello ${name}!`;

interface Signature {
  arity: number;
  domain: number;
  coarity: number;
  codomain: number;
}

export type Diagram = Signature;
export type Generator = Signature;

export function indicesToDomain(indices: number[], bits: number): number {
  return indices.reduce((p, c, i) => p + (c << (i * bits)), 0);
}

export function sigFromIdxs(
  domSig: number[],
  codSig: number[],
  bits: number
): Signature {
  return {
    arity: domSig.length,
    domain: indicesToDomain(domSig, bits),
    coarity: codSig.length,
    codomain: indicesToDomain(codSig, bits),
  };
}

export function compose(dia: Diagram, gen: Generator): [number, Diagram][] {
  const results: [number, Diagram][] = [];
  for (let offset = 0; offset <= dia.coarity - gen.arity + 1; offset++) {
    const l = gen.arity * 2;
    const o = offset * 2;
    const body = (dia.codomain & (2 ** (l + o) - 1)) >> o;
    if (body == gen.domain) {
      const head = dia.codomain >> (l + o);
      const tail = dia.codomain & (2 ** o - 1);
      const new_sig =
        (((head << (gen.coarity * 2)) + gen.codomain) << (offset * 2)) + tail;
      const signature: Signature = {
        arity: dia.arity,
        domain: dia.domain,
        coarity: dia.coarity - gen.arity + gen.coarity,
        codomain: new_sig,
      };
      results.push([offset, signature]);
    }
  }
  return results;
}

const PAR = {
  lRoot: sigFromIdxs([], [1], 2),
  lNest: sigFromIdxs([1], [2, 1], 2),
  rNest: sigFromIdxs([2, 1], [1], 2),
  rRoot: sigFromIdxs([1], [], 2),
};

export function explore(
  sigs: [number, number][],
  store: Map<number, Set<number>>,
  depth: number
) {
  if (depth < 1) return;
  const other = new Set<[number, number]>();
  sigs.forEach(([coarity, codomain]) => {
    if (!store.has(codomain)) store.set(codomain, new Set());
    Object.values(PAR).forEach((g) => {
      const compositions = compose(
        { arity: 0, domain: 0, coarity, codomain },
        g
      );
      compositions.forEach(([_, f]) => {
        store.get(codomain)?.add(f.codomain);
        other.add([f.coarity, f.codomain]);
      });
    });
  });

  explore(
    [...other].filter(([_, codomain]) => !store.has(codomain)),
    store,
    depth - 1
  );
}
