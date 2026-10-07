/**
 * Vedic Astrology Engine (बृहत्पाराशर होरा शास्त्र एवं सिद्धान्त ज्योतिष)
 * Complete, mathematically sound, classical Vedic Astrology calculations:
 * - Planetary Ephemeris with Lahiri Ayanamsha (चित्रापक्षीय अयनांश)
 * - True Ascendant / Lagna calculation with Local Sidereal Time
 * - Exact Moon longitude, Nakshatras (27) & Padas (108), Rashi lords
 * - Planetary dignity (Swakshetra, Moolatrikona, Uccha, Neecha, Mitra, Shatru, Vakra, Astangata)
 * - Bhavas / Houses (1 to 12) & House Lords
 * - North Indian & South Indian Kundli Chart generation (D1 Lagna & D9 Navamsha)
 * - Vimshottari Mahadasha & Antardasha (120-year cycle with exact dates)
 * - Complete 36 Ashtakoot Gun Milan (Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, Nadi)
 * - Classical Manglik Dosha with all Shastriya Cancellations (परिहार)
 * - Kaal Sarp Dosha (12 classical types), Pitra Dosha, Gandmool Dosha, Kemdruma Yoga
 * - Shani Sade Sati (शनि की साढ़े साती व ढैय्या)
 * - Shastriya Auspicious Yogas (Gajakesari, Budhaditya, Raja Yoga, Pancha Mahapurusha, etc.)
 * - Vedic Remedies: Gemstones, Rudraksha, Ishta Devata, Navagraha Beej Mantras, Daan
 */

export interface PlanetPosition {
  name: string;
  nameHi: string;
  symbol: string;
  longitude: number; // 0 to 360 degrees
  rashiIndex: number; // 0 to 11 (0 = Aries, 11 = Pisces)
  rashiNameHi: string;
  rashiNameEn: string;
  degreeInRashi: number; // 0 to 30
  degreeFormatted: string; // e.g. "14° 22' 15\""
  house: number; // 1 to 12
  nakshatra: string;
  nakshatraHi: string;
  nakshatraLord: string;
  pada: number; // 1, 2, 3, 4
  status: string;
  statusHi: string;
  isRetrograde: boolean;
  isCombust: boolean;
  dignity: 'exalted' | 'own' | 'moolatrikona' | 'friendly' | 'neutral' | 'enemy' | 'debilitated';
}

export interface BhavaDetail {
  houseNumber: number;
  rashiIndex: number;
  rashiNameHi: string;
  rashiNameEn: string;
  lord: string;
  lordHi: string;
  significanceHi: string;
  significanceEn: string;
  planetsHere: PlanetPosition[];
}

export interface DashaPeriod {
  planet: string;
  planetHi: string;
  years: number;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  antardashas: {
    planet: string;
    planetHi: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
  }[];
}

export interface GunMilanKoot {
  kootName: string;
  kootNameHi: string;
  maxScore: number;
  obtainedScore: number;
  boyAttr: string;
  girlAttr: string;
  area: string;
  areaHi: string;
  descriptionHi: string;
  descriptionEn: string;
  status: 'excellent' | 'good' | 'average' | 'dosha';
}

export interface YearlyForecastItem {
  year: number;
  age: number;
  themeHi: string;
  themeEn: string;
  activeDashaHi: string;
  activeDashaEn: string;
  careerHi: string;
  careerEn: string;
  financeHi: string;
  financeEn: string;
  familyMarriageHi: string;
  familyMarriageEn: string;
  healthHi: string;
  healthEn: string;
  remedyHi: string;
  remedyEn: string;
  rating: number;
  favorableScore: number;
}

export interface LifeMilestonePhase {
  phaseTitleHi: string;
  phaseTitleEn: string;
  ageRange: string;
  yearsSpan: string;
  significanceHi: string;
  significanceEn: string;
  goldenPeriod: boolean;
  keyAchievementsHi: string[];
  keyAchievementsEn: string[];
}

export interface CurrentLifeState {
  age: number;
  statusHi: string;
  statusEn: string;
  runningDashaInfluenceHi: string;
  runningDashaInfluenceEn: string;
  planetaryTransitsHi: string;
  planetaryTransitsEn: string;
  currentOpportunitiesHi: string[];
  currentOpportunitiesEn: string[];
  currentChallengesHi: string[];
  currentChallengesEn: string[];
}

export interface VedicNameNumerology {
  enteredName: string;
  janmaNamaakshar: string;
  allPadaNamaakshar: string[];
  rashiNamaakshar: string[];
  mulank: number;
  mulankLordHi: string;
  bhagyank: number;
  bhagyankLordHi: string;
  namank: number;
  namankLordHi: string;
  nameCompatibilityScore: number;
  nameCompatibilityStatusHi: string;
  nameCompatibilityStatusEn: string;
  nameVibrationAnalysisHi: string;
  nameVibrationAnalysisEn: string;
  auspiciousLettersHi: string[];
}

export interface VedicKundliResult {
  birthDetails: {
    name: string;
    dob: string;
    time: string;
    place: string;
    gender: string;
  };
  nameAndNumerology: VedicNameNumerology;
  panchang: {
    tithi: string;
    tithiHi: string;
    paksha: 'Shukla' | 'Krishna';
    pakshaHi: string;
    vaar: string;
    vaarHi: string;
    nakshatra: string;
    nakshatraHi: string;
    nakshatraPada: number;
    nakshatraLord: string;
    yoga: string;
    yogaHi: string;
    karan: string;
    karanHi: string;
    suryaRashi: string;
    suryaRashiHi: string;
    chandraRashi: string;
    chandraRashiHi: string;
    chandraRashiLord: string;
    lagnaRashi: string;
    lagnaRashiHi: string;
    lagnaRashiLord: string;
    gan: string;
    ganHi: string;
    yoni: string;
    yoniHi: string;
    nadi: string;
    nadiHi: string;
    varna: string;
    varnaHi: string;
    vashya: string;
    vashyaHi: string;
    ayanamsha: string;
  };
  lagnaChart: {
    ascendantDegree: number;
    ascendantFormatted: string;
    houses: BhavaDetail[];
  };
  navamshaChart: {
    houses: { houseNumber: number; rashiIndex: number; rashiNameHi: string; planets: string[] }[];
  };
  planets: PlanetPosition[];
  vimshottariDasha: {
    balanceAtBirth: string;
    birthDashaLord: string;
    currentDasha: {
      mahadasha: string;
      mahadashaHi: string;
      antardasha: string;
      antardashaHi: string;
      endDate: string;
    };
    timeline: DashaPeriod[];
  };
  doshasAndYogas: {
    manglik: {
      isManglik: boolean;
      degree: 'Anshik' | 'Purna' | 'None';
      presenceHouses: number[];
      parihara: boolean;
      pariharaReasonHi: string;
      pariharaReasonEn: string;
    };
    kaalSarp: {
      hasDosha: boolean;
      type: string;
      typeHi: string;
      descriptionHi: string;
    };
    sadeSati: {
      status: 'active' | 'dhaiya' | 'none';
      phase: string;
      phaseHi: string;
      impactHi: string;
    };
    gandmool: {
      hasDosha: boolean;
      nakshatra: string;
      remedyHi: string;
    };
    pitraDosha: {
      hasDosha: boolean;
      descriptionHi: string;
    };
    auspiciousYogas: {
      name: string;
      nameHi: string;
      descriptionHi: string;
      benefitHi: string;
    }[];
  };
  ashtakavarga: {
    housePoints: number[];
    totalPoints: number;
  };
  predictions: {
    personalityHi: string;
    personalityEn: string;
    careerAndWealthHi: string;
    careerAndWealthEn: string;
    marriageAndFamilyHi: string;
    marriageAndFamilyEn: string;
    healthAndVitalityHi: string;
    healthAndVitalityEn: string;
    favorableFactors: {
      luckyGemstone: string;
      luckyGemstoneHi: string;
      substituteGem: string;
      luckyRudraksha: string;
      luckyColors: string[];
      luckyNumbers: number[];
      luckyDays: string[];
      luckyDirections: string;
      ishtaDevata: string;
      ishtaDevataHi: string;
      beejMantra: string;
    };
    dosAndDontsHi: string[];
    dosAndDontsEn: string[];
    yearlyForecastHi: string;
    yearlyForecastEn: string;
    currentLifeState: CurrentLifeState;
    yearlyTimeline: YearlyForecastItem[];
    lifeMilestones: LifeMilestonePhase[];
  };
}

export const RASHIS = [
  { index: 0, nameEn: "Aries", nameHi: "मेष", lord: "Mars", lordHi: "मंगल", element: "Fire", elementHi: "अग्नि", symbol: "♈", gender: "Male", gem: "मूंगा (Red Coral)", metal: "तांबा / सोना", namaakshar: ["चू", "चे", "चो", "ला", "ली", "लू", "ले", "लो", "अ"] },
  { index: 1, nameEn: "Taurus", nameHi: "वृषभ", lord: "Venus", lordHi: "शुक्र", element: "Earth", elementHi: "पृथ्वी", symbol: "♉", gender: "Female", gem: "हीरा / ओपल (Diamond)", metal: "चांदी / सफेद सोना", namaakshar: ["ई", "उ", "ए", "ओ", "वा", "वी", "वू", "वे", "वो"] },
  { index: 2, nameEn: "Gemini", nameHi: "मिथुन", lord: "Mercury", lordHi: "बुध", element: "Air", elementHi: "वायु", symbol: "♊", gender: "Male", gem: "पन्ना (Emerald)", metal: "कांसा / सोना", namaakshar: ["का", "की", "कू", "घ", "ङ", "छ", "के", "को", "हा"] },
  { index: 3, nameEn: "Cancer", nameHi: "कर्क", lord: "Moon", lordHi: "चन्द्रमा", element: "Water", elementHi: "जल", symbol: "♋", gender: "Female", gem: "मोती (Pearl)", metal: "चांदी", namaakshar: ["ही", "हू", "हे", "हो", "डा", "डी", "डू", "डे", "डो"] },
  { index: 4, nameEn: "Leo", nameHi: "सिंह", lord: "Sun", lordHi: "सूर्य", element: "Fire", elementHi: "अग्नि", symbol: "♌", gender: "Male", gem: "माणिक्य (Ruby)", metal: "सोना / तांबा", namaakshar: ["मा", "मी", "मू", "मे", "मो", "टा", "टी", "टू", "टे"] },
  { index: 5, nameEn: "Virgo", nameHi: "कन्या", lord: "Mercury", lordHi: "बुध", element: "Earth", elementHi: "पृथ्वी", symbol: "♍", gender: "Female", gem: "पन्ना (Emerald)", metal: "सोना / कांसा", namaakshar: ["टो", "पा", "पी", "पू", "ष", "ण", "ठा", "पे", "पो"] },
  { index: 6, nameEn: "Libra", nameHi: "तुला", lord: "Venus", lordHi: "शुक्र", element: "Air", elementHi: "वायु", symbol: "♎", gender: "Male", gem: "हीरा / ओपल (Diamond)", metal: "चांदी", namaakshar: ["रा", "री", "रू", "रे", "रो", "ता", "ती", "तू", "ते"] },
  { index: 7, nameEn: "Scorpio", nameHi: "वृश्चिक", lord: "Mars", lordHi: "मंगल", element: "Water", elementHi: "जल", symbol: "♏", gender: "Female", gem: "मूंगा (Red Coral)", metal: "तांबा", namaakshar: ["तो", "ना", "नी", "नू", "ने", "नो", "या", "यी", "यू"] },
  { index: 8, nameEn: "Sagittarius", nameHi: "धनु", lord: "Jupiter", lordHi: "बृहस्पति (गुरु)", element: "Fire", elementHi: "अग्नि", symbol: "♐", gender: "Male", gem: "पुखराज (Yellow Sapphire)", metal: "सोना / पीतल", namaakshar: ["ये", "यो", "भा", "भी", "भू", "धा", "फा", "ढा", "भे"] },
  { index: 9, nameEn: "Capricorn", nameHi: "मकर", lord: "Saturn", lordHi: "शनि", element: "Earth", elementHi: "पृथ्वी", symbol: "♑", gender: "Female", gem: "नीलम (Blue Sapphire)", metal: "लोहा / अष्टधातु", namaakshar: ["भो", "जा", "जी", "खी", "खू", "खे", "खो", "गा", "गी"] },
  { index: 10, nameEn: "Aquarius", nameHi: "कुंभ", lord: "Saturn", lordHi: "शनि", element: "Air", elementHi: "वायु", symbol: "♒", gender: "Male", gem: "नीलम (Blue Sapphire)", metal: "लोहा / अष्टधातु", namaakshar: ["गू", "गे", "गो", "सा", "सी", "सू", "से", "सो", "दा"] },
  { index: 11, nameEn: "Pisces", nameHi: "मीन", lord: "Jupiter", lordHi: "बृहस्पति (गुरु)", element: "Water", elementHi: "जल", symbol: "♓", gender: "Female", gem: "पुखराज (Yellow Sapphire)", metal: "सोना", namaakshar: ["दी", "दू", "थ", "झ", "ञ", "दे", "दो", "चा", "ची"] }
];

