import { Application } from "@hotwired/stimulus";
import MainController from "./controllers/main_controller";
import TabController from "./controllers/tab_controller";
import EditorController from "./controllers/editor_controller";
import GraphController from "./controllers/graph_controller";
import DiagramController from "./controllers/diagram_controller";
import ListController from "./controllers/list_controller";
import "./monaco_environment";
import "./index.css";

const application = Application.start();
application.register("main", MainController);
application.register("tab", TabController);
application.register("editor", EditorController);
application.register("graph", GraphController);
application.register("diagram", DiagramController);
application.register("list", ListController);
application.debug = true;
