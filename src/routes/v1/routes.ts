import { Context, Hono } from "hono";
import promptOptimizer from "../../utils/promptOptimizer";
import getQuranVerses from "../../utils/qurandotcomApi";
const router = new Hono();

router.get("/", (c) => {
    return c.json({
        success: true,
        message: "Server is running !",
    });
});

type promptBody = {
    prompt: string;
};

type payload = {
    surah_number: number;
    verse_start: number;
    verse_end: number;
    text_english: string;
    text_bangla: string;
};

type myApiResponse = {
    verses: payload[];
};

router.post("/search", async (c: any) => {
    // Get propmpt from req body
    const body: promptBody = await c.req.json();

    const optimizedPrompt = promptOptimizer(body.prompt);

    const messages = [
        {
            role: "system",
            content:
                'You are a quran reference finder api that can only reply with json no language. From prompt you are to work as a reference finder or advisor or therapist or keyword finder. Understand the prompt find its meaning or theme or thoughts or keywords or topic and then match it with quran then reply with the most relevant quran references. The order should be most relevant first to least relevant last. The format will be like this : { "0" : [ surah_number , starting_ayah_number , ending_ayah_number ] , "1" : [ surah_number , starting_ayah_number , ending_ayah_number ] ... } . The ayah range should be short and relevant. Just the json no other response.',
        },
        {
            role: "user",
            content: optimizedPrompt,
        },
    ];
    const apiReply = await c.env.AI.run("@cf/meta/llama-3.1-70b-instruct", {
        messages,
        temperature: 0,
    });
    const parsedResponse = await JSON.parse(apiReply.response);

    let myApiResponse: myApiResponse = {
        verses: [],
    };
    for (let x in parsedResponse) {
        // console.log(parsedResponse[x]);
        const verse = await getQuranVerses({
            surahNumber: parsedResponse[x][0],
            startVerse: parsedResponse[x][1],
            endVerse: parsedResponse[x][2],
        });
        myApiResponse.verses.push(verse);
        // console.log(verse);
    }

    return c.json(myApiResponse);
});

// Test error
router.get("/error", (c) => {
    throw new Error("This is an error");
});

export default router;
