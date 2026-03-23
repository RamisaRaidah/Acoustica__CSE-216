const GENRE_COLORS = [
    "linear-gradient(140deg, #9c6fe4 0%, #6a1fc2 55%, #35007a 100%)",
    "linear-gradient(140deg, #26d0ce 0%, #1a73e8 55%, #0a2fa8 100%)",
    "linear-gradient(140deg, #f7971e 0%, #d45000 55%, #7a2500 100%)",
    "linear-gradient(140deg, #48cae4 0%, #1565c0 55%, #062d6e 100%)",
    "linear-gradient(140deg, #f953c6 0%, #b91d73 55%, #620035 100%)",
    "linear-gradient(140deg, #56ab2f 0%, #2e7d32 55%, #0f3d12 100%)",
    "linear-gradient(140deg, #c9a227 0%, #8d6200 55%, #4a3200 100%)",
    "linear-gradient(140deg, #43e9e0 0%, #0097a7 55%, #004d55 100%)",
    "linear-gradient(140deg, #c471ed 0%, #8b2fc9 55%, #4a0d7a 100%)",
    "linear-gradient(140deg, #f85032 0%, #c0392b 55%, #6a0000 100%)",
    "linear-gradient(140deg, #f9d423 0%, #e0a000 55%, #7a5200 100%)",
    "linear-gradient(140deg, #2193b0 0%, #1565c0 55%, #062d6e 100%)",
    "linear-gradient(140deg, #11998e 0%, #007a63 55%, #003d32 100%)",
    "linear-gradient(140deg, #f46b45 0%, #d84315 55%, #7a1800 100%)",
    "linear-gradient(140deg, #a855f7 0%, #6d28d9 55%, #2e0d8a 100%)",
    "linear-gradient(140deg, #52fa8a 0%, #20bf55 55%, #0a6e2c 100%)",
    "linear-gradient(140deg, #4a4a8a 0%, #1a1a5e 55%, #0a0a30 100%)",
    "linear-gradient(140deg, #ff6b6b 0%, #c0392b 55%, #7b1010 100%)",
    "linear-gradient(140deg, #43e9e0 0%, #00b894 55%, #005c47 100%)",
    "linear-gradient(140deg, #74b9ff 0%, #2d6fd6 55%, #0c2e6b 100%)",
];

const MOOD_COLORS = [
    "linear-gradient(140deg, #ff6b6b 0%, #d63031 60%, #7b0000 100%)",
    "linear-gradient(140deg, #74b9ff 0%, #2980b9 60%, #0c3d6b 100%)",
    "linear-gradient(140deg, #ffeaa7 0%, #fdcb6e 55%, #b87800 100%)",
    "linear-gradient(140deg, #55efc4 0%, #00b894 55%, #005c47 100%)",
    "linear-gradient(140deg, #d7aefb 0%, #9c27b0 55%, #4a0060 100%)",
    "linear-gradient(140deg, #ffb347 0%, #e67e22 55%, #8c3d00 100%)",
    "linear-gradient(140deg, #43e9e0 0%, #00cec9 55%, #006663 100%)",
    "linear-gradient(140deg, #ff8fab 0%, #fd79a8 45%, #b5006b 100%)",
    "linear-gradient(140deg, #a4b0be 0%, #57606f 55%, #2d3436 100%)",
    "linear-gradient(140deg, #a29bfe 0%, #6c5ce7 55%, #2d1f8a 100%)",
    "linear-gradient(140deg, #fda7df 0%, #e84393 55%, #8c0045 100%)",
    "linear-gradient(140deg, #00b894 0%, #009875 55%, #004d3a 100%)",
    "linear-gradient(140deg, #e17055 0%, #c0392b 55%, #6a0f00 100%)",
    "linear-gradient(140deg, #74b9ff 0%, #0984e3 55%, #033d6e 100%)",
    "linear-gradient(140deg, #55efc4 0%, #00b894 55%, #005c47 100%)",
    "linear-gradient(140deg, #ffeaa7 0%, #f9ca24 55%, #8a6200 100%)",
    "linear-gradient(140deg, #fd79a8 0%, #e84393 55%, #8c0045 100%)",
    "linear-gradient(140deg, #6c5ce7 0%, #4834d4 55%, #1e0a8a 100%)",
    "linear-gradient(140deg, #ff7675 0%, #d63031 55%, #7b0000 100%)",
    "linear-gradient(140deg, #00cec9 0%, #00b4b0 55%, #005e5c 100%)",
];

