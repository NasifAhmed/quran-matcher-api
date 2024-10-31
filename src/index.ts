import { Hono } from "hono";
import routes from "./routes/v1/routes";

const app = new Hono<{ Bindings: CloudflareBindings }>();

// Call Global Error Handler
app.onError((error, c) => {
    console.error(error.stack);
    return c.json(
        {
            succes: false,
            message: "Internal Server Error",
            error: error.message,
        },
        500
    );
});
// Call Global NotFound Handler
app.notFound((c) => {
    return c.json(
        {
            succes: false,
            message: "Not Found",
        },
        404
    );
});

app.basePath("/api/v1/").route("/", routes);

export default app;
