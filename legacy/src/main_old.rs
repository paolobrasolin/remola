// IDEA: what if we keep each level of the diagram's general form in the node of a tree? It's much more memory efficient, and we can fold back only on branches which converge within bounds.

#[derive(Debug)]
struct Generator {
    arity: u8,
    domain: u128,
    coarity: u8,
    codomain: u128,
}

// type: just a label. we'll refer to types by index?
// generator: (co)domain = (co)arity + (co)signature; so, basically, 4 integers. then, maybe a label. we'll refer to generators by index?
// diagram: in general form (right normal or not) we have a sequence of levels; each level is a generator with an offset; to (pre)compose we always need a checkable signature, so it's better to store it even if technically redundant. So, we have N+1 signatures and N (offset, generator ref).

fn splot(signature: u128, length: u8, offset: u8) -> (u128, u128, u128) {
    let head = signature >> length + offset;
    let body = (signature & (2u128.pow((length + offset) as u32) - 1)) >> offset;
    let tail = signature & (2u128.pow(offset as u32) - 1);
    (head, body, tail)
}

fn mask(signature: u128, length: u8, offset: u8) -> u128 {
    // NOTE: this trick won't work with big ints though.
    // signature
    //     .checked_shl((128 - length - offset).into())
    //     .unwrap_or(0)
    //     .checked_shr((128 - length).into())
    //     .unwrap_or(0)
    (signature << 128 - length - offset) >> 128 - length
}

fn sig(wires: Vec<u128>, size: usize) -> u128 {
    let mut result: u128 = 0;
    for (i, w) in wires.iter().enumerate() {
        // result <<= size; result += w; // TODO: maybe use a fold?
        result += w << i * size
    }
    result
}

fn main() {
    // enum Type {
    //     A = 1,
    //     B = 2,
    // };
    // let cod = (0 << 4 + 2) << 4 + 1; // is fold better?
    // TODO: right associative operator s.t. 1 + 2 + 3 == (3 << 4 + 2) << 4 + 1 ?

    let generators = [
        // Generator::from([],[1])
        // Generator::from([1],[2,1])
        // Generator::from([2,1],[1])
        // Generator::from([1],[])
        Generator {
            arity: 0,
            domain: 0,
            coarity: 1,
            codomain: 0b_01,
        },
        Generator {
            arity: 1,
            domain: 0b_01,
            coarity: 2,
            codomain: 0b_10_01,
        },
        Generator {
            arity: 2,
            domain: 0b_10_01,
            coarity: 1,
            codomain: 0b_01,
        },
        Generator {
            arity: 1,
            domain: 0b_01,
            coarity: 0,
            codomain: 0,
        },
    ];

    let diagram = Generator {
        arity: 0,
        domain: 0b0,
        coarity: 5,
        codomain: 0b_11_01_10_01_10,
    };
    // let diagram = Generator {
    //     arity: 0,
    //     domain: 0b0,
    //     coarity: 12,
    //     codomain: sig(vec![1, 6, 4, 8, 2, 7, 2, 6, 4, 2, 2, 3], 4),
    // };

    let generator = &generators[3];
    // let generator = Generator {
    //     arity: 2,
    //     domain: sig(vec![6, 4], 4),
    //     coarity: 0,
    //     codomain: 0b0,
    // };

    println!("DIA: {0:#066b} ({0:X})", diagram.codomain);
    println!("GEN: {0:#010b} ({0:X})", generator.domain);

    for offset in 0..diagram.coarity - generator.arity + 1 {
        let l = generator.arity * 2;
        let o = offset * 2;
        let body = (diagram.codomain & (2u128.pow((l + o) as u32) - 1)) >> o;
        if (body == generator.domain) {
            let head = diagram.codomain >> l + o;
            let tail = diagram.codomain & (2u128.pow(o as u32) - 1);
            let new_sig =
                (((head << (generator.coarity * 2)) + generator.codomain) << offset * 2) + tail;
            println!(
                "{0:b} ~ {1:02$b}/{3:04$b} @ {5} ~> {6:b}",
                diagram.codomain,
                generator.domain,
                (generator.arity * 2) as usize,
                generator.codomain,
                (generator.coarity * 2) as usize,
                offset,
                new_sig,
            )
        }
    }
}
