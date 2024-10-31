import { Hono } from "hono";
const router = new Hono();

router.get("/", (c) => {
    return c.json({
        success: true,
        message: "Hello Hono !",
    });
});

router.post("/search", async (c) => {
    const body = await c.req.json();
    return c.text(JSON.stringify(body));
});

// Test error
router.get("/error", (c) => {
    throw new Error("This is an error");
});

export default router;
