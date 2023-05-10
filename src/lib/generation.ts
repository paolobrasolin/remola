import { BitSize, Composable, Signature } from "./encoding";

export function listCompositionOffsets(
  lho: Composable,
  rho: Composable,
  bits: BitSize,
  unsafe = true
): bigint[] {
  const results: bigint[] = [];

  if (!unsafe && lho.coarity > 0n && rho.arity < 1n) return results; // TODO: debatable
  for (let offset = 0n; offset <= lho.coarity - rho.arity; offset++) {
    const bitLength = rho.arity * bits;
    const bitOffset = offset * bits;
    // NOTE: careful with bitmasks on 1 bits
    const bitMask =
      bits === 1n
        ? bitLength + bitOffset
        : bits ** (bitLength + bitOffset) - 1n;
    const body = (lho.codomain & bitMask) >> bitOffset;
    if (body == rho.domain) results.push(offset);
  }
  return results;
}

export function listCompositions(
  lho: Composable,
  rho: Composable,
  bits: BitSize,
  unsafe = true
): [bigint, Composable][] {
  const results: [bigint, Composable][] = [];
  listCompositionOffsets(lho, rho, bits, unsafe).forEach((offset) => {
    let codomain = lho.codomain;
    codomain >>= (rho.arity + offset) * bits;
    codomain <<= rho.coarity * bits;
    codomain |= rho.codomain;
    codomain <<= offset * bits;
    // NOTE: careful with bitmasks on 1 bits
    const bitMask = bits === 1n ? offset * bits : bits ** (offset * bits) - 1n;
    codomain |= lho.codomain & bitMask;
    const coarity = lho.coarity + rho.coarity - rho.arity;
    const composition = {
      name: undefined,
      arity: lho.arity,
      domain: lho.domain,
      coarity: coarity,
      codomain: codomain,
    };
    results.push([offset, composition]);
  });
  return results;
}

export function explore(
  sigs: Composable[],
  store: Map<Signature, Set<Signature>>,
  depth: bigint,
  generators: Composable[],
  bits: BitSize
) {
  if (depth < 1n) return;
  const other = new Set<Composable>();
  sigs.forEach((sig) => {
    if (!store.has(sig.codomain)) store.set(sig.codomain, new Set<Signature>());
    generators.forEach((g) => {
      // if (g.dom.arity < 1n) return; // TODO: is this actually right?
      const compositions = listCompositions(sig, g, bits);
      compositions.forEach(([_, f]) => {
        store.get(sig.codomain)?.add(f.codomain);
        other.add(f);
      });
    });
  });

  explore(
    [...other].filter((x) => !store.has(x.codomain)),
    store,
    depth - 1n,
    generators,
    bits
  );
}

export function exploreWithEdges(
  sigs: Composable[],
  store: Map<Signature, Map<Signature, [bigint, symbol, Composable][]>>,
  depth: bigint,
  generators: Composable[],
  bits: BitSize,
  unsafe = true
) {
  if (depth < 1n) return;
  const other = new Set<Composable>();
  sigs.forEach((sig) => {
    if (!store.has(sig.codomain))
      store.set(
        sig.codomain,
        new Map<Signature, [bigint, symbol, Composable][]>()
      );
    generators.forEach((g) => {
      // if (g.dom.arity < 1n) return; // TODO: is this actually right?
      const compositions = listCompositions(sig, g, bits, unsafe);
      compositions.forEach(([o, f]) => {
        if (!store.get(sig.codomain)?.has(f.codomain))
          store
            .get(sig.codomain)
            ?.set(f.codomain, new Array<[bigint, symbol, Composable]>());

        store.get(sig.codomain)?.get(f.codomain)?.push([o, g.name!, f]);
        other.add(f);
      });
    });
  });

  exploreWithEdges(
    [...other].filter((x) => !store.has(x.codomain)),
    store,
    depth - 1n,
    generators,
    bits,
    unsafe
  );
}
