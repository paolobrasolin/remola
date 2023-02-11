import { Controller } from "@hotwired/stimulus";
import { editor, languages } from "monaco-editor";

const DEFAULT = `{
  "0": { "dom": [], "cod": ["A"]},
  "(": { "dom": ["A"], "cod": ["B", "A"]},
  ")": { "dom": ["B", "A"], "cod": ["A"]},
  "1": { "dom": ["A"], "cod": []}
}`;

const SCHEMA = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",
  additionalProperties: false,
  patternProperties: {
    "^.+$": {
      type: "object",
      required: ["dom", "cod"],
      properties: {
        dom: {
          type: "array",
          items: { type: "string", minLength: 1 },
        },
        cod: {
          type: "array",
          items: { type: "string", minLength: 1 },
        },
      },
    },
  },
};

export default class extends Controller {
  static targets = ["container"];
  declare readonly containerTarget: HTMLDivElement;

  editor!: editor.IStandaloneCodeEditor;

  connect() {
    this.editor = editor.create(this.containerTarget, {
      value: DEFAULT,
      language: "json",
    });

    languages.json.jsonDefaults.setDiagnosticsOptions({
      schemas: [
        {
          uri: "https://paolobrasolin.github.io/remola/generators_schema.json",
          fileMatch: ["*"],
          schema: SCHEMA,
        },
      ],
    });
  }

  disconnect() {}
}
