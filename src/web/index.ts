import { Application } from "@hotwired/stimulus";
import TabController from "./controllers/tab_controller";
import "./index.css";

const application = Application.start();
application.register("tab", TabController);
application.debug = true;
