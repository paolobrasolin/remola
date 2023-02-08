import "./index.css";
import { greet } from "../main";

const app = document.querySelector<HTMLDivElement>("#app");
if (app) app.innerHTML = greet("web");
