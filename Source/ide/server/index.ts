import Koa from 'koa';
import Router from 'koa-router';
import koaBody from 'koa-body';
import staticServer from 'koa-static';
import { XMLHttpRequest } from 'xmlhttprequest-ts';

const port = 8080;
const app = new Koa();
const router = new Router();
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

app.use(staticServer("../", { defer: false }));
app.use(staticServer("../../../node_modules/", { defer: false }));

// app.use(koaBody());

// app.use(async ctx => {
// });

router.post('/users', koaBody(),
    (ctx) => {
        console.log(ctx.request.body);
        // => POST body
        ctx.body = `Request Body: ${JSON.stringify(ctx.request.body)}`;
    }
);

app.use(router.routes());

// app.use(async (ctx, next) => {
//     // Log the request to the console
//     console.log('404');
//     ctx.body = "The URL is not valid.";
//     ctx.status = 404;
// });

app.listen(port);

console.log(`Server running on port ${port}`);