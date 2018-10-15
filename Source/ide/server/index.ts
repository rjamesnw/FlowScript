import Koa from 'koa';
import Router from 'koa-router';

const port = 8080;
const app = new Koa();

app.use(async (ctx, next) => {
    // Log the request to the console
    console.log('Url:', ctx.url);
    // Pass the request to the next middleware function
    await next();
});

const router = new Router();
router.get('/*', async (ctx) => {
    ctx.body = 'Hello World!';
});

app.use(router.routes());

app.listen(port);

console.log(`Server running on port ${port}`);