export const greet = (name: string): string => `Hello ${name}!`;

interface Signature {
  dom: Sig;
  cod: Sig;
}

export type Diagram = Signature;
export type Generator = Signature;

export type Sig = bigint & { arity: bigint };

export function indicesToDomain(indices: bigint[], bits: bigint): Sig {
  return Object.assign(
    indices.reduce((p, c, i) => p + (c << (BigInt(i) * bits)), 0n),
    { arity: BigInt(indices.length) }
  );
}

export function sigFromIdcs(
  domIdcs: bigint[],
  codIdcs: bigint[],
  bits: bigint
): Signature {
  return {
    dom: indicesToDomain(domIdcs, bits),
    cod: indicesToDomain(codIdcs, bits),
  };
}

export function compose(dia: Diagram, gen: Generator): [bigint, Diagram][] {
  const results: [bigint, Diagram][] = [];
  for (
    let offset = 0n;
    offset <= dia.cod.arity - gen.dom.arity + 1n;
    offset++
  ) {
    const l = gen.dom.arity * 2n;
    const o = offset * 2n;
    const body = (dia.cod & (2n ** (l + o) - 1n)) >> o;
    if (body == gen.dom) {
      const head = dia.cod >> (l + o);
      const tail = dia.cod & (2n ** o - 1n);
      const codomain =
        (((head << (gen.cod.arity * 2n)) + gen.cod) << (offset * 2n)) + tail;
      const signature: Signature = {
        dom: Object.assign(dia.dom, { arity: dia.dom.arity }),
        cod: Object.assign(codomain, {
          arity: dia.cod.arity - gen.dom.arity + gen.cod.arity,
        }),
      };
      results.push([offset, signature]);
    }
  }
  return results;
}

const PAR = {
  lRoot: sigFromIdcs([], [1n], 2n),
  lNest: sigFromIdcs([1n], [2n, 1n], 2n),
  rNest: sigFromIdcs([2n, 1n], [1n], 2n),
  rRoot: sigFromIdcs([1n], [], 2n),
};

export function explore(
  sigs: Sig[],
  store: Map<bigint, Set<bigint>>,
  depth: bigint
) {
  if (depth < 1n) return;
  const other = new Set<Sig>();
  sigs.forEach((sig) => {
    if (!store.has(sig.valueOf())) store.set(sig.valueOf(), new Set<bigint>());
    Object.values(PAR).forEach((g) => {
      // if (g.dom.arity < 1n) return; // TODO: is this actually right?
      const compositions = compose(
        { dom: Object.assign(0b0n, { arity: 0n }), cod: sig },
        g
      );
      compositions.forEach(([_, f]) => {
        store.get(sig.valueOf())?.add(f.cod.valueOf());
        other.add(f.cod);
      });
    });
  });

  explore(
    [...other].filter((x) => !store.has(x.valueOf())),
    store,
    depth - 1n
  );
}
