import { Application } from "@hotwired/stimulus";
import TabController from "./controllers/tab_controller";
import EditorController from "./controllers/editor_controller";
import "./index.css";

const application = Application.start();
application.register("tab", TabController);
application.register("editor", EditorController);
application.debug = true;