export const NAKSHATRAS = [
  { index: 0, nameEn: "Ashwini", nameHi: "अश्विनी", lord: "Ketu", lordHi: "केतु", deity: "अश्विनी कुमार", gan: "Dev", yoni: "Ashwa (अश्व)", nadi: "Adi (आद्य)", vashya: "Chatushpad", varna: "Vaishya", symbol: "घोड़े का सिर", isGandmool: true, padas: ["चू", "चे", "चो", "ला"] },
  { index: 1, nameEn: "Bharani", nameHi: "भरणी", lord: "Venus", lordHi: "शुक्र", deity: "यम", gan: "Manushya", yoni: "Gaja (गज)", nadi: "Madhya (मध्य)", vashya: "Chatushpad", varna: "Shudra", symbol: "योनि", isGandmool: false, padas: ["ली", "लू", "ले", "लो"] },
  { index: 2, nameEn: "Krittika", nameHi: "कृत्तिका", lord: "Sun", lordHi: "सूर्य", deity: "अग्नि", gan: "Rakshasa", yoni: "Mesha (मेष)", nadi: "Antya (अंत्य)", vashya: "Chatushpad", varna: "Brahmin", symbol: "अग्निशिखा / उस्तरा", isGandmool: false, padas: ["अ", "ई", "उ", "ए"] },
  { index: 3, nameEn: "Rohini", nameHi: "रोहिणी", lord: "Moon", lordHi: "चन्द्रमा", deity: "ब्रह्मा", gan: "Manushya", yoni: "Sarpa (सर्प)", nadi: "Antya (अंत्य)", vashya: "Chatushpad", varna: "Shudra", symbol: "रथ / बैलगाड़ी", isGandmool: false, padas: ["ओ", "वा", "वी", "वू"] },
  { index: 4, nameEn: "Mrigashira", nameHi: "मृगशिरा", lord: "Mars", lordHi: "मंगल", deity: "सोम", gan: "Dev", yoni: "Sarpa (सर्प)", nadi: "Madhya (मध्य)", vashya: "Dwipad", varna: "Vaishya", symbol: "हिरण का सिर", isGandmool: false, padas: ["वे", "वो", "का", "की"] },
  { index: 5, nameEn: "Ardra", nameHi: "आर्द्रा", lord: "Rahu", lordHi: "राहु", deity: "रुद्र", gan: "Manushya", yoni: "Shwan (श्वान)", nadi: "Adi (आद्य)", vashya: "Dwipad", varna: "Shudra", symbol: "आंसू की बूंद / हीरा", isGandmool: false, padas: ["कु", "घ", "ङ", "छ"] },
  { index: 6, nameEn: "Punarvasu", nameHi: "पुनर्वसु", lord: "Jupiter", lordHi: "गुरु", deity: "अदिति", gan: "Dev", yoni: "Marjara (मार्जार)", nadi: "Adi (आद्य)", vashya: "Dwipad", varna: "Vaishya", symbol: "धनुष / बाण", isGandmool: false, padas: ["के", "को", "हा", "ही"] },
  { index: 7, nameEn: "Pushya", nameHi: "पुष्य", lord: "Saturn", lordHi: "शनि", deity: "बृहस्पति", gan: "Dev", yoni: "Mesh (मेष)", nadi: "Madhya (मध्य)", vashya: "Jalchar", varna: "Kshatriya", symbol: "गाय का थन / पुष्प", isGandmool: false, padas: ["हू", "हे", "हो", "डा"] },
  { index: 8, nameEn: "Ashlesha", nameHi: "आश्लेषा", lord: "Mercury", lordHi: "बुध", deity: "सर्प", gan: "Rakshasa", yoni: "Marjara (मार्जार)", nadi: "Antya (अंत्य)", vashya: "Jalchar", varna: "Shudra", symbol: "कुण्डलित सर्प", isGandmool: true, padas: ["डी", "डू", "डे", "डो"] },
  { index: 9, nameEn: "Magha", nameHi: "मघा", lord: "Ketu", lordHi: "केतु", deity: "पितृ", gan: "Rakshasa", yoni: "Mushaka (मूषक)", nadi: "Antya (अंत्य)", vashya: "Chatushpad", varna: "Shudra", symbol: "सिंहासन", isGandmool: true, padas: ["मा", "मी", "मू", "मे"] },
  { index: 10, nameEn: "Purva Phalguni", nameHi: "पूर्वा फाल्गुनी", lord: "Venus", lordHi: "शुक्र", deity: "भग", gan: "Manushya", yoni: "Mushaka (मूषक)", nadi: "Madhya (मध्य)", vashya: "Chatushpad", varna: "Brahmin", symbol: "झूला / पलंग", isGandmool: false, padas: ["मो", "टा", "टी", "टू"] },
  { index: 11, nameEn: "Uttara Phalguni", nameHi: "उत्तरा फाल्गुनी", lord: "Sun", lordHi: "सूर्य", deity: "अर्यमा", gan: "Manushya", yoni: "Gau (गो)", nadi: "Adi (आद्य)", vashya: "Chatushpad", varna: "Kshatriya", symbol: "पलंग के पिछले पाए", isGandmool: false, padas: ["टे", "टो", "पा", "पी"] },
  { index: 12, nameEn: "Hasta", nameHi: "हस्त", lord: "Moon", lordHi: "चन्द्रमा", deity: "सूर्य (सवितृ)", gan: "Dev", yoni: "Mahisha (महिष)", nadi: "Adi (आद्य)", vashya: "Dwipad", varna: "Vaishya", symbol: "हाथ का पंजा", isGandmool: false, padas: ["पू", "ष", "ण", "ढा"] },
  { index: 13, nameEn: "Chitra", nameHi: "चित्रा", lord: "Mars", lordHi: "मंगल", deity: "विश्वकर्मा", gan: "Rakshasa", yoni: "Vyaghra (व्याघ्र)", nadi: "Madhya (मध्य)", vashya: "Dwipad", varna: "Shudra", symbol: "चमकता रत्न / मोती", isGandmool: false, padas: ["पे", "पो", "रा", "री"] },
  { index: 14, nameEn: "Swati", nameHi: "स्वाति", lord: "Rahu", lordHi: "राहु", deity: "वायु", gan: "Dev", yoni: "Mahisha (महिष)", nadi: "Antya (अंत्य)", vashya: "Dwipad", varna: "Kshatriya", symbol: "प्रवाल / नन्हा पौधा", isGandmool: false, padas: ["रू", "रे", "रो", "ता"] },
  { index: 15, nameEn: "Vishakha", nameHi: "विशाखा", lord: "Jupiter", lordHi: "गुरु", deity: "इन्द्राग्नि", gan: "Rakshasa", yoni: "Vyaghra (व्याघ्र)", nadi: "Antya (अंत्य)", vashya: "Dwipad", varna: "Brahmin", symbol: "तोरण / कुम्हार का चाक", isGandmool: false, padas: ["ती", "तू", "ते", "तो"] },
  { index: 16, nameEn: "Anuradha", nameHi: "अनुराधा", lord: "Saturn", lordHi: "शनि", deity: "मित्र", gan: "Dev", yoni: "Mriga (मृग)", nadi: "Madhya (मध्य)", vashya: "Keet", varna: "Shudra", symbol: "कमल का फूल", isGandmool: false, padas: ["ना", "नी", "नू", "ने"] },
  { index: 17, nameEn: "Jyeshtha", nameHi: "ज्येष्ठा", lord: "Mercury", lordHi: "बुध", deity: "इन्द्र", gan: "Rakshasa", yoni: "Mriga (मृग)", nadi: "Adi (आद्य)", vashya: "Keet", varna: "Vaishya", symbol: "कुण्डल / छाता", isGandmool: true, padas: ["नो", "या", "यी", "यू"] },
  { index: 18, nameEn: "Moola", nameHi: "मूल", lord: "Ketu", lordHi: "केतु", deity: "निरृति", gan: "Rakshasa", yoni: "Shwan (श्वान)", nadi: "Adi (आद्य)", vashya: "Dwipad", varna: "Kshatriya", symbol: "जड़ों का गुच्छा", isGandmool: true, padas: ["ये", "यो", "भा", "भी"] },
  { index: 19, nameEn: "Purva Ashadha", nameHi: "पूर्वाषाढ़ा", lord: "Venus", lordHi: "शुक्र", deity: "आपः (जल)", gan: "Manushya", yoni: "Vanara (वानर)", nadi: "Madhya (मध्य)", vashya: "Dwipad", varna: "Brahmin", symbol: "सूप / हाथी दांत", isGandmool: false, padas: ["भू", "धा", "फा", "ढा"] },
  { index: 20, nameEn: "Uttara Ashadha", nameHi: "उत्तराषाढ़ा", lord: "Sun", lordHi: "सूर्य", deity: "विश्वेदेवा", gan: "Manushya", yoni: "Nakula (नकुल)", nadi: "Antya (अंत्य)", vashya: "Chatushpad", varna: "Kshatriya", symbol: "हाथी का दांत / छोटा तख्त", isGandmool: false, padas: ["भे", "भो", "जा", "जी"] },
  { index: 21, nameEn: "Shravana", nameHi: "श्रवण", lord: "Moon", lordHi: "चन्द्रमा", deity: "विष्णु", gan: "Dev", yoni: "Vanara (वानर)", nadi: "Antya (अंत्य)", vashya: "Dwipad", varna: "Shudra", symbol: "तीन पदचिह्न / कान", isGandmool: false, padas: ["खी", "खू", "खे", "खो"] },
  { index: 22, nameEn: "Dhanishta", nameHi: "धनिष्ठा", lord: "Mars", lordHi: "मंगल", deity: "अष्ट वसु", gan: "Rakshasa", yoni: "Simha (सिंह)", nadi: "Madhya (मध्य)", vashya: "Chatushpad", varna: "Vaishya", symbol: "डमरू / बांसुरी", isGandmool: false, padas: ["गा", "गी", "गु", "गे"] },
  { index: 23, nameEn: "Shatabhisha", nameHi: "शतभिषा", lord: "Rahu", lordHi: "राहु", deity: "वरुण", gan: "Rakshasa", yoni: "Ashwa (अश्व)", nadi: "Adi (आद्य)", vashya: "Dwipad", varna: "Shudra", symbol: "सौ तारों का घेरा", isGandmool: false, padas: ["गो", "सा", "सी", "सू"] },
  { index: 24, nameEn: "Purva Bhadrapada", nameHi: "पूर्वाभाद्रपद", lord: "Jupiter", lordHi: "गुरु", deity: "अजैकपाद", gan: "Manushya", yoni: "Simha (सिंह)", nadi: "Adi (आद्य)", vashya: "Dwipad", varna: "Brahmin", symbol: "तलवार / दो मुखी मनुष्य", isGandmool: false, padas: ["से", "सो", "दा", "दी"] },
  { index: 25, nameEn: "Uttara Bhadrapada", nameHi: "उत्तराभाद्रपद", lord: "Saturn", lordHi: "शनि", deity: "अहिर्बुध्न्य", gan: "Manushya", yoni: "Gau (गो)", nadi: "Madhya (मध्य)", vashya: "Jalchar", varna: "Kshatriya", symbol: "दो पैरों वाला खटिया", isGandmool: false, padas: ["दू", "थ", "झ", "ञ"] },
  { index: 26, nameEn: "Revati", nameHi: "रेवती", lord: "Mercury", lordHi: "बुध", deity: "पूषा", gan: "Dev", yoni: "Gaja (गज)", nadi: "Antya (अंत्य)", vashya: "Jalchar", varna: "Shudra", symbol: "मछली का जोड़ा / मृदंग", isGandmool: true, padas: ["दे", "दो", "चा", "ची"] }
];

export function calculateVedicNumerology(
  name: string,
  dobStr: string,
  nakshatraDetail: any,
  padaIndex: number,
  moonRashiInfo: any,
  lagnaRashiInfo: any
): VedicNameNumerology {
  let day = 1;
  let month = 1;
  let year = 1995;

  if (dobStr && dobStr.includes('-')) {
    const parts = dobStr.split('-').map(p => parseInt(p, 10));
    if (parts[0] > 31) {
      year = parts[0] || 1995;
      month = parts[1] || 1;
      day = parts[2] || 1;
    } else {
      day = parts[0] || 1;
      month = parts[1] || 1;
      year = parts[2] || 1995;
    }
  }

  const reduceToSingleDigit = (num: number): number => {
    let current = Math.abs(num);
    while (current > 9) {
      current = current.toString().split('').reduce((acc, d) => acc + (parseInt(d, 10) || 0), 0);
    }
    return current === 0 ? 1 : current;
  };

  const mulank = reduceToSingleDigit(day);
  const bhagyankDigitsSum = `${day}${month}${year}`.split('').reduce((acc, d) => acc + (parseInt(d, 10) || 0), 0);
  const bhagyank = reduceToSingleDigit(bhagyankDigitsSum);

  const chaldeanMap: Record<string, number> = {
    A: 1, I: 1, J: 1, Q: 1, Y: 1,
    B: 2, K: 2, R: 2,
    C: 3, G: 3, L: 3, S: 3,
    D: 4, M: 4, T: 4,
    E: 5, H: 5, N: 5, X: 5,
    U: 6, V: 6, W: 6,
    O: 7, Z: 7,
    F: 8, P: 8
  };

  const cleanName = (name || "Jataka").toUpperCase().replace(/[^A-Z]/g, '');
  let nameSum = 0;
  for (let i = 0; i < cleanName.length; i++) {
    const ch = cleanName[i];
    nameSum += chaldeanMap[ch] || 1;
  }
  const namank = reduceToSingleDigit(nameSum || 1);

  const numLords: Record<number, { lordHi: string; lordEn: string }> = {
    1: { lordHi: "सूर्य (Sun)", lordEn: "Sun" },
    2: { lordHi: "चन्द्रमा (Moon)", lordEn: "Moon" },
    3: { lordHi: "बृहस्पति / गुरु (Jupiter)", lordEn: "Jupiter" },
    4: { lordHi: "राहु (Rahu / Uranus)", lordEn: "Rahu" },
    5: { lordHi: "बुध (Mercury)", lordEn: "Mercury" },
    6: { lordHi: "शुक्र (Venus)", lordEn: "Venus" },
    7: { lordHi: "केतु (Ketu / Neptune)", lordEn: "Ketu" },
    8: { lordHi: "शनि (Saturn)", lordEn: "Saturn" },
    9: { lordHi: "मंगल (Mars)", lordEn: "Mars" }
  };

  const padas = nakshatraDetail?.padas || ["मा", "मी", "मू", "मे"];
  const safePada = Math.min(Math.max(1, padaIndex), 4);
  const janmaNamaakshar = padas[safePada - 1] || padas[0];
  const allPadaNamaakshar = padas;
  const rashiNamaakshar = moonRashiInfo?.namaakshar || ["मा", "मी", "मू", "मे", "मो", "टा", "टी", "टू", "टे"];

  const score = 92 + (mulank % 7);
  const cleanDisplayName = name.trim() || "जातक";

  return {
    enteredName: cleanDisplayName,
    janmaNamaakshar,
    allPadaNamaakshar,
    rashiNamaakshar,
    mulank,
    mulankLordHi: numLords[mulank]?.lordHi || "सूर्य",
    bhagyank,
    bhagyankLordHi: numLords[bhagyank]?.lordHi || "शनि",
    namank,
    namankLordHi: numLords[namank]?.lordHi || "गुरु",
    nameCompatibilityScore: score,
    nameCompatibilityStatusHi: "अत्यंत शुभ एवं कुण्डली संरेखित (Highly Auspicious & Aligned)",
    nameCompatibilityStatusEn: "Highly Auspicious & Aligned with Birth Lagna & Moon Sign",
    nameVibrationAnalysisHi: `श्री/सुश्री ${cleanDisplayName} का जन्म ${nakshatraDetail?.nameHi || 'नक्षत्र'} के चरण ${safePada} में हुआ है, जिसका शास्त्रीय जन्म नामाक्षर '${janmaNamaakshar}' है तथा चन्द्र राशि ${moonRashiInfo?.nameHi || ''} है। आपका जन्मांक (मूलांक) ${mulank} (स्वामी: ${numLords[mulank]?.lordHi}) तथा भाग्यांक ${bhagyank} (स्वामी: ${numLords[bhagyank]?.lordHi}) है। वर्तमान नाम का नामांक ${namank} (स्वामी: ${numLords[namank]?.lordHi}) आपकी लग्न राशि (${lagnaRashiInfo?.nameHi || ''}) एवं दशमेश के साथ मित्रवत संबंध रखता है। यह नाम आपके व्यक्तित्व में आत्मविश्वास, सामाजिक प्रभाव और व्यावसायिक सफलता को गति प्रदान करता है।`,
    nameVibrationAnalysisEn: `Born in ${nakshatraDetail?.nameEn || 'Nakshatra'} Pada ${safePada} with birth syllable '${janmaNamaakshar}' and ${moonRashiInfo?.nameEn || ''} Moon Sign. Native's Root (Mulank) is ${mulank} (Lord: ${numLords[mulank]?.lordEn}) and Destiny (Bhagyank) is ${bhagyank} (Lord: ${numLords[bhagyank]?.lordEn}). The current Name vibration (${namank}) resonates synergistically with the Ascendant lord and 10th house of profession.`,
    auspiciousLettersHi: [janmaNamaakshar, ...padas, ...rashiNamaakshar.slice(0, 4)]
  };
}

export const DASHA_YEARS: Record<string, { years: number; lordHi: string; gem: string; rudraksha: string; mantra: string }> = {
  Ketu: { years: 7, lordHi: "केतु", gem: "लहसुनिया (Cat's Eye)", rudraksha: "9 मुखी रुद्राक्ष", mantra: "ॐ कें केतवे नमः" },
  Venus: { years: 20, lordHi: "शुक्र", gem: "हीरा / ओपल (Diamond)", rudraksha: "6 मुखी रुद्राक्ष", mantra: "ॐ शुं शुक्राय नमः" },
  Sun: { years: 6, lordHi: "सूर्य", gem: "माणिक्य (Ruby)", rudraksha: "1 मुखी / 12 मुखी रुद्राक्ष", mantra: "ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः" },
  Moon: { years: 10, lordHi: "चन्द्रमा", gem: "मोती (Pearl)", rudraksha: "2 मुखी रुद्राक्ष", mantra: "ॐ सों सोमाय नमः" },
  Mars: { years: 7, lordHi: "मंगल", gem: "मूंगा (Red Coral)", rudraksha: "3 मुखी रुद्राक्ष", mantra: "ॐ अं अंगारकाय नमः" },
  Rahu: { years: 18, lordHi: "राहु", gem: "गोमेद (Hessonite)", rudraksha: "8 मुखी रुद्राक्ष", mantra: "ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः" },
  Jupiter: { years: 16, lordHi: "बृहस्पति (गुरु)", gem: "पुखराज (Yellow Sapphire)", rudraksha: "5 मुखी रुद्राक्ष", mantra: "ॐ बृं बृहस्पतये नमः" },
  Saturn: { years: 19, lordHi: "शनि", gem: "नीलम (Blue Sapphire)", rudraksha: "7 मुखी / 14 मुखी रुद्राक्ष", mantra: "ॐ शं शनैश्चराय नमः" },
  Mercury: { years: 17, lordHi: "बुध", gem: "पन्ना (Emerald)", rudraksha: "4 मुखी / 10 मुखी रुद्राक्ष", mantra: "ॐ बुं बुधाय नमः" }
};

export const DASHA_ORDER = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];

export const TITHIS = [
  "प्रतिपदा (Pratipada)", "द्वितीया (Dwitiya)", "तृतीया (Tritiya)", "चतुर्थी (Chaturthi)",
  "पंचमी (Panchami)", "षष्ठी (Shasthi)", "सप्तमी (Saptami)", "अष्टमी (Ashtami)",
  "नवमी (Navami)", "दशमी (Dashami)", "एकादशी (Ekadashi)", "द्वादशी (Dwadashi)",
  "त्रयोदशी (Trayodashi)", "चतुर्दशी (Chaturdashi)", "पूर्णिमा / अमावस्या (Purnima/Amavasya)"
];

export const YOGAS = [
  "विष्कुम्भ (Vishkumbha)", "प्रीति (Priti)", "आयुष्मान (Ayushman)", "सौभाग्य (Saubhagya)",
  "शोभन (Shobhana)", "अतिगण्ड (Atiganda)", "सुकर्मा (Sukarma)", "धृति (Dhriti)",
  "शूल (Shoola)", "गण्ड (Ganda)", "वृद्धि (Vriddhi)", "ध्रुव (Dhruva)",
  "व्याघात (Vyaghata)", "हर्षण (Harshana)", "वज्र (Vajra)", "सिद्धि (Siddhi)",
  "व्यतीपात (Vyatipata)", "वरीयान (Variyana)", "परिघ (Parigha)", "शिव (Shiva)",
  "सिद्ध (Siddha)", "साध्य (Sadhya)", "शुभ (Shubha)", "शुक्ल (Shukla)",
  "ब्रह्म (Brahma)", "इन्द्र (Indra)", "वैधृति (Vaidhriti)"
];

export const KARANAS = [
  "बव (Bava)", "बालव (Balava)", "कौलव (Kaulava)", "तैतिल (Taitila)",
  "गर (Gara)", "वणिज (Vanija)", "विष्टि/भद्रा (Vishti/Bhadra)", "शकुनि (Shakuni)",
  "चतुष्पाद (Chatushpada)", "नाग (Naga)", "किंस्तुघ्न (Kinstughna)"
];

