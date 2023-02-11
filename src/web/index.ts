import { Application } from "@hotwired/stimulus";
import TabController from "./controllers/tab_controller";
import EditorController from "./controllers/editor_controller";
import GraphController from "./controllers/graph_controller";
import "./index.css";

const application = Application.start();
application.register("tab", TabController);
application.register("editor", EditorController);
application.register("graph", GraphController);
application.debug = true;
