import "./index.css";
import { greet } from "../lib";

const app = document.querySelector<HTMLDivElement>("#app");
if (app) app.innerHTML = greet("web");
