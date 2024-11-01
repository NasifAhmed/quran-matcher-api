import { Hono } from "hono";
import { cors } from "hono/cors";
import routes from "./routes/v1/routes";

const app = new Hono<{ Bindings: CloudflareBindings }>();

// Apply CORS middleware with options
app.use(
    "*",
    cors({
        origin: "https://quran-verse-ai.vercel.app", // Allow only your Next.js app domain
        // origin: "http://localhost:3001", // Allow only your Next.js app domain
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"],
    })
);

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

app.route("/api/v1/", routes);

export default app;
