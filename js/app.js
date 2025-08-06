import { ProductManager } from "./managers/ProductManager.js";
import { UIController } from "./controllers/UIController.js";

document.addEventListener('DOMContentLoaded', () => {
    const productManager = ProductManager.getInstance();
    new UIController(productManager);
});
