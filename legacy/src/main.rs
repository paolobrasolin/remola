use serde::Deserialize;
use std::collections::HashMap;

#[derive(Deserialize, Debug)]
struct Config {
    generators: Vec<Generator>,
}

#[derive(Deserialize, Debug)]
struct Generator {
    label: String,
    source: Vec<String>,
    target: Vec<String>,
}

fn configToAlphabet(generators: &Vec<Generator>) -> HashMap<String, usize> {
    let mut mappy: HashMap<String, usize> = HashMap::new();

    for generator in generators {
        for s in generator.source {
            let l = mappy.len();
            mappy.entry(s).or_insert(l + 1);
        }
        for t in generator.target {
            let l = mappy.len();
            mappy.entry(t).or_insert(l + 1);
        }
    }

    return mappy;
}

fn main() {
    let config: Config = toml::from_str(
        r#"
        [[generators]]
        label = "0"
        source = []
        target = ["A"]
        
        [[generators]]
        label = "("
        source = ["A"]
        target = ["B", "A"]
        
        [[generators]]
        label = ")"
        source = ["B", "A"]
        target = ["A"]
        
        [[generators]]
        label = "1"
        source = ["A"]
        target = []
    "#,
    )
    .unwrap();

    let mappy = configToAlphabet(&config.generators);

    for g in config.generators {
        println!("{:?}", g)
    }
}
