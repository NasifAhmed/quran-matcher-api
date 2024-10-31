export default function promptOptimizer(prompt: string) {
    //Remove unnecessary whitespace
    let optimizedPrompt = prompt.trim().replace(/\s+/g, " ");

    //Normalize text
    optimizedPrompt = optimizedPrompt.toLowerCase();

    //Remove special characters
    optimizedPrompt = optimizedPrompt.replace(/[^a-zA-Z0-9\s]/g, "");

    //Remove stop words (example list of stop words)
    const stopWords = [
        "a",
        "an",
        "the",
        "and",
        "or",
        "but",
        "if",
        "then",
        "else",
    ];
    optimizedPrompt = optimizedPrompt
        .split(" ")
        .filter((word) => !stopWords.includes(word))
        .join(" ");

    return optimizedPrompt;
}
