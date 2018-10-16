"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_1 = __importDefault(require("koa"));
const koa_router_1 = __importDefault(require("koa-router"));
const koa_body_1 = __importDefault(require("koa-body"));
const koa_static_1 = __importDefault(require("koa-static"));
const port = 8080;
const app = new koa_1.default();
const router = new koa_router_1.default();
var currentPath = process.cwd(); // (this is the directory of the server, NOT any running script)
app.use(async (ctx, next) => {
    // Log the request to the console
    console.log('Server Path:', currentPath);
    console.log('Current Module:', __filename);
    console.log('Current Module Path:', __dirname);
    console.log('Url:', ctx.url);
    // Pass the request to the next middleware function
    await next();
});
app.use(koa_static_1.default("templates", { defer: false }));
// app.use(koaBody());
// app.use(async ctx => {
// });
router.post('/users', koa_body_1.default(), (ctx) => {
    console.log(ctx.request.body);
    // => POST body
    ctx.body = `Request Body: ${JSON.stringify(ctx.request.body)}`;
});
app.use(router.routes());
// app.use(async (ctx, next) => {
//     // Log the request to the console
//     console.log('404');
//     ctx.body = "The URL is not valid.";
//     ctx.status = 404;
// });
app.listen(port);
console.log(`Server running on port ${port}`);
//# sourceMappingURL=index.js.map