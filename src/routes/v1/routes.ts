import { Hono } from "hono";
const router = new Hono();

router.get("/", (c) => {
    return c.json({
        success: true,
        message: "Hello Hono !",
    });
});

// Test error
router.get("/error", (c) => {
    throw new Error("This is an error");
});

export default router;
