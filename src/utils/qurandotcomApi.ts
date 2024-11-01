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
        translations: {
            id: number;
            resource_id: number;
            text: string;
        }[];
    };
};

type Payload = {
    surah_number: number;
    verse_start: number;
    verse_end: number;
    text_english: string;
    text_bangla: string;
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
        `https://api.quran.com/api/v4/verses/by_key/${surah}:${verse}?translations=20,163`
    );

    if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
    }
    const data: QuranAPIResponse = await response.json();
    return {
        verse_english: data.verse.translations[0].text,
        verse_bangla: data.verse.translations[1].text,
    };
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

        let translationText: { verse_english: string; verse_bangla: string } = {
            verse_english: "",
            verse_bangla: "",
        };
        if (endVerse == startVerse) {
            translationText = await getSingleVerse(surahNumber, startVerse);

            translationText.verse_english = cleanTranslationText({
                text: translationText.verse_english,
            });
            translationText.verse_bangla = cleanTranslationText({
                text: translationText.verse_bangla,
            });
        } else {
            const versePromises = [];
            for (let i = startVerse; i <= endVerse; i++) {
                versePromises.push(getSingleVerse(surahNumber, i));
            }

            const verses = await Promise.all(versePromises);

            const combinedTextEnglish = verses
                .map((verse) => verse.verse_english)
                .join(". ");
            const combinedTextBangla = verses
                .map((verse) => verse.verse_bangla)
                .join("। ");

            translationText.verse_english = cleanTranslationText({
                text: combinedTextEnglish,
            });
            translationText.verse_bangla = cleanTranslationText({
                text: combinedTextBangla,
            });
        }

        return {
            surah_number: surahNumber,
            verse_start: startVerse,
            verse_end: endVerse,
            text_english: translationText.verse_english,
            text_bangla: translationText.verse_bangla,
        };
    } catch (error) {
        console.error("Error fetching Quran verses:", error);
        throw error;
    }
}

export default getQuranVerses;
