"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_1 = __importDefault(require("koa"));
const koa_router_1 = __importDefault(require("koa-router"));
const port = 8080;
const app = new koa_1.default();
app.use(async (ctx, next) => {
    // Log the request to the console
    console.log('Url:', ctx.url);
    // Pass the request to the next middleware function
    await next();
});
const router = new koa_router_1.default();
router.get('/*', async (ctx) => {
    ctx.body = 'Hello World!';
});
app.use(router.routes());
app.listen(port);
console.log(`Server running on port ${port}`);
//# sourceMappingURL=index.js.map