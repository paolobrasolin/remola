import { Controller } from "@hotwired/stimulus";
import { editor, languages } from "monaco-editor";

const DEFAULT = `{
  "0": { "dom": [], "cod": ["A", "X"]},
  "(": { "dom": ["A"], "cod": ["B", "A"]},
  ")": { "dom": ["B", "A"], "cod": ["A"]},
  "1": { "dom": ["A", "X"], "cod": []}
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

const VALIDATION_PENDING_MARKER: editor.IMarkerData = {
  severity: 2,
  message: "Code is not yet validated",
  startColumn: 0,
  startLineNumber: 0,
  endColumn: Infinity,
  endLineNumber: Infinity,
};

languages.json.jsonDefaults.setDiagnosticsOptions({
  validate: true,
  schemas: [
    {
      uri: "https://paolobrasolin.github.io/remola/generators_schema.json",
      fileMatch: ["*"],
      schema: SCHEMA,
    },
  ],
});

export default class extends Controller {
  static targets = ["container"];
  declare readonly containerTarget: HTMLDivElement;

  editor!: editor.IStandaloneCodeEditor;

  connect() {
    this.editor = editor.create(this.containerTarget, {
      // value: DEFAULT,
      language: "json",
    });

    this.editor.onDidChangeModelContent(() => {
      const model = this.editor.getModel();
      if (!model) return;
      this.appendValidationPendingMarker(model);
    });

    editor.onDidChangeMarkers(() => {
      const invalid = editor.getModelMarkers({ owner: "json" }).length > 0;
      if (invalid) return;
      const grammar = JSON.parse(this.editor.getValue());
      this.dispatch("grammarChanged", { detail: { grammar } });
    });

    const params = new URLSearchParams(window.location.search);
    this.editor.setValue(params.get("grammar") || DEFAULT);

    new ResizeObserver((en) => {
      this.editor.layout();
    }).observe(this.containerTarget);
  }

  disconnect() {
    //
  }

  // NOTE: this is a kludge to force a call to onDidChangeMarkers after every onDidChangeModelContent, effectively giving us an onValidationCompleted event
  appendValidationPendingMarker(model: editor.ITextModel) {
    const currentMarkers: editor.IMarkerData[] = editor.getModelMarkers({
      resource: model.uri,
      owner: "json",
    });

    editor.setModelMarkers(model, "json", [
      ...currentMarkers,
      VALIDATION_PENDING_MARKER,
    ]);
  }
}
