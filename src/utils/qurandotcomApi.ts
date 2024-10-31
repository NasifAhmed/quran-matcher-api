type QuranAPIResponse = {
    verse: {
        id: number;
        verse_number: number;
        verse_key: string;
        hizb_number: number;
        rub_el_hizb_number: number;
        ruku_number: number;
        manzil_number: number;
        sajdah_number: number;
        page_number: number;
        juz_number: number;
        translations: [
            {
                id: number;
                resource_id: number;
                text: string;
            }
        ];
    };
};

type Payload = {
    surah_number: number;
    verse_start: number;
    verse_end: number;
    text: string;
};

type GetVersesParams = {
    surahNumber: number;
    startVerse: number;
    endVerse: number;
};

type CleanTranslationParams = {
    text: string;
    removeFootnotes?: boolean;
    removeSquareBrackets?: boolean;
};

function cleanTranslationText({
    text,
    removeFootnotes = true,
    removeSquareBrackets = false,
}: CleanTranslationParams): string {
    let cleaned = text;

    // Remove footnotes
    if (removeFootnotes) {
        cleaned = cleaned.replace(/<sup.*?<\/sup>/g, "");
    }

    // Remove square brackets content if requested
    if (removeSquareBrackets) {
        cleaned = cleaned.replace(/\[.*?\]/g, "");
    }

    // Clean extra spaces
    cleaned = cleaned.replace(/\s+/g, " ").trim();

    return cleaned;
}
const getSingleVerse = async (surah: number, verse: number) => {
    const response = await fetch(
        `https://api.quran.com/api/v4/verses/by_key/${surah}:${verse}?translations=20`
    );

    if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
    }
    const data: QuranAPIResponse = await response.json();
    return data.verse.translations[0].text;
};

async function getQuranVerses({
    surahNumber,
    startVerse,
    endVerse,
}: GetVersesParams): Promise<Payload> {
    try {
        if (surahNumber < 1 || surahNumber > 114) {
            throw new Error("Invalid surah number");
        }
        if (startVerse < 1 || endVerse < startVerse) {
            throw new Error("Invalid verse range");
        }

        let translationText = "";
        if (endVerse == startVerse) {
            translationText = cleanTranslationText({
                text: await getSingleVerse(surahNumber, startVerse),
            });
        } else {
            let combinedText = "";
            for (let i = startVerse; i <= endVerse; i++) {
                combinedText = `${combinedText}${
                    combinedText != "" ? "." : ""
                } ${await getSingleVerse(surahNumber, i)}`;
            }
            translationText = cleanTranslationText({
                text: combinedText,
            });
        }

        return {
            surah_number: surahNumber,
            verse_start: startVerse,
            verse_end: endVerse,
            text: translationText,
        };
    } catch (error) {
        console.error("Error fetching Quran verses:", error);
        throw error;
    }
}

export default getQuranVerses;