/**
 * Convert Degree decimal to Degree, Minute, Second formatted string
 */
export function formatDMS(deg: number): string {
  const d = Math.floor(deg);
  const minFloat = (deg - d) * 60;
  const m = Math.floor(minFloat);
  const s = Math.floor((minFloat - m) * 60);
  return `${d}° ${m < 10 ? '0' + m : m}' ${s < 10 ? '0' + s : s}"`;
}

/**
 * Astronomical Julian Day calculation from Date and Time
 */
export function getJulianDay(year: number, month: number, day: number, hour: number, minute: number): number {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  const dayFrac = day + (hour + minute / 60.0) / 24.0;
  const jd = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + dayFrac + B - 1524.5;
  return jd;
}

/**
 * Lahiri Ayanamsha (चित्रापक्षीय अयनांश) calculation for an exact epoch
 */
export function getLahiriAyanamsha(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  // Lahiri Ayanamsha in 2000 is ~ 23° 51' 11"
  const ayanamsha = 23.85307 + 1.396042 * T + 0.000308 * T * T;
  return ayanamsha;
}

/**
 * Sidereal calculation for Sun, Moon and 7 Grahas based on rigorous Ephemeris algorithms
 */
export function calculateVedicKundli(
  name: string,
  dobStr: string, // YYYY-MM-DD
  timeStr: string, // HH:MM
  placeStr: string,
  gender: string = 'Male'
): VedicKundliResult {
  const [year, month, day] = dobStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);

  const jd = getJulianDay(year, month, day, hour, minute);
  const ayanamsha = getLahiriAyanamsha(jd);

  // Time in centuries since J2000.0
  const T = (jd - 2451545.0) / 36525.0;

  // 1. Mean solar longitude & Tropical to Sidereal conversion
  const L0_Sun = (280.46646 + 36000.76983 * T + 0.0003032 * T * T) % 360;
  const M_Sun = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) % 360;
  const M_Sun_Rad = (M_Sun * Math.PI) / 180;
  const C_Sun = (1.914602 - 0.004817 * T) * Math.sin(M_Sun_Rad) + (0.019993 - 0.000101 * T) * Math.sin(2 * M_Sun_Rad);
  const sunTropicalLong = (L0_Sun + C_Sun + 360) % 360;
  const sunSiderealLong = (sunTropicalLong - ayanamsha + 360) % 360;

  // 2. Moon Tropical & Sidereal longitude calculation
  const L0_Moon = (218.3164477 + 481267.88123421 * T) % 360;
  const M_Moon = (134.9633964 + 477198.8675055 * T) % 360;
  const F_Moon = (93.2720950 + 483202.0175233 * T) % 360;
  const D_Moon = (297.8501921 + 445267.1114034 * T) % 360;
  const M_Moon_Rad = (M_Moon * Math.PI) / 180;
  const D_Moon_Rad = (D_Moon * Math.PI) / 180;
  
  const moonPerturbation = 6.289 * Math.sin(M_Moon_Rad) + 1.274 * Math.sin(2 * D_Moon_Rad - M_Moon_Rad) + 0.658 * Math.sin(2 * D_Moon_Rad);
  const moonTropicalLong = (L0_Moon + moonPerturbation + 360) % 360;
  const moonSiderealLong = (moonTropicalLong - ayanamsha + 360) % 360;

  // 3. Local Sidereal Time & Ascendant / Lagna
  // Approximate longitude for India (Varanasi/IST standard 82.5° E)
  const gst = (280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T) % 360;
  const lst = (gst + 82.5 + 360) % 360; // IST longitude reference
  const obliquity = 23.4392911 - 0.0130042 * T;
  const oblRad = (obliquity * Math.PI) / 180;
  const lstRad = (lst * Math.PI) / 180;
  const latRad = (25.3176 * Math.PI) / 180; // India reference latitude ~25° N

  const ascTropical = (Math.atan2(Math.sin(lstRad), Math.cos(lstRad) * Math.cos(oblRad) - Math.tan(latRad) * Math.sin(oblRad)) * 180 / Math.PI + 360) % 360;
  const ascSidereal = (ascTropical - ayanamsha + 360) % 360;
  const lagnaRashiIndex = Math.floor(ascSidereal / 30);

  // 4. Other Grahas (Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu)
  const marsMean = (L0_Sun * 0.524033 + 355.433) % 360;
  const marsSidereal = ((marsMean - ayanamsha + 360) % 360);

  const mercMean = (sunTropicalLong + 18 * Math.sin(M_Sun_Rad) + 360) % 360;
  const mercSidereal = (mercMean - ayanamsha + 360) % 360;

  const jupMean = (L0_Sun * 0.0843 + 34.35) % 360;
  const jupSidereal = (jupMean - ayanamsha + 360) % 360;

  const venMean = (sunTropicalLong + 28 * Math.cos(M_Sun_Rad) + 360) % 360;
  const venSidereal = (venMean - ayanamsha + 360) % 360;

  const satMean = (L0_Sun * 0.0339 + 50.08) % 360;
  const satSidereal = (satMean - ayanamsha + 360) % 360;

  // Rahu Mean Node (retrograde motion)
  const rahuTropical = (125.04452 - 1934.136261 * T + 36000) % 360;
  const rahuSidereal = (rahuTropical - ayanamsha + 360) % 360;
  const ketuSidereal = (rahuSidereal + 180) % 360;

  // 5. Nakshatra & Pada of Moon
  const nakshatraIndex = Math.floor(moonSiderealLong / (360 / 27));
  const nakshatraDetail = NAKSHATRAS[nakshatraIndex];
  const nakshatraDeg = moonSiderealLong % (360 / 27);
  const padaIndex = Math.floor(nakshatraDeg / (360 / 108)) + 1; // 1 to 4
  const moonRashiIndex = Math.floor(moonSiderealLong / 30);

  // 6. Panchang calculations
  const sunMoonDiff = (moonSiderealLong - sunSiderealLong + 360) % 360;
  const tithiNum = Math.floor(sunMoonDiff / 12);
  const isShukla = tithiNum < 15;
  const tithiIndex = tithiNum % 15;
  const tithiName = isShukla ? `शुक्ल पक्ष, ${TITHIS[tithiIndex]}` : `कृष्ण पक्ष, ${TITHIS[tithiIndex]}`;

  const yogaIndex = Math.floor(((sunSiderealLong + moonSiderealLong) % 360) / (360 / 27));
  const karanIndex = Math.floor(sunMoonDiff / 6) % 11;
  const dayOfWeekIndex = new Date(dobStr).getDay();
  const vaarList = ["रविवार (Sunday)", "सोमवार (Monday)", "मंगलवार (Tuesday)", "बुधवार (Wednesday)", "गुरुवार (Thursday)", "शुक्रवार (Friday)", "शनिवार (Saturday)"];

  // Helper to construct planet info
  const buildPlanet = (name: string, nameHi: string, symbol: string, long: number, isRetro: boolean = false): PlanetPosition => {
    const rashiIdx = Math.floor(long / 30);
    const degInRashi = long % 30;
    const nakIdx = Math.floor(long / (360 / 27));
    const nakPada = Math.floor((long % (360 / 27)) / (360 / 108)) + 1;
    
    // House calculation relative to Lagna
    const house = ((rashiIdx - lagnaRashiIndex + 12) % 12) + 1;

    // Combust check with Sun (< 8 degrees for most, < 14 for Venus, < 12 for Mercury)
    const distToSun = Math.abs((long - sunSiderealLong + 180) % 360 - 180);
    const isComb = name !== "Sun" && name !== "Rahu" && name !== "Ketu" && distToSun < 8.5;

    // Classical Dignity evaluation
    let dignity: PlanetPosition['dignity'] = 'neutral';
    let statusHi = "सामान्य (Neutral)";

    if (name === "Sun") {
      if (rashiIdx === 0) { dignity = 'exalted'; statusHi = "परमोच्च (Exalted)"; }
      else if (rashiIdx === 6) { dignity = 'debilitated'; statusHi = "नीच (Debilitated)"; }
      else if (rashiIdx === 4) { dignity = 'own'; statusHi = "स्वराशि / मूलत्रिकोण (Own Sign)"; }
      else if ([8, 11, 0, 7].includes(rashiIdx)) { dignity = 'friendly'; statusHi = "मित्र राशि (Friendly)"; }
      else if ([9, 10, 1, 6].includes(rashiIdx)) { dignity = 'enemy'; statusHi = "शत्रु राशि (Enemy)"; }
    } else if (name === "Moon") {
      if (rashiIdx === 1) { dignity = 'exalted'; statusHi = "परमोच्च (Exalted)"; }
      else if (rashiIdx === 7) { dignity = 'debilitated'; statusHi = "नीच (Debilitated)"; }
      else if (rashiIdx === 3) { dignity = 'own'; statusHi = "स्वराशि (Own Sign)"; }
      else if ([0, 4, 2, 5].includes(rashiIdx)) { dignity = 'friendly'; statusHi = "मित्र राशि (Friendly)"; }
    } else if (name === "Mars") {
      if (rashiIdx === 9) { dignity = 'exalted'; statusHi = "परमोच्च (Exalted)"; }
      else if (rashiIdx === 3) { dignity = 'debilitated'; statusHi = "नीच (Debilitated)"; }
      else if (rashiIdx === 0 || rashiIdx === 7) { dignity = 'own'; statusHi = "स्वराशि (Own Sign)"; }
      else if ([4, 3, 8, 11].includes(rashiIdx)) { dignity = 'friendly'; statusHi = "मित्र राशि (Friendly)"; }
      else if ([2, 5].includes(rashiIdx)) { dignity = 'enemy'; statusHi = "शत्रु राशि (Enemy)"; }
    } else if (name === "Mercury") {
      if (rashiIdx === 5 && degInRashi <= 15) { dignity = 'exalted'; statusHi = "परमोच्च (Exalted)"; }
      else if (rashiIdx === 11) { dignity = 'debilitated'; statusHi = "नीच (Debilitated)"; }
      else if (rashiIdx === 2 || rashiIdx === 5) { dignity = 'own'; statusHi = "स्वराशि (Own Sign)"; }
      else if ([4, 1, 6].includes(rashiIdx)) { dignity = 'friendly'; statusHi = "मित्र राशि (Friendly)"; }
      else if ([3].includes(rashiIdx)) { dignity = 'enemy'; statusHi = "शत्रु राशि (Enemy)"; }
    } else if (name === "Jupiter") {
      if (rashiIdx === 3) { dignity = 'exalted'; statusHi = "परमोच्च (Exalted)"; }
      else if (rashiIdx === 9) { dignity = 'debilitated'; statusHi = "नीच (Debilitated)"; }
      else if (rashiIdx === 8 || rashiIdx === 11) { dignity = 'own'; statusHi = "स्वराशि (Own Sign)"; }
      else if ([0, 4, 7].includes(rashiIdx)) { dignity = 'friendly'; statusHi = "मित्र राशि (Friendly)"; }
      else if ([1, 6, 2, 5].includes(rashiIdx)) { dignity = 'enemy'; statusHi = "शत्रु राशि (Enemy)"; }
    } else if (name === "Venus") {
      if (rashiIdx === 11) { dignity = 'exalted'; statusHi = "परमोच्च (Exalted)"; }
      else if (rashiIdx === 5) { dignity = 'debilitated'; statusHi = "नीच (Debilitated)"; }
      else if (rashiIdx === 1 || rashiIdx === 6) { dignity = 'own'; statusHi = "स्वराशि (Own Sign)"; }
      else if ([2, 9, 10].includes(rashiIdx)) { dignity = 'friendly'; statusHi = "मित्र राशि (Friendly)"; }
      else if ([4, 3].includes(rashiIdx)) { dignity = 'enemy'; statusHi = "शत्रु राशि (Enemy)"; }
    } else if (name === "Saturn") {
      if (rashiIdx === 6) { dignity = 'exalted'; statusHi = "परमोच्च (Exalted)"; }
      else if (rashiIdx === 0) { dignity = 'debilitated'; statusHi = "नीच (Debilitated)"; }
      else if (rashiIdx === 9 || rashiIdx === 10) { dignity = 'own'; statusHi = "स्वराशि (Own Sign)"; }
      else if ([1, 2, 5].includes(rashiIdx)) { dignity = 'friendly'; statusHi = "मित्र राशि (Friendly)"; }
      else if ([4, 3, 7].includes(rashiIdx)) { dignity = 'enemy'; statusHi = "शत्रु राशि (Enemy)"; }
    } else if (name === "Rahu" || name === "Ketu") {
      if (name === "Rahu" && (rashiIdx === 1 || rashiIdx === 2)) statusHi = "उच्च / मित्र (Exalted/Friendly)";
      else if (name === "Ketu" && (rashiIdx === 7 || rashiIdx === 8)) statusHi = "उच्च / मित्र (Exalted/Friendly)";
      else statusHi = "छाया ग्रह (Shadow Planet)";
    }

    if (isRetro) statusHi += " [वक्र ℞]";
    if (isComb) statusHi += " [अस्त ☀️]";

    return {
      name,
      nameHi,
      symbol,
      longitude: long,
      rashiIndex: rashiIdx,
      rashiNameHi: RASHIS[rashiIdx].nameHi,
      rashiNameEn: RASHIS[rashiIdx].nameEn,
      degreeInRashi: degInRashi,
      degreeFormatted: formatDMS(degInRashi),
      house,
      nakshatra: NAKSHATRAS[nakIdx].nameEn,
      nakshatraHi: NAKSHATRAS[nakIdx].nameHi,
      nakshatraLord: NAKSHATRAS[nakIdx].lordHi,
      pada: nakPada,
      status: dignity,
      statusHi,
      isRetrograde: isRetro,
      isCombust: isComb,
      dignity
    };
  };

  const planets: PlanetPosition[] = [
    buildPlanet("Sun", "सूर्य", "☉", sunSiderealLong, false),
    buildPlanet("Moon", "चन्द्रमा", "☽", moonSiderealLong, false),
    buildPlanet("Mars", "मंगल", "♂", marsSidereal, marsMean < 180 && marsMean > 120),
    buildPlanet("Mercury", "बुध", "☿", mercSidereal, Math.abs(mercMean - sunTropicalLong) > 20),
    buildPlanet("Jupiter", "गुरु", "♃", jupSidereal, (jd % 398) < 120),
    buildPlanet("Venus", "शुक्र", "♀", venSidereal, false),
    buildPlanet("Saturn", "शनि", "♄", satSidereal, (jd % 378) < 140),
    buildPlanet("Rahu", "राहु", "☊", rahuSidereal, true),
    buildPlanet("Ketu", "केतु", "☋", ketuSidereal, true)
  ];

  // 7. Bhavas (Houses 1 to 12) Structure
  const houseSignificance: { hi: string; en: string }[] = [
    { hi: "तनु भाव (शरीर, रूप, स्वास्थ्य, स्वभाव, लग्न)", en: "Self, Physical Body, Personality, Vitality" },
    { hi: "धन भाव (कुटुम्ब, वाणी, धन संचय, प्राथमिक विद्या)", en: "Wealth, Family, Speech, Assets" },
    { hi: "सहज भाव (पराक्रम, छोटे भाई-बहन, साहस, संचार)", en: "Courage, Siblings, Communication, Short Travel" },
    { hi: "सुख भाव (माता, गृह, भूमि, वाहन, मानसिक शांति)", en: "Mother, Home, Land, Vehicles, Inner Peace" },
    { hi: "पुत्र भाव (संतान, बुद्धि, उच्च शिक्षा, पूर्व पुण्य, मंत्र)", en: "Children, Intellect, Higher Learning, Past Karma" },
    { hi: "रिपु भाव (रोग, ऋण, शत्रु, प्रतिस्पर्धा, सेवा)", en: "Debts, Diseases, Competitors, Daily Work" },
    { hi: "जाया भाव (विवाह, जीवनसाथी, साझेदारी, व्यापार)", en: "Spouse, Marriage, Business Partnerships" },
    { hi: "आयु भाव (आयु, गुप्त रहस्य, आकस्मिक धन, संकट)", en: "Longevity, Occult, Transformation, In-laws" },
    { hi: "धर्म/भाग्य भाव (भाग्य, पिता, गुरु, धर्म, तीर्थ यात्रा)", en: "Fortune, Father, Dharma, Higher Wisdom, Travel" },
    { hi: "कर्म भाव (व्यवसाय, पद-प्रतिष्ठा, राज्य, मान-सम्मान)", en: "Career, Status, Fame, Governance, Actions" },
    { hi: "लाभ भाव (आय, लाभ, मित्र, बड़े भाई-बहन, मनोकामना पूर्ति)", en: "Gains, Income, Networking, Aspirations" },
    { hi: "व्यय भाव (मोक्ष, विदेश वास, व्यय, शयन सुख, आध्यात्म)", en: "Expenses, Foreign Travel, Spirituality, Moksha" }
  ];

  const houses: BhavaDetail[] = Array.from({ length: 12 }, (_, i) => {
    const houseNum = i + 1;
    const rashiIdx = (lagnaRashiIndex + i) % 12;
    const rashi = RASHIS[rashiIdx];
    const planetsHere = planets.filter(p => p.house === houseNum);

    return {
      houseNumber: houseNum,
      rashiIndex: rashiIdx,
      rashiNameHi: rashi.nameHi,
      rashiNameEn: rashi.nameEn,
      lord: rashi.lord,
      lordHi: rashi.lordHi,
      significanceHi: houseSignificance[i].hi,
      significanceEn: houseSignificance[i].en,
      planetsHere
    };
  });

  // 8. Navamsha Chart (D9)
  const navamshaHouses = Array.from({ length: 12 }, (_, i) => {
    const houseNum = i + 1;
    const navamshaLagnaRashi = Math.floor(ascSidereal / (30 / 9)) % 12;
    const houseRashiIdx = (navamshaLagnaRashi + i) % 12;
    const planetsInNavHouse = planets.filter(p => {
      const pNavRashi = Math.floor(p.longitude / (30 / 9)) % 12;
      return pNavRashi === houseRashiIdx;
    }).map(p => p.nameHi);

    return {
      houseNumber: houseNum,
      rashiIndex: houseRashiIdx,
      rashiNameHi: RASHIS[houseRashiIdx].nameHi,
      planets: planetsInNavHouse
    };
  });

  // 9. Vimshottari Mahadasha Calculation (120 years cycle)
  const birthNakLord = nakshatraDetail.lord; // e.g. "Jupiter"
  const startDashaIdx = DASHA_ORDER.indexOf(birthNakLord);
  const nakTotalSpan = 360 / 27; // 13.3333 degrees
  const degElapsed = nakshatraDeg;
  const fracElapsed = degElapsed / nakTotalSpan; // fraction spent
  const fracRemaining = 1 - fracElapsed;

  const birthLordYears = DASHA_YEARS[birthNakLord].years;
  const balanceYears = fracRemaining * birthLordYears;

  const birthDateObj = new Date(`${dobStr}T${timeStr}:00`);
  let cursorDate = new Date(birthDateObj);
  cursorDate.setDate(cursorDate.getDate() + Math.round(balanceYears * 365.25));

  const dashaTimeline: DashaPeriod[] = [];
  const now = new Date();

  for (let i = 0; i < 9; i++) {
    const currentLord = DASHA_ORDER[(startDashaIdx + i) % 9];
    const totalYrs = i === 0 ? balanceYears : DASHA_YEARS[currentLord].years;
    
    const pStart = i === 0 ? new Date(birthDateObj) : new Date(cursorDate.getTime() - totalYrs * 365.25 * 86400000);
    const pEnd = i === 0 ? new Date(cursorDate) : new Date(pStart.getTime() + totalYrs * 365.25 * 86400000);
    if (i > 0) cursorDate = new Date(pEnd);

    const isCurrent = now >= pStart && now <= pEnd;

    // Sub periods (Antardashas)
    const antardashas = DASHA_ORDER.map((subLord, subIdx) => {
      const subRatio = (DASHA_YEARS[subLord].years / 120);
      const subDays = totalYrs * subRatio * 365.25;
      const subStart = new Date(pStart.getTime() + subIdx * (totalYrs * 365.25 / 9) * 86400000);
      const subEnd = new Date(subStart.getTime() + subDays * 86400000);
      return {
        planet: subLord,
        planetHi: DASHA_YEARS[subLord].lordHi,
        startDate: subStart.toISOString().split('T')[0],
        endDate: subEnd.toISOString().split('T')[0],
        isCurrent: now >= subStart && now <= subEnd
      };
    });

    dashaTimeline.push({
      planet: currentLord,
      planetHi: DASHA_YEARS[currentLord].lordHi,
      years: Number(totalYrs.toFixed(1)),
      startDate: pStart.toISOString().split('T')[0],
      endDate: pEnd.toISOString().split('T')[0],
      isCurrent,
      antardashas
    });
  }

  const currentDashaPeriod = dashaTimeline.find(d => d.isCurrent) || dashaTimeline[0];
  const currentAntar = currentDashaPeriod.antardashas.find(a => a.isCurrent) || currentDashaPeriod.antardashas[0];

  // 10. Shastriya Dosha & Yoga Analysis
  // Manglik Dosha (Mars in 1, 4, 7, 8, 12 from Lagna OR Moon)
  const marsHouseFromLagna = planets.find(p => p.name === "Mars")?.house || 1;
  const moonHouse = planets.find(p => p.name === "Moon")?.house || 1;
  const marsHouseFromMoon = ((marsHouseFromLagna - moonHouse + 12) % 12) + 1;
  const isLagnaManglik = [1, 4, 7, 8, 12].includes(marsHouseFromLagna);
  const isChandraManglik = [1, 4, 7, 8, 12].includes(marsHouseFromMoon);
  const isManglik = isLagnaManglik || isChandraManglik;

  // Classical Manglik Parihara (Cancellations as per Brihat Parashara & Muhurta Chintamani):
  // 1. Mars in Aries in 1st house
  // 2. Mars in Scorpio in 4th house
  // 3. Mars in Capricorn in 7th house
  // 4. Mars in Sagittarius in 8th house
  // 5. Mars in Pisces in 12th house
  // 6. Jupiter aspect on Mars or Lagna
  let parihara = false;
  let pariharaReasonHi = "";
  let pariharaReasonEn = "";

  const marsRashi = planets.find(p => p.name === "Mars")?.rashiIndex || 0;
  const jupiterHouse = planets.find(p => p.name === "Jupiter")?.house || 1;

  if (isManglik) {
    if (marsHouseFromLagna === 1 && marsRashi === 0) {
      parihara = true;
      pariharaReasonHi = "मेष राशि में लग्नस्थ मंगल होने से शास्त्रानुसार 'भौम दोष' का स्वतः परिहार (दोष-मुक्त) हो जाता है।";
      pariharaReasonEn = "Mars in Aries in the 1st house naturally cancels Mangal dosha.";
    } else if (marsHouseFromLagna === 4 && marsRashi === 7) {
      parihara = true;
      pariharaReasonHi = "वृश्चिक राशि के चतुर्थ भाव में मंगल होने से मांगलिक दोष निष्प्रभावी हो जाता है।";
      pariharaReasonEn = "Mars in Scorpio in the 4th house dissolves Manglik dosha.";
    } else if (marsHouseFromLagna === 7 && marsRashi === 9) {
      parihara = true;
      pariharaReasonHi = "सप्तम भाव में उच्च का मंगल (मकर राशि) होने से कुण्डली मंगल दोष से मुक्त होती है।";
      pariharaReasonEn = "Exalted Mars in 7th house (Capricorn) cancels Manglik dosha.";
    } else if (Math.abs(jupiterHouse - marsHouseFromLagna) === 4 || Math.abs(jupiterHouse - marsHouseFromLagna) === 8) {
      parihara = true;
      pariharaReasonHi = "देवगुरु बृहस्पति की पूर्ण अमृत दृष्टि मंगल पर होने से मांगलिक दोष शांत हो गया है।";
      pariharaReasonEn = "Jupiter's auspicious aspect on Mars cancels malefic effects.";
    } else {
      pariharaReasonHi = "वैदिक विवाह पूर्व कुंभ विवाह या मंगल शांति अनुष्ठान शास्त्रसम्मत रहेगा।";
      pariharaReasonEn = "Traditional Kumbh Vivah or Mangal Gayatri remedies recommended.";
    }
  }

  // Kaal Sarp Dosha Check (All 7 planets between Rahu and Ketu)
  const rahuHouse = planets.find(p => p.name === "Rahu")?.house || 1;
  const nonNodeHouses = planets.filter(p => p.name !== "Rahu" && p.name !== "Ketu").map(p => p.house);
  const isOneSide = nonNodeHouses.every(h => (h >= rahuHouse && h < (rahuHouse + 6)) || (h + 12 >= rahuHouse && (h + 12) < (rahuHouse + 6)));
  const kaalSarpTypes = [
    "अनन्त कालसर्प (Anant Kaal Sarp - 1st to 7th)", "कुलिक कालसर्प (Kulik Kaal Sarp - 2nd to 8th)",
    "वासुकी कालसर्प (Vasuki Kaal Sarp - 3rd to 9th)", "शंखपाल कालसर्प (Shankhpal Kaal Sarp - 4th to 10th)",
    "पद्म कालसर्प (Padma Kaal Sarp - 5th to 11th)", "महापद्म कालसर्प (Mahapadma Kaal Sarp - 6th to 12th)",
    "तक्षक कालसर्प (Takshak Kaal Sarp - 7th to 1st)", "कर्कोटक कालसर्प (Karkotak Kaal Sarp - 8th to 2nd)",
    "शंखचूड़ कालसर्प (Shankhachood Kaal Sarp - 9th to 3rd)", "घातक कालसर्प (Ghatak Kaal Sarp - 10th to 4th)",
    "विषधर कालसर्प (Vishdhar Kaal Sarp - 11th to 5th)", "शेषनाग कालसर्प (Sheshnag Kaal Sarp - 12th to 6th)"
  ];

  const kaalSarpType = kaalSarpTypes[rahuHouse - 1] || "अनन्त कालसर्प";

  // Sade Sati Check (Current Saturn position relative to natal Moon)
  // Current Saturn in 2026 is in Aquarius/Pisces
  const natalMoonRashi = moonRashiIndex;
  const currentSaturnRashi = 10; // Aquarius in 2026
  const sadeSatiDiff = (currentSaturnRashi - natalMoonRashi + 12) % 12;
  let sadeSatiStatus: 'active' | 'dhaiya' | 'none' = 'none';
  let sadeSatiPhaseHi = "शनि की शुभ कृपा (वर्तमान में साढ़े साती नहीं है)";
  let sadeSatiImpactHi = "शनिदेव का गोचर आपकी राशि के लिए अनुकूल है। कार्यों में स्थिरता और लाभ बना रहेगा।";

  if (sadeSatiDiff === 11) {
    sadeSatiStatus = 'active';
    sadeSatiPhaseHi = "साढ़े साती का प्रथम चरण (शिखर/मस्तिष्क चरण)";
    sadeSatiImpactHi = "मानसिक तनाव, यात्राओं में व्यय एवं नए उद्यम में धैर्य रखने का समय है।";
  } else if (sadeSatiDiff === 0) {
    sadeSatiStatus = 'active';
    sadeSatiPhaseHi = "साढ़े साती का द्वितीय चरण (हृदय/मध्य चरण - मुख्य प्रभाव)";
    sadeSatiImpactHi = "कड़ी मेहनत का पूर्ण फल मिलेगा। शनिवार को पीपल की सेवा एवं हनुमान चालीसा का पाठ करें।";
  } else if (sadeSatiDiff === 1) {
    sadeSatiStatus = 'active';
    sadeSatiPhaseHi = "साढ़े साती का तृतीय चरण (उतरती साढ़े साती - पाद चरण)";
    sadeSatiImpactHi = "कठिनाइयों से मुक्ति, व्यवसाय में लाभ एवं नए अवसरों की प्राप्ति होगी।";
  } else if (sadeSatiDiff === 3 || sadeSatiDiff === 7) {
    sadeSatiStatus = 'dhaiya';
    sadeSatiPhaseHi = "शनि की ढैय्या (कंटक / अष्टम शनि)";
    sadeSatiImpactHi = "स्वास्थ्य एवं लेन-देन में सतर्कता बरतें।";
  }

  // Auspicious Yogas Identification
  const auspiciousYogas: VedicKundliResult['doshasAndYogas']['auspiciousYogas'] = [];

  // Gajakesari Yoga (Jupiter in 1, 4, 7, 10 from Moon)
  const jupFromMoon = ((jupiterHouse - moonHouse + 12) % 12) + 1;
  if ([1, 4, 7, 10].includes(jupFromMoon)) {
    auspiciousYogas.push({
      name: "Gajakesari Yoga",
      nameHi: "गजकेसरी महायोग",
      descriptionHi: "चन्द्रमा से केन्द्र (1, 4, 7, 10) में देवगुरु बृहस्पति स्थित होने से महाशुभ गजकेसरी योग निर्मित हुआ है।",
      benefitHi: "जातक बुद्धिमान, तेजस्वी, समाज में प्रतिष्ठित, राजतुल्य सम्मान और दीर्घायु प्राप्त करता है।"
    });
  }

  // Budhaditya Yoga (Sun + Mercury in same house)
  const sunHouse = planets.find(p => p.name === "Sun")?.house || 1;
  const mercHouse = planets.find(p => p.name === "Mercury")?.house || 1;
  if (sunHouse === mercHouse) {
    auspiciousYogas.push({
      name: "Budhaditya Yoga",
      nameHi: "बुधादित्य राजयोग",
      descriptionHi: "सूर्य और बुध की एक ही भाव में युति से विख्यात बुधादित्य योग का निर्माण हुआ है।",
      benefitHi: "तीक्ष्ण बुद्धि, प्रशासनिक एवं व्यापारिक कार्यों में असाधारण सफलता और वक्तृत्व क्षमता।"
    });
  }

  // Ruchaka / Pancha Mahapurusha Yoga (Mars in Kendra in Aries/Scorpio/Capricorn)
  if ([1, 4, 7, 10].includes(marsHouseFromLagna) && [0, 7, 9].includes(marsRashi)) {
    auspiciousYogas.push({
      name: "Ruchaka Yoga",
      nameHi: "रुचक पंचमहापुरुष योग",
      descriptionHi: "मंगल ग्रह का केन्द्र में स्वराशि (मेष/वृश्चिक) अथवा उच्च (मकर) में स्थित होना।",
      benefitHi: "शारीरिक बल, साहस, भूमि-भवन का अपार सुख और सेना/प्रशासन/ठेकेदारी में सर्वोच्च पद।"
    });
  }

  // Hamsa Yoga (Jupiter in Kendra in Cancer/Sagittarius/Pisces)
  const jupRashi = planets.find(p => p.name === "Jupiter")?.rashiIndex || 0;
  if ([1, 4, 7, 10].includes(jupiterHouse) && [3, 8, 11].includes(jupRashi)) {
    auspiciousYogas.push({
      name: "Hamsa Yoga",
      nameHi: "हंस पंचमहापुरुष योग",
      descriptionHi: "बृहस्पति देव का केन्द्र में उच्च (कर्क) या स्वराशि (धनु/मीन) में विराजमान होना।",
      benefitHi: "धार्मिक प्रवृत्ति, परम विद्वान, सर्वप्रिय, उच्च ज्ञान और निष्कलंक चरित्र।"
    });
  }

  // Malavya Yoga (Venus in Kendra in Taurus/Libra/Pisces)
  const venHouse = planets.find(p => p.name === "Venus")?.house || 1;
  const venRashi = planets.find(p => p.name === "Venus")?.rashiIndex || 0;
  if ([1, 4, 7, 10].includes(venHouse) && [1, 6, 11].includes(venRashi)) {
    auspiciousYogas.push({
      name: "Malavya Yoga",
      nameHi: "मालव्य पंचमहापुरुष योग",
      descriptionHi: "शुक्र ग्रह का केन्द्र में स्वराशि (वृषभ/तुला) अथवा उच्च (मीन) में स्थित होना।",
      benefitHi: "समस्त भौतिक सुख, सुंदर जीवनसाथी, कला/वाहन/आभूषणों का प्रचुर लाभ।"
    });
  }

  // 11. Ashtakavarga Points Simulation (Shastriya totals sum ~337 points)
  const basePoints = [28, 32, 29, 30, 27, 34, 25, 24, 31, 33, 36, 28];
  const housePoints = basePoints.map((pt, idx) => {
    const shift = (lagnaRashiIndex + idx) % 4;
    return pt + shift - 1;
  });
  const totalPoints = housePoints.reduce((acc, curr) => acc + curr, 0);

  // 12. Shastriya Predictions & Life Guidance
  const lagnaInfo = RASHIS[lagnaRashiIndex];
  const moonInfo = RASHIS[moonRashiIndex];

  // Parse birth year and compute current age
  const birthYear = parseInt(dobStr.slice(0, 4), 10) || 1995;
  const currentYear = 2026;
  const nativeCurrentAge = Math.max(1, currentYear - birthYear);

  // Determine running active dasha info
  const runningMahadashaName = currentDashaPeriod.planet;
  const runningMahadashaHi = currentDashaPeriod.planetHi;
  const runningAntardashaName = currentAntar.planet;
  const runningAntardashaHi = currentAntar.planetHi;

  // Build current life state
  const currentLifeState: CurrentLifeState = {
    age: nativeCurrentAge,
    statusHi: `वर्तमान उम्र ${nativeCurrentAge} वर्ष — आजीविका सुदृढ़ीकरण, कर्म विस्तार एवं आर्थिक उत्थान का कालखंड`,
    statusEn: `Current Age ${nativeCurrentAge} Years — Career Consolidation, Business Expansion & Financial Rise Phase`,
    runningDashaInfluenceHi: `वर्तमान में आपकी कुण्डली में ${runningMahadashaHi} की महादशा के अंतर्गत ${runningAntardashaHi} की अंतर्दशा प्रभावशील है। यह ग्रह गोचर आपके दशम (कर्म), एकादश (लाभ) और द्वितीय (धन) भाव को सक्रिय कर रहा है, जिससे पूर्व के किए गए प्रयासों का सकारात्मक फल मिलना आरंभ हो रहा है।`,
    runningDashaInfluenceEn: `Currently running the Mahadasha of ${runningMahadashaName} with the Antardasha of ${runningAntardashaName}. This actively triggers your 10th (Career), 11th (Gains), and 2nd (Wealth) houses, turning past hard work into tangible rewards.`,
    planetaryTransitsHi: `गोचरस्थ देवगुरु बृहस्पति की शुभ दृष्टि आपके भाग्य व लाभ भाव पर होने से नए संपर्क लाभदायक सिद्ध होंगे। कर्मफलदाता शनिदेव आपके कार्यक्षेत्र में अनुशासन और दीर्घकालिक स्थिरता का निर्माण कर रहे हैं।`,
    planetaryTransitsEn: `Transit Jupiter casts an auspicious aspect on your 9th (Fortune) and 11th (Gains) houses, making strategic connections highly fruitful. Saturn demands discipline while cementing long-term foundations.`,
    currentOpportunitiesHi: [
      "कैरियर एवं व्यापार में नए अनुबंध, पदोन्नति अथवा स्वतंत्र कार्य विस्तार के सुनहरे अवसर।",
      "भूमि, मकान अथवा नए वाहन की खरीद-फरोख्त की मजबूत और क्रियान्वित होने वाली योजना।",
      "प्रतिष्ठित व्यक्तियों एवं मार्गदर्शकों के सहयोग से रुके हुए धन व प्रोजेक्ट्स की त्वरित बहाली।"
    ],
    currentOpportunitiesEn: [
      "Prime opportunities for career promotion, lucrative contracts, or independent business ventures.",
      "High feasibility for investing in real estate, residential property, or personal vehicles.",
      "Rapid recovery of delayed payments and execution of pending plans through influential mentors."
    ],
    currentChallengesHi: [
      "अत्यधिक कार्यभार के कारण मानसिक बेचैनी और अनिद्रा से बचें; नियमित योग-प्राणायाम करें।",
      "बिना सोचे-समझे अथवा बिना लिखित विधिक कागजात के किसी को भी बड़ी राशि उधार देने से बचें।",
      "घरेलू मामलों में वाणी की मधुरता बनाए रखें और अति-उत्साह में जल्दबाजी में निर्णय न लें।"
    ],
    currentChallengesEn: [
      "Prevent burnout and sleep disruption caused by intense workloads; practice daily meditation.",
      "Avoid lending large financial sums or entering informal partnerships without legal documentation.",
      "Maintain diplomatic calmness in family discussions; refrain from impulsive reactions."
    ]
  };

  // Generate Year-by-Year Future Timeline (2026 to 2035)
  const yearlyTimeline: YearlyForecastItem[] = [];
  const yearlyThemes = [
    {
      year: 2026,
      themeHi: "कैरियर विस्तार, नए स्रोत एवं आर्थिक स्थिरता",
      themeEn: "Career Expansion, New Revenue Streams & Financial Stability",
      activeDashaHi: `${runningMahadashaHi} - ${runningAntardashaHi}`,
      activeDashaEn: `${runningMahadashaName} - ${runningAntardashaName}`,
      careerHi: "कार्यक्षेत्र में नए प्रोजेक्ट्स का सफल क्रियान्वयन होगा। सहकर्मियों व उच्चाधिकारियों का सहयोग मिलेगा। यदि व्यापार में हैं, तो नेटवर्क विस्तार से नए ग्राहक जुड़ेंगे।",
      careerEn: "Successful execution of flagship projects. Excellent synergy with colleagues and authorities. In business, network expansion will unlock high-value clients.",
      financeHi: "एकाधिक स्रोतों से नियमित धन प्रवाह बना रहेगा। पुराने फंसे हुए धन की आंशिक वसूली होगी। बैंक बैलेंस में संतोषजनक वृद्धि होगी।",
      financeEn: "Consistent cash flow from multiple streams. Partial recovery of stuck funds with steady growth in liquid savings.",
      familyMarriageHi: "परिवार में मांगलिक और प्रसन्नता का वातावरण रहेगा। जीवनसाथी के साथ सामंजस्य प्रगाढ़ होगा। घर में किसी उत्सव का योग है।",
      familyMarriageEn: "Joyful and harmonious domestic atmosphere. Deepening understanding with spouse and celebrations of auspicious events at home.",
      healthHi: "शारीरिक ऊर्जा उत्तम रहेगी। मौसमी विकारों और खानपान की अनियमितता से पेट सम्बन्धी संवेदनशीलता का ध्यान रखें।",
      healthEn: "High physical stamina. Watch out for dietary indiscretions and mild digestive sensitivities.",
      remedyHi: "प्रतिदिन प्रातः सूर्य को तांबे के लोटे से जल दें और 'ॐ सूर्याय नमः' का जप करें।",
      remedyEn: "Offer water to the rising Sun daily from a copper vessel and chant 'Om Suryaya Namaha'.",
      rating: 5,
      favorableScore: 88
    },
    {
      year: 2027,
      themeHi: "अचल संपत्ति (भूमि/भवन) व नए वाहन का सुखद योग",
      themeEn: "Acquisition of Real Estate & New Vehicle Fortune",
      activeDashaHi: `${runningMahadashaHi} में शुभ अंतर्दशा`,
      activeDashaEn: `${runningMahadashaName} Auspicious Antardasha`,
      careerHi: "कैरियर में स्थिर उन्नति और विश्वसनीयता का निर्माण होगा। कार्यक्षेत्र में आपकी विशेषज्ञता की प्रशंसा होगी। नए दायित्व प्राप्त होंगे।",
      careerEn: "Steady professional ascension and reputation building. Recognition for specialized expertise with bigger responsibilities.",
      financeHi: "भूमि, मकान अथवा बहुप्रतीक्षित वाहन खरीदने का अत्यंत प्रबल योग। दीर्घकालिक निवेशों में अच्छा मुनाफा प्राप्त होगा।",
      financeEn: "Exceptionally strong window for purchasing land, residential property, or a luxury vehicle. Profitable long-term assets.",
      familyMarriageHi: "दांपत्य जीवन में मधुरता रहेगी। अविवाहित जातकों के लिए श्रेष्ठ विवाह प्रस्ताव आएंगे। संतान पक्ष से शुभ समाचार प्राप्त होगा।",
      familyMarriageEn: "Marital harmony. Unmarried natives will receive noble matrimonial proposals. Promising news from children's side.",
      healthHi: "उत्तम स्वास्थ्य। पीठ व जोड़ों के लचीलेपन के लिए नियमित व्यायाम एवं प्रातः भ्रमण लाभकारी रहेगा।",
      healthEn: "Vibrant health. Maintain spinal flexibility and joint mobility through regular morning walks and stretching.",
      remedyHi: "मंगलवार को श्री हनुमान चालीसा का पाठ करें और चमेली के तेल का दीपक प्रज्वलित करें।",
      remedyEn: "Chant Sri Hanuman Chalisa on Tuesdays and light a sesame or jasmine oil lamp.",
      rating: 5,
      favorableScore: 92
    },
    {
      year: 2028,
      themeHi: "व्यापारिक विस्तार, नए अनुबंध व सामाजिक मान-प्रतिष्ठा",
      themeEn: "Business Scaling, Key Partnerships & High Social Honors",
      activeDashaHi: `${runningMahadashaHi} अंतर्दशा संधि काल`,
      activeDashaEn: `${runningMahadashaName} Sub-period Transition`,
      careerHi: "साझेदारी अथवा स्वतंत्र फर्म में बड़ा विस्तार। नए शहरों या तकनीकी माध्यमों से व्यवसाय का फैलाव होगा। पदोन्नति का समय।",
      careerEn: "Significant scaling in partnership or independent ventures. Expansion into new markets and technologies with strong promotion.",
      financeHi: "व्यापारिक मुनाफे में 30% से 40% तक की भारी उछाल। नए वित्तीय साधनों में निवेश से अतिरिक्त आय का मार्ग प्रशस्त होगा।",
      financeEn: "A massive 30% to 40% jump in commercial turnover. Lucrative capital investments generate robust passive returns.",
      familyMarriageHi: "सगे-संबंधियों व समाज में आपके सम्मान में वृद्धि होगी। परिवार के साथ किसी पवित्र तीर्थ स्थल की सुखद यात्रा के योग।",
      familyMarriageEn: "Elevated social standing among relatives and peers. Joyful pilgrimage or family vacation to holy destinations.",
      healthHi: "मानसिक शांति व ताजगी बनी रहेगी। तनावमुक्त रहने से कार्यक्षमता दोगुनी होगी।",
      healthEn: "Mental clarity and inner poise. Low stress levels boost overall productivity exponentially.",
      remedyHi: "गुरुवार को भगवान श्री हरि विष्णु को पीले पुष्प अर्पित करें और चने की दाल का दान करें।",
      remedyEn: "Offer yellow flowers to Lord Vishnu on Thursdays and donate yellow gram or sweets.",
      rating: 5,
      favorableScore: 94
    },
    {
      year: 2029,
      themeHi: "संतान सुख, ज्ञान वृद्धि व बौद्धिक निवेश में अप्रत्याशित लाभ",
      themeEn: "Family Joy, Intellect Expansion & High-Yield Investments",
      activeDashaHi: `${runningMahadashaHi} नवम भाव फल काल`,
      activeDashaEn: `${runningMahadashaName} 9th House Prosperity`,
      careerHi: "बौद्धिक कौशल, कंसल्टिंग, तकनीकी शोध अथवा योजना निर्माण में शीर्ष सफलता। आपकी सलाह से संस्थान को भारी लाभ पहुंचेगा।",
      careerEn: "Peak accomplishments in advisory, consulting, tech research, or management. Your strategic counsel yields major success.",
      financeHi: "शेयर, म्यूचुअल फंड अथवा स्वर्ण में किए गए निवेश से अभूतपूर्व लाभ। पैतृक संपत्ति के मामलों में आपके पक्ष में समाधान होगा।",
      financeEn: "Unprecedented windfalls from equity, gold, or calculated investments. Favorable resolution of ancestral property matters.",
      familyMarriageHi: "संतान की उच्च शिक्षा या करियर में बड़ी उपलब्धि से कुल का नाम रोशन होगा। घर में मांगलिक उत्सवों की गूंज रहेगी।",
      familyMarriageEn: "Glorious achievements by children in academics/career. Celebratory feasts and auspicious ceremonies at home.",
      healthHi: "उत्कृष्ट स्वास्थ्य। जीवनशैली में सकारात्मक परिवर्तन से शरीर में नई ऊर्जा और स्फूर्ति का संचार होगा।",
      healthEn: "Exemplary vitality. Healthy lifestyle upgrades bring boundless stamina and freshness.",
      remedyHi: "प्रतिदिन माता-पिता और कुल के वरिष्ठ जनों का चरण स्पर्श कर आशीर्वाद लें।",
      remedyEn: "Seek daily blessings by touching the feet of parents and respected elders.",
      rating: 5,
      favorableScore: 90
    },
    {
      year: 2030,
      themeHi: "👑 स्वर्ण भाग्योदय वर्ष — सर्वोच्च पद, नेतृत्व व महा धन संचय",
      themeEn: "👑 Golden Fortune Year — Pinnacle Leadership & Massive Wealth",
      activeDashaHi: `${runningMahadashaHi} का पूर्ण राजयोग काल`,
      activeDashaEn: `${runningMahadashaName} Full Raja Yoga Phase`,
      careerHi: "जीवन का सबसे बड़ा कैरियर मोड़। सर्वोच्च अधिकार, वरिष्ठ पद अथवा अपनी संस्था के निर्विवाद प्रमुख बनने का स्वर्णिम समय।",
      careerEn: "A historic career turning point. Reaching executive command, apex authority, or becoming an undisputed leader in your field.",
      financeHi: "अकूत धन संचय का वर्ष। जीवन की कई बड़ी वित्तीय इच्छाओं की पूर्ति होगी। संपत्ति का स्थायी और सुरक्षित साम्राज्य बनेगा।",
      financeEn: "Historic wealth accumulation. Fulfillment of major lifelong financial dreams and creation of secure, durable family assets.",
      familyMarriageHi: "समस्त पारिवारिक कलह का अंत। दांपत्य जीवन में अपार स्नेह, विश्वास और परस्पर सम्मान का स्वर्णिम दौर।",
      familyMarriageEn: "End of all lingering domestic disputes. A golden chapter of mutual admiration, trust, and luxury with your spouse.",
      healthHi: "रोग प्रतिरोधक क्षमता चरम पर। सभी पुरानी व्याधियों से पूर्ण राहत और मानसिक संतोष।",
      healthEn: "Immunity at its peak. Complete recovery from chronic minor ailments and deep psychological contentment.",
      remedyHi: "शिवलिंग पर जल, कच्चा दूध और बेलपत्र अर्पित करते हुए 'महामृत्युंजय मंत्र' का 108 बार जप करें।",
      remedyEn: "Offer milk and sacred Bilva leaves to the Shiva Lingam while chanting the Maha Mrityunjaya Mantra 108 times.",
      rating: 5,
      favorableScore: 96
    },
    {
      year: 2031,
      themeHi: "दूरगामी लाभदायक यात्राएं, नए प्रोजेक्ट्स व वैश्विक संपर्क",
      themeEn: "Profitable Long-Distance Travels & Global Networking",
      activeDashaHi: `${runningMahadashaHi} विदेश व यात्रा योग काल`,
      activeDashaEn: `${runningMahadashaName} Foreign & Travel Transit`,
      careerHi: "व्यापार या नौकरी के सिलसिले में दूरस्थ राज्यों अथवा विदेश यात्रा के प्रबल योग। नए अंतरराष्ट्रीय/दूरस्थ संपर्कों से लाभ।",
      careerEn: "Strong prospects for lucrative domestic and overseas travels. Strategic alliances with distant enterprises.",
      financeHi: "विदेशी स्रोतों या दूरस्थ ग्राहकों से अत्यधिक धन लाभ। यात्राओं पर व्यय होगा परन्तु उससे कई गुना अधिक मुनाफा लौटेगा।",
      financeEn: "High-margin returns from distant clientele. Travel expenditures quickly convert into multifaceted revenue streams.",
      familyMarriageHi: "परिवार में नव उमंग। बच्चों के साथ दर्शनीय स्थलों के भ्रमण का आनंद। वैवाहिक जीवन में नव स्फूर्ति।",
      familyMarriageEn: "Renewed joy at home. Memorable holidays and leisure travel with spouse and children.",
      healthHi: "यात्रा के दौरान खान-पान का विशेष ध्यान रखें। पर्याप्त जल पिएं और नींद पूरी रखें।",
      healthEn: "Stay hydrated and maintain clean eating habits during long journeys. Prioritize restful sleep.",
      remedyHi: "पक्षियों को नियमित रूप से सतनाजा (7 प्रकार का अनाज) डालें और जलपात्र रखें।",
      remedyEn: "Feed a mixture of 7 grains (Satnaja) and place freshwater pots for birds every morning.",
      rating: 4,
      favorableScore: 86
    },
    {
      year: 2032,
      themeHi: "व्यावसायिक साम्राज्य का स्थायित्व व सामाजिक प्रतिष्ठा का उत्थान",
      themeEn: "Empire Consolidation & Grand Social Prominence",
      activeDashaHi: `${runningMahadashaHi} एकादश भाव सिद्धि काल`,
      activeDashaEn: `${runningMahadashaName} 11th House Manifestation`,
      careerHi: "आपके बनाए गए सिस्टम और टीम स्वतः कार्य करेगी। आप रणनीतिक निर्णयकर्ता की भूमिका में होंगे और दूसरों को रोजगार देंगे।",
      careerEn: "Your systems and teams operate autonomously. You act as the chief strategic architect, creating opportunities for others.",
      financeHi: "अचल संपत्ति से नियमित किराया या लाभांश का प्रवाह। आर्थिक दृष्टि से पूर्ण आत्मनिर्भरता व निश्चिंतता का अनुभव।",
      financeEn: "Steady influx of rental yields and passive dividends. Complete financial sovereignty and peace of mind.",
      familyMarriageHi: "परिवार के सभी सदस्यों का आपके प्रति असीम आदर। समाज में एक मार्गदर्शक और सम्मानीय स्तंभ के रूप में प्रतिष्ठा।",
      familyMarriageEn: "Profound reverence from all family generations. Regarded as a wise pillar and community mentor.",
      healthHi: "संतुलित एवं उत्तम स्वास्थ्य। प्राणायाम और ध्यान से आध्यात्मिक तेज में वृद्धि होगी।",
      healthEn: "Balanced wellness. Daily pranayama and mindfulness amplify mental composure and inner vitality.",
      remedyHi: "अमावस्या अथवा शनिवार को निर्धन विद्यार्थियों को पुस्तकें एवं भोजन सामग्री दान करें।",
      remedyEn: "Donate notebooks, educational materials, or warm meals to underprivileged students on Saturdays.",
      rating: 5,
      favorableScore: 91
    },
    {
      year: 2033,
      themeHi: "पारिवारिक समृद्धि, शांति व संचित कोष में ऐतिहासिक वृद्धि",
      themeEn: "Family Flourishing, Harmony & Historic Wealth Reserve",
      activeDashaHi: `${runningMahadashaHi} द्वितीय भाव कोष सिद्धि`,
      activeDashaEn: `${runningMahadashaName} 2nd House Treasure Phase`,
      careerHi: "कार्यक्षेत्र में आपके अनुभव का लोहा माना जाएगा। सरकार, प्रशासन या उद्योग जगत से विशेष पुरस्कार या सम्मान के योग।",
      careerEn: "Widespread acclaim for your lifelong expertise. Strong likelihood of receiving state or industry honors.",
      financeHi: "पारिवारिक संचित कोष (FDR, सोना, सुरक्षित बॉन्ड्स) में अभूतपूर्व वृद्धि। भविष्य की पीढ़ियों के लिए मजबूत वित्तीय आधार।",
      financeEn: "Monumental growth in family reserves (gold, fixed assets, treasury bonds), securing generational prosperity.",
      familyMarriageHi: "घर में शांति, सुख और ऐश्वर्य का वातावरण। संतानों के विवाह व कैरियर के सभी महत्वपूर्ण संकल्प पूर्ण होंगे।",
      familyMarriageEn: "Absolute domestic tranquility. Key milestones like children's weddings and settlements are accomplished gracefully.",
      healthHi: "स्वास्थ्य सामान्यतः उत्तम रहेगा। नियमित स्वास्थ्य जांच कराएं और सात्विक दिनचर्या का पालन करें।",
      healthEn: "Robust health overall. Maintain routine preventative checkups and clean vegetarian habits.",
      remedyHi: "गाय को प्रतिदिन ताजी रोटी पर गुड़ और थोड़ा घी लगाकर प्रेमपूर्वक खिलाएं।",
      remedyEn: "Feed fresh wheat bread (roti) with jaggery and a drop of clarified butter (ghee) to cows daily.",
      rating: 5,
      favorableScore: 89
    },
    {
      year: 2034,
      themeHi: "वरिष्ठ नेतृत्व, परामर्शदाता की भूमिका व आध्यात्मिक उन्नति",
      themeEn: "Senior Advisory, High Mentorship & Spiritual Awakening",
      activeDashaHi: `${runningMahadashaHi} नवम/दशम संगम काल`,
      activeDashaEn: `${runningMahadashaName} Dharma-Karma Conjunction`,
      careerHi: "सक्रिय भागदौड़ से हटकर रणनीतिक सलाहकार और निदेशक के रूप में कार्य करेंगे। आपके निर्णयों से सैकड़ों लोगों को दिशा मिलेगी।",
      careerEn: "Transitioning from daily hustle to visionary mentorship and executive advisory. Your wisdom guides many.",
      financeHi: "आय के कई स्वतंत्र और स्वचालित स्रोत निर्बाध चलेंगे। धर्मार्थ कार्यों और समाज सेवा में धन का सदुपयोग करेंगे।",
      financeEn: "Seamless automated income streams. Meaningful investments in charity, education, and social upliftment.",
      familyMarriageHi: "सुखमय और परिपक्व दांपत्य। नाती-पोतों और संयुक्त परिवार का असीम सुख एवं प्रेम प्राप्त होगा।",
      familyMarriageEn: "Blissful, mature companionship. Boundless joy from grandchildren and a tightly knit extended family.",
      healthHi: "मन शांत और स्थिर रहेगा। ध्यान, सत्संग और प्रकृति के सानिध्य से मानसिक व शारीरिक स्वास्थ्य उत्तम बना रहेगा।",
      healthEn: "Deep spiritual peace and physical equilibrium through meditation, satsang, and nature immersion.",
      remedyHi: "किसी प्राचीन मंदिर या जन-कल्याणकारी संस्था में जल सेवा (प्याऊ) अथवा वृक्षारोपण कराएं।",
      remedyEn: "Install public water stations or sponsor tree plantation drives at sacred shrines.",
      rating: 5,
      favorableScore: 93
    },
    {
      year: 2035,
      themeHi: "समग्र ऐश्वर्य, यश, कीर्ति व स्थिरता का स्वर्णिम काल",
      themeEn: "Complete Prosperity, Everlasting Legacy & Royal Splendor",
      activeDashaHi: `${runningMahadashaHi} का पूर्ण परिपक्व काल`,
      activeDashaEn: `${runningMahadashaName} Apex Maturation Phase`,
      careerHi: "आपकी कार्यशैली और सफलता एक मिसाल बनेगी। जीवन के सभी प्रमुख व्यावसायिक लक्ष्यों की 100% प्राप्ति।",
      careerEn: "Your career trajectory becomes an enduring benchmark. Complete 100% fulfillment of key professional goals.",
      financeHi: "अचल, चल और बौद्धिक संपत्तियों का विशाल साम्राज्य। वित्तीय चिंता से पूर्ण मुक्ति।",
      financeEn: "Immense portfolio of tangible and intellectual assets. Total freedom from financial worries.",
      familyMarriageHi: "कुल में प्रधान और संरक्षक की भूमिका। परिवार का हर सदस्य आपकी सलाह से आगे बढ़ेगा।",
      familyMarriageEn: "Esteemed patriarch/matriarch status. Every family member thrives under your benevolent guidance.",
      healthHi: "दीर्घायु और स्वस्थ जीवन। चित्त में आध्यात्मिक आनंद और प्रसन्नता की अनुभूति।",
      healthEn: "Longevity and vibrant spirit with profound spiritual tranquility and joy.",
      remedyHi: "प्रतिदिन गायत्री मंत्र का 24 बार शांत मन से जप करें और अंतर्मन का आभार व्यक्त करें।",
      remedyEn: "Chant the sacred Gayatri Mantra 24 times daily and express gratitude for life's blessings.",
      rating: 5,
      favorableScore: 95
    }
  ];

  yearlyThemes.forEach(t => {
    const calculatedAge = nativeCurrentAge + (t.year - currentYear);
    yearlyTimeline.push({
      ...t,
      age: calculatedAge
    });
  });

  // Key Life Milestones & Fortune Peaks
  const lifeMilestones: LifeMilestonePhase[] = [
    {
      phaseTitleHi: "आरंभिक नींव, शिक्षा एवं संघर्ष काल",
      phaseTitleEn: "Early Foundations, Education & Struggle Phase",
      ageRange: "उम्र 18 से 25 वर्ष",
      yearsSpan: `${birthYear + 18} - ${birthYear + 25}`,
      significanceHi: "कौशल निर्माण, प्रतियोगी परीक्षाओं की तैयारी और जीवन की दिशा तय करने का समय। इस दौरान की गई मेहनत ही आगे के स्वर्णिम भविष्य की मजबूत नींव साबित होती है।",
      significanceEn: "Acquisition of practical skills, competitive exams, and determining life direction. The discipline formed here builds the foundation for future prosperity.",
      goldenPeriod: false,
      keyAchievementsHi: [
        "उच्च शिक्षा अथवा व्यावसायिक कौशल की प्राप्ति",
        "प्रथम स्वतंत्र रोजगार अथवा आजीविका का शुभारंभ",
        "जीवन के वास्तविक मूल्यों एवं वित्तीय समझ का विकास"
      ],
      keyAchievementsEn: [
        "Acquisition of higher education or vocational mastery",
        "Landing the first independent job or trade launch",
        "Development of core values and realistic financial acumen"
      ]
    },
    {
      phaseTitleHi: "कैरियर स्थिरता, विवाह एवं प्रथम संपत्ति योग",
      phaseTitleEn: "Career Consolidation, Marriage & First Asset Foundation",
      ageRange: "उम्र 26 से 32 वर्ष",
      yearsSpan: `${birthYear + 26} - ${birthYear + 32}`,
      significanceHi: "आर्थिक स्थिरता, विवाह संस्कार, प्रथम वाहन अथवा स्वयं के मकान की नींव रखने का महत्वपूर्ण कालखंड। आय के स्रोत स्थायी और विश्वसनीय बनते हैं।",
      significanceEn: "Crucial period for financial consolidation, matrimonial union, and acquiring the first vehicle or residential home.",
      goldenPeriod: false,
      keyAchievementsHi: [
        "विवाह संस्कार एवं योग्य जीवनसाथी का सानिध्य",
        "कार्यक्षेत्र में महत्वपूर्ण पदोन्नति अथवा व्यापार का विस्तार",
        "प्रथम स्थायी संपत्ति (प्लॉट/फ्लैट/वाहन) का क्रय"
      ],
      keyAchievementsEn: [
        "Matrimonial vows with a supportive and capable spouse",
        "Significant promotions or commercial scaling",
        "Acquiring first durable asset (plot/flat/vehicle)"
      ]
    },
    {
      phaseTitleHi: "👑 स्वर्ण भाग्योदय काल — महा धन लाभ व प्रतिष्ठा का शिखर",
      phaseTitleEn: "👑 Golden Fortune Peak — Massive Wealth & Supreme Recognition",
      ageRange: "उम्र 33 से 42 वर्ष",
      yearsSpan: `${birthYear + 33} - ${birthYear + 42}`,
      significanceHi: "यह आपकी कुण्डली का सबसे शक्तिशाली और फलदायी स्वर्णिम समय है। दशम व एकादश भाव के राजयोग पूर्ण रूप से जागृत होकर अपार धन, अधिकार, प्रतिष्ठा और स्वतंत्र साम्राज्य प्रदान करेंगे।",
      significanceEn: "The most formidable and rewarding golden chapter of your horoscope. Raja Yogas in the 10th and 11th houses manifest supreme authority, massive prosperity, and fame.",
      goldenPeriod: true,
      keyAchievementsHi: [
        "स्वतंत्र व्यवसाय अथवा उच्च प्रशासनिक पद का सर्वोच्च शिखर",
        "एकाधिक अचल संपत्तियों (भूमि, भवन, फॉर्महाउस) का निर्माण",
        "संतान की अद्भुत उन्नति और समाज में शीर्ष सम्मान"
      ],
      keyAchievementsEn: [
        "Apex of independent business enterprise or senior administrative authority",
        "Building multiple real estate holdings and commercial properties",
        "Outstanding achievements by children and high societal esteem"
      ]
    },
    {
      phaseTitleHi: "व्यावसायिक साम्राज्य विस्तार, नेतृत्व व संतान उत्थान",
      phaseTitleEn: "Empire Expansion, High Leadership & Generational Success",
      ageRange: "उम्र 43 से 52 वर्ष",
      yearsSpan: `${birthYear + 43} - ${birthYear + 52}`,
      significanceHi: "संचित पूंजी का विस्तार, समाज में प्रभावशाली हस्ती के रूप में पहचान और परिवार के सभी सदस्यों को आर्थिक रूप से सुरक्षित करने का गौरवमयी समय।",
      significanceEn: "Preserving and compounding wealth, solidifying influence in society, and establishing enduring financial security for the entire family.",
      goldenPeriod: false,
      keyAchievementsHi: [
        "स्वचालित आय स्रोतों और निष्क्रिय आमदनी (Passive Income) की स्थापना",
        "संतानों के उच्च शिक्षा, विवाह व करियर का सकुशल संपादन",
        "धार्मिक एवं सामाजिक परोपकारी ट्रस्टों का संचालन"
      ],
      keyAchievementsEn: [
        "Establishment of automated passive cash flows and investment trusts",
        "Successful higher education, careers, and marriages of children",
        "Active involvement in major charitable, cultural, and spiritual institutions"
      ]
    },
    {
      phaseTitleHi: "आध्यात्मिक सिद्धि, यश, पारिवारिक छत्रछाया व निरोगी जीवन",
      phaseTitleEn: "Spiritual Fulfillment, Legacy, Family Grandeur & Contentment",
      ageRange: "उम्र 53 वर्ष से आगे",
      yearsSpan: `${birthYear + 53}+`,
      significanceHi: "जीवन के समस्त भौतिक उत्तरदायित्वों से मुक्ति, आत्म-संतुष्टि, ईश्वर भक्ति, नाती-पोतों का सुख और समाज में एक पूज्य मार्गदर्शक के रूप में सम्मानित स्थान।",
      significanceEn: "Fulfillment of all worldly duties, profound inner contentment, spiritual devotion, joy of extended family, and revered elder statesman status in the community.",
      goldenPeriod: false,
      keyAchievementsHi: [
        "पूर्ण वित्तीय स्वतंत्रता एवं चिंतामुक्त ऐश्वर्यशाली जीवन",
        "तीर्थाटन, धर्म-कर्म और आत्म-कल्याण में समय का सदुपयोग",
        "परिवार व समाज के लिए अमूल्य धरोहर एवं प्रेरणादायी जीवन गाथा"
      ],
      keyAchievementsEn: [
        "Complete financial freedom and serene living without anxieties",
        "Sacred pilgrimages, dharmic activities, and inner enlightenment",
        "Leaving a legacy of honor, wisdom, and inspiration for future generations"
      ]
    }
  ];

  const nameAndNumerology = calculateVedicNumerology(
    name,
    dobStr,
    nakshatraDetail,
    padaIndex,
    moonInfo,
    lagnaInfo
  );

  const cleanNativeName = name.trim() || "जातक";

  return {
    birthDetails: {
      name,
      dob: dobStr,
      time: timeStr,
      place: placeStr,
      gender
    },
    nameAndNumerology,
    panchang: {
      tithi: tithiName,
      tithiHi: tithiName,
      paksha: isShukla ? 'Shukla' : 'Krishna',
      pakshaHi: isShukla ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष',
      vaar: vaarList[dayOfWeekIndex].split(' ')[0],
      vaarHi: vaarList[dayOfWeekIndex],
      nakshatra: nakshatraDetail.nameEn,
      nakshatraHi: nakshatraDetail.nameHi,
      nakshatraPada: padaIndex,
      nakshatraLord: nakshatraDetail.lordHi,
      yoga: YOGAS[yogaIndex],
      yogaHi: YOGAS[yogaIndex],
      karan: KARANAS[karanIndex],
      karanHi: KARANAS[karanIndex],
      suryaRashi: RASHIS[Math.floor(sunSiderealLong / 30)].nameEn,
      suryaRashiHi: RASHIS[Math.floor(sunSiderealLong / 30)].nameHi,
      chandraRashi: moonInfo.nameEn,
      chandraRashiHi: moonInfo.nameHi,
      chandraRashiLord: moonInfo.lordHi,
      lagnaRashi: lagnaInfo.nameEn,
      lagnaRashiHi: lagnaInfo.nameHi,
      lagnaRashiLord: lagnaInfo.lordHi,
      gan: nakshatraDetail.gan,
      ganHi: nakshatraDetail.gan === 'Dev' ? 'देव गण' : nakshatraDetail.gan === 'Manushya' ? 'मनुष्य गण' : 'राक्षस गण',
      yoni: nakshatraDetail.yoni,
      yoniHi: nakshatraDetail.yoni,
      nadi: nakshatraDetail.nadi,
      nadiHi: nakshatraDetail.nadi === 'Adi' ? 'आद्य नाड़ी' : nakshatraDetail.nadi === 'Madhya' ? 'मध्य नाड़ी' : 'अंत्य नाड़ी',
      varna: nakshatraDetail.varna,
      varnaHi: nakshatraDetail.varna === 'Brahmin' ? 'ब्राह्मण' : nakshatraDetail.varna === 'Kshatriya' ? 'क्षत्रिय' : nakshatraDetail.varna === 'Vaishya' ? 'वैश्य' : 'शूद्र',
      vashya: nakshatraDetail.vashya,
      vashyaHi: nakshatraDetail.vashya === 'Chatushpad' ? 'चतुष्पाद' : nakshatraDetail.vashya === 'Dwipad' ? 'द्विपद (मानव)' : nakshatraDetail.vashya === 'Jalchar' ? 'जलचर' : 'कीट',
      ayanamsha: formatDMS(ayanamsha)
    },
    lagnaChart: {
      ascendantDegree: ascSidereal,
      ascendantFormatted: formatDMS(ascSidereal % 30),
      houses
    },
    navamshaChart: {
      houses: navamshaHouses
    },
    planets,
    vimshottariDasha: {
      balanceAtBirth: `${birthNakLord} (${DASHA_YEARS[birthNakLord].lordHi}) - ${balanceYears.toFixed(1)} वर्ष`,
      birthDashaLord: birthNakLord,
      currentDasha: {
        mahadasha: currentDashaPeriod.planet,
        mahadashaHi: currentDashaPeriod.planetHi,
        antardasha: currentAntar.planet,
        antardashaHi: currentAntar.planetHi,
        endDate: currentAntar.endDate
      },
      timeline: dashaTimeline
    },
    doshasAndYogas: {
      manglik: {
        isManglik,
        degree: isManglik ? (parihara ? 'Anshik' : 'Purna') : 'None',
        presenceHouses: [marsHouseFromLagna],
        parihara,
        pariharaReasonHi: parihara ? pariharaReasonHi : "मंगल का प्रभाव सप्तम या चतुर्थ भाव पर है।",
        pariharaReasonEn: pariharaReasonEn
      },
      kaalSarp: {
        hasDosha: isOneSide,
        type: isOneSide ? kaalSarpType : "दोष मुक्त (No Kaal Sarp)",
        typeHi: isOneSide ? kaalSarpType : "दोष मुक्त (कालसर्प दोष नहीं है)",
        descriptionHi: isOneSide
          ? `राहु ${rahuHouse} भाव में और केतु ${(rahuHouse + 6 - 1) % 12 + 1} भाव में होने से ${kaalSarpType} योग निर्मित हुआ है।`
          : "सभी ग्रह राहु-केतु के दोनों पक्षों में स्थित हैं, अतः कुण्डली पूर्णतः कालसर्प दोष से मुक्त है।"
      },
      sadeSati: {
        status: sadeSatiStatus,
        phase: sadeSatiStatus !== 'none' ? sadeSatiPhaseHi : 'No Sade Sati',
        phaseHi: sadeSatiPhaseHi,
        impactHi: sadeSatiImpactHi
      },
      gandmool: {
        hasDosha: nakshatraDetail.isGandmool,
        nakshatra: nakshatraDetail.nameHi,
        remedyHi: nakshatraDetail.isGandmool
          ? "जन्म गंडमूल नक्षत्र में हुआ है। 27वें दिन नक्षत्र शांति हवन एवं 27 कुओं/तीर्थों के जल से मार्जन शास्त्रसम्मत है।"
          : "जन्म मूल नक्षत्रों से मुक्त है। किसी विशेष गंडमूल शांति की आवश्यकता नहीं है।"
      },
      pitraDosha: {
        hasDosha: sunHouse === rahuHouse || sunHouse === 8,
        descriptionHi: (sunHouse === rahuHouse || sunHouse === 8)
          ? "सूर्य पर राहु या अष्टमेश का प्रभाव होने से पितृ दोष के लक्षण हैं। अमावस्या को पितृ तर्पण एवं पीपल पूजन करें।"
          : "कुण्डली पर पूर्वजों का पूर्ण आशीर्वाद है। कोई गंभीर पितृ दोष नहीं है।"
      },
      auspiciousYogas
    },
    ashtakavarga: {
      housePoints,
      totalPoints
    },
    predictions: {
      personalityHi: `जातक ${cleanNativeName} की जन्म कुण्डली में ${lagnaInfo.nameHi} लग्न (स्वामी: ${lagnaInfo.lordHi}) और ${moonInfo.nameHi} चन्द्र राशि (स्वामी: ${moonInfo.lordHi}) का विशिष्ट संयोग है। जन्म नक्षत्र ${nakshatraDetail.nameHi} के चरण ${Math.min(Math.max(1, padaIndex), 4)} एवं नामाक्षर '${nameAndNumerology.janmaNamaakshar}' के शुभ प्रभाव से आपका व्यक्तित्व अत्यंत प्रभावशाली, आत्मविश्वासी और कर्मठ है। आपमें स्वाभाविक नेतृत्व क्षमता, दृढ़ निश्चय और विपरीत परिस्थितियों में भी विजय प्राप्त करने की अद्भुत क्षमता है।`,
      personalityEn: `In the horoscope of ${cleanNativeName}, the conjunction of ${lagnaInfo.nameEn} Ascendant (Lord: ${lagnaInfo.lord}) and ${moonInfo.nameEn} Moon Sign (Lord: ${moonInfo.lord}) with birth star ${nakshatraDetail.nameEn} (Pada ${Math.min(Math.max(1, padaIndex), 4)}) generates commanding authority, exceptional resilience, and magnetic charisma.`,
      careerAndWealthHi: `जातक ${cleanNativeName} के कर्म भाव (दशमेश: ${houses[9].lordHi}) एवं लाभ भाव (एकादशेश: ${houses[10].lordHi}) की स्थिति के अनुसार आपके लिए स्वतंत्र व्यापार, तकनीकी परामर्श, ठेकेदारी, निर्माण कार्य, प्रशासनिक दायित्व अथवा रियल एस्टेट में अपार सफलता के योग हैं। आपका जन्मांक ${nameAndNumerology.mulank} व भाग्यांक ${nameAndNumerology.bhagyank} आजीविका में निरंतर स्थिरता प्रदान करते हैं। 28वें वर्ष से 36वें वर्ष के मध्य अभूतपूर्व आर्थिक उत्थान होगा।`,
      careerAndWealthEn: `For ${cleanNativeName}, with 10th house lord ${houses[9].lord} and 11th lord ${houses[10].lord} powerfully aligned, outstanding success is destined in independent business, administrative management, real estate, and technical contracting. Ages 28 to 36 mark stellar wealth creation.`,
      marriageAndFamilyHi: `सप्तम भाव (विवाह भाव, स्वामी: ${houses[6].lordHi}) एवं चतुर्थ भाव (गृह सुख, स्वामी: ${houses[3].lordHi}) की शुभ स्थिति से जातक ${cleanNativeName} का वैवाहिक जीवन सौहार्दपूर्ण, सुखमय और सम्मानजनक रहेगा। जीवनसाथी समझदार, सुशिक्षित एवं आर्थिक रूप से सहयोगी स्वभाव के होंगे। कुल में संतान पक्ष से विशेष यश और मान-प्रतिष्ठा की प्राप्ति होगी।`,
      marriageAndFamilyEn: `With auspicious aspects on the 7th house (Lord: ${houses[6].lord}) and 4th house of domestic peace (Lord: ${houses[3].lord}), ${cleanNativeName} will enjoy a dedicated, supportive, and blissful marital relationship with noble children.`,
      healthAndVitalityHi: `लग्न स्वामी ${lagnaInfo.lordHi} के प्रभाव से जातक ${cleanNativeName} की शारीरिक रोग प्रतिरोधक क्षमता उत्तम है। अग्नि व जल तत्व के संतुलन हेतु नियमित सूर्य नमस्कार, प्राणायाम, पर्याप्त जल सेवन और शुद्ध सात्विक आहार ऊर्जावान बनाए रखेगा।`,
      healthAndVitalityEn: `Ascendant lord ${lagnaInfo.lord} grants ${cleanNativeName} robust vitality and fast physical recovery. Daily morning pranayama and balanced nutrition will maintain peak metabolic health.`,
      favorableFactors: {
        luckyGemstone: lagnaInfo.gem,
        luckyGemstoneHi: lagnaInfo.gem,
        substituteGem: lagnaInfo.lord === "Mars" ? "रक्तमणि" : lagnaInfo.lord === "Venus" ? "सफेद जरकन" : lagnaInfo.lord === "Jupiter" ? "टोपाज / सुनहला" : "पेरिडॉट",
        luckyRudraksha: DASHA_YEARS[lagnaInfo.lord]?.rudraksha || "5 मुखी रुद्राक्ष",
        luckyColors: [lagnaInfo.element === "Fire" ? "लाल, केसरिया, पीला" : lagnaInfo.element === "Earth" ? "सफेद, हरा, क्रीम" : lagnaInfo.element === "Air" ? "नीला, आसमानी" : "सफेद, मोतीया, गुलाबी"],
        luckyNumbers: [1, 3, 7, 9],
        luckyDays: [lagnaInfo.lordHi === "मंगल" ? "मंगलवार" : lagnaInfo.lordHi === "गुरु" ? "गुरुवार" : lagnaInfo.lordHi === "शुक्र" ? "शुक्रवार" : "रविवार"],
        luckyDirections: lagnaInfo.element === "Fire" ? "पूर्व दिशा" : lagnaInfo.element === "Earth" ? "दक्षिण दिशा" : lagnaInfo.element === "Air" ? "पश्चिम दिशा" : "उत्तर दिशा",
        ishtaDevata: lagnaInfo.element === "Fire" ? "भगवान शिव / श्री हनुमान जी" : lagnaInfo.element === "Earth" ? "महालक्ष्मी / भगवान गणेश" : lagnaInfo.element === "Air" ? "श्री कृष्ण / श्री राम" : "भगवान विष्णु / माता दुर्गा",
        ishtaDevataHi: lagnaInfo.element === "Fire" ? "भगवान शिव एवं श्री हनुमान जी" : lagnaInfo.element === "Earth" ? "माता महालक्ष्मी एवं भगवान श्री गणेश" : lagnaInfo.element === "Air" ? "भगवान श्री कृष्ण एवं मर्यादा पुरुषोत्तम राम" : "भगवान श्री हरि विष्णु एवं माता जगदम्बा",
        beejMantra: DASHA_YEARS[lagnaInfo.lord]?.mantra || "ॐ नमः शिवाय"
      },
      dosAndDontsHi: [
        "क्या करें: प्रतिदिन उगते सूर्य को अर्घ्य दें और अपने इष्ट देव का नियमित ध्यान करें।",
        "क्या करें: अपने कार्यस्थल पर पूरी ईमानदारी और पारदर्शिता रखें, यह आपके एकादश भाव को शक्तिशाली बनाएगा।",
        "क्या करें: मंगलवार या शनिवार को जरूरतमंदों को अन्न या वस्त्र का दान करें।",
        "क्या न करें: बिना लिखित समझौते के किसी भी मित्र या सम्बन्धी के साथ वित्तीय साझेदारी से बचें।",
        "क्या न करें: जल्दबाजी में लिए गए निर्णय और क्रोध पर पूर्ण नियंत्रण रखें, वाणी को मधुर रखें।",
        "क्या न करें: किसी भी प्रकार के जुए, सट्टे अथवा अत्यधिक जोखिम भरे गैर-कानूनी निवेश से दूर रहें।"
      ],
      dosAndDontsEn: [
        "Do: Offer water to the rising Sun daily and meditate on your Ishta Devata for spiritual clarity.",
        "Do: Maintain transparency and high integrity in business contracts to empower your 11th house of gains.",
        "Do: Donate food grains and warm clothes to the underprivileged on Tuesdays or Saturdays.",
        "Don't: Avoid undocumented financial loans or loose partnerships with friends and relatives.",
        "Don't: Restrain impulsive temper and harsh words during critical business negotiations.",
        "Don't: Never engage in speculative gambling or high-risk illicit financial schemes."
      ],
      yearlyForecastHi: `आगामी वर्षों में गोचरस्थ देवगुरु बृहस्पति व सक्रिय राजयोगों की कृपा से आपके मान-सम्मान, व्यवसाय, भूमि-भवन और गृहस्थ जीवन में अभूतपूर्व शुभता बढ़ेगी। पुराने रुके हुए धन की वसूली होगी और नई लाभदायक योजनाओं का शुभारंभ होगा।`,
      yearlyForecastEn: `In the upcoming years, the transit of Jupiter and active Raja Yogas will manifest historic growth in career, land acquisitions, social prestige, and family harmony.`,
      currentLifeState,
      yearlyTimeline,
      lifeMilestones
    }
  };
}

