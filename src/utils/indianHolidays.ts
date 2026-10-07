export interface IndianHoliday {
  month: number; // 1-12
  day: number;   // 1-31
  nameEn: string;
  nameHi: string;
  symbol: string;
  type: 'NATIONAL' | 'FESTIVAL' | 'CULTURAL';
}

// Major Indian Festivals & Gazetted Holidays Calendar Data (2026 Official Calendar)
export const INDIAN_HOLIDAYS_LIST: IndianHoliday[] = [
  // January
  { month: 1, day: 1, nameEn: "New Year's Day", nameHi: "नववर्ष दिवस", symbol: "🎆", type: "FESTIVAL" },
  { month: 1, day: 14, nameEn: "Makar Sankranti / Pongal / Lohri", nameHi: "मकर संक्रांति / पोंगल / लोहड़ी", symbol: "🪁", type: "FESTIVAL" },
  { month: 1, day: 26, nameEn: "Republic Day", nameHi: "गणतंत्र दिवस", symbol: "🇮🇳", type: "NATIONAL" },

  // February
  { month: 2, day: 14, nameEn: "Vasant Panchami / Saraswati Puja", nameHi: "बसंत पंचमी / सरस्वती पूजा", symbol: "🌸", type: "FESTIVAL" },
  { month: 2, day: 15, nameEn: "Maha Shivratri", nameHi: "महाशिवरात्रि", symbol: "🕉️", type: "FESTIVAL" },

  // March
  { month: 3, day: 3, nameEn: "Holika Dahan", nameHi: "होलिका दहन", symbol: "🔥", type: "FESTIVAL" },
  { month: 3, day: 4, nameEn: "Holi (Dhulandi)", nameHi: "होली (रंगोत्सव)", symbol: "🎨", type: "FESTIVAL" },
  { month: 3, day: 8, nameEn: "International Women's Day", nameHi: "अंतरराष्ट्रीय महिला दिवस", symbol: "👩", type: "CULTURAL" },
  { month: 3, day: 20, nameEn: "Eid-ul-Fitr", nameHi: "ईद-उल-फ़ित्र", symbol: "🌙", type: "FESTIVAL" },
  { month: 3, day: 27, nameEn: "Ram Navami", nameHi: "राम नवमी", symbol: "🚩", type: "FESTIVAL" },
  { month: 3, day: 31, nameEn: "Mahavir Jayanti", nameHi: "महावीर जयंती", symbol: "🏹", type: "FESTIVAL" },

  // April
  { month: 4, day: 3, nameEn: "Good Friday", nameHi: "गुड फ्राइडे", symbol: "✝️", type: "FESTIVAL" },
  { month: 4, day: 14, nameEn: "Ambedkar Jayanti / Baisakhi", nameHi: "अम्बेडकर जयंती / बैसाखी", symbol: "🌾", type: "NATIONAL" },

  // May
  { month: 5, day: 1, nameEn: "International Labour Day", nameHi: "अंतरराष्ट्रीय मजदूर दिवस", symbol: "🛠️", type: "NATIONAL" },
  { month: 5, day: 27, nameEn: "Bakrid / Eid-ul-Adha", nameHi: "ईद-उल-अज़हा (बकरीद)", symbol: "🐐", type: "FESTIVAL" },
  { month: 5, day: 31, nameEn: "Buddha Purnima", nameHi: "बुद्ध पूर्णिमा", symbol: "☸️", type: "FESTIVAL" },

  // June
  { month: 6, day: 21, nameEn: "International Yoga Day", nameHi: "अंतरराष्ट्रीय योग दिवस", symbol: "🧘", type: "CULTURAL" },
  { month: 6, day: 26, nameEn: "Muharram", nameHi: "मुहर्रम", symbol: "🌙", type: "FESTIVAL" },

  // July
  { month: 7, day: 29, nameEn: "Guru Purnima", nameHi: "गुरु पूर्णिमा", symbol: "🌧️", type: "FESTIVAL" },

  // August
  { month: 8, day: 15, nameEn: "Independence Day", nameHi: "स्वतंत्रता दिवस", symbol: "🇮🇳", type: "NATIONAL" },
  { month: 8, day: 25, nameEn: "Milad-un-Nabi", nameHi: "मिलाद-उन-नबी", symbol: "🌙", type: "FESTIVAL" },
  { month: 8, day: 28, nameEn: "Raksha Bandhan", nameHi: "रक्षाबंधन (राखी)", symbol: "🌸", type: "FESTIVAL" },

  // September
  { month: 9, day: 4, nameEn: "Krishna Janmashtami", nameHi: "श्रीकृष्ण जन्माष्टमी", symbol: "🪈", type: "FESTIVAL" },
  { month: 9, day: 14, nameEn: "Ganesh Chaturthi", nameHi: "गणेश चतुर्थी", symbol: "🐘", type: "FESTIVAL" },
  { month: 9, day: 25, nameEn: "Onam Festival", nameHi: "ओणम", symbol: "🌾", type: "FESTIVAL" },

  // October
  { month: 10, day: 2, nameEn: "Mahatma Gandhi Jayanti", nameHi: "महात्मा गांधी जयंती", symbol: "🕊️", type: "NATIONAL" },
  { month: 10, day: 20, nameEn: "Dussehra / Vijayadashami", nameHi: "दशहरा / विजयादशमी", symbol: "🏹", type: "FESTIVAL" },
  { month: 10, day: 29, nameEn: "Karwa Chauth", nameHi: "करवाचौथ", symbol: "🪔", type: "FESTIVAL" },

  // November
  { month: 11, day: 8, nameEn: "Diwali / Deepawali", nameHi: "दीपावली / दिवाली", symbol: "🪔", type: "FESTIVAL" },
  { month: 11, day: 9, nameEn: "Govardhan Puja", nameHi: "गोवर्धन पूजा", symbol: "🪔", type: "FESTIVAL" },
  { month: 11, day: 10, nameEn: "Bhai Dooj", nameHi: "भाई दूज", symbol: "🪔", type: "FESTIVAL" },
  { month: 11, day: 15, nameEn: "Chhath Puja", nameHi: "छठ पूजा", symbol: "🎇", type: "FESTIVAL" },
  { month: 11, day: 24, nameEn: "Guru Nanak Jayanti", nameHi: "गुरु नानक जयंती", symbol: "🪯", type: "FESTIVAL" },

  // December
  { month: 12, day: 25, nameEn: "Christmas Day", nameHi: "क्रिसमस दिवस", symbol: "🎄", type: "FESTIVAL" },
  { month: 12, day: 31, nameEn: "New Year's Eve", nameHi: "नए साल की पूर्व संध्या", symbol: "🎆", type: "FESTIVAL" },
];

export function getHolidayForDate(month: number | string, day: number | string): IndianHoliday | undefined {
  const m = typeof month === 'number' ? month : parseInt(String(month), 10);
  const d = typeof day === 'number' ? day : parseInt(String(day), 10);
  return INDIAN_HOLIDAYS_LIST.find(h => h.month === m && h.day === d);
}

export function getHolidaysForMonth(month: number | string): IndianHoliday[] {
  const m = typeof month === 'number' ? month : parseInt(String(month), 10);
  return INDIAN_HOLIDAYS_LIST.filter(h => h.month === m);
}