const LANGUAGE_COLORS = [
    "linear-gradient(140deg, #ff6b6b 0%, #c0392b 60%, #7b1010 100%)",
    "linear-gradient(140deg, #48cae4 0%, #1e90ff 55%, #0a3fa8 100%)",
    "linear-gradient(140deg, #52fa8a 0%, #20bf55 55%, #0a6e2c 100%)",
    "linear-gradient(140deg, #c77dff 0%, #8b2fc9 55%, #4a0d7a 100%)",
    "linear-gradient(140deg, #ffb347 0%, #e07b2a 55%, #8c3d00 100%)",
    "linear-gradient(140deg, #43e9e0 0%, #00b4b0 55%, #005e5c 100%)",
    "linear-gradient(140deg, #ffd166 0%, #f0a500 55%, #8a5a00 100%)",
    "linear-gradient(140deg, #74b9ff 0%, #2d6fd6 55%, #0c2e6b 100%)",
    "linear-gradient(140deg, #ff8fab 0%, #e0195f 55%, #870030 100%)",
    "linear-gradient(140deg, #55efc4 0%, #00b48a 55%, #005c46 100%)",
    "linear-gradient(140deg, #fdcb6e 0%, #e0a000 55%, #7a5200 100%)",
    "linear-gradient(140deg, #b2bec3 0%, #636e72 55%, #2d3436 100%)",
    "linear-gradient(140deg, #e040fb 0%, #9c00d4 55%, #500070 100%)",
    "linear-gradient(140deg, #18dcff 0%, #0097bf 55%, #004d63 100%)",
    "linear-gradient(140deg, #ff7043 0%, #d84315 55%, #7a1800 100%)",
    "linear-gradient(140deg, #69f0ae 0%, #00b248 55%, #005c26 100%)",
    "linear-gradient(140deg, #f48fb1 0%, #c2185b 55%, #6a0030 100%)",
    "linear-gradient(140deg, #42a5f5 0%, #1565c0 55%, #062d6e 100%)",
    "linear-gradient(140deg, #ef5350 0%, #b71c1c 55%, #620000 100%)",
    "linear-gradient(140deg, #9ccc65 0%, #558b2f 55%, #224d0e 100%)",
];

const INSTRUMENT_COLORS = [
    "linear-gradient(140deg, #48cae4 0%, #1e90ff 55%, #0a3fa8 100%)",
    "linear-gradient(140deg, #ff7043 0%, #e64a19 55%, #7a1800 100%)",
    "linear-gradient(140deg, #66bb6a 0%, #2e7d32 55%, #0f3d12 100%)",
    "linear-gradient(140deg, #ffd54f 0%, #f9a825 55%, #7a5000 100%)",
    "linear-gradient(140deg, #f06292 0%, #c2185b 55%, #6a0030 100%)",
    "linear-gradient(140deg, #26c6da 0%, #00838f 55%, #004d55 100%)",
    "linear-gradient(140deg, #ab47bc 0%, #7b1fa2 55%, #400060 100%)",
    "linear-gradient(140deg, #ef5350 0%, #c62828 55%, #620000 100%)",
    "linear-gradient(140deg, #26a69a 0%, #00796b 55%, #003d36 100%)",
    "linear-gradient(140deg, #ffa726 0%, #e65100 55%, #7a2500 100%)",
    "linear-gradient(140deg, #42a5f5 0%, #1565c0 55%, #062d6e 100%)",
    "linear-gradient(140deg, #ec407a 0%, #ad1457 55%, #5c0030 100%)",
    "linear-gradient(140deg, #26c6da 0%, #0097a7 55%, #004d55 100%)",
    "linear-gradient(140deg, #ffca28 0%, #f57f17 55%, #7a3a00 100%)",
    "linear-gradient(140deg, #7e57c2 0%, #4527a0 55%, #1a0060 100%)",
    "linear-gradient(140deg, #66bb6a 0%, #388e3c 55%, #1a4d1c 100%)",
    "linear-gradient(140deg, #ef5350 0%, #b71c1c 55%, #620000 100%)",
    "linear-gradient(140deg, #29b6f6 0%, #0277bd 55%, #01406b 100%)",
    "linear-gradient(140deg, #ffa040 0%, #e65100 55%, #7a2500 100%)",
    "linear-gradient(140deg, #26c6da 0%, #00838f 55%, #004d55 100%)",
];