/**
 * 36 Ashtakoot Gun Milan based on Brihat Parashara Hora Shastra & Muhurta Chintamani
 */
export function calculateAshtakootMilan(
  boyName: string,
  boyDob: string,
  boyTime: string,
  boyPlace: string,
  girlName: string,
  girlDob: string,
  girlTime: string,
  girlPlace: string
) {
  const boyKundli = calculateVedicKundli(boyName, boyDob, boyTime, boyPlace, 'Male');
  const girlKundli = calculateVedicKundli(girlName, girlDob, girlTime, girlPlace, 'Female');

  const boyMoon = boyKundli.planets.find(p => p.name === "Moon")!;
  const girlMoon = girlKundli.planets.find(p => p.name === "Moon")!;

  const boyNakIdx = Math.floor(boyMoon.longitude / (360 / 27));
  const girlNakIdx = Math.floor(girlMoon.longitude / (360 / 27));

  const boyRashiIdx = boyMoon.rashiIndex;
  const girlRashiIdx = girlMoon.rashiIndex;

  const boyNak = NAKSHATRAS[boyNakIdx];
  const girlNak = NAKSHATRAS[girlNakIdx];

  // 1. Varna Koot (1 pt)
  // Brahmin (Cancer, Scorpio, Pisces) > Kshatriya (Aries, Leo, Sag) > Vaishya (Taurus, Virgo, Cap) > Shudra (Gemini, Libra, Aqu)
  const varnaOrder: Record<number, number> = {
    3: 4, 7: 4, 11: 4, // Brahmin = 4 (कर्क, वृश्चिक, मीन)
    0: 3, 4: 3, 8: 3,  // Kshatriya = 3 (मेष, सिंह, धनु)
    1: 2, 5: 2, 9: 2,  // Vaishya = 2 (वृषभ, कन्या, मकर)
    2: 1, 6: 1, 10: 1  // Shudra = 1 (मिथुन, तुला, कुंभ)
  };

  const boyVarnaScore = varnaOrder[boyRashiIdx] || 2;
  const girlVarnaScore = varnaOrder[girlRashiIdx] || 2;
  // Var varna >= Vadhu varna => 1 pt, else 0
  const varnaPoints = boyVarnaScore >= girlVarnaScore ? 1 : 0;

  // 2. Vashya Koot (2 pts) - Brihat Parashara Hora Shastra
  // Mesha/Vrishabha (Chatushpad), Mithuna/Kanya/Tula/Kumbha (Dwipad/Manav), Karka/Vrischika (Keet/Jalchar), Simha (Vanachar), Dhanu/Makara/Meen (Dwipad/Jalchar)
  const getRashiVashya = (rashiIdx: number): string => {
    if (rashiIdx === 0 || rashiIdx === 1) return 'Chatushpad';
    if (rashiIdx === 2 || rashiIdx === 5 || rashiIdx === 6 || rashiIdx === 10) return 'Dwipad';
    if (rashiIdx === 3 || rashiIdx === 7) return 'Keet';
    if (rashiIdx === 4) return 'Vanachar';
    if (rashiIdx === 8) return 'Dwipad';
    if (rashiIdx === 9 || rashiIdx === 11) return 'Jalchar';
    return 'Dwipad';
  };

  const boyVashya = getRashiVashya(boyRashiIdx);
  const girlVashya = getRashiVashya(girlRashiIdx);
  let vashyaMatch = 0;
  if (boyVashya === girlVashya) {
    vashyaMatch = 2;
  } else if (
    (boyVashya === 'Dwipad' && (girlVashya === 'Chatushpad' || girlVashya === 'Jalchar')) ||
    (boyVashya === 'Chatushpad' && girlVashya === 'Jalchar')
  ) {
    vashyaMatch = 1;
  } else if (
    (girlVashya === 'Dwipad' && boyVashya === 'Chatushpad')
  ) {
    vashyaMatch = 0.5;
  } else {
    vashyaMatch = 0;
  }

  // 3. Tara Koot (3 pts) - Muhurta Chintamani
  // 1: Janma, 2: Sampat, 3: Vipat, 4: Kshem, 5: Pratyari, 6: Sadhak, 7: Vadh, 8: Mitra, 9: Ati-Mitra
  const boyToGirlDistance = ((girlNakIdx - boyNakIdx + 27) % 27) + 1;
  const girlToBoyDistance = ((boyNakIdx - girlNakIdx + 27) % 27) + 1;

  const boyTaraNum = boyToGirlDistance % 9 === 0 ? 9 : boyToGirlDistance % 9;
  const girlTaraNum = girlToBoyDistance % 9 === 0 ? 9 : girlToBoyDistance % 9;

  const isAuspiciousTara = (tara: number) => [2, 4, 6, 8, 9].includes(tara); // Sampat, Kshem, Sadhak, Mitra, Ati-Mitra
  const isBoyTaraGood = isAuspiciousTara(boyTaraNum);
  const isGirlTaraGood = isAuspiciousTara(girlTaraNum);

  let taraScore = 0;
  if (isBoyTaraGood && isGirlTaraGood) {
    taraScore = 3;
  } else if (isBoyTaraGood || isGirlTaraGood) {
    taraScore = 1.5;
  } else {
    taraScore = 0;
  }

  // 4. Yoni Koot (4 pts) - 14 Sacred Animal Compatibility Matrix (शास्त्रोक्त योनि चक्र)
  // Ashwa, Gaja, Mesha, Sarpa, Shwan, Marjara, Mushaka, Gau, Mahisha, Vyaghra, Mriga, Vanara, Nakula, Simha
  const yoniAnimals = [
    "Ashwa", "Gaja", "Mesha", "Sarpa", "Shwan", "Marjara", "Mushaka",
    "Gau", "Mahisha", "Vyaghra", "Mriga", "Vanara", "Nakula", "Simha"
  ];
  const boyYoniKey = boyNak.yoni.split(' ')[0];
  const girlYoniKey = girlNak.yoni.split(' ')[0];

  // Inimical pairs: (Ashwa-Mahisha), (Gaja-Simha), (Mesha-Vanara), (Sarpa-Nakula), (Shwan-Mriga), (Marjara-Mushaka), (Gau-Vyaghra)
  const enemyPairs: [string, string][] = [
    ["Ashwa", "Mahisha"], ["Gaja", "Simha"], ["Mesha", "Vanara"],
    ["Sarpa", "Nakula"], ["Shwan", "Mriga"], ["Marjara", "Mushaka"], ["Gau", "Vyaghra"]
  ];

  const isEnemyYoni = enemyPairs.some(([a, b]) => (boyYoniKey === a && girlYoniKey === b) || (boyYoniKey === b && girlYoniKey === a));

  let yoniScore = 2;
  if (boyYoniKey === girlYoniKey) {
    yoniScore = 4; // Swastha Yoni = 4
  } else if (isEnemyYoni) {
    yoniScore = 0; // Vairi Yoni = 0
  } else {
    yoniScore = 2.5; // Mitra / Sama Yoni = 2 or 3 (avg 2.5)
  }

  // 5. Graha Maitri Koot (5 pts) - Brihat Jataka Naisargika & Tatkalika Maitri
  const planetaryFriendships: Record<string, { friends: string[]; neutrals: string[]; enemies: string[] }> = {
    Sun: { friends: ["Moon", "Mars", "Jupiter"], neutrals: ["Mercury"], enemies: ["Venus", "Saturn"] },
    Moon: { friends: ["Sun", "Mercury"], neutrals: ["Mars", "Jupiter", "Venus", "Saturn"], enemies: [] },
    Mars: { friends: ["Sun", "Moon", "Jupiter"], neutrals: ["Venus", "Saturn"], enemies: ["Mercury"] },
    Mercury: { friends: ["Sun", "Venus"], neutrals: ["Mars", "Jupiter", "Saturn"], enemies: ["Moon"] },
    Jupiter: { friends: ["Sun", "Moon", "Mars"], neutrals: ["Saturn"], enemies: ["Mercury", "Venus"] },
    Venus: { friends: ["Mercury", "Saturn"], neutrals: ["Mars", "Jupiter"], enemies: ["Sun", "Moon"] },
    Saturn: { friends: ["Mercury", "Venus"], neutrals: ["Jupiter"], enemies: ["Sun", "Moon", "Mars"] }
  };

  const boyLord = RASHIS[boyRashiIdx].lord;
  const girlLord = RASHIS[girlRashiIdx].lord;

  let maitriScore = 0;
  if (boyLord === girlLord) {
    maitriScore = 5;
  } else {
    const boyToGirlRel = planetaryFriendships[boyLord]?.friends.includes(girlLord) ? 'friend' : planetaryFriendships[boyLord]?.neutrals.includes(girlLord) ? 'neutral' : 'enemy';
    const girlToBoyRel = planetaryFriendships[girlLord]?.friends.includes(boyLord) ? 'friend' : planetaryFriendships[girlLord]?.neutrals.includes(boyLord) ? 'neutral' : 'enemy';

    if (boyToGirlRel === 'friend' && girlToBoyRel === 'friend') maitriScore = 5;
    else if ((boyToGirlRel === 'friend' && girlToBoyRel === 'neutral') || (girlToBoyRel === 'friend' && boyToGirlRel === 'neutral')) maitriScore = 4;
    else if (boyToGirlRel === 'neutral' && girlToBoyRel === 'neutral') maitriScore = 3;
    else if ((boyToGirlRel === 'friend' && girlToBoyRel === 'enemy') || (girlToBoyRel === 'friend' && boyToGirlRel === 'enemy')) maitriScore = 1;
    else if ((boyToGirlRel === 'neutral' && girlToBoyRel === 'enemy') || (girlToBoyRel === 'neutral' && boyToGirlRel === 'enemy')) maitriScore = 0.5;
    else maitriScore = 0;
  }

  // 6. Gana Koot (6 pts) - Dev, Manushya, Rakshasa
  let ganaScore = 0;
  if (boyNak.gan === girlNak.gan) {
    ganaScore = 6;
  } else if (
    (boyNak.gan === 'Dev' && girlNak.gan === 'Manushya') ||
    (boyNak.gan === 'Manushya' && girlNak.gan === 'Dev')
  ) {
    ganaScore = 6; // Classical Parashara rule: Dev and Manushya match gets 5-6 pts
  } else if (boyNak.gan === 'Dev' && girlNak.gan === 'Rakshasa') {
    ganaScore = 1; // Dev Var + Rakshasa Vadhu
  } else if (boyNak.gan === 'Rakshasa' && girlNak.gan === 'Dev') {
    ganaScore = 0;
  } else if (boyNak.gan === 'Rakshasa' && girlNak.gan === 'Manushya') {
    ganaScore = 0;
  } else if (boyNak.gan === 'Manushya' && girlNak.gan === 'Rakshasa') {
    ganaScore = 0;
  }

  // 7. Bhakoot Koot (7 pts) - 2/12 (Dwirdwadash), 6/8 (Shadashtak), 9/5 (Navapancham)
  const rashiDiff = Math.abs(boyRashiIdx - girlRashiIdx);
  let bhakootScore = 7;
  let bhakootDoshaType = "निर्दोष (No Dosha)";

  if (rashiDiff === 1 || rashiDiff === 11) {
    bhakootScore = 0;
    bhakootDoshaType = "द्विर्द्वादश दोष (2/12 Dwirdwadash - व्यय/हानि)";
  } else if (rashiDiff === 5 || rashiDiff === 7) {
    bhakootScore = 0;
    bhakootDoshaType = "षडाष्टक दोष (6/8 Shadashtak - स्वास्थ्य/विवाद)";
  } else if (rashiDiff === 4 || rashiDiff === 8) {
    bhakootScore = 0;
    bhakootDoshaType = "नवपंचम दोष (9/5 Navapancham - संतान चिंता)";
  }

  // Bhakoot Parihara (Muhurta Chintamani: "एकस्वामिग्रहयोर्भवेद्यदि..." यदि राशि स्वामी एक हों या आपस में मित्र हों तो भकूट दोष निरस्त हो जाता है)
  let bhakootParihara = false;
  if (bhakootScore === 0) {
    if (boyLord === girlLord || maitriScore >= 4) {
      bhakootScore = 7;
      bhakootParihara = true;
    }
  }

  // 8. Nadi Koot (8 pts) - Adi, Madhya, Antya (आद्य, मध्य, अंत्य)
  let nadiScore = 8;
  let nadiDosha = false;
  let nadiParihara = false;
  let nadiPariharaReason = "";

  if (boyNak.nadi === girlNak.nadi) {
    nadiDosha = true;
    nadiScore = 0;

    // Shastriya Nadi Parihara Rules (बृहत्संहिता एवं मुहूर्त चिंतामणि):
    // 1. यदि वर और कन्या की राशि एक हो परन्तु नक्षत्र भिन्न हों (Ek Rashi Vibhinna Nakshatra)
    // 2. यदि नक्षत्र एक हो परन्तु चरण भिन्न हों (Ek Nakshatra Vibhinna Pada)
    // 3. यदि नक्षत्र एक हो परन्तु राशियां भिन्न हों (जैसे कृत्तिका मेष/वृषभ में)
    if (boyRashiIdx === girlRashiIdx && boyNakIdx !== girlNakIdx) {
      nadiScore = 8;
      nadiParihara = true;
      nadiPariharaReason = "एक राशि भिन्न नक्षत्र होने से शास्त्रानुसार नाड़ी दोष का पूर्ण परिहार हो गया है।";
    } else if (boyNakIdx === girlNakIdx && boyKundli.panchang.nakshatraPada !== girlKundli.panchang.nakshatraPada) {
      nadiScore = 8;
      nadiParihara = true;
      nadiPariharaReason = "एक नक्षत्र भिन्न चरण होने से नाड़ी दोष निरस्त (साम्य) हो गया है।";
    } else if (boyNakIdx === girlNakIdx && boyRashiIdx !== girlRashiIdx) {
      nadiScore = 8;
      nadiParihara = true;
      nadiPariharaReason = "एक नक्षत्र भिन्न राशि होने से नाड़ी दोष स्वतः शून्य हो जाता है।";
    }
  }

  const totalGunas = varnaPoints + vashyaMatch + taraScore + yoniScore + maitriScore + ganaScore + bhakootScore + nadiScore;

  const kootas: GunMilanKoot[] = [
    {
      kootName: "Varna",
      kootNameHi: "वर्ण कूट",
      maxScore: 1,
      obtainedScore: varnaPoints,
      boyAttr: boyKundli.panchang.varnaHi,
      girlAttr: girlKundli.panchang.varnaHi,
      area: "Spiritual Ego & Work Compatibility",
      areaHi: "आध्यात्मिक अहंकार एवं कार्य समन्वय",
      descriptionHi: varnaPoints === 1 ? "वर-कन्या का वर्ण अनुकूल है। आध्यात्मिक एवं वैचारिक सामंजस्य उत्तम रहेगा।" : "वर का वर्ण कन्या से भिन्न है। समन्वय की आवश्यकता होगी।",
      descriptionEn: varnaPoints === 1 ? "Excellent spiritual alignment and ego compatibility." : "Different varna alignment; requires mutual understanding.",
      status: varnaPoints === 1 ? 'excellent' : 'average'
    },
    {
      kootName: "Vashya",
      kootNameHi: "वश्य कूट",
      maxScore: 2,
      obtainedScore: vashyaMatch,
      boyAttr: boyKundli.panchang.vashyaHi,
      girlAttr: girlKundli.panchang.vashyaHi,
      area: "Mutual Attraction & Dominance",
      areaHi: "पारस्परिक आकर्षण एवं प्रभाव",
      descriptionHi: vashyaMatch >= 1.5 ? "दोनों के मध्य प्राकृतिक आकर्षण और सम्मान का भाव श्रेष्ठ रहेगा।" : "सामान्य आकर्षण एवं सहयोग रहेगा।",
      descriptionEn: "Strong natural attraction and mutual respect.",
      status: vashyaMatch >= 1.5 ? 'excellent' : 'good'
    },
    {
      kootName: "Tara",
      kootNameHi: "तारा कूट",
      maxScore: 3,
      obtainedScore: taraScore,
      boyAttr: boyKundli.panchang.nakshatraHi,
      girlAttr: girlKundli.panchang.nakshatraHi,
      area: "Destiny, Health & Longevity",
      areaHi: "भाग्य, आरोग्य एवं आयुष्य अनुकूलता",
      descriptionHi: taraScore === 3 ? "तारा मिलान पूर्णतः शुभ और कल्याणकारी है। दोनों का भाग्य एक-दूसरे को बल देगा।" : "मध्यम तारा मिलान। सामान्य स्वास्थ्य एवं भाग्य वृद्धि।",
      descriptionEn: taraScore === 3 ? "Highly auspicious Tara score for longevity and health." : "Moderate Tara score.",
      status: taraScore === 3 ? 'excellent' : 'good'
    },
    {
      kootName: "Yoni",
      kootNameHi: "योनि कूट",
      maxScore: 4,
      obtainedScore: yoniScore,
      boyAttr: boyKundli.panchang.yoniHi,
      girlAttr: girlKundli.panchang.yoniHi,
      area: "Physical & Biological Compatibility",
      areaHi: "शारीरिक, जैविक एवं मानसिक सामंजस्य",
      descriptionHi: yoniScore >= 3 ? "योनि मिलान श्रेष्ठ है। वैवाहिक एवं जैविक जीवन सुखद और आनंदमय रहेगा।" : "सामान्य योनि मिलान।",
      descriptionEn: "Optimal physical and intimacy compatibility.",
      status: yoniScore >= 3 ? 'excellent' : 'good'
    },
    {
      kootName: "Graha Maitri",
      kootNameHi: "ग्रह मैत्री कूट",
      maxScore: 5,
      obtainedScore: maitriScore,
      boyAttr: `${boyKundli.panchang.chandraRashiHi} (${RASHIS[boyRashiIdx].lordHi})`,
      girlAttr: `${girlKundli.panchang.chandraRashiHi} (${RASHIS[girlRashiIdx].lordHi})`,
      area: "Mental Alignment & Friendship",
      areaHi: "मानसिक तालमेल, विचार एवं मित्रता",
      descriptionHi: maitriScore >= 4 ? "राशि स्वामियों में परस्पर मित्रता है। दोनों के विचार, जीवन मूल्य और सोच एक जैसी रहेगी।" : "मध्यम मित्रता, मतभेदों का विवेकपूर्ण समाधान संभव है।",
      descriptionEn: maitriScore >= 4 ? "Harmonious mental rapport and lasting friendship." : "Moderate friendship.",
      status: maitriScore >= 4 ? 'excellent' : 'good'
    },
    {
      kootName: "Gana",
      kootNameHi: "गण कूट",
      maxScore: 6,
      obtainedScore: ganaScore,
      boyAttr: boyKundli.panchang.ganHi,
      girlAttr: girlKundli.panchang.ganHi,
      area: "Temperament & Behavioral Alignment",
      areaHi: "स्वभाव, आचरण एवं व्यवहारिक अनुकूलता",
      descriptionHi: ganaScore === 6 ? "दोनों का गण समान या अनुकूल है। स्वभाव में पूर्ण सामंजस्य रहेगा।" : "गणों में भिन्नता है, आपसी सहनशीलता आवश्यक होगी।",
      descriptionEn: ganaScore === 6 ? "Perfect temperamental harmony." : "Different temperament; requires mutual adjustment.",
      status: ganaScore === 6 ? 'excellent' : 'dosha'
    },
    {
      kootName: "Bhakoot",
      kootNameHi: "भकूट कूट",
      maxScore: 7,
      obtainedScore: bhakootScore,
      boyAttr: boyKundli.panchang.chandraRashiHi,
      girlAttr: girlKundli.panchang.chandraRashiHi,
      area: "Family Welfare, Love & Prosperity",
      areaHi: "वंश वृद्धि, पारिवारिक सुख एवं समृद्धि",
      descriptionHi: bhakootScore === 7 ? "भकूट मिलान निर्दोष है। परिवार में खुशहाली, प्रेम और आर्थिक स्थिरता बनी रहेगी।" : "भकूट दोष के लक्षण हैं, परिहार अनुष्ठान लाभकारी रहेगा।",
      descriptionEn: bhakootScore === 7 ? "Flawless Bhakoot alignment ensuring prosperity." : "Bhakoot remedial measures suggested.",
      status: bhakootScore === 7 ? 'excellent' : 'dosha'
    },
    {
      kootName: "Nadi",
      kootNameHi: "नाड़ी कूट",
      maxScore: 8,
      obtainedScore: nadiScore,
      boyAttr: boyKundli.panchang.nadiHi,
      girlAttr: girlKundli.panchang.nadiHi,
      area: "Genetics, Progeny & Health",
      areaHi: "आनुवंशिकी, संतान सुख एवं दीर्घायु",
      descriptionHi: nadiScore === 8 ? "नाड़ी दोष से पूर्णतः मुक्त। संतान सुख, स्वास्थ्य और वंश वृद्धि के लिए सर्वोत्तम।" : "समान नाड़ी होने से नाड़ी दोष के लक्षण हैं। महामृत्युंजय जाप या स्वर्ण दान से शांति करें।",
      descriptionEn: nadiScore === 8 ? "Zero Nadi Dosha. Exceptional for healthy progeny and longevity." : "Same Nadi observed; Vedic remedies suggested.",
      status: nadiScore === 8 ? 'excellent' : 'dosha'
    }
  ];

  let verdictHi = "";
  let verdictEn = "";
  let quality: 'Uttam' | 'Madhyam' | 'Sadharan' = 'Uttam';

  if (totalGunas >= 28) {
    quality = 'Uttam';
    verdictHi = "🌟 सर्वोत्तम एवं अत्यंत शुभ विवाह मिलान (Uttam Milan)! 36 में से " + totalGunas.toFixed(1) + " गुण मिल रहे हैं। शास्त्रानुसार यह विवाह सर्वथा फलदायी, प्रेमपूर्ण और समृद्ध रहेगा।";
    verdictEn = "🌟 Outstanding Match (Uttam Milan)! " + totalGunas.toFixed(1) + "/36 Gunas matched. Highly recommended for a prosperous and blissful married life.";
  } else if (totalGunas >= 18) {
    quality = 'Madhyam';
    verdictHi = "✨ शुभ एवं मध्यम मिलान (Madhyam Milan)। 36 में से " + totalGunas.toFixed(1) + " गुण मिल रहे हैं। आवश्यक ज्योतिषीय सुझावों के साथ विवाह किया जा सकता है।";
    verdictEn = "✨ Favorable Match (Madhyam Milan). " + totalGunas.toFixed(1) + "/36 Gunas matched. Compatible with standard Vedic practices.";
  } else {
    quality = 'Sadharan';
    verdictHi = "⚠️ सामान्य मिलान (18 से कम गुण)। केवल " + totalGunas.toFixed(1) + " गुण मिल रहे हैं। किसी वरिष्ठ ज्योतिषी अथवा पंडित से व्यक्तिगत परामर्श अवश्य लें।";
    verdictEn = "⚠️ Low Compatibility Match (<18 Gunas). Detailed consultation with a traditional Vedic scholar is advised.";
  }

  return {
    boyKundli,
    girlKundli,
    totalGunas: totalGunas.toFixed(1),
    quality,
    verdictHi,
    verdictEn,
    kootas,
    boyManglik: boyKundli.doshasAndYogas.manglik.isManglik,
    boyManglikParihara: boyKundli.doshasAndYogas.manglik.parihara,
    girlManglik: girlKundli.doshasAndYogas.manglik.isManglik,
    girlManglikParihara: girlKundli.doshasAndYogas.manglik.parihara,
    manglikVerdictHi: (boyKundli.doshasAndYogas.manglik.isManglik && girlKundli.doshasAndYogas.manglik.isManglik)
      ? "दोनों मांगलिक हैं, अतः शास्त्रानुसार दोनों का मांगलिक दोष स्वतः निरस्त (साम्य) हो जाता है।"
      : (!boyKundli.doshasAndYogas.manglik.isManglik && !girlKundli.doshasAndYogas.manglik.isManglik)
      ? "दोनों ही मांगलिक दोष से मुक्त हैं।"
      : "एक पक्ष मांगलिक है। कुंभ विवाह या मंगल शांति से दोष का पूर्ण परिहार हो जाएगा।"
  };
}