import ExploreProfile, { ExploreProfileConfig } from '@/pages/music/explore/explore_profiles/ExploreProfile';
import { getGenres, getGenreTrendingSongs, getGenrePopularSongs, getGenreMySongs } from '@/services/analytics_service/analytics';
import { getMoods, getMoodTrendingSongs, getMoodPopularSongs, getMoodMySongs } from '@/services/analytics_service/analytics';
import { getLanguages, getLanguageTrendingSongs, getLanguagePopularSongs, getLanguageMySongs } from '@/services/analytics_service/analytics';
import { getInstruments, getInstrumentTrendingSongs, getInstrumentPopularSongs, getInstrumentMySongs } from '@/services/analytics_service/analytics';

const genreConfig: ExploreProfileConfig = {
    paramKey: "genre_name",
    categoryLabel: "GENRE",
    getItems: () => getGenres().then(g => g.map(x => ({ id: x.genre_id, name: x.genre_name }))),
    getTrending: getGenreTrendingSongs,
    getPopular: getGenrePopularSongs,
    getMySongs: getGenreMySongs,
    getColor: (i: number) => GENRE_COLORS[i % GENRE_COLORS.length],
};

export function GenreProfile() {
    return <ExploreProfile config={genreConfig} />;
}

const moodConfig: ExploreProfileConfig = {
    paramKey: "mood_name",
    categoryLabel: "MOOD",
    getItems: () => getMoods().then(m => m.map(x => ({ id: x.mood_id, name: x.mood_name }))),
    getTrending: getMoodTrendingSongs,
    getPopular: getMoodPopularSongs,
    getMySongs: getMoodMySongs,
    getColor: (i: number) => MOOD_COLORS[i % MOOD_COLORS.length],
};

export function MoodProfile() {
    return <ExploreProfile config={moodConfig} />;
}

const languageConfig: ExploreProfileConfig = {
    paramKey: "language_name",
    categoryLabel: "LANGUAGE",
    getItems: () => getLanguages().then(l => l.map(x => ({ id: x.language_id, name: x.language_name }))),
    getTrending: getLanguageTrendingSongs,
    getPopular: getLanguagePopularSongs,
    getMySongs: getLanguageMySongs,
    getColor: (i: number) => LANGUAGE_COLORS[i % LANGUAGE_COLORS.length],
};

export function LanguageProfile() {
    return <ExploreProfile config={languageConfig} />;
}

const instrumentConfig: ExploreProfileConfig = {
    paramKey: "instrument_name",
    categoryLabel: "INSTRUMENT",
    getItems: () => getInstruments().then(i => i.map(x => ({ id: x.instrument_id, name: x.instrument_name }))),
    getTrending: getInstrumentTrendingSongs,
    getPopular: getInstrumentPopularSongs,
    getMySongs: getInstrumentMySongs,
    getColor: (i: number) => INSTRUMENT_COLORS[i % INSTRUMENT_COLORS.length],
};

export function InstrumentProfile() {
    return <ExploreProfile config={instrumentConfig} />;
}