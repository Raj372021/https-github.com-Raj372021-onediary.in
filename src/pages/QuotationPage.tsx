import React, { useState, useEffect, useRef } from "react";
import { safeHtml2Canvas } from "../utils/safeHtml2Canvas";
import { 
  ArrowLeft, FileText, Plus, Trash2, Printer, Share2, Save, CheckCircle, 
  Building2, User, Phone, MapPin, Calendar, CreditCard, Receipt, Eye, 
  Copy, Download, Edit2, Search, Check, FileCheck, Sparkles, AlertCircle, 
  RefreshCw, Palette, Layers, CheckSquare, Type, ShieldAlert,
  Wrench, Zap, Droplet, Hammer, MinusCircle, ZoomIn, ZoomOut, X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAppContext } from "../context/AppContext";
import { sanitizeInput, checkRateLimit } from "../utils/security";

export interface QuotationItem {
  id: string;
  description: string;
  unit: string; // SFT, MM, RFT, Inch, Meter, SQM, Pcs, Days, Hours, LumpSum, Brass, Bags, Kg, Tonne, Job, etc.
  quantity: number;
  rate: number;
  amount: number;
}

export interface QuotationData {
  id: string;
  docType: 'QUOTATION' | 'TAX_INVOICE' | 'DELIVERY_CHALLAN' | 'ESTIMATE' | 'PERFORMA' | 'WORK_ORDER' | 'PURCHASE_ORDER' | 'CASH_MEMO' | 'MEASUREMENT_BILL' | string;
  docNumber: string;
  billDocLanguage?: 'en' | 'hi' | 'gu' | 'mr';
  date: string;
  validUntil: string;
  templateTheme: 'RAJKAPOOR_STYLE' | 'NAVY_CORPORATE' | 'CLASSIC_MINIMAL' | 'ROYAL_GOLD' | 'EMERALD_MODERN' | 'HEADER_FRAME' | string;
  tradeCategory?: string;
  
  // Contractor Info
  companyName: string;
  tagline: string;
  contractorName: string;
  phone: string;
  altPhone: string;
  email: string;
  address: string;
  gstin: string;
  upiId: string;
  bankDetails: string;
  symbol?: string;

  // Custom Banner / Title
  billTitle: string; // e.g. "BILL FOR LEBUR WITH MATERIEL CHARGES"

  // Client Info
  clientName: string;
  clientCompany: string;
  clientPhone: string;
  clientAddress: string;
  siteLocation: string;
  poNumber: string;
  shipDate: string;
  preparedBy: string;

  // Line Items
  items: QuotationItem[];

  // Tax & Totals
  isGstEnabled: boolean;
  gstRate: number; // 5, 10, 12, 18, 28
  discount: number; // flat amount
  shippingCost: number; // transport/labour charge
  advancePaid: number; // Advance Amount Received

  // Terms
  terms: string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'PAID' | 'REJECTED';
  createdAt: string;
}


const COMMON_UNITS = [
  'SFT', 'SQFT', 'SQM', 'MM', 'RFT', 'INCH', 'METER', 'CFT', 'LFT', 
  'PCS/NOS', 'DAYS', 'HOURS', 'LUMPSUM', 'BRASS', 'BAGS', 'KG', 'TONNE', 
  'JOB', 'BOX', 'POINT', 'BATHROOM', 'FEET', 'SET'
];

export function numberToWordsEnglish(amount: number): string {
  const cleanAmount = Math.max(0, Math.round(Number(amount) || 0));
  if (cleanAmount === 0) return 'Rupees Zero Only';

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertLessThanThousand = (n: number): string => {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    const digit = n % 10;
    return tens[Math.floor(n / 10)] + (digit ? ' ' + ones[digit] : '');
  };

  const convertToWords = (n: number): string => {
    if (n === 0) return '';
    let result = '';

    if (Math.floor(n / 10000000) > 0) {
      result += convertToWords(Math.floor(n / 10000000)) + ' Crore ';
      n %= 10000000;
    }
    if (Math.floor(n / 100000) > 0) {
      result += convertToWords(Math.floor(n / 100000)) + ' Lakh ';
      n %= 100000;
    }
    if (Math.floor(n / 1000) > 0) {
      result += convertToWords(Math.floor(n / 1000)) + ' Thousand ';
      n %= 1000;
    }
    if (Math.floor(n / 100) > 0) {
      result += convertToWords(Math.floor(n / 100)) + ' Hundred ';
      n %= 100;
    }
    if (n > 0) {
      result += convertLessThanThousand(n) + ' ';
    }
    return result.trim();
  };

  return 'Rupees ' + convertToWords(cleanAmount) + ' Only';
}

export function numberToWordsHindi(amount: number): string {
  const cleanAmount = Math.max(0, Math.round(Number(amount) || 0));
  if (cleanAmount === 0) return 'शून्य रुपये मात्र';

  const ones = ['', 'एक', 'दो', 'तीन', 'चार', 'पाँच', 'छह', 'सात', 'आठ', 'नौ', 'दस',
    'ग्यारह', 'बारह', 'तेरह', 'चौदह', 'पंद्रह', 'सोलह', 'सत्रह', 'अठारह', 'उन्नीस'];
  const tens = ['', '', 'बीस', 'तीस', 'चालीस', 'पचास', 'साठ', 'सत्तर', 'अस्सी', 'नब्बे'];

  const convertLessThanThousand = (n: number): string => {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    const digit = n % 10;
    return tens[Math.floor(n / 10)] + (digit ? ' ' + ones[digit] : '');
  };

  const convertToWords = (n: number): string => {
    if (n === 0) return '';
    let result = '';

    if (Math.floor(n / 10000000) > 0) {
      result += convertToWords(Math.floor(n / 10000000)) + ' करोड़ ';
      n %= 10000000;
    }
    if (Math.floor(n / 100000) > 0) {
      result += convertToWords(Math.floor(n / 100000)) + ' लाख ';
      n %= 100000;
    }
    if (Math.floor(n / 1000) > 0) {
      result += convertToWords(Math.floor(n / 1000)) + ' हज़ार ';
      n %= 1000;
    }
    if (Math.floor(n / 100) > 0) {
      result += convertToWords(Math.floor(n / 100)) + ' सौ ';
      n %= 100;
    }
    if (n > 0) {
      result += convertLessThanThousand(n) + ' ';
    }
    return result.trim();
  };

  return convertToWords(cleanAmount) + ' रुपये मात्र';
}

export function numberToWordsGujarati(amount: number): string {
  const cleanAmount = Math.max(0, Math.round(Number(amount) || 0));
  if (cleanAmount === 0) return 'શૂન્ય રૂપિયા માત્ર';

  const ones = ['', 'એક', 'બે', 'ત્રણ', 'ચાર', 'પાંચ', 'છ', 'સાત', 'આઠ', 'નવ', 'દસ',
    'અગિયાર', 'બાર', 'તેર', 'ચૌદ', 'પંદર', 'સોળ', 'સત્તર', 'અઢાર', 'ઓગણીસ'];
  const tens = ['', '', 'વીસ', 'ત્રીસ', 'ચાલીસ', 'પચાસ', 'સાઠ', 'સિત્તેર', 'એંસી', 'નેવુ'];

  const convertLessThanThousand = (n: number): string => {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    const digit = n % 10;
    return tens[Math.floor(n / 10)] + (digit ? ' ' + ones[digit] : '');
  };

  const convertToWords = (n: number): string => {
    if (n === 0) return '';
    let result = '';

    if (Math.floor(n / 10000000) > 0) {
      result += convertToWords(Math.floor(n / 10000000)) + ' કરોડ ';
      n %= 10000000;
    }
    if (Math.floor(n / 100000) > 0) {
      result += convertToWords(Math.floor(n / 100000)) + ' લાખ ';
      n %= 100000;
    }
    if (Math.floor(n / 1000) > 0) {
      result += convertToWords(Math.floor(n / 1000)) + ' હજાર ';
      n %= 1000;
    }
    if (Math.floor(n / 100) > 0) {
      result += convertToWords(Math.floor(n / 100)) + ' સો ';
      n %= 100;
    }
    if (n > 0) {
      result += convertLessThanThousand(n) + ' ';
    }
    return result.trim();
  };

  return convertToWords(cleanAmount) + ' રૂપિયા માત્ર';
}

export function numberToWordsMarathi(amount: number): string {
  const cleanAmount = Math.max(0, Math.round(Number(amount) || 0));
  if (cleanAmount === 0) return 'शून्य रुपये फक्त';

  const ones = ['', 'एक', 'दोन', 'तीन', 'चार', 'पाच', 'सहा', 'सात', 'आठ', 'नऊ', 'दहा',
    'अकरा', 'बारा', 'तेरा', 'चौदा', 'पंधरा', 'सोळा', 'सतरा', 'अठरा', 'एकोणवीस'];
  const tens = ['', '', 'वीस', 'तीस', 'चाळीस', 'पन्नास', 'साठ', 'सत्तर', 'ऐंशी', 'नव्वद'];

  const convertLessThanThousand = (n: number): string => {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    const digit = n % 10;
    return tens[Math.floor(n / 10)] + (digit ? ' ' + ones[digit] : '');
  };

  const convertToWords = (n: number): string => {
    if (n === 0) return '';
    let result = '';

    if (Math.floor(n / 10000000) > 0) {
      result += convertToWords(Math.floor(n / 10000000)) + ' कोटी ';
      n %= 10000000;
    }
    if (Math.floor(n / 100000) > 0) {
      result += convertToWords(Math.floor(n / 100000)) + ' लाख ';
      n %= 100000;
    }
    if (Math.floor(n / 1000) > 0) {
      result += convertToWords(Math.floor(n / 1000)) + ' हजार ';
      n %= 1000;
    }
    if (Math.floor(n / 100) > 0) {
      result += convertToWords(Math.floor(n / 100)) + ' शंभर ';
      n %= 100;
    }
    if (n > 0) {
      result += convertLessThanThousand(n) + ' ';
    }
    return result.trim();
  };

  return convertToWords(cleanAmount) + ' रुपये फक्त';
}

export function renderAmountInWords(amount: number, lang: 'en' | 'hi' | 'gu' | 'mr'): string {
  if (lang === 'en') {
    return numberToWordsEnglish(amount);
  }
  if (lang === 'gu') {
    return numberToWordsGujarati(amount);
  }
  if (lang === 'mr') {
    return numberToWordsMarathi(amount);
  }
  return numberToWordsHindi(amount);
}

export function getDocTypeLabel(type: string, lang: 'en' | 'hi' | 'gu' | 'mr'): string {
  switch (type) {
    case 'DELIVERY_CHALLAN':
      if (lang === 'en') return 'DELIVERY CHALLAN';
      if (lang === 'hi') return 'डिलीवरी चालान (DELIVERY CHALLAN)';
      if (lang === 'gu') return 'ડિલિવરી ચલાન (DELIVERY CHALLAN)';
      if (lang === 'mr') return 'डिलीव्हरी चलना (DELIVERY CHALLAN)';
      return 'DELIVERY CHALLAN';
    case 'TAX_INVOICE':
      if (lang === 'en') return 'TAX INVOICE';
      if (lang === 'hi') return 'टैक्स इनवॉइस (TAX INVOICE)';
      if (lang === 'gu') return 'ટેક્સ ઇનવોઇસ (TAX INVOICE)';
      if (lang === 'mr') return 'टॅक्स इनव्हॉइस (TAX INVOICE)';
      return 'TAX INVOICE';
    case 'QUOTATION':
      if (lang === 'en') return 'QUOTATION';
      if (lang === 'hi') return 'कोटेशन / दर प्राक्कलन (QUOTATION)';
      if (lang === 'gu') return 'ક્વોટેશન / દર પત્રક (QUOTATION)';
      if (lang === 'mr') return 'कोटेशन / दर पत्रक (QUOTATION)';
      return 'QUOTATION';
    case 'ESTIMATE':
      if (lang === 'en') return 'WORK ESTIMATE';
      if (lang === 'hi') return 'कार्य अनुमान (WORK ESTIMATE)';
      if (lang === 'gu') return 'કામ અંદાજ પત્રક (WORK ESTIMATE)';
      if (lang === 'mr') return 'कामाचे अंदाजपत्रक (WORK ESTIMATE)';
      return 'WORK ESTIMATE';
    case 'PERFORMA':
      if (lang === 'en') return 'PROFORMA INVOICE';
      if (lang === 'hi') return 'प्रोफार्मा इनवॉइस (PROFORMA INVOICE)';
      if (lang === 'gu') return 'પ્રોફોર્મા ઇનવોઇસ (PROFORMA INVOICE)';
      if (lang === 'mr') return 'प्रोफॉर्म इनव्हॉइस (PROFORMA INVOICE)';
      return 'PROFORMA INVOICE';
    case 'WORK_ORDER':
      if (lang === 'en') return 'WORK ORDER';
      if (lang === 'hi') return 'वर्क ऑर्डर (WORK ORDER)';
      if (lang === 'gu') return 'વર્ક ઓર્ડર (WORK ORDER)';
      if (lang === 'mr') return 'वर्क ऑर्डर (WORK ORDER)';
      return 'WORK ORDER';
    case 'PURCHASE_ORDER':
      if (lang === 'en') return 'PURCHASE ORDER';
      if (lang === 'hi') return 'परचेज ऑर्डर (PURCHASE ORDER)';
      if (lang === 'gu') return 'પર્ચાઇસ ઓર્ડર (PURCHASE ORDER)';
      if (lang === 'mr') return 'परचेस ऑर्डर (PURCHASE ORDER)';
      return 'PURCHASE ORDER';
    case 'CASH_MEMO':
      if (lang === 'en') return 'CASH MEMO';
      if (lang === 'hi') return 'कैश मेमो (CASH MEMO)';
      if (lang === 'gu') return 'કેશ મેમો (CASH MEMO)';
      if (lang === 'mr') return 'कॅश मेमो (CASH MEMO)';
      return 'CASH MEMO';
    case 'MEASUREMENT_BILL':
      if (lang === 'en') return 'MEASUREMENT SHEET BILL';
      if (lang === 'hi') return 'मेज़रमेंट शीट बिल (MEASUREMENT BILL)';
      if (lang === 'gu') return 'માપણી શીટ બિલ (MEASUREMENT BILL)';
      if (lang === 'mr') return 'मोजमाप पत्रक बिल (MEASUREMENT BILL)';
      return 'MEASUREMENT SHEET BILL';
    default:
      return type;
  }
}

export function getBillLabel(key: string, lang: 'en' | 'hi' | 'gu' | 'mr'): string {
  const dictionary: Record<string, Record<'en' | 'hi' | 'gu' | 'mr', string>> = {
    date: {
      en: 'DATE:',
      hi: 'दिनांक (DATE):',
      gu: 'તારીખ (DATE):',
      mr: 'दिनांक (DATE):',
    },
    ref: {
      en: 'REF:',
      hi: 'क्रमांक (REF):',
      gu: 'બિલ નંબર (REF):',
      mr: 'संदर्भ क्र. (REF):',
    },
    mobile: {
      en: 'MOBIL.',
      hi: 'मो.',
      gu: 'મો.',
      mr: 'मो.',
    },
    address: {
      en: 'Address:',
      hi: 'पता:',
      gu: 'સરનામું:',
      mr: 'पत्ता:',
    },
    client: {
      en: 'PARTY / CLIENT:',
      hi: 'ग्राहक / पार्टी:',
      gu: 'ગ્રાહક / પાર્ટી:',
      mr: 'ग्राहक / पार्टी:',
    },
    siteLocation: {
      en: 'SITE LOCATION:',
      hi: 'साइट स्थान:',
      gu: 'સાઇટ સ્થળ:',
      mr: 'साइट ठिकाण:',
    },
    asSpecified: {
      en: 'As specified',
      hi: 'यथा निर्दिष्ट',
      gu: 'જણાવ્યા મુજબ',
      mr: 'નમુદ કર્યા મુજબ',
    },
    defaultBillTitle: {
      en: 'BILL FOR LABOUR WITH MATERIAL CHARGES',
      hi: 'सामग्री एवं लेबर बिल',
      gu: 'મટીરીયલ અને મજૂરી કામ બિલ',
      mr: 'मटेरियल व मजुरी काम बिल',
    },
    itemDesc: {
      en: 'Item Description',
      hi: 'कार्य / सामग्री विवरण',
      gu: 'કામ / મટીરીયલ વિગત',
      mr: 'काम / साहित्य तपशील',
    },
    qtyUnit: {
      en: 'Quantity / Unit',
      hi: 'मात्रा / इकाई',
      gu: 'જથ્થો / યુનિટ',
      mr: 'प्रमाण / युનિટ',
    },
    unitRate: {
      en: 'Unit Rate (₹)',
      hi: 'दर (₹)',
      gu: 'ભાવ (₹)',
      mr: 'दर (₹)',
    },
    totalPrice: {
      en: 'Total Price (₹)',
      hi: 'कुल राशि (₹)',
      gu: 'કુલ રકમ (₹)',
      mr: 'एकूण रक्कम (₹)',
    },
    subtotal: {
      en: 'Subtotal:',
      hi: 'उप-योग (Subtotal):',
      gu: 'સબટોટલ (Subtotal):',
      mr: 'सबटोटल (Subtotal):',
    },
    discount: {
      en: 'Less Discount:',
      hi: 'छूट (Less Discount):',
      gu: 'ડિસ્કાઉન્ટ (Less Discount):',
      mr: 'सवलत (Less Discount):',
    },
    gst: {
      en: 'Tax (GST):',
      hi: 'जीएसटी (GST):',
      gu: 'જીએસટી (GST):',
      mr: 'जीएसटी (GST):',
    },
    shipping: {
      en: 'Shipping / Transport Cost:',
      hi: 'भाड़ा व ट्रांसपोर्ट खर्च:',
      gu: 'ટ્રાન્સપોર્ટ ખર્ચ:',
      mr: 'वाहतूक खर्च:',
    },
    grandTotal: {
      en: 'Grand Total:',
      hi: 'कुल देय राशि (Grand Total):',
      gu: 'કુલ રકમ (Grand Total):',
      mr: 'एकूण देय रक्कम (Grand Total):',
    },
    lessAdvance: {
      en: 'LESS ADVANCE RECEIVED:',
      hi: 'घटाया अग्रिम जमा राशि (Advance Paid):',
      gu: 'એડવાન્સ જમા રકમ (Advance Paid):',
      mr: 'अग्रिम जमा रक्कम (Advance Paid):',
    },
    netDue: {
      en: 'NET REMAINING DUE:',
      hi: 'शेष देय राशि (Net Balance Due):',
      gu: 'બાકી દેવાની રકમ (Net Balance Due):',
      mr: 'उरलेली बाकी रक्कम (Net Balance Due):',
    },
    amountInWords: {
      en: 'TOTAL AMOUNT IN WORDS:',
      hi: 'कुल राशि शब्दों में:',
      gu: 'કુલ રકમ શબ્દોમાં:',
      mr: 'एकूण रक्कम अक्षरी:',
    },
    balanceInWords: {
      en: 'BALANCE PAYABLE IN WORDS:',
      hi: 'शेष देय राशि शब्दों में:',
      gu: 'બાકી રકમ શબ્દોમાં:',
      mr: 'उरलेली बाकी रक्कम अक्षरी:',
    },
    terms: {
      en: 'TERMS AND CONDITIONS:',
      hi: 'शर्तें एवं नियम (TERMS & CONDITIONS):',
      gu: 'શરતો અને નિયમો (TERMS & CONDITIONS):',
      mr: 'अटी व शर्ती (TERMS & CONDITIONS):',
    },
    clientSignature: {
      en: 'Client Signature',
      hi: 'ग्राहक हस्ताक्षर (Client Signature)',
      gu: 'ગ્રાહક સહી (Client Signature)',
      mr: 'ग्राहकाची सही (Client Signature)',
    },
    authorizedSignature: {
      en: 'Authorized Contractor Signature',
      hi: 'अधिकृत ठेकेदार हस्ताक्षर',
      gu: 'મુખ્ય કોન્ટ્રાક્ટર સહી',
      mr: 'अधिकृत कंत्राटदार सही',
    }
  };

  return dictionary[key]?.[lang] || dictionary[key]?.['en'] || key;
}

export function getPresetBillTitle(type: string, lang: 'en' | 'hi' | 'gu' | 'mr'): string {
  switch (type) {
    case 'DELIVERY_CHALLAN':
      if (lang === 'en') return 'DELIVERY CHALLAN & DESPATCH MEMO';
      if (lang === 'hi') return 'सामग्री सुपुर्दगी चालान (DELIVERY CHALLAN)';
      if (lang === 'gu') return 'મટીરીયલ ડિલિવરી ચલાન (DELIVERY CHALLAN)';
      if (lang === 'mr') return 'साहित्य सुपूर्दगी चलना (DELIVERY CHALLAN)';
      return 'DELIVERY CHALLAN & DESPATCH MEMO';
    case 'TAX_INVOICE':
      if (lang === 'en') return 'TAX INVOICE / FINAL BILL';
      if (lang === 'hi') return 'टैक्स इनवॉइस एवं अंतिम बिल';
      if (lang === 'gu') return 'ટેક્સ ઇનવોઇસ અને અંતિમ બિલ';
      if (lang === 'mr') return 'टॅक्स इनव्हॉइस व अंतिम बिल';
      return 'TAX INVOICE / FINAL BILL';
    case 'QUOTATION':
      if (lang === 'en') return 'QUOTATION & RATE ESTIMATE';
      if (lang === 'hi') return 'कोटेशन एवं दर प्राक्कलन';
      if (lang === 'gu') return 'ક્વોટેશન અને ભાવ પત્રક';
      if (lang === 'mr') return 'कोटेशन व दर पत्रक';
      return 'QUOTATION & RATE ESTIMATE';
    case 'ESTIMATE':
      if (lang === 'en') return 'WORK ESTIMATE & COST BUDGET';
      if (lang === 'hi') return 'कार्य लागत अनुमान (ESTIMATE)';
      if (lang === 'gu') return 'કામ અંદાજ પત્રક (ESTIMATE)';
      if (lang === 'mr') return 'कामाचे अंदाजपत्रक (ESTIMATE)';
      return 'WORK ESTIMATE & COST BUDGET';
    case 'PERFORMA':
      if (lang === 'en') return 'PROFORMA INVOICE';
      if (lang === 'hi') return 'प्रोफार्मा इनवॉइस';
      if (lang === 'gu') return 'પ્રોફોર્મા ઇનવોઇસ';
      if (lang === 'mr') return 'प्रोफॉर्म इनव्हॉइस';
      return 'PROFORMA INVOICE';
    case 'WORK_ORDER':
      if (lang === 'en') return 'WORK ORDER & JOB AGREEMENT';
      if (lang === 'hi') return 'वर्क ऑर्डर एवं कार्य आदेश';
      if (lang === 'gu') return 'વર્ક ઓર્ડર અને કરાર';
      if (lang === 'mr') return 'वर्क ઓર્ડર व करार';
      return 'WORK ORDER & JOB AGREEMENT';
    case 'PURCHASE_ORDER':
      if (lang === 'en') return 'PURCHASE ORDER (PO)';
      if (lang === 'hi') return 'परचेज ऑर्डर (क्रय आदेश)';
      if (lang === 'gu') return 'પર્ચાઇસ ઓર્ડર (ખરીદ ઓર્ડર)';
      if (lang === 'mr') return 'परचेस ऑर्डर (खरेदी आदेश)';
      return 'PURCHASE ORDER (PO)';
    case 'CASH_MEMO':
      if (lang === 'en') return 'CASH MEMO & PAYMENT RECEIPT';
      if (lang === 'hi') return 'कैश मेमो एवं नकद रसीद';
      if (lang === 'gu') return 'કેશ મેમો અને પાવતી';
      if (lang === 'mr') return 'कॅश मेमो व नॉकड पावती';
      return 'CASH MEMO & PAYMENT RECEIPT';
    case 'MEASUREMENT_BILL':
      if (lang === 'en') return 'MEASUREMENT SHEET & SITE BILL';
      if (lang === 'hi') return 'मेज़रमेंट शीट एवं नाप बिल';
      if (lang === 'gu') return 'માપણી શીટ અને માપ બિલ';
      if (lang === 'mr') return 'मोजमाप पत्रक व माप बिल';
      return 'MEASUREMENT SHEET & SITE BILL';
    default:
      if (lang === 'en') return 'BILL FOR LABOUR WITH MATERIAL CHARGES';
      if (lang === 'hi') return 'सामग्री एवं लेबर बिल';
      if (lang === 'gu') return 'મટીરીયલ અને મજૂરી બિલ';
      if (lang === 'mr') return 'मटेरियल व मजुरी बिल';
      return 'BILL FOR LABOUR WITH MATERIAL CHARGES';
  }
}

const DEFAULT_TERMS = "• Payment Terms: Payment is due within 30 days of the invoice date.\n• Advance required before work commencement.\n• Extra work outside quotation scope will be billed separately.";

const WORK_CATEGORY_SYMBOLS = [
  { sym: '🎨', name: 'Painting / पेंटिंग' },
  { sym: '🏗️', name: 'Civil Construction / सिविल काम' },
  { sym: '🪵', name: 'Carpentry & Furniture / कारपेंटर' },
  { sym: '⚡', name: 'Electrical & Wiring / इलेक्ट्रिशियन' },
  { sym: '🚰', name: 'Plumbing & Bath / प्लंबिंग' },
  { sym: '🛠️', name: 'Welding & Fabrication / वेल्डिंग' },
  { sym: '🧱', name: 'Tiles & Marblework / टाइल्स' },
  { sym: '🛋️', name: 'POP & False Ceiling / सीलिंग' },
  { sym: '🪟', name: 'Aluminium & Glass / एल्युमिनियम' },
  { sym: '🏢', name: 'Corporate & Commercial / कॉर्पोरेट' },
  { sym: '🏙️', name: 'Real Estate & Property / रियल एस्टेट' },
  { sym: '👑', name: 'Royal Contractor / रॉयल' },
  { sym: '🛡️', name: 'Quality Assured / क्वालिटी' },
  { sym: '📐', name: 'Architect & Interior / इंटीरियर' },
  { sym: '🚗', name: 'Transport & Delivery / ट्रांसपोर्ट' },
  { sym: '🔧', name: 'Hardware & Tools / हार्डवेयर' },
  { sym: '💎', name: 'Premium Luxury / प्रीमियम' },
  { sym: '🧹', name: 'Cleaning & Housekeeping / सफाई' },
  { sym: '❄️', name: 'HVAC & AC Service / एसी रिपेयर' },
  { sym: '☀️', name: 'Solar Energy / सोलर पावर' },
  { sym: '🔒', name: 'CCTV & Security / सुरक्षा' },
  { sym: '🌿', name: 'Gardening & Lawn / गार्डनिंग' },
  { sym: '🧱', name: 'Masonry & Brickwork / राजमिस्त्री' },
  { sym: '🚜', name: 'Earthmovers & JCB / जे.सी.बी.' },
  { sym: '⭐', name: 'Star Rated Work / स्टार ठेकेदार' },
  { sym: '📜', name: 'Registered Contractor / रजिस्टर्ड' }
];

const TRADE_ITEM_CHIPS: Record<string, Array<{ name: string; unit: string; rate: number }>> = {
  PAINTER: [
    { name: 'छत पेंट (रॉयल इमल्शन)', unit: 'SFT', rate: 35 },
    { name: 'दीवार पेंट रॉयल + पुट्टी घिसाई', unit: 'SFT', rate: 39 },
    { name: 'पुरानी पपड़ी सफाई व स्क्रैपिंग', unit: 'SFT', rate: 15 },
    { name: 'दरवाजा/खिड़की ऑइल पेंट', unit: 'SFT', rate: 39 },
    { name: 'लकड़ी की पीयू/मेलमाइन पॉलिश', unit: 'SFT', rate: 85 },
    { name: 'टेक्सचर डिजाइन वॉल आर्ट', unit: 'SFT', rate: 95 },
    { name: 'पेंटर मिस्त्री लेबर हाजिरी', unit: 'Days', rate: 1000 },
  ],
  CARPENTER: [
    { name: 'मॉड्यूलर किचन कैबिनेट', unit: 'MM', rate: 185 },
    { name: 'बेडरूम अलमारी (18mm प्लाई)', unit: 'SFT', rate: 1450 },
    { name: 'फ्लश डोर फ्रेम व शटर फिटिंग', unit: 'Pcs/Nos', rate: 3500 },
    { name: 'हार्डवेयर फिटिंग (कब्जे, चैनल)', unit: 'Job', rate: 12500 },
    { name: 'टीव युनिट व वॉल पैनलिंग', unit: 'SFT', rate: 1100 },
    { name: 'कारपेंटर मिस्त्री दिहाड़ी', unit: 'Days', rate: 1200 },
  ],
  ELECTRICIAN: [
    { name: 'लाइट व पंखा प्वाइंट वायरिंग', unit: 'Point', rate: 850 },
    { name: 'पावर प्लग प्वाइंट 16A', unit: 'Point', rate: 1200 },
    { name: 'मेन डीबी बॉक्स ड्रेसिंग', unit: 'Job', rate: 4500 },
    { name: 'एलईडी प्रोफाइल लाइट चैनल', unit: 'Meter', rate: 180 },
    { name: 'सिलिंग फैन व झूमर टांगना', unit: 'Pcs/Nos', rate: 350 },
    { name: 'इलेक्ट्रिशियन विजिट चार्ज', unit: 'Job', rate: 500 },
  ],
  PLUMBER: [
    { name: 'CPVC पाइपलाइन फिटिंग 25mm', unit: 'Meter', rate: 220 },
    { name: 'बाथरूम मिक्सर व शॉवर फिटिंग', unit: 'Bathroom', rate: 6500 },
    { name: 'SWR ड्रेनेज वेस्ट पाइपलाइन', unit: 'RFT', rate: 190 },
    { name: 'कमोड व वॉश बेसिन सैनिटरी', unit: 'Pcs/Nos', rate: 1800 },
    { name: 'वाटर टैंक सिंटेक्स फिटिंग', unit: 'Job', rate: 2500 },
    { name: 'प्लंबर मिस्त्री लेबर चार्ज', unit: 'Days', rate: 1000 },
  ],
  CIVIL: [
    { name: 'ईंट की जुड़ाई काम (9 इंच)', unit: 'SFT', rate: 95 },
    { name: 'अंदरूनी दीवार प्लास्टर', unit: 'SFT', rate: 42 },
    { name: 'RCC स्लैब शटरिंग व सरिया', unit: 'SFT', rate: 120 },
    { name: 'फर्श पीसीसी कंक्रीट ढलाई', unit: 'CFT', rate: 180 },
    { name: 'मलबे व कचरे की ढुलाई', unit: 'Job', rate: 2500 },
    { name: 'राजमिस्त्री मजदूर हाजिरी', unit: 'Days', rate: 1500 },
  ],
  POP: [
    { name: 'जिप्सम फॉल्स सीलिंग चैनल', unit: 'SFT', rate: 115 },
    { name: 'कोव लाइट चैनल व बॉर्डर', unit: 'RFT', rate: 85 },
    { name: 'दीवार पर पीओपी पनिंग', unit: 'SFT', rate: 32 },
    { name: 'डिजाइनर कॉर्निश पट्टी', unit: 'RFT', rate: 95 },
    { name: 'पीओपी मिस्त्री लेबर हाजिरी', unit: 'Days', rate: 1100 },
  ],
  FABRICATION: [
    { name: 'सुरक्षा खिड़की एमएस ग्रिल', unit: 'Kg', rate: 110 },
    { name: 'स्टेनलेस स्टील SS304 रेलिंग', unit: 'RFT', rate: 1450 },
    { name: 'मुख्य गेट हेवी स्टील दरवाजा', unit: 'Job', rate: 38000 },
    { name: 'शेड रूफ टिन ट्रस स्ट्रक्चर', unit: 'SFT', rate: 160 },
    { name: 'वेल्डर व फैब्रिकेटर दिहाड़ी', unit: 'Days', rate: 1200 },
  ],
  TILE: [
    { name: 'विट्रिफाइड टाइल्स फ्लोरिंग 4x2', unit: 'SFT', rate: 48 },
    { name: 'बाथरूम दीवार डैडो टाइल्स', unit: 'SFT', rate: 52 },
    { name: 'किचन ग्रेनाइट प्लेटफॉर्म कटिंग', unit: 'RFT', rate: 380 },
    { name: 'मार्बल डायमंड मिरर पॉलिश', unit: 'SFT', rate: 45 },
    { name: 'टाइल्स मिस्त्री मजदूरी', unit: 'Days', rate: 1200 },
  ],
  DELIVERY_CHALLAN: [
    { name: 'पेंट 20 लीटर बाल्टी', unit: 'Bucket', rate: 4200 },
    { name: 'वाटरप्रूफ पुट्टी 40kg बैग', unit: 'Bag', rate: 850 },
    { name: 'ऑइल बेस्ड प्राइमर 20L', unit: 'Drum', rate: 3400 },
    { name: 'पेंट ब्रश व रोलर सेट', unit: 'Set', rate: 280 },
    { name: 'सीमेंट बाइंडिंग बैग', unit: 'Bag', rate: 380 },
  ],
  GENERAL: [
    { name: 'सामग्री व मटीरियल खर्च', unit: 'LumpSum', rate: 5000 },
    { name: 'लेबर मजदूरी काम', unit: 'Days', rate: 1000 },
    { name: 'गाड़ी भाड़ा व ट्रांसपोर्ट', unit: 'Job', rate: 800 },
    { name: 'सर्विस व कंसल्टेशन चार्ज', unit: 'Job', rate: 1500 },
  ]
};

export default function QuotationPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { userProfile, checkAndIncrementUsage, isSubscribed, paymentSettings } = useAppContext();
  const [showPaywall, setShowPaywall] = useState(false);
  const [showSymbolModal, setShowSymbolModal] = useState(false);

  const [activeTab, setActiveTab] = useState<'CREATE' | 'LIST' | 'PREVIEW' | 'SETTINGS'>('CREATE');
  const [quotations, setQuotations] = useState<QuotationData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  // Contractor / Company Profile Settings
  const [companyProfile, setCompanyProfile] = useState({
    companyName: userProfile?.name || 'SPECIALTY WORKS',
    tagline: 'PAINTING, POLISHING & INTERIOR WORKS',
    contractorName: userProfile?.name || 'Contractor',
    phone: userProfile?.phone || '9987337637',
    altPhone: '8181881318',
    email: 'contractor@example.com',
    address: 'Hanuman Nagar, Kandivali (E), Mumbai 400101',
    gstin: '27AAAAA0000A1Z5',
    upiId: 'contractor@upi',
    bankDetails: 'SBI A/C: 38291028472 | IFSC: SBIN0004812',
    symbol: '🎨'
  });

  // Working Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedTrade, setSelectedTrade] = useState<string>('PAINTER');
  const [templateTheme, setTemplateTheme] = useState<'RAJKAPOOR_STYLE' | 'NAVY_CORPORATE' | 'CLASSIC_MINIMAL' | 'ROYAL_GOLD' | 'EMERALD_MODERN' | 'HEADER_FRAME' | string>('RAJKAPOOR_STYLE');
  const [fontStyle, setFontStyle] = useState<'SANS_MODERN' | 'SERIF_ELEGANT' | 'MONO_TECH' | 'ARCHITECT_BOLD' | 'FORMAL_ROYAL'>('SANS_MODERN');

  const getFontStyleClass = (style: string) => {
    switch (style) {
      case 'SERIF_ELEGANT': return 'font-serif tracking-normal';
      case 'MONO_TECH': return 'font-mono tracking-tight';
      case 'ARCHITECT_BOLD': return 'font-sans tracking-wider uppercase-headers';
      case 'FORMAL_ROYAL': return 'font-serif tracking-wide';
      case 'SANS_MODERN':
      default: return 'font-sans tracking-normal';
    }
  };
  const [billDocLanguage, setBillDocLanguage] = useState<'en' | 'hi' | 'gu' | 'mr'>('en');
  const [docType, setDocType] = useState<string>('QUOTATION');
  const [docNumber, setDocNumber] = useState(`QUO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [billTitle, setBillTitle] = useState('BILL FOR LABOUR WITH MATERIAL CHARGES');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });

  const handleDocTypeChange = (newType: string) => {
    setDocType(newType);
    let prefix = 'DOC';
    switch (newType) {
      case 'DELIVERY_CHALLAN': prefix = 'DC'; break;
      case 'TAX_INVOICE': prefix = 'INV'; break;
      case 'QUOTATION': prefix = 'QUO'; break;
      case 'ESTIMATE': prefix = 'EST'; break;
      case 'PERFORMA': prefix = 'PI'; break;
      case 'WORK_ORDER': prefix = 'WO'; break;
      case 'PURCHASE_ORDER': prefix = 'PO'; break;
      case 'CASH_MEMO': prefix = 'CM'; break;
      case 'MEASUREMENT_BILL': prefix = 'MB'; break;
      default: prefix = 'BILL'; break;
    }

    setDocNumber(`${prefix}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setBillTitle(getPresetBillTitle(newType, billDocLanguage));
  };

  const handleBillDocLanguageChange = (newLang: 'en' | 'hi' | 'gu' | 'mr') => {
    setBillDocLanguage(newLang);
    setBillTitle(getPresetBillTitle(docType, newLang));
  };

  // Client & Extra Details
  const [clientName, setClientName] = useState('Ramesh Sharma');
  const [clientCompany, setClientCompany] = useState('');
  const [clientPhone, setClientPhone] = useState('9820012345');
  const [clientAddress, setClientAddress] = useState('Flat 402, Green Park, Malad West, Mumbai');
  const [siteLocation, setSiteLocation] = useState('Kandivali Work Site');
  const [poNumber, setPoNumber] = useState('');
  const [shipDate, setShipDate] = useState('');
  const [preparedBy, setPreparedBy] = useState('');

  // Line Items
  const [items, setItems] = useState<QuotationItem[]>([
    { id: '1', description: 'CEILING PAINT', unit: 'SFT', quantity: 4400, rate: 35, amount: 154000 },
    { id: '2', description: 'WALL PAINT ROYAL', unit: 'SFT', quantity: 12801, rate: 39, amount: 499239 },
    { id: '3', description: 'WALL AND CEILING SCRAPPING', unit: 'SFT', quantity: 3613, rate: 15, amount: 54195 },
    { id: '4', description: 'OIL PAINT', unit: 'SFT', quantity: 497, rate: 39, amount: 19383 },
  ]);

  // Financials
  const [isGstEnabled, setIsGstEnabled] = useState(true);
  const [gstRate, setGstRate] = useState<number>(10);
  const [discount, setDiscount] = useState<number>(0);
  const [shippingCost, setShippingCost] = useState<number>(150);
  const [advancePaid, setAdvancePaid] = useState<number>(50000); // Default advance sample to show deduction
  const [terms, setTerms] = useState(DEFAULT_TERMS);

  // Preview Data & In-Line Editing Toggle Mode
  const [previewData, setPreviewData] = useState<QuotationData | null>(null);
  const [isInlineEditing, setIsInlineEditing] = useState<boolean>(true); // Enabled by default for direct editing on paper!
  const [customZoom, setCustomZoom] = useState<number | null>(null); // Custom scale override (e.g. 0.50 to 1.50)
  const [screenWidth, setScreenWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 390);
  const letterheadWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setScreenWidth(window.innerWidth);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute scale factor dynamically
  const autoScale = screenWidth < 640 ? Math.min(1, Math.max(0.30, (screenWidth - 20) / 794)) : 1.0;
  const currentScale = customZoom !== null ? customZoom : (screenWidth >= 640 ? 1.0 : autoScale);

  const scrollLetterhead = (direction: 'left' | 'center' | 'right') => {
    if (!letterheadWrapperRef.current) return;
    const container = letterheadWrapperRef.current;
    if (direction === 'left') {
      container.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (direction === 'right') {
      container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
    } else {
      container.scrollTo({ left: (container.scrollWidth - container.clientWidth) / 2, behavior: 'smooth' });
    }
  };

  // Load from LocalStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('labourbook_contractor_profile');
    if (savedProfile) {
      try { setCompanyProfile(JSON.parse(savedProfile)); } catch (e) { console.error(e); }
    }

    const savedQuotations = localStorage.getItem('labourbook_quotations');
    if (savedQuotations) {
      try { 
        const parsed = JSON.parse(savedQuotations);
        setQuotations(parsed);
      } catch (e) { console.error(e); }
    }
  }, []);

  // Preset Loaders for All Trade Categories
  const loadPaintingPreset = () => {
    setSelectedTrade('PAINTER');
    setTemplateTheme('RAJKAPOOR_STYLE');
    setDocType('QUOTATION');
    setDocNumber(`QUO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setBillTitle(language === 'hi' ? 'पेंटर व पॉलिश काम का बिल (BILL FOR PAINTING & POLISHING)' : 'BILL FOR PAINTING & POLISHING WORKS');
    setCompanyProfile(prev => ({
      ...prev,
      tagline: language === 'hi' ? 'पेंटिंग, पुट्टी एवं पॉलिश ठेकेदार' : 'PAINTING AND POLISHING WORKS WITH TEXTURE DESIGNS',
    }));
    setItems([
      { id: '1', description: language === 'hi' ? 'छत का पेंट (रॉयल इमल्शन)' : 'CEILING PAINT (ROYAL EMULSION)', unit: 'SFT', quantity: 4400, rate: 35, amount: 154000 },
      { id: '2', description: language === 'hi' ? 'दीवार पेंट रॉयल एवं पुट्टी घिसाई' : 'WALL PAINT ROYAL WITH PUTTY', unit: 'SFT', quantity: 12801, rate: 39, amount: 499239 },
      { id: '3', description: language === 'hi' ? 'दीवार व छत की पुरानी पपड़ी सफाई' : 'WALL AND CEILING SCRAPPING', unit: 'SFT', quantity: 3613, rate: 15, amount: 54195 },
      { id: '4', description: language === 'hi' ? 'लकड़ी के दरवाजों पर ऑइल पेंट' : 'OIL PAINT ON WOODEN DOORS', unit: 'SFT', quantity: 497, rate: 39, amount: 19383 },
    ]);
    setIsGstEnabled(true);
    setGstRate(10);
    setShippingCost(150);
    setAdvancePaid(50000);
  };

  const loadCarpenterPreset = () => {
    setSelectedTrade('CARPENTER');
    setTemplateTheme('RAJKAPOOR_STYLE');
    setDocType('QUOTATION');
    setDocNumber(`QUO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setBillTitle(language === 'hi' ? 'कारपेंटर व वुडवर्क बिल' : 'CARPENTRY & MODULAR WOODWORK BILL');
    setCompanyProfile(prev => ({
      ...prev,
      tagline: language === 'hi' ? 'कारपेंटर, फर्नीचर व इंटीरियर वुडवर्क ठेकेदार' : 'INTERIOR CARPENTRY, FURNITURE & WOODWORK CONTRACTOR',
    }));
    setItems([
      { id: '1', description: language === 'hi' ? 'मॉड्यूलर किचन कैबिनेट (कमर्शियल प्लाई व एक्रिलिक)' : 'MODULAR KITCHEN CABINET (COMMERCIAL PLY & ACRYLIC)', unit: 'MM', quantity: 2400, rate: 185, amount: 444000 },
      { id: '2', description: language === 'hi' ? 'बेडरूम अलमारी वॉर्डरोब (18mm गुर्जन प्लाई)' : 'BEDROOM WARDROBE (18MM GURJAN PLY & LAMINATE)', unit: 'SFT', quantity: 120, rate: 1450, amount: 174000 },
      { id: '3', description: language === 'hi' ? 'फ्लश डोर फ्रेम व शटर फिटिंग' : 'FLUSH DOOR FRAME & SHUTTER FITTING', unit: 'Pcs/Nos', quantity: 6, rate: 3500, amount: 21000 },
      { id: '4', description: language === 'hi' ? 'हार्डवेयर फिटिंग (कब्जे, चैनल व हैंडल)' : 'HARDWARE FITTING (HINGES, SLIDES, HANDLES)', unit: 'Job', quantity: 1, rate: 12500, amount: 12500 },
    ]);
    setIsGstEnabled(false);
    setGstRate(18);
    setShippingCost(1200);
    setAdvancePaid(100000);
  };

  const loadElectricianPreset = () => {
    setSelectedTrade('ELECTRICIAN');
    setTemplateTheme('NAVY_CORPORATE');
    setDocType('ESTIMATE');
    setDocNumber(`EST-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setBillTitle(language === 'hi' ? 'इलेक्ट्रिकल वायरिंग व फिटिंग अनुमान' : 'ELECTRICAL WIRING & FITTING ESTIMATE');
    setCompanyProfile(prev => ({
      ...prev,
      tagline: language === 'hi' ? 'इलेक्ट्रिशियन वायरिंग व इलेक्ट्रिकल ठेकेदार' : 'RESIDENTIAL & COMMERCIAL ELECTRICAL CONTRACTOR',
    }));
    setItems([
      { id: '1', description: language === 'hi' ? 'लाइट व पंखा पॉइंट वायरिंग (हवेल्स 1.5 SQ MM)' : 'LIGHT & FAN POINT WIRING (HAVELLS 1.5 SQ MM)', unit: 'Point', quantity: 45, rate: 850, amount: 38250 },
      { id: '2', description: language === 'hi' ? 'पावर प्लग पॉइंट (16 एंपियर मेटल बॉक्स)' : 'POWER PLUG POINT (16 AMP WITH METAL BOX & PLATE)', unit: 'Point', quantity: 12, rate: 1200, amount: 14400 },
      { id: '3', description: language === 'hi' ? 'मेन डीबी बॉक्स 12-वे ड्रेसिंग' : 'MAIN DB BOX 12-WAY DISTRIBUTION BOARD DRESSING', unit: 'Job', quantity: 1, rate: 4500, amount: 4500 },
      { id: '4', description: language === 'hi' ? 'एलईडी प्रोफाइल लाइट चैनल फिटिंग' : 'LED CONCEALED PROFILE LIGHT CHANNEL FITTING', unit: 'Meter', quantity: 65, rate: 180, amount: 11700 },
      { id: '5', description: 'PROFILE STRIP LIGHT DRIVER & LIGHTING', unit: 'MM', quantity: 3500, rate: 8, amount: 28000 },
    ]);
    setIsGstEnabled(true);
    setGstRate(18);
    setShippingCost(500);
    setAdvancePaid(25000);
  };

  const loadPlumberPreset = () => {
    setSelectedTrade('PLUMBER');
    setTemplateTheme('NAVY_CORPORATE');
    setDocType('QUOTATION');
    setDocNumber(`QUO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setBillTitle(language === 'hi' ? 'प्लंबिंग व सैनिटरी फिटिंग बिल' : 'PLUMBING & SANITARY FITTING BILL');
    setCompanyProfile(prev => ({
      ...prev,
      tagline: language === 'hi' ? 'प्लंबर, नल पाइपलाइन व बाथरूम सैनिटरी ठेकेदार' : 'PLUMBING PIPELINE, SANITARY & BATHROOM FITTINGS',
    }));
    setItems([
      { id: '1', description: language === 'hi' ? 'CPVC पाइपलाइन फिटिंग (एस्ट्रल 25 MM)' : 'CPVC CONCEALED PIPE FITTING (ASTRAL 25 MM / 1 INCH)', unit: 'Meter', quantity: 120, rate: 220, amount: 26400 },
      { id: '2', description: language === 'hi' ? 'बाथरूम मिक्सर डाइवर्टर व शॉवर फिटिंग' : 'BATHROOM DIVERTER & SHOWER CP FITTING', unit: 'Bathroom', quantity: 2, rate: 6500, amount: 13000 },
      { id: '3', description: language === 'hi' ? 'SWR ड्रेनेज वेस्ट पाइपलाइन (110 MM)' : 'SWR DRAINAGE PIPE LINE (110 MM / 4 INCH)', unit: 'RFT', quantity: 85, rate: 190, amount: 16150 },
      { id: '4', description: language === 'hi' ? 'कमोड व वॉश बेसिन सैनिटरी फिटिंग' : 'SANITARYWARE INSTALLATION (COMMODE, WASH BASIN)', unit: 'Pcs/Nos', quantity: 3, rate: 1800, amount: 5400 },
    ]);
    setIsGstEnabled(true);
    setGstRate(18);
    setShippingCost(300);
    setAdvancePaid(20000);
  };

  const loadCivilPreset = () => {
    setSelectedTrade('CIVIL');
    setTemplateTheme('NAVY_CORPORATE');
    setDocType('TAX_INVOICE');
    setDocNumber(`INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setBillTitle(language === 'hi' ? 'सिविल निर्माण एवं लेबर बिल' : 'CIVIL CONSTRUCTION & LABOUR ESTIMATE');
    setCompanyProfile(prev => ({
      ...prev,
      tagline: language === 'hi' ? 'राजमिस्त्री, सिविल कंस्ट्रक्शन व कंक्रीट ठेकेदार' : 'CIVIL MASONRY, CONCRETE & STRUCTURAL CONTRACTOR',
    }));
    setItems([
      { id: '1', description: language === 'hi' ? 'ईंट की जुड़ाई काम (9 इंच बाहरी दीवार)' : 'BRICK MASONRY WORK (9 INCH OUTER WALL)', unit: 'SFT', quantity: 1200, rate: 95, amount: 114000 },
      { id: '2', description: language === 'hi' ? 'अंदरूनी दीवार प्लास्टर व चिकनाई' : 'INTERNAL PLASTERING & SMOOTH FINISHING', unit: 'SFT', quantity: 1500, rate: 42, amount: 63000 },
      { id: '3', description: 'RCC SLAB SHUTTERING & STEEL BINDING', unit: 'SFT', quantity: 1000, rate: 120, amount: 120000 },
      { id: '4', description: language === 'hi' ? 'मजदूरी हाजिरी व मलबे की ढुलाई' : 'LABOUR WAGES & DEBRIS TRANSPORT', unit: 'Days', quantity: 15, rate: 1500, amount: 22500 }
    ]);
    setIsGstEnabled(true);
    setGstRate(18);
    setShippingCost(2500);
    setAdvancePaid(80000);
  };

  const loadPopPreset = () => {
    setSelectedTrade('POP');
    setTemplateTheme('RAJKAPOOR_STYLE');
    setDocType('QUOTATION');
    setDocNumber(`QUO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setBillTitle(language === 'hi' ? 'पीओपी व फॉल्स सीलिंग कोटेशन' : 'POP & GYPSUM FALSE CEILING QUOTATION');
    setCompanyProfile(prev => ({
      ...prev,
      tagline: language === 'hi' ? 'पीओपी पुट्टी, जिप्सम फॉल्स सीलिंग व डिजाइन' : 'POP PUNNING, GYPSUM FALSE CEILING & DESIGNER CORNICE',
    }));
    setItems([
      { id: '1', description: language === 'hi' ? 'जिप्सम फॉल्स सीलिंग चैनल ग्रिड' : 'GYPSUM FALSE CEILING WITH GI CHANNEL GRID', unit: 'SFT', quantity: 1850, rate: 115, amount: 212750 },
      { id: '2', description: language === 'hi' ? 'कोव लाइट चैनल व बॉर्डर मोल्डिंग' : 'COVE LIGHTING POP CHANNEL & BORDER MOULDING', unit: 'RFT', quantity: 420, rate: 85, amount: 35700 },
      { id: '3', description: language === 'hi' ? 'दीवार पर पीओपी पनिंग व फिनिशिंग' : 'WALL POP PUNNING & SMOOTH SURFACING', unit: 'SFT', quantity: 2200, rate: 32, amount: 70400 },
      { id: '4', description: 'DESIGNER CORNICE & FLOWER ROSES FITTING', unit: 'RFT', quantity: 150, rate: 95, amount: 14250 },
    ]);
    setIsGstEnabled(true);
    setGstRate(12);
    setShippingCost(800);
    setAdvancePaid(60000);
  };

  const loadFabricationPreset = () => {
    setSelectedTrade('FABRICATION');
    setTemplateTheme('NAVY_CORPORATE');
    setDocType('QUOTATION');
    setDocNumber(`QUO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setBillTitle(language === 'hi' ? 'फैब्रिकेशन व ग्रिल वर्क बिल' : 'FABRICATION & STEEL GRILL ESTIMATE');
    setCompanyProfile(prev => ({
      ...prev,
      tagline: language === 'hi' ? 'स्टील ग्रिल, एसएस रेलिंग व वेल्डिंग ठेकेदार' : 'SAFETY GRILLS, STAINLESS STEEL RAILINGS & WELDING WORKS',
    }));
    setItems([
      { id: '1', description: language === 'hi' ? 'खिड़की सुरक्षा ग्रिल (एमएस स्क्वायर बार 12mm)' : 'SAFETY WINDOW GRILL (MS SQUARE BAR 12 MM)', unit: 'Kg', quantity: 350, rate: 110, amount: 38500 },
      { id: '2', description: language === 'hi' ? 'स्टेनलेस स्टील रेलिंग (304 ग्रेड कांच सहित)' : 'STAINLESS STEEL RAILING (304 GRADE WITH GLASS)', unit: 'RFT', quantity: 65, rate: 1450, amount: 94250 },
      { id: '3', description: language === 'hi' ? 'मुख्य गेट हेवी लोहे का दरवाजा' : 'MAIN ENTRANCE HEAVY STEEL GATE FABRICATION', unit: 'Job', quantity: 1, rate: 38000, amount: 38000 },
      { id: '4', description: 'SHED ROOF TRUSS PIPE STRUCTURE ASSEMBLY', unit: 'SFT', quantity: 1200, rate: 160, amount: 192000 },
    ]);
    setIsGstEnabled(true);
    setGstRate(18);
    setShippingCost(1500);
    setAdvancePaid(75000);
  };

  const loadTilePreset = () => {
    setSelectedTrade('TILE');
    setTemplateTheme('RAJKAPOOR_STYLE');
    setDocType('QUOTATION');
    setDocNumber(`QUO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setBillTitle(language === 'hi' ? 'टाइल्स fitting व मार्बल पॉलिश बिल' : 'TILE LAYING & MARBLE POLISHING BILL');
    setCompanyProfile(prev => ({
      ...prev,
      tagline: language === 'hi' ? 'टाइल्स, मार्बल, ग्रेनाइट व इपॉक्सी ठेकेदार' : 'VITRIFIED TILES, MARBLE LAYING & GRANITE KITCHEN MOULDING',
    }));
    setItems([
      { id: '1', description: language === 'hi' ? 'टाइल्स बिछाई (4x2 फीट विट्रिफाइड)' : 'VITRIFIED TILE FLOORING (4X2 FT TILES LAYING)', unit: 'SFT', quantity: 1450, rate: 48, amount: 69600 },
      { id: '2', description: language === 'hi' ? 'बाथरूम दीवार डैडो टाइल्स फिटिंग' : 'BATHROOM WALL DADO TILE FITTING', unit: 'SFT', quantity: 650, rate: 52, amount: 33800 },
      { id: '3', description: language === 'hi' ? 'किचन ग्रेनाइट काउंटरटॉप कटिंग व मोल्डिंग' : 'KITCHEN GRANITE PLATFORM MOULDING & CUTTING', unit: 'RFT', quantity: 45, rate: 380, amount: 17100 },
      { id: '4', description: language === 'hi' ? 'मार्बल डायमंड पॉलिश व इपॉक्सी ग्राउटिंग' : 'MARBLE DIAMOND MIRROR POLISH & EPOXY GROUTING', unit: 'SFT', quantity: 1200, rate: 45, amount: 54000 },
    ]);
    setIsGstEnabled(true);
    setGstRate(12);
    setShippingCost(1000);
    setAdvancePaid(40000);
  };

  const loadDeliveryChallanPreset = () => {
    setSelectedTrade('DELIVERY_CHALLAN');
    setTemplateTheme('NAVY_CORPORATE');
    setDocType('DELIVERY_CHALLAN');
    setDocNumber(`DC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setBillTitle(language === 'hi' ? 'सामग्री सुपुर्दगी चालान (DELIVERY CHALLAN)' : 'DELIVERY CHALLAN & MATERIAL DESPATCH MEMO');
    setCompanyProfile(prev => ({
      ...prev,
      tagline: language === 'hi' ? 'बिल्डिंग मटीरियल, हार्डवेयर एवं डिलीवरी चालान सप्लायर' : 'BUILDING MATERIAL, HARDWARE & DESPATCH SUPPLIER',
    }));
    setItems([
      { id: '1', description: language === 'hi' ? 'एशियन पेंट्स रॉयल इमल्शन (20L बाल्टी)' : 'ASIAN PAINTS ROYAL EMULSION (20L BUCKET)', unit: 'Bucket', quantity: 10, rate: 4200, amount: 42000 },
      { id: '2', description: language === 'hi' ? 'वाटरप्रूफ सीमेंट पुट्टी (40 किग्रा बैग)' : 'WATERPROOF CEMENT PUTTY (40KG BAG)', unit: 'Bag', quantity: 25, rate: 850, amount: 21250 },
      { id: '3', description: language === 'hi' ? 'प्राइमर ऑयल बेस्ड (20 लीटर ड्रम)' : 'OIL BASED PRIMER (20L DRUM)', unit: 'Drum', quantity: 5, rate: 3400, amount: 17000 },
      { id: '4', description: language === 'hi' ? 'पेंट ब्रश व रोलर किट सेट' : 'PAINT BRUSHES & ROLLER KIT SET', unit: 'Set', quantity: 12, rate: 280, amount: 3360 },
    ]);
    setIsGstEnabled(true);
    setGstRate(18);
    setShippingCost(1500);
    setAdvancePaid(20000);
  };

  const loadAluminiumPreset = () => {
    setSelectedTrade('ALUMINIUM');
    setTemplateTheme('RAJKAPOOR_STYLE');
    setDocType('QUOTATION');
    setDocNumber(`QUO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setBillTitle(language === 'hi' ? 'एल्युमिनियम स्लाइडिंग व ग्लास वर्क बिल' : 'ALUMINIUM SLIDING WINDOWS & GLASS WORK BILL');
    setCompanyProfile(prev => ({
      ...prev,
      tagline: language === 'hi' ? 'एल्युमिनियम खिड़की, टफन्ड ग्लास व पार्टिशन कार्य' : 'ALUMINIUM SLIDING WINDOWS, GLASS & OFFICE PARTITION',
    }));
    setItems([
      { id: '1', description: language === 'hi' ? '3-ट्रैक एल्युमिनियम स्लाइडिंग विंडो (डोमल सेक्शन)' : '3-TRACK ALUMINIUM SLIDING WINDOW (DOMAL SECTION)', unit: 'SFT', quantity: 380, rate: 320, amount: 121600 },
      { id: '2', description: language === 'hi' ? '12mm टफन्ड ग्लास ऑफिस पार्टिशन (एसएस फिटिंग)' : '12MM TOUGHENED GLASS PARTITION (SS FITTING)', unit: 'SFT', quantity: 220, rate: 450, amount: 99000 },
      { id: '3', description: 'MOSQUITO NET MESH SHUTTER', unit: 'SFT', quantity: 150, rate: 95, amount: 14250 },
      { id: '4', description: 'SILICONE SEALANT WEATHERPROOFING', unit: 'Job', quantity: 1, rate: 6500, amount: 6500 },
    ]);
    setIsGstEnabled(true);
    setGstRate(18);
    setShippingCost(800);
    setAdvancePaid(50000);
  };

  const loadCleaningPreset = () => {
    setSelectedTrade('CLEANING');
    setTemplateTheme('NAVY_CORPORATE');
    setDocType('TAX_INVOICE');
    setDocNumber(`INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setBillTitle(language === 'hi' ? 'हाउसकीपिंग व डीप क्लीनिंग सेवा बिल' : 'DEEP CLEANING & HOUSEKEEPING INVOICE');
    setCompanyProfile(prev => ({
      ...prev,
      tagline: language === 'hi' ? 'रेजिडेंशियल व कमर्शियल डीप क्लीनिंग सेवाएं' : 'RESIDENTIAL & COMMERCIAL DEEP CLEANING SERVICES',
    }));
    setItems([
      { id: '1', description: language === 'hi' ? '3BHK फ्लैट डीप क्लीनिंग व सेनेटाइजेशन' : '3BHK FLAT DEEP CLEANING & SANITIZATION', unit: 'Job', quantity: 1, rate: 8500, amount: 8500 },
      { id: '2', description: language === 'hi' ? 'सोफ़ा व गद्दे शैम्पू ड्राई क्लीनिंग' : 'SOFA & MATTRESS SHAMPOO DRY CLEANING', unit: 'Seat', quantity: 7, rate: 350, amount: 2450 },
      { id: '3', description: language === 'hi' ? 'बाथरूम एसिड व बफिंग क्लीनिंग' : 'BATHROOM DEEP SCRUBBING & DESCALING', unit: 'Bathroom', quantity: 3, rate: 1200, amount: 3600 },
      { id: '4', description: language === 'hi' ? 'किचन ऑइल व ग्रीस डीप मशीन क्लीनिंग' : 'KITCHEN DEEP DEGREASING & HOOD CLEANING', unit: 'Job', quantity: 1, rate: 3200, amount: 3200 },
    ]);
    setIsGstEnabled(true);
    setGstRate(18);
    setShippingCost(0);
    setAdvancePaid(3000);
  };

  const loadHvacPreset = () => {
    setSelectedTrade('HVAC');
    setTemplateTheme('NAVY_CORPORATE');
    setDocType('TAX_INVOICE');
    setDocNumber(`INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setBillTitle(language === 'hi' ? 'एसी सर्विस, गैस चार्जिंग व रिपेयरिंग बिल' : 'AC REPAIR, GAS CHARGING & HVAC SERVICE INVOICE');
    setCompanyProfile(prev => ({
      ...prev,
      tagline: language === 'hi' ? 'एसी इंस्टॉलेशन, गैस रिफिलिंग व डक्टिंग सेवाएं' : 'AC INSTALLATION, GAS REFILL & HVAC CONTRACTOR',
    }));
    setItems([
      { id: '1', description: language === 'hi' ? 'स्प्लिट एसी जेट पंप वॉटर वॉश सर्विस' : 'SPLIT AC JET PUMP WATER WASH SERVICE', unit: 'Pcs/Nos', quantity: 4, rate: 599, amount: 2396 },
      { id: '2', description: language === 'hi' ? 'R32 एसी गैस टॉपअप / पूर्ण चार्जिंग' : 'R32 AC GAS REFILL & LEAKAGE REPAIR', unit: 'Pcs/Nos', quantity: 2, rate: 2400, amount: 4800 },
      { id: '3', description: language === 'hi' ? 'कॉपर पाइपिंग 1/2" व 1/4" इंसुलेशन के साथ' : 'COPPER PIPING WITH FOAM INSULATION', unit: 'Meter', quantity: 15, rate: 850, amount: 12750 },
      { id: '4', description: 'OUTSIDE UNIT HEAVY MS BRACKET FITTING', unit: 'Set', quantity: 2, rate: 1100, amount: 2200 },
    ]);
    setIsGstEnabled(true);
    setGstRate(18);
    setShippingCost(300);
    setAdvancePaid(5000);
  };

  const loadRealEstatePreset = () => {
    setSelectedTrade('REAL_ESTATE');
    setTemplateTheme('NAVY_CORPORATE');
    setDocType('QUOTATION');
    setDocNumber(`QUO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setBillTitle(language === 'hi' ? 'रियल एस्टेट, प्लॉटिंग व कंस्ट्रक्शन कोटेशन' : 'REAL ESTATE, PLOTTING & PROPERTY ESTIMATE');
    setCompanyProfile(prev => ({
      ...prev,
      tagline: language === 'hi' ? 'रियल एस्टेट ठेकेदार, प्लॉटिंग डेवलपर व बिल्डर' : 'REAL ESTATE DEVELOPER, LAND PLOTTING & PROPERTY CONSULTANT',
    }));
    setItems([
      { id: '1', description: language === 'hi' ? 'भूमि समतलीकरण, बाउंड्री वॉल व प्लॉटिंग कार्य' : 'LAND PLOTTING, LEVELLING & BOUNDARY WALL CONSTRUCTION', unit: 'SFT', quantity: 2400, rate: 125, amount: 300000 },
      { id: '2', description: language === 'hi' ? 'रेजिडेंशियल फ्लैट कंस्ट्रक्शन व फिनिशिंग वर्क' : 'RESIDENTIAL FLAT CONSTRUCTION & STRUCTURAL WORK', unit: 'SFT', quantity: 1200, rate: 1650, amount: 1980000 },
      { id: '3', description: language === 'hi' ? 'प्रॉपर्टी रजिस्ट्रेशन व लीगल एग्रीमेंट प्रोसेसिंग' : 'PROPERTY REGISTRATION & LEGAL DOCUMENTATION CHARGE', unit: 'Job', quantity: 1, rate: 25000, amount: 25000 },
      { id: '4', description: language === 'hi' ? 'आर्किटेक्चरल नक्शा व 3D एलिवेशन डिजाइन' : 'ARCHITECTURAL LAYOUT & 3D ELEVATION PLAN', unit: 'Job', quantity: 1, rate: 35000, amount: 35000 },
    ]);
    setIsGstEnabled(true);
    setGstRate(18);
    setShippingCost(0);
    setAdvancePaid(100000);
  };

  const loadCustomPreset = () => {
    setSelectedTrade('CUSTOM');
    setTemplateTheme('RAJKAPOOR_STYLE');
    setDocType('QUOTATION');
    const taglineText = companyProfile.tagline || (language === 'hi' ? 'जनरल ठेकेदार एवं इंटीरियर वर्क्स' : 'GENERAL CONTRACTOR & INTERIOR WORKS');
    setBillTitle(language === 'hi' ? `बिल - ${taglineText}` : `BILL FOR ${taglineText.toUpperCase()}`);
  };

  // Item Handlers
  const handleItemChange = (id: string, field: keyof QuotationItem, value: any) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          const q = field === 'quantity' ? parseFloat(value) || 0 : item.quantity;
          const r = field === 'rate' ? parseFloat(value) || 0 : item.rate;
          updated.amount = Math.round(q * r * 100) / 100;
        }
        return updated;
      }
      return item;
    }));
  };

  const handleAddItem = () => {
    const newItem: QuotationItem = {
      id: Date.now().toString(),
      description: 'NEW WORK ITEM',
      unit: 'SFT',
      quantity: 100,
      rate: 10,
      amount: 1000
    };
    setItems(prev => [...prev, newItem]);
  };

  const addQuickChipItem = (chip: { name: string; unit: string; rate: number }) => {
    const qty = chip.unit === 'Job' || chip.unit === 'Set' || chip.unit === 'Bucket' || chip.unit === 'Bag' ? 1 : 100;
    const newItem: QuotationItem = {
      id: `${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      description: chip.name,
      unit: chip.unit,
      quantity: qty,
      rate: chip.rate,
      amount: qty * chip.rate
    };
    setItems(prev => [...prev, newItem]);
  };

  const handleQuickFillClient = () => {
    setClientName(language === 'hi' ? 'रमेश शर्मा (ग्राहक)' : 'Ramesh Sharma (Client)');
    setClientPhone('9820012345');
    setSiteLocation(language === 'hi' ? 'कांदिवली वेस्ट वर्क साइट' : 'Kandivali West Site');
    setClientAddress(language === 'hi' ? 'फ्लैट 402, ग्रीन पार्क सोसाइटी, मुंबई' : 'Flat 402, Green Park Society, Mumbai');
  };

  const buildCurrentQuotationObject = (): QuotationData => {
    return {
      id: editingId || `quo_${Date.now()}`,
      docType,
      docNumber,
      billDocLanguage,
      date,
      validUntil,
      templateTheme,
      tradeCategory: selectedTrade,
      companyName: companyProfile.companyName || 'MY FIRM NAME',
      tagline: companyProfile.tagline || '',
      contractorName: companyProfile.contractorName || '',
      phone: companyProfile.phone || '9820012345',
      altPhone: companyProfile.altPhone || '',
      email: companyProfile.email || '',
      address: companyProfile.address || '',
      gstin: companyProfile.gstin || '',
      upiId: companyProfile.upiId || '',
      bankDetails: companyProfile.bankDetails || '',
      symbol: companyProfile.symbol || '🎨',
      billTitle,
      clientName: clientName || (language === 'hi' ? 'रमेश शर्मा' : 'Ramesh Sharma'),
      clientCompany,
      clientPhone,
      clientAddress,
      siteLocation,
      poNumber,
      shipDate,
      preparedBy: preparedBy || companyProfile.contractorName,
      items,
      isGstEnabled,
      gstRate,
      discount,
      shippingCost,
      advancePaid,
      terms,
      status: 'DRAFT',
      createdAt: new Date().toISOString()
    };
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter(i => i.id !== id));
  };

  // Live calculations for preview & form
  const subtotal = items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  const afterDiscount = Math.max(0, subtotal - (Number(discount) || 0));
  const gstAmount = isGstEnabled ? Math.round(afterDiscount * (gstRate / 100) * 100) / 100 : 0;
  const totalAmount = Math.round((afterDiscount + gstAmount + (Number(shippingCost) || 0)) * 100) / 100;
  const balanceDue = Math.max(0, Math.round((totalAmount - (Number(advancePaid) || 0)) * 100) / 100);

  // Save Quotation
  const handleSaveQuotation = (status: QuotationData['status'] = 'DRAFT') => {
    if (!checkRateLimit('save_quotation', 20)) {
      alert(language === 'hi' ? 'बहुत तेज़ क्रियाएँ! कृपया कुछ सेकंड रुकें।' : 'Too many requests! Please wait a moment.');
      return;
    }

    if (!clientName.trim()) {
      alert(language === 'hi' ? 'कृपया ग्राहक / पार्टी का नाम दर्ज करें' : 'Please enter Client / Party name');
      return;
    }

    const check = checkAndIncrementUsage("bill_book");
    if (!check.allowed) {
      setShowPaywall(true);
      return;
    }

    const cleanedClientName = sanitizeInput(clientName);
    const cleanedCompany = sanitizeInput(companyProfile.companyName);
    const cleanedAddress = sanitizeInput(companyProfile.address);
    const cleanedTagline = sanitizeInput(companyProfile.tagline);
    const cleanedBillTitle = sanitizeInput(billTitle);

    const quotationObj: QuotationData = {
      id: editingId || `quo_${Date.now()}`,
      docType,
      docNumber,
      billDocLanguage,
      date,
      validUntil,
      templateTheme,
      tradeCategory: selectedTrade,
      companyName: cleanedCompany,
      tagline: cleanedTagline,
      contractorName: sanitizeInput(companyProfile.contractorName),
      phone: sanitizeInput(companyProfile.phone),
      altPhone: sanitizeInput(companyProfile.altPhone),
      email: sanitizeInput(companyProfile.email),
      address: cleanedAddress,
      gstin: sanitizeInput(companyProfile.gstin),
      upiId: sanitizeInput(companyProfile.upiId),
      bankDetails: sanitizeInput(companyProfile.bankDetails),
      symbol: companyProfile.symbol || '🎨',
      billTitle: cleanedBillTitle,
      clientName: cleanedClientName,
      clientCompany: sanitizeInput(clientCompany),
      clientPhone: sanitizeInput(clientPhone),
      clientAddress: sanitizeInput(clientAddress),
      siteLocation: sanitizeInput(siteLocation),
      poNumber: sanitizeInput(poNumber),
      shipDate: sanitizeInput(shipDate),
      preparedBy: sanitizeInput(preparedBy || companyProfile.contractorName),
      items: items.map(item => ({
        ...item,
        description: sanitizeInput(item.description),
        unit: sanitizeInput(item.unit)
      })),
      isGstEnabled,
      gstRate,
      discount,
      shippingCost,
      advancePaid,
      terms: typeof terms === 'string' ? sanitizeInput(terms) : Array.isArray(terms) ? (terms as string[]).map(t => sanitizeInput(t)).join('\n') : '',
      status,
      createdAt: new Date().toISOString()
    };

    let updatedList: QuotationData[];
    if (editingId) {
      updatedList = quotations.map(q => q.id === editingId ? quotationObj : q);
    } else {
      updatedList = [quotationObj, ...quotations];
    }

    setQuotations(updatedList);
    localStorage.setItem('labourbook_quotations', JSON.stringify(updatedList));
    localStorage.setItem('labourbook_contractor_profile', JSON.stringify(companyProfile));

    setPreviewData(quotationObj);
    setActiveTab('PREVIEW');

    alert(language === 'hi' ? '✅ बिल / कोटेशन सफलतापूर्वक सेव्ह (Save) हो गया है!' : '✅ Bill / Quotation saved successfully!');
  };

  // Load into Edit Form
  const handleEditQuotation = (quo: QuotationData) => {
    setEditingId(quo.id);
    setSelectedTrade(quo.tradeCategory || 'PAINTER');
    setTemplateTheme(quo.templateTheme || 'RAJKAPOOR_STYLE');
    setDocType(quo.docType);
    if (quo.billDocLanguage) setBillDocLanguage(quo.billDocLanguage);
    setDocNumber(quo.docNumber);
    setDate(quo.date);
    setValidUntil(quo.validUntil);
    setBillTitle(quo.billTitle || 'BILL FOR LEBUR WITH MATERIEL CHARGES');
    setCompanyProfile({
      companyName: quo.companyName || '',
      tagline: quo.tagline || '',
      contractorName: quo.contractorName || '',
      phone: quo.phone || '',
      altPhone: quo.altPhone || '',
      email: quo.email || '',
      address: quo.address || '',
      gstin: quo.gstin || '',
      upiId: quo.upiId || '',
      bankDetails: quo.bankDetails || '',
      symbol: quo.symbol || '🎨'
    });
    setClientName(quo.clientName || '');
    setClientCompany(quo.clientCompany || '');
    setClientPhone(quo.clientPhone || '');
    setClientAddress(quo.clientAddress || '');
    setSiteLocation(quo.siteLocation || '');
    setPoNumber(quo.poNumber || '');
    setShipDate(quo.shipDate || '');
    setPreparedBy(quo.preparedBy || '');
    setItems(quo.items || []);
    setIsGstEnabled(quo.isGstEnabled);
    setGstRate(quo.gstRate || 10);
    setDiscount(quo.discount || 0);
    setShippingCost(quo.shippingCost || 0);
    setAdvancePaid(quo.advancePaid || 0);
    setTerms(quo.terms || DEFAULT_TERMS);

    setActiveTab('CREATE');
  };

  // Preview Load directly
  const handlePreviewDirect = (quo: QuotationData) => {
    handleEditQuotation(quo);
    setPreviewData(quo);
    setActiveTab('PREVIEW');
  };

  // Delete Record
  const handleDeleteQuotation = (id: string) => {
    if (confirm(language === 'hi' ? 'क्या आप इस कोटेशन को मिटाना चाहते हैं?' : 'Delete this quotation record?')) {
      const updated = quotations.filter(q => q.id !== id);
      setQuotations(updated);
      localStorage.setItem('labourbook_quotations', JSON.stringify(updated));
      if (previewData?.id === id) setPreviewData(null);
    }
  };

  // Reset Form
  const handleResetForm = () => {
    setEditingId(null);
    setDocType('QUOTATION');
    setDocNumber(`BILL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setDate(new Date().toISOString().split('T')[0]);
    setClientName('');
    setClientPhone('');
    setClientAddress('');
    setSiteLocation('');
    setItems([
      { id: '1', description: 'WORK ITEM 1', unit: 'SFT', quantity: 100, rate: 20, amount: 2000 }
    ]);
    setIsGstEnabled(false);
    setDiscount(0);
    setShippingCost(0);
    setAdvancePaid(0);
  };

  // Save company profile
  const handleSaveCompanyProfile = () => {
    localStorage.setItem('labourbook_contractor_profile', JSON.stringify(companyProfile));
    alert(language === 'hi' ? 'कंपनी प्रोफ़ाइल सहेजी गई!' : 'Company Header Saved!');
  };

  // WhatsApp Share with Advance & Balance details
  const handleWhatsAppShare = (quo: QuotationData) => {
    const itemsSum = quo.items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const afterDisc = Math.max(0, itemsSum - (Number(quo.discount) || 0));
    const tax = quo.isGstEnabled ? Math.round(afterDisc * (quo.gstRate / 100)) : 0;
    const grand = Math.round(afterDisc + tax + (Number(quo.shippingCost) || 0));
    const adv = Number(quo.advancePaid) || 0;
    const remaining = Math.max(0, grand - adv);

    const text = `📋 *${quo.billTitle || quo.docType}*
🏢 *${quo.companyName}*
📞 ${quo.phone} ${quo.altPhone ? `/ ${quo.altPhone}` : ''}
📍 ${quo.address}

👤 *Client:* ${quo.clientName} (${quo.clientPhone || 'N/A'})
📍 *Site:* ${quo.siteLocation || quo.clientAddress || 'N/A'}
-------------------------------
*Items List:*
${quo.items.map((i, idx) => `${idx + 1}. ${i.description} - ${i.quantity} ${i.unit} @ ₹${i.rate} = ₹${i.amount}`).join('\n')}

*Subtotal:* ₹${itemsSum.toLocaleString('en-IN')}
${quo.isGstEnabled ? `*Tax (${quo.gstRate}%):* ₹${tax.toLocaleString('en-IN')}\n` : ''}${quo.shippingCost ? `*Transport Charges:* ₹${quo.shippingCost.toLocaleString('en-IN')}\n` : ''}${quo.discount ? `*Discount:* -₹${quo.discount.toLocaleString('en-IN')}\n` : ''}-------------------------------
*GRAND TOTAL:* ₹${grand.toLocaleString('en-IN')}
_(${numberToWordsEnglish(grand)})_
*LESS ADVANCE PAID (अग्रिम):* -₹${adv.toLocaleString('en-IN')}
*BALANCE PAYABLE (शेष देय राशि):* ₹${remaining.toLocaleString('en-IN')}
_(${numberToWordsEnglish(remaining)})_
-------------------------------

_Generated via Labour Book Pro_`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadAsImage = async () => {
    const check = checkAndIncrementUsage("bill_download");
    if (!check.allowed) {
      setShowPaywall(true);
      return;
    }

    const el = document.getElementById('printable-letterhead');
    if (!el) {
      alert(language === 'hi' ? 'लेटरहेड नहीं मिला' : 'Letterhead element not found');
      return;
    }
    try {
      setIsDownloading(true);

      // Temporarily clear CSS transform for crisp un-scaled 794px A4 canvas capture
      const origTransform = el.style.transform;
      const origTransformOrigin = el.style.transformOrigin;
      const origMarginBottom = el.style.marginBottom;

      el.style.transform = 'none';
      el.style.transformOrigin = 'initial';
      el.style.marginBottom = '0px';

      // Render crisp standard A4 HD PNG (scale 2)
      const canvas = await safeHtml2Canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 1024,
        width: 794,
        height: el.scrollHeight || 1123,
        scrollX: 0,
        scrollY: 0
      });

      // Restore transform style immediately
      el.style.transform = origTransform;
      el.style.transformOrigin = origTransformOrigin;
      el.style.marginBottom = origMarginBottom;

      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.href = image;
      link.download = `${docType}_${docNumber || 'bill'}_A4_Letterhead.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  // Filtered List
  const filteredQuotations = quotations.filter(q => {
    const matchesSearch = q.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          q.docNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          q.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'ALL' || q.docType === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 pb-20">
      
      {/* Print Styles */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 8mm;
        }
        @media print {
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden;
          }
          #printable-letterhead-wrapper {
            overflow: visible !important;
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
          }
          #printable-letterhead, #printable-letterhead * {
            visibility: visible;
          }
          #printable-letterhead {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: none !important;
            min-width: 0 !important;
            margin: 0 !important;
            padding: 15px !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Main Top Header - Ultra Compact */}
      <div className="no-print bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white px-2 py-1.5 sm:p-4 shadow-md sticky top-0 z-30 pt-[calc(0.5rem+env(safe-area-inset-top))] sm:pt-[calc(1rem+env(safe-area-inset-top))]">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 sm:gap-3 truncate">
            <button 
              onClick={() => navigate(-1)} 
              className="p-1 hover:bg-white/20 rounded-full transition cursor-pointer shrink-0"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="truncate">
              <h1 className="text-xs sm:text-xl font-black tracking-tight flex items-center gap-1 truncate">
                <Receipt size={15} className="text-amber-400 shrink-0" />
                <span className="truncate">{language === 'hi' ? 'कोटेशन व बिल बुक' : 'Quotation & Bill Book'}</span>
              </h1>
              <p className="text-[10px] text-blue-200 truncate hidden sm:block">
                {language === 'hi' ? 'सभी ठेकेदारों के लिए लेटरहेड बिल व कोटेशन मेकर' : 'Contractor Letterhead Bills'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button 
              onClick={() => setActiveTab('SETTINGS')}
              className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] sm:text-xs font-bold flex items-center gap-1 transition cursor-pointer"
            >
              <Building2 size={13} />
              <span>{language === 'hi' ? 'कंपनी हेडर' : 'Header Info'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Bar - Very Small Compact 3 Buttons */}
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-1 mt-1 pt-1 border-t border-blue-800/80">
          <button
            type="button"
            onClick={() => { handleResetForm(); setActiveTab('CREATE'); }}
            className={`px-1 py-1 rounded-md text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer text-center ${
              activeTab === 'CREATE' ? 'bg-amber-400 text-slate-950 shadow-sm font-black' : 'bg-blue-800/80 text-blue-100 hover:bg-blue-700'
            }`}
          >
            <Plus size={12} className="shrink-0" />
            <span className="truncate">{language === 'hi' ? '1. नया बिल' : '1. New Bill'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('LIST')}
            className={`px-1 py-1 rounded-md text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer text-center ${
              activeTab === 'LIST' ? 'bg-amber-400 text-slate-950 shadow-sm font-black' : 'bg-blue-800/80 text-blue-100 hover:bg-blue-700'
            }`}
          >
            <FileText size={12} className="shrink-0" />
            <span className="truncate">{language === 'hi' ? `2. सहेजे (${quotations.length})` : `2. Saved (${quotations.length})`}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPreviewData({
                id: editingId || `quo_${Date.now()}`,
                docType, docNumber, date, validUntil, templateTheme, tradeCategory: selectedTrade,
                companyName: companyProfile.companyName,
                tagline: companyProfile.tagline,
                contractorName: companyProfile.contractorName,
                phone: companyProfile.phone, altPhone: companyProfile.altPhone,
                email: companyProfile.email, address: companyProfile.address,
                gstin: companyProfile.gstin, upiId: companyProfile.upiId, bankDetails: companyProfile.bankDetails,
                billTitle, clientName, clientCompany, clientPhone, clientAddress, siteLocation, poNumber, shipDate, preparedBy,
                items, isGstEnabled, gstRate, discount, shippingCost, advancePaid, terms, status: 'DRAFT', createdAt: new Date().toISOString()
              });
              setActiveTab('PREVIEW');
            }}
            className={`px-1 py-1 rounded-md text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer text-center ${
              activeTab === 'PREVIEW' ? 'bg-amber-400 text-slate-950 shadow-sm font-black' : 'bg-amber-400/20 text-amber-200 border border-amber-400/60 hover:bg-amber-400/30'
            }`}
          >
            <Eye size={12} className="shrink-0 text-amber-300" />
            <span className="truncate">{language === 'hi' ? '3. लेटरहेड एडिट' : '3. Letterhead View'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 space-y-5">

        {/* TAB 1: FORM EDITOR */}
        {activeTab === 'CREATE' && (
          <div className="space-y-5">
            
            {/* QUICK 1-CLICK PRESETS BAR FOR SUPER FAST BILLING */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 p-3 sm:p-4 rounded-2xl shadow-lg border border-amber-300 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-slate-950 shrink-0" />
                  <span className="font-black text-xs sm:text-sm tracking-tight">
                    {language === 'hi' ? '⚡ तुरंत 1-क्लिक में बिल भरें (Quick Preset Bills):' : '⚡ 1-Click Quick Preset Bills:'}
                  </span>
                </div>
                <span className="text-[10px] font-bold bg-slate-950/20 px-2.5 py-0.5 rounded-full text-slate-950">
                  {language === 'hi' ? 'एक क्लिक में लोड करें' : 'Load in 1 Click'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={loadPaintingPreset}
                  className="bg-white/90 hover:bg-white text-slate-950 font-extrabold text-[11px] py-2 px-2.5 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>🎨</span>
                  <span className="truncate">{language === 'hi' ? 'पेंटर बिल' : 'Painter Bill'}</span>
                </button>
                <button
                  type="button"
                  onClick={loadCarpenterPreset}
                  className="bg-white/90 hover:bg-white text-slate-950 font-extrabold text-[11px] py-2 px-2.5 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>🪚</span>
                  <span className="truncate">{language === 'hi' ? 'कारपेंटर बिल' : 'Carpenter'}</span>
                </button>
                <button
                  type="button"
                  onClick={loadElectricianPreset}
                  className="bg-white/90 hover:bg-white text-slate-950 font-extrabold text-[11px] py-2 px-2.5 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>⚡</span>
                  <span className="truncate">{language === 'hi' ? 'इलेक्ट्रिकल' : 'Electrician'}</span>
                </button>
                <button
                  type="button"
                  onClick={loadPlumberPreset}
                  className="bg-white/90 hover:bg-white text-slate-950 font-extrabold text-[11px] py-2 px-2.5 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>🚰</span>
                  <span className="truncate">{language === 'hi' ? 'प्लंबर बिल' : 'Plumber'}</span>
                </button>
                <button
                  type="button"
                  onClick={loadCivilPreset}
                  className="bg-white/90 hover:bg-white text-slate-950 font-extrabold text-[11px] py-2 px-2.5 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>🧱</span>
                  <span className="truncate">{language === 'hi' ? 'सिविल वर्क' : 'Civil Work'}</span>
                </button>
                <button
                  type="button"
                  onClick={loadPopPreset}
                  className="bg-white/90 hover:bg-white text-slate-950 font-extrabold text-[11px] py-2 px-2.5 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>🛋️</span>
                  <span className="truncate">{language === 'hi' ? 'पीओपी सीलिंग' : 'POP Ceiling'}</span>
                </button>
                <button
                  type="button"
                  onClick={loadFabricationPreset}
                  className="bg-white/90 hover:bg-white text-slate-950 font-extrabold text-[11px] py-2 px-2.5 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>⚒️</span>
                  <span className="truncate">{language === 'hi' ? 'फैब्रिकेशन' : 'Fabrication'}</span>
                </button>
                <button
                  type="button"
                  onClick={loadTilePreset}
                  className="bg-white/90 hover:bg-white text-slate-950 font-extrabold text-[11px] py-2 px-2.5 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>🔲</span>
                  <span className="truncate">{language === 'hi' ? 'टाइल्स बिल' : 'Tile Bill'}</span>
                </button>
              </div>
            </div>
            
            {/* UNIFIED CONTRACTOR SPECIALTY & CATEGORY BOX */}
            <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-md border border-blue-800 space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-2 text-amber-300">
                    <Sparkles size={18} className="text-amber-400" />
                    <span>{language === 'hi' ? 'काम की श्रेणी (Trade Category Box)' : 'Trade Category Box'}</span>
                  </h3>
                  <p className="text-xs text-blue-200 mt-0.5">
                    {language === 'hi' ? 'अपनी काम श्रेणी चुनें या कस्टम नाम सेट करें:' : 'Choose your trade category:'}
                  </p>
                </div>

                <span className="bg-amber-400 text-slate-950 text-[11px] font-black px-3 py-1 rounded-full border border-amber-300 shadow-sm shrink-0">
                  {selectedTrade === 'PAINTER' && '🎨 पेंटर व पॉलिश'}
                  {selectedTrade === 'CARPENTER' && '🪚 कारपेंटर व वुडवर्क'}
                  {selectedTrade === 'ELECTRICIAN' && '⚡ इलेक्ट्रिशियन व वायरिंग'}
                  {selectedTrade === 'PLUMBER' && '🚰 प्लंबर व सैनिटरी'}
                  {selectedTrade === 'CIVIL' && '🧱 राजमिस्त्री व सिविल'}
                  {selectedTrade === 'POP' && '🛋️ पीओपी व फॉल्स सीलिंग'}
                  {selectedTrade === 'FABRICATION' && '⚒️ फैब्रिकेशन व ग्रिल'}
                  {selectedTrade === 'TILE' && '🔲 टाइल्स व मार्बल'}
                  {selectedTrade === 'DELIVERY_CHALLAN' && '🚚 सामग्री सुपुर्दगी चालान'}
                  {selectedTrade === 'ALUMINIUM' && '🪟 एल्युमिनियम व ग्लास'}
                  {selectedTrade === 'CLEANING' && '🧹 डीप क्लीनिंग व हाउसकीपिंग'}
                  {selectedTrade === 'HVAC' && '❄️ एसी रिपेयर व एचवीएसी'}
                  {selectedTrade === 'REAL_ESTATE' && '🏢 रियल एस्टेट व बिल्डर'}
                  {selectedTrade === 'CUSTOM' && '✏️ कस्टम काम श्रेणी'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {/* Category Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1">
                    {language === 'hi' ? 'काम की श्रेणी (Category)' : 'Select Trade Category'}
                  </label>
                  <select
                    value={selectedTrade}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'PAINTER') loadPaintingPreset();
                      else if (val === 'CARPENTER') loadCarpenterPreset();
                      else if (val === 'ELECTRICIAN') loadElectricianPreset();
                      else if (val === 'PLUMBER') loadPlumberPreset();
                      else if (val === 'CIVIL') loadCivilPreset();
                      else if (val === 'POP') loadPopPreset();
                      else if (val === 'FABRICATION') loadFabricationPreset();
                      else if (val === 'TILE') loadTilePreset();
                      else if (val === 'DELIVERY_CHALLAN') loadDeliveryChallanPreset();
                      else if (val === 'ALUMINIUM') loadAluminiumPreset();
                      else if (val === 'CLEANING') loadCleaningPreset();
                      else if (val === 'HVAC') loadHvacPreset();
                      else if (val === 'REAL_ESTATE') loadRealEstatePreset();
                      else if (val === 'CUSTOM') loadCustomPreset();
                    }}
                    className="w-full bg-slate-900 border-2 border-amber-400/90 rounded-xl px-3 py-2.5 text-xs font-extrabold text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-inner cursor-pointer"
                  >
                    <option value="PAINTER">🎨 पेंटर व पॉलिश काम (Painting & Polishing)</option>
                    <option value="CARPENTER">🪚 कारपेंटर व वुडवर्क (Carpentry & Furniture)</option>
                    <option value="ELECTRICIAN">⚡ इलेक्ट्रिशियन व वायरिंग (Electrical Wiring)</option>
                    <option value="PLUMBER">🚰 प्लंबर व सैनिटरी (Plumbing & Sanitary)</option>
                    <option value="CIVIL">🧱 राजमिस्त्री व सिविल काम (Civil Construction)</option>
                    <option value="POP">🛋️ पीओपी व फॉल्स सीलिंग (POP & Ceiling)</option>
                    <option value="FABRICATION">⚒️ फैब्रिकेशन व ग्रिल काम (Steel Fabrication)</option>
                    <option value="TILE">🔲 टाइल्स, मार्बल व ग्रेनाइट (Tiles & Marble)</option>
                    <option value="DELIVERY_CHALLAN">🚚 मटीरियल सप्लायर व चालान (Delivery Challan)</option>
                    <option value="ALUMINIUM">🪟 एल्युमिनियम विंडो व कांच पार्टिशन (Aluminium & Glass)</option>
                    <option value="CLEANING">🧹 डीप क्लीनिंग व सेनेटाइजेशन (Cleaning & Housekeeping)</option>
                    <option value="HVAC">❄️ एसी रिपेयर व सर्विसिंग (HVAC & AC Service)</option>
                    <option value="REAL_ESTATE">🏢 रियल एस्टेट व बिल्डर (Real Estate & Builder)</option>
                    <option value="CUSTOM">✏️ अपनी मनपसंद श्रेणी सेट करें (Custom Category)</option>
                  </select>
                </div>

                {/* Custom Specialty Tagline Input */}
                <div>
                  <label className="block text-xs font-bold text-blue-200 mb-1">
                    {language === 'hi' ? 'अपनी पसंद का काम शीर्षक / टैगलाइन (Custom Tagline)' : 'Work Specialty / Tagline'}
                  </label>
                  <input
                    type="text"
                    value={companyProfile.tagline || ''}
                    onChange={(e) => setCompanyProfile(prev => ({ ...prev, tagline: e.target.value }))}
                    placeholder="e.g. ALUMINIUM SLIDING WINDOW, GLASS & INTERIOR WORK"
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-white placeholder-slate-400 uppercase focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Company Category Symbol Picker - Single Button Trigger */}
              <div className="pt-2 border-t border-slate-800">
                <label className="block text-xs font-extrabold text-amber-300 mb-1.5 flex items-center justify-between">
                  <span>{language === 'hi' ? 'कंपनी प्रतीक / सिंबल आइकॉन (Company Symbol Icon):' : 'Company Category Symbol Icon:'}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowSymbolModal(true)}
                  className="w-full bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 hover:border-amber-400 text-white rounded-xl p-3 flex items-center justify-between transition-all cursor-pointer shadow-sm group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl bg-amber-400/20 p-2 rounded-xl border border-amber-400/30 group-hover:scale-110 transition-transform shrink-0">
                      {companyProfile.symbol || '🎨'}
                    </span>
                    <div className="text-left">
                      <div className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                        <span>{WORK_CATEGORY_SYMBOLS.find(s => s.sym === (companyProfile.symbol || '🎨'))?.name || 'Selected Symbol'}</span>
                      </div>
                      <div className="text-[10px] text-slate-300 font-bold">
                        {language === 'hi' ? 'क्लिक करके 25 प्रतीक आइकॉन में से चुनें (Click to choose symbol)' : 'Click to select from 25 symbol icons'}
                      </div>
                    </div>
                  </div>
                  <span className="bg-amber-400 text-slate-950 font-black text-xs px-3 py-1.5 rounded-lg shadow transition-transform group-hover:scale-105 flex items-center gap-1 shrink-0">
                    <span>{language === 'hi' ? 'चुनें' : 'Select'}</span>
                    <span>🎨</span>
                  </span>
                </button>
              </div>
            </div>

            {/* Template & Document Type Selector */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                  {language === 'hi' ? 'लेटरहेड डिज़ाइन चुनें' : 'Select Letterhead Layout'}
                </label>
                <select
                  value={templateTheme}
                  onChange={(e) => setTemplateTheme(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white"
                >
                  <option value="RAJKAPOOR_STYLE">📄 Contractor Classic (ठेकेदार राजकपूर स्टाइल)</option>
                  <option value="NAVY_CORPORATE">🔷 Navy Corporate (कॉर्पोरेट नेवी ब्लू)</option>
                  <option value="CLASSIC_MINIMAL">📋 Classic Minimal (क्लासिक मिनीमल)</option>
                  <option value="ROYAL_GOLD">👑 Royal Gold & Luxury (रॉयल गोल्ड डिज़ाइन)</option>
                  <option value="EMERALD_MODERN">🌿 Emerald Green (मॉडर्न एमराल्ड ग्रीन)</option>
                  <option value="HEADER_FRAME">🏛️ Architectural Frame (आर्किटेक्ट फ़्रेम)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">
                  🌐 {language === 'hi' ? 'बिल प्रिंट भाषा' : 'Bill Language'}
                </label>
                <select
                  value={billDocLanguage}
                  onChange={(e) => handleBillDocLanguageChange(e.target.value as 'en' | 'hi' | 'gu' | 'mr')}
                  className="w-full bg-amber-50 dark:bg-slate-900 border-2 border-amber-500 rounded-xl px-3 py-2 text-xs font-black text-slate-900 dark:text-amber-300 cursor-pointer shadow-sm"
                >
                  <option value="en">🇬🇧 English (100% Pure)</option>
                  <option value="hi">🇮🇳 Hindi (हिंदी)</option>
                  <option value="gu">🇮🇳 Gujarati (ગુજરાતી)</option>
                  <option value="mr">🇮🇳 Marathi (मराठी)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                  {language === 'hi' ? 'अक्षर / टेक्स्ट स्टाइल (Text Style)' : 'Text / Font Style'}
                </label>
                <select
                  value={fontStyle}
                  onChange={(e) => setFontStyle(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white cursor-pointer"
                >
                  <option value="SANS_MODERN">🔤 Modern Sans (साधारण साफ़)</option>
                  <option value="SERIF_ELEGANT">🖋️ Classic Serif / Royal (रॉयल क्लासिक)</option>
                  <option value="ARCHITECT_BOLD">🏛️ Architectural Heavy (आर्किटेक्ट बोल्‍ड)</option>
                  <option value="MONO_TECH">💻 Technical Monospace (इंजीनियर टेक)</option>
                  <option value="FORMAL_ROYAL">👑 Formal Royal (रॉयल लेटरहेड)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                  {language === 'hi' ? 'दस्तावेज़ प्रकार (Bill Type)' : 'Document Type'}
                </label>
                <select
                  value={docType}
                  onChange={(e) => handleDocTypeChange(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-amber-400 dark:border-amber-500 rounded-xl px-3 py-2 text-xs font-extrabold text-slate-900 dark:text-amber-300 cursor-pointer"
                >
                  <option value="QUOTATION">📋 Quotation / कोटेशन</option>
                  <option value="TAX_INVOICE">🧾 Tax Invoice / टैक्स इनवॉइस</option>
                  <option value="DELIVERY_CHALLAN">🚚 Delivery Challan / डिलीवरी चालान</option>
                  <option value="ESTIMATE">📐 Work Estimate / कार्य अनुमान</option>
                  <option value="PERFORMA">📄 Proforma Invoice / प्रोफार्मा</option>
                  <option value="WORK_ORDER">🔨 Work Order / कार्य आदेश</option>
                  <option value="PURCHASE_ORDER">🛍️ Purchase Order / क्रय आदेश</option>
                  <option value="CASH_MEMO">💵 Cash Memo / कैश मेमो</option>
                  <option value="MEASUREMENT_BILL">📏 Measurement Bill / नाप बिल</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                  {language === 'hi' ? 'बिल क्रमांक (Ref No)' : 'Ref / Bill Number'}
                </label>
                <input
                  type="text"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                  {language === 'hi' ? 'तारीख (Date)' : 'Date'}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Contractor Header Banner Inputs */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 space-y-3">
              <h3 className="text-xs font-black text-blue-900 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 size={16} />
                <span>{language === 'hi' ? 'कंपनी व लेटरहेड जानकारी' : 'Letterhead Details'}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    {language === 'hi' ? 'कंपनी या प्रोफ़ाइल का नाम *' : 'Company / Business Name *'}
                  </label>
                  <input
                    type="text"
                    value={companyProfile.companyName}
                    onChange={(e) => setCompanyProfile({ ...companyProfile, companyName: e.target.value })}
                    placeholder="e.g. BUSINESS NAME"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm font-black uppercase text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    {language === 'hi' ? 'कार्य विशेषता (Specialty / Tagline)' : 'Work Specialty Tagline'}
                  </label>
                  <input
                    type="text"
                    value={companyProfile.tagline}
                    onChange={(e) => setCompanyProfile({ ...companyProfile, tagline: e.target.value })}
                    placeholder="e.g. painting and polishing WORKS with texture DESIGNS"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    {language === 'hi' ? 'पूरा पता (Address)' : 'Complete Address'}
                  </label>
                  <input
                    type="text"
                    value={companyProfile.address}
                    onChange={(e) => setCompanyProfile({ ...companyProfile, address: e.target.value })}
                    placeholder="e.g. house no.436 rajpati yadav chawl hanuman nagar..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Mobile 1</label>
                    <input
                      type="text"
                      value={companyProfile.phone}
                      onChange={(e) => setCompanyProfile({ ...companyProfile, phone: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-2.5 py-2 text-xs font-mono font-bold text-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Mobile 2</label>
                    <input
                      type="text"
                      value={companyProfile.altPhone}
                      onChange={(e) => setCompanyProfile({ ...companyProfile, altPhone: e.target.value })}
                      placeholder="e.g. 8181881318"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-2.5 py-2 text-xs font-mono font-bold text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    {language === 'hi' ? 'बिल / टेबल का शीर्षक (Bill Title Banner)' : 'Bill / Table Title Header'}
                  </label>
                  <input
                    type="text"
                    value={billTitle}
                    onChange={(e) => setBillTitle(e.target.value)}
                    placeholder="BILL FOR LEBUR WITH MATERIEL CHARGES"
                    className="w-full bg-amber-50 dark:bg-slate-900 border border-amber-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-black uppercase text-amber-950 dark:text-amber-200"
                  />
                </div>
              </div>
            </div>

            {/* Client Details */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <User size={16} className="text-blue-600" />
                  <span>{language === 'hi' ? 'ग्राहक व साइट विवरण (Client & Site Details)' : 'Client & Site Info'}</span>
                </h3>
                <button
                  type="button"
                  onClick={handleQuickFillClient}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-[10px] font-black px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  <Zap size={12} className="text-amber-600 dark:text-amber-400" />
                  <span>{language === 'hi' ? '⚡ 1-क्लिक ग्राहक भरें' : '⚡ Quick Sample Client'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    {language === 'hi' ? 'ग्राहक का नाम *' : 'Client Name *'}
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ramesh Sharma / Party Name"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    {language === 'hi' ? 'मोबाइल नंबर' : 'Client Phone'}
                  </label>
                  <input
                    type="text"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="9820012345"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    {language === 'hi' ? 'साइट लोकेशन (Work Site)' : 'Site Location'}
                  </label>
                  <input
                    type="text"
                    value={siteLocation}
                    onChange={(e) => setSiteLocation(e.target.value)}
                    placeholder="Kandivali Work Site / Flat No"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Line Items Table with Unit Options (SFT, MM, RFT, Meter, Inch, SQM, Pcs, Days, Job) */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                    <Receipt size={16} className="text-blue-600" />
                    <span>{language === 'hi' ? 'काम / सामग्री का विवरण (Items List)' : 'Particulars & Rates'}</span>
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {language === 'hi' ? 'इकाई (Unit): SFT, MM, RFT, Inch, Meter, SQM, Pcs, Days, Brass, Job आदि चुनें या टाइप करें' : 'Choose or type any unit: SFT, MM, RFT, Inch, Meter, SQM, Pcs, Days, Job'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-extrabold text-xs px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>{language === 'hi' ? 'रो जोड़ें (Add Row)' : 'Add Row'}</span>
                </button>
              </div>

              {/* 1-TAP SMART QUICK ITEM CHIPS FOR FAST MOBILE ADD */}
              <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 text-white p-3 rounded-xl border border-blue-800/80 shadow-sm space-y-2 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-300">
                    <Zap size={14} className="text-amber-400 shrink-0" />
                    <span>{language === 'hi' ? '1-टैप में आइटम जोड़ें (1-Tap Smart Chips):' : '1-Tap Smart Add Items:'}</span>
                  </div>
                  <span className="text-[9px] text-amber-200 font-bold bg-amber-950/80 border border-amber-500/50 px-2 py-0.5 rounded-full">
                    {language === 'hi' ? 'टैप करते ही जुड़ जाएगा' : 'Tap to Append'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-0.5 max-h-36 overflow-y-auto pr-1">
                  {(TRADE_ITEM_CHIPS[selectedTrade] || TRADE_ITEM_CHIPS.GENERAL).map((chip, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => addQuickChipItem(chip)}
                      className="bg-slate-800/90 hover:bg-amber-400 hover:text-slate-950 text-amber-200 border border-slate-700 hover:border-amber-500 font-extrabold text-[11px] py-1.5 px-2.5 rounded-lg shadow-xs transition-all flex items-center gap-1 cursor-pointer shrink-0 active:scale-95"
                    >
                      <span className="text-amber-400 font-bold">+</span>
                      <span>{chip.name}</span>
                      <span className="text-[9px] opacity-75 font-mono">({chip.unit} @ ₹{chip.rate})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Datalist for unit suggestions */}
              <datalist id="common-units-list">
                {COMMON_UNITS.map(u => (
                  <option key={u} value={u} />
                ))}
              </datalist>

              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={item.id} className="bg-slate-50 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-12 md:col-span-5">
                        <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Item #{idx + 1} Description</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                          placeholder="CEILING PAINT / CABINET IN MM / PIPE FIT METER"
                          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-xs font-bold uppercase text-slate-800 dark:text-white"
                        />
                      </div>

                      <div className="col-span-4 md:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Quantity</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-slate-800 dark:text-white"
                        />
                      </div>

                      <div className="col-span-4 md:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Unit (इकाई)</label>
                        <div>
                          <select
                            value={COMMON_UNITS.includes(item.unit.toUpperCase()) ? item.unit.toUpperCase() : 'CUSTOM'}
                            onChange={(e) => {
                              if (e.target.value !== 'CUSTOM') {
                                handleItemChange(item.id, 'unit', e.target.value);
                              }
                            }}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-800 dark:text-white uppercase cursor-pointer"
                          >
                            {COMMON_UNITS.map(u => (
                              <option key={u} value={u}>{u}</option>
                            ))}
                            <option value="CUSTOM">Custom / अन्य...</option>
                          </select>
                          {(!COMMON_UNITS.includes(item.unit.toUpperCase())) && (
                            <input
                              type="text"
                              value={item.unit}
                              onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                              placeholder="Unit"
                              className="mt-1 w-full bg-amber-50 dark:bg-slate-700 border border-amber-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 dark:text-white uppercase"
                            />
                          )}
                        </div>
                      </div>

                      <div className="col-span-3 md:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Rate (₹)</label>
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-slate-800 dark:text-white"
                        />
                      </div>

                      <div className="col-span-1 md:col-span-1 text-right pt-2 md:pt-0">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={items.length <= 1}
                          className="text-rose-500 hover:text-rose-700 disabled:opacity-20 p-1 rounded cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* ITEM TOTAL AMOUNT CALCULATION BADGE */}
                      <div className="col-span-12 flex items-center justify-between text-xs font-bold pt-2 border-t border-slate-200 dark:border-slate-700/70">
                        <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                          आइटम कुल राशि: <span className="font-mono font-semibold">{item.quantity || 0} {item.unit} × ₹{item.rate || 0}</span>
                        </span>
                        <span className="text-emerald-700 dark:text-emerald-300 font-mono font-black text-xs sm:text-sm bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-700">
                          = ₹{(item.amount || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>

              {/* Prominent Add Row button right where items line finishes */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full py-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer shadow-sm hover:scale-[1.002]"
                >
                  <Plus size={18} className="text-blue-600 dark:text-blue-400" />
                  <span>{language === 'hi' ? '+ नया आइटम / लाइन जोड़ें (Add New Row)' : '+ Add Row / Item to List'}</span>
                </button>
              </div>
            </div>

            {/* Calculations, Taxes & Advance Deduction */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
                      <CheckCircle size={15} className="text-emerald-600" />
                      <span>{language === 'hi' ? 'जीएसटी लागू करें (Add Tax)' : 'Include Tax (GST / VAT)'}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => setIsGstEnabled(!isGstEnabled)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        isGstEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                        isGstEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {isGstEnabled && (
                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Tax Percentage (%)</label>
                      <div className="flex gap-2">
                        {[5, 10, 12, 18, 28].map(r => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setGstRate(r)}
                            className={`flex-1 py-1 rounded-lg font-mono font-bold text-xs border transition cursor-pointer ${
                              gstRate === r 
                                ? 'bg-emerald-600 text-white border-emerald-600' 
                                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200'
                            }`}
                          >
                            {r}%
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">
                      {language === 'hi' ? 'डिस्काउंट / छूट (₹)' : 'Discount (₹)'}
                    </label>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      placeholder="e.g. 1000"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">
                      {language === 'hi' ? 'ट्रांसपोर्ट / भाड़ा (₹)' : 'Transport Charges (₹)'}
                    </label>
                    <input
                      type="number"
                      value={shippingCost}
                      onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                      placeholder="e.g. 150"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                {/* Advance Amount Paid Input Box */}
                <div className="bg-amber-50 dark:bg-slate-900/90 p-3 rounded-xl border border-amber-300 dark:border-amber-500/40">
                  <label className="block text-xs font-black text-amber-950 dark:text-amber-300 mb-1 flex items-center gap-1">
                    <CreditCard size={15} className="text-amber-600" />
                    <span>{language === 'hi' ? 'अग्रिम प्राप्त राशि (Advance Received ₹) - बिल से घटेगा' : 'Advance Amount Received (Less ₹)'}</span>
                  </label>
                  <input
                    type="number"
                    value={advancePaid}
                    onChange={(e) => setAdvancePaid(parseFloat(e.target.value) || 0)}
                    placeholder="Enter advance paid e.g. 50000"
                    className="w-full bg-white dark:bg-slate-800 border border-amber-400 dark:border-amber-500 rounded-xl px-3 py-2 text-sm font-mono font-black text-amber-950 dark:text-amber-200 shadow-sm"
                  />
                  <p className="text-[10px] text-amber-800 dark:text-amber-400 font-semibold mt-1">
                    {language === 'hi' ? '✓ यह एडवांस राशि कुल बिल में से घटाकर "शेष देय राशि (Balance Payable)" दिखाएगी।' : '✓ Automatically deducted from Grand Total to calculate Balance Due.'}
                  </p>
                </div>
              </div>

              {/* Live Calculation Summary Card */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col justify-between border border-slate-800 shadow-lg">
                <div className="space-y-2 border-b border-slate-800 pb-3">
                  <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider">Total & Balance Calculation</span>
                  
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Subtotal (कुल काम योग):</span>
                    <span className="font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-xs text-rose-300">
                      <span>Discount (छूट):</span>
                      <span className="font-mono">- ₹{discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {isGstEnabled && (
                    <div className="flex justify-between text-xs text-emerald-400">
                      <span>Tax ({gstRate}%):</span>
                      <span className="font-mono">+ ₹{gstAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {shippingCost > 0 && (
                    <div className="flex justify-between text-xs text-amber-300">
                      <span>Shipping / Transport:</span>
                      <span className="font-mono">+ ₹{shippingCost.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-baseline pt-2 border-t border-slate-800">
                    <span className="text-xs font-bold text-slate-300">Grand Total (कुल बिल):</span>
                    <span className="text-lg font-black text-slate-100 font-mono">₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>

                  {/* TOTAL AMOUNT IN WORDS (ENGLISH) */}
                  <div className="bg-slate-800/80 p-2 rounded-lg text-[11px] text-amber-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total in Words (English):</span>
                    <span className="font-serif italic font-semibold">{numberToWordsEnglish(totalAmount)}</span>
                  </div>

                  {/* PROMINENT DEDUCTION OF ADVANCE */}
                  <div className="flex justify-between items-baseline text-xs text-amber-400 font-bold bg-amber-950/40 p-2 rounded-lg border border-amber-500/30">
                    <span>Less Advance Paid (घटाया गया एडवांस):</span>
                    <span className="font-mono font-black text-amber-300 text-sm">- ₹{(Number(advancePaid) || 0).toLocaleString('en-IN')}</span>
                  </div>

                  {/* FINAL NET BALANCE PAYABLE */}
                  <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 p-2.5 rounded-xl border border-emerald-500/40 space-y-1">
                    <div className="flex justify-between items-baseline">
                      <div>
                        <span className="text-xs font-black text-emerald-300 uppercase block">{language === 'hi' ? 'शेष देय राशि' : 'Net Remaining Due'}</span>
                        <span className="text-[10px] text-emerald-400 font-semibold">(Balance Payable)</span>
                      </div>
                      <span className="text-2xl font-black text-emerald-400 font-mono">₹{balanceDue.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="text-[11px] text-emerald-300 pt-1 border-t border-emerald-900/60">
                      <span className="text-[10px] uppercase font-bold text-emerald-500/80 block">Balance Payable in Words (English):</span>
                      <span className="font-serif italic font-bold">{numberToWordsEnglish(balanceDue)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveQuotation('SENT')}
                    className="sm:col-span-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs py-3 rounded-xl transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye size={16} />
                    <span>{language === 'hi' ? 'प्रीव्यू / PDF देखें' : 'Preview / PDF'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveQuotation('DRAFT')}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs py-3 rounded-xl transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Save size={16} />
                    <span>{language === 'hi' ? 'बिल सहेजें (Save)' : 'Save Record'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleWhatsAppShare(buildCurrentQuotationObject())}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-3 rounded-xl transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Share2 size={16} />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>

            {/* MOBILE FIXED STICKY ACTION BAR FOR FAST ACCESS */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md p-2.5 border-t border-slate-800 shadow-2xl flex items-center justify-between gap-2 no-print">
              <button
                type="button"
                onClick={() => handleSaveQuotation('DRAFT')}
                className="flex-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs py-2.5 px-2 rounded-xl flex items-center justify-center gap-1 shadow cursor-pointer active:scale-95"
              >
                <Eye size={15} />
                <span>{language === 'hi' ? 'लेटरहेड प्रीव्यू' : 'Preview'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveQuotation('DRAFT')}
                className="bg-blue-600 text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1 shadow cursor-pointer active:scale-95"
              >
                <Save size={15} />
                <span>{language === 'hi' ? 'सहेजें' : 'Save'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleWhatsAppShare(buildCurrentQuotationObject())}
                className="bg-emerald-600 text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1 shadow cursor-pointer active:scale-95"
              >
                <Share2 size={15} />
                <span>WhatsApp</span>
              </button>
            </div>

          </div>
        )}

        {/* TAB 2: INTERACTIVE LETTERHEAD PREVIEW & LIVE IN-LINE EDITING */}
        {activeTab === 'PREVIEW' && (
          <div className="space-y-4">
            
            {/* Top Toolbar - Compact Action Bar */}
            <div className="no-print bg-white dark:bg-slate-800 p-2 sm:p-3 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-1.5">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsInlineEditing(!isInlineEditing)}
                  className={`px-2 py-1 rounded-md text-[10px] sm:text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                    isInlineEditing 
                      ? 'bg-amber-400 text-slate-950 shadow-sm border border-amber-500 ring-1 ring-amber-300 font-black' 
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <Edit2 size={12} />
                  <span>{isInlineEditing ? (language === 'hi' ? '✏️ ऑन-पेपर डायरेक्ट एडिट' : '✏️ Direct Edit') : (language === 'hi' ? 'एडिट चालू करें' : 'Enable Edit')}</span>
                </button>

                <button
                  onClick={() => handleSaveQuotation('DRAFT')}
                  className="bg-blue-900 hover:bg-blue-800 text-white px-2 py-1 rounded-md text-[10px] sm:text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm"
                >
                  <Save size={12} />
                  <span>{language === 'hi' ? 'सहेजें' : 'Save'}</span>
                </button>
              </div>

              {/* Theme Switcher in Preview */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto max-w-full">
                <button
                  onClick={() => setTemplateTheme('RAJKAPOOR_STYLE')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer whitespace-nowrap ${
                    templateTheme === 'RAJKAPOOR_STYLE' ? 'bg-white dark:bg-slate-800 text-blue-900 dark:text-blue-300 shadow-sm font-black' : 'text-slate-500'
                  }`}
                >
                  Contractor
                </button>
                <button
                  onClick={() => setTemplateTheme('NAVY_CORPORATE')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer whitespace-nowrap ${
                    templateTheme === 'NAVY_CORPORATE' ? 'bg-blue-900 text-white shadow-sm font-black' : 'text-slate-500'
                  }`}
                >
                  Navy
                </button>
                <button
                  onClick={() => setTemplateTheme('CLASSIC_MINIMAL')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer whitespace-nowrap ${
                    templateTheme === 'CLASSIC_MINIMAL' ? 'bg-slate-800 text-white shadow-sm font-black' : 'text-slate-500'
                  }`}
                >
                  Classic
                </button>
                <button
                  onClick={() => setTemplateTheme('ROYAL_GOLD')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer whitespace-nowrap ${
                    templateTheme === 'ROYAL_GOLD' ? 'bg-amber-500 text-slate-950 font-black shadow-sm' : 'text-slate-500 hover:text-amber-600'
                  }`}
                >
                  👑 Royal Gold
                </button>
                <button
                  onClick={() => setTemplateTheme('EMERALD_MODERN')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer whitespace-nowrap ${
                    templateTheme === 'EMERALD_MODERN' ? 'bg-emerald-800 text-white font-black shadow-sm' : 'text-slate-500 hover:text-emerald-700'
                  }`}
                >
                  🌿 Emerald
                </button>
                <button
                  onClick={() => setTemplateTheme('HEADER_FRAME')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer whitespace-nowrap ${
                    templateTheme === 'HEADER_FRAME' ? 'bg-rose-900 text-white font-black shadow-sm' : 'text-slate-500 hover:text-rose-800'
                  }`}
                >
                  🏛️ Architect
                </button>
              </div>

              {/* Bill Language Selector in Preview Top Bar */}
              <div className="flex items-center gap-1 bg-amber-50 dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-amber-300 dark:border-amber-500/50 shadow-sm">
                <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-400">🌐</span>
                <select
                  value={billDocLanguage}
                  onChange={(e) => handleBillDocLanguageChange(e.target.value as any)}
                  className="bg-transparent text-[11px] font-black text-slate-900 dark:text-amber-300 cursor-pointer focus:outline-none"
                >
                  <option value="en">English (100% Pure)</option>
                  <option value="hi">Hindi (हिंदी)</option>
                  <option value="gu">Gujarati (ગુજરાતી)</option>
                  <option value="mr">Marathi (मराठी)</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleWhatsAppShare(previewData || {
                    id: `quo_${Date.now()}`,
                    docType, docNumber, date, validUntil, templateTheme, tradeCategory: selectedTrade,
                    companyName: companyProfile.companyName, tagline: companyProfile.tagline,
                    contractorName: companyProfile.contractorName, phone: companyProfile.phone, altPhone: companyProfile.altPhone,
                    email: companyProfile.email, address: companyProfile.address, gstin: companyProfile.gstin, upiId: companyProfile.upiId, bankDetails: companyProfile.bankDetails,
                    billTitle, clientName, clientCompany, clientPhone, clientAddress, siteLocation, poNumber, shipDate, preparedBy,
                    items, isGstEnabled, gstRate, discount, shippingCost, advancePaid, terms, status: 'DRAFT', createdAt: new Date().toISOString()
                  })}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded-md text-[10px] sm:text-xs font-bold flex items-center gap-1 shadow-sm transition cursor-pointer"
                >
                  <Share2 size={12} />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={handleDownloadAsImage}
                  disabled={isDownloading}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded-md text-[10px] sm:text-xs font-bold flex items-center gap-1 shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  <Download size={12} />
                  <span>{isDownloading ? '...' : 'PNG'}</span>
                </button>

                <button
                  onClick={() => {
                    const check = checkAndIncrementUsage("bill_print");
                    if (!check.allowed) {
                      setShowPaywall(true);
                      return;
                    }
                    window.print();
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-md text-[10px] sm:text-xs font-bold flex items-center gap-1 shadow-md transition cursor-pointer"
                >
                  <Printer size={12} />
                  <span>{language === 'hi' ? 'प्रिंट' : 'Print'}</span>
                </button>
              </div>
            </div>

            {/* Editable Notice Helper Banner */}
            {isInlineEditing && (
              <div className="no-print bg-amber-50 border border-amber-300 text-amber-900 rounded-lg p-1.5 text-[10px] sm:text-xs font-semibold flex items-center justify-between gap-2 shadow-sm">
                <div className="flex items-center gap-1 truncate">
                  <Sparkles size={13} className="text-amber-600 shrink-0" />
                  <span className="truncate">
                    {language === 'hi' 
                      ? '💡 ऑन-पेपर एडिट: लेटरहेड में नाम, पता, फोन, दरें आदि पर टच करके सीधे एडिट करें!' 
                      : '💡 Direct On-Paper Edit: Tap any text on letterhead paper below to edit!'}
                  </span>
                </div>
                <button 
                  onClick={handleAddItem}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded shrink-0 cursor-pointer shadow-sm"
                >
                  + Add Row
                </button>
              </div>
            )}

            {/* Mobile Letterhead Zoom & Scroll Controls Bar */}
            <div className="no-print sm:hidden bg-slate-900 text-white p-2.5 rounded-xl border border-slate-700 space-y-2 shadow-sm">
              {/* Zoom - and + Controls Row */}
              <div className="flex items-center justify-between gap-1 text-[11px] font-black">
                <div className="flex items-center gap-1.5 text-amber-300 font-extrabold text-[11px] shrink-0">
                  <ZoomOut size={13} className="text-amber-400" />
                  <span>ज़ूम:</span>
                  <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setCustomZoom(Math.max(0.30, Number((currentScale - 0.10).toFixed(2))))}
                      className="bg-slate-700 hover:bg-slate-600 text-white font-black px-2 py-1 rounded text-xs active:scale-90 transition cursor-pointer border border-slate-600"
                      title="Zoom Out (-)"
                    >
                      -
                    </button>
                    <span className="font-mono text-amber-400 font-extrabold px-2 text-xs min-w-[42px] text-center">
                      {Math.round(currentScale * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setCustomZoom(Math.min(1.50, Number((currentScale + 0.10).toFixed(2))))}
                      className="bg-slate-700 hover:bg-slate-600 text-white font-black px-2 py-1 rounded text-xs active:scale-90 transition cursor-pointer border border-slate-600"
                      title="Zoom In (+)"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1 shrink-0 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setCustomZoom(autoScale)}
                    className={`px-2 py-1 rounded-lg transition border cursor-pointer ${
                      Math.abs(currentScale - autoScale) < 0.02
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm font-black' 
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                    }`}
                  >
                    📱 स्क्रीन फ़िट
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomZoom(1.0);
                      setTimeout(() => scrollLetterhead('center'), 50);
                    }}
                    className={`px-2 py-1 rounded-lg transition border cursor-pointer ${
                      Math.abs(currentScale - 1.0) < 0.02
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm font-black' 
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                    }`}
                  >
                    📄 100% A4
                  </button>
                </div>
              </div>

              {/* Scroll Direction Controls for Zoomed View */}
              <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-slate-800 text-[10px] font-bold">
                <span className="text-slate-400 text-[10px] shrink-0">बाएं-दाएं देखें:</span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => scrollLetterhead('left')}
                    className="bg-slate-800 hover:bg-slate-700 active:bg-amber-400 active:text-slate-950 text-amber-300 px-2.5 py-1 rounded-lg border border-slate-600 text-[11px] font-extrabold flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
                  >
                    <span>👈</span>
                    <span>बायें (Left)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollLetterhead('center')}
                    className="bg-slate-800 hover:bg-slate-700 active:bg-amber-400 active:text-slate-950 text-slate-200 px-2 py-1 rounded-lg border border-slate-600 text-[11px] font-bold cursor-pointer active:scale-95 shadow-sm"
                  >
                    🎯 सेंटर
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollLetterhead('right')}
                    className="bg-slate-800 hover:bg-slate-700 active:bg-amber-400 active:text-slate-950 text-amber-300 px-2.5 py-1 rounded-lg border border-slate-600 text-[11px] font-extrabold flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
                  >
                    <span>दायें (Right)</span>
                    <span>👉</span>
                  </button>
                </div>
              </div>
            </div>

            {/* LETTERHEAD PRINT PAPER CONTAINER WRAPPER FOR MOBILE & HIGH-RES DOWNLOAD */}
            <div 
              id="printable-letterhead-wrapper" 
              ref={letterheadWrapperRef}
              className="w-full pb-8 pt-1 flex flex-col items-center overflow-x-auto  scrollbar-thin px-1"
            >
              {/* DYNAMIC SCALED VIEWPORT BOX PREVENTING OVERFLOW & CROPPING */}
              <div
                style={{
                  width: `${Math.round(794 * currentScale)}px`,
                  minHeight: `${Math.round(1123 * currentScale)}px`,
                  overflow: 'hidden',
                  position: 'relative'
                }}
                className="mx-auto shrink-0 transition-all duration-200 shadow-2xl rounded-sm border border-slate-300"
              >
                <div 
                  id="printable-letterhead"
                  style={{
                    transform: `scale(${currentScale})`,
                    transformOrigin: 'top left',
                    width: '794px',
                    minWidth: '794px',
                    minHeight: '1123px'
                  }}
                  className={`bg-white text-slate-900 p-8 sm:p-10 relative overflow-hidden transition-all duration-200 text-slate-900 ${getFontStyleClass(fontStyle)}`}
                >
              
              {/* LAYOUT 1: GLOBAL CONTRACTOR STYLE */}
              {templateTheme === 'RAJKAPOOR_STYLE' && (
                <div className="space-y-4">
                  
                  {/* Top Right Mobile Header */}
                  <div className="flex justify-between items-start border-b pb-3 border-slate-200">
                    <div className="text-xs text-slate-500 font-mono font-bold">
                      {getBillLabel('date', billDocLanguage)} {date} | {getBillLabel('ref', billDocLanguage)} {docNumber}
                    </div>

                    <div className="text-right font-mono text-xs font-black text-slate-800">
                      {isInlineEditing ? (
                        <div className="flex items-center gap-1 justify-end">
                          <span>{getBillLabel('mobile', billDocLanguage)}</span>
                          <input 
                            type="text" 
                            value={companyProfile.phone} 
                            onChange={(e) => setCompanyProfile({...companyProfile, phone: e.target.value})}
                            className="w-24 border-b border-slate-400 text-right font-bold focus:bg-amber-50 outline-none"
                          />
                          <span>/</span>
                          <input 
                            type="text" 
                            value={companyProfile.altPhone} 
                            onChange={(e) => setCompanyProfile({...companyProfile, altPhone: e.target.value})}
                            className="w-24 border-b border-slate-400 text-right font-bold focus:bg-amber-50 outline-none"
                          />
                        </div>
                      ) : (
                        <span>{getBillLabel('mobile', billDocLanguage)} {companyProfile.phone} {companyProfile.altPhone ? `, ${companyProfile.altPhone}` : ''}</span>
                      )}
                    </div>
                  </div>

                  {/* Centered Compact Contractor Name */}
                  <div className="text-center space-y-1 py-1.5">
                    {isInlineEditing ? (
                      <input
                        type="text"
                        value={companyProfile.companyName}
                        onChange={(e) => setCompanyProfile({...companyProfile, companyName: e.target.value})}
                        className="w-full text-center text-lg sm:text-xl font-black tracking-wide text-slate-900 uppercase border-b border-dashed border-amber-400 focus:bg-amber-50 outline-none"
                      />
                    ) : (
                      <h1 className="text-lg sm:text-xl font-black tracking-wide text-slate-900 uppercase flex items-center justify-center gap-2">
                        <span className="text-lg sm:text-xl">{companyProfile.symbol || '🎨'}</span>
                        <span>{companyProfile.companyName}</span>
                      </h1>
                    )}

                    {isInlineEditing ? (
                      <input
                        type="text"
                        value={companyProfile.tagline}
                        onChange={(e) => setCompanyProfile({...companyProfile, tagline: e.target.value})}
                        className="w-full text-center text-xs font-bold text-slate-600 uppercase tracking-widest border-b border-dashed border-slate-300 focus:bg-amber-50 outline-none"
                      />
                    ) : (
                      <p className="text-xs font-extrabold text-slate-600 uppercase tracking-widest">
                        {companyProfile.tagline}
                      </p>
                    )}

                    {isInlineEditing ? (
                      <textarea
                        rows={1}
                        value={companyProfile.address}
                        onChange={(e) => setCompanyProfile({...companyProfile, address: e.target.value})}
                        className="w-full text-center text-[11px] text-slate-500 font-medium focus:bg-amber-50 outline-none border-b border-dashed border-slate-200"
                      />
                    ) : (
                      <p className="text-[11px] text-slate-600 font-medium max-w-xl mx-auto">
                        {getBillLabel('address', billDocLanguage)} {companyProfile.address}
                      </p>
                    )}
                  </div>

                  {/* Client & Work Site Info Strip */}
                  <div className="bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs grid grid-cols-1 md:grid-cols-2 gap-2 my-2">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-slate-700">{getBillLabel('client', billDocLanguage)}</span>
                      {isInlineEditing ? (
                        <input
                          type="text"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          className="font-extrabold text-slate-900 border-b border-slate-400 focus:bg-amber-50 outline-none flex-1"
                        />
                      ) : (
                        <span className="font-black text-slate-900">{clientName}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 md:justify-end">
                      <span className="font-bold text-slate-700">{getBillLabel('siteLocation', billDocLanguage)}</span>
                      {isInlineEditing ? (
                        <input
                          type="text"
                          value={siteLocation}
                          onChange={(e) => setSiteLocation(e.target.value)}
                          className="font-bold text-slate-900 border-b border-slate-400 focus:bg-amber-50 outline-none"
                        />
                      ) : (
                        <span className="font-bold text-slate-900">{siteLocation || getBillLabel('asSpecified', billDocLanguage)}</span>
                      )}
                    </div>
                  </div>

                  {/* Centered Boxed Bill Header Banner */}
                  <div className="text-center my-3">
                    {isInlineEditing ? (
                      <input
                        type="text"
                        value={billTitle}
                        onChange={(e) => setBillTitle(e.target.value)}
                        className="w-full text-center font-black text-sm uppercase tracking-wider py-1.5 bg-slate-100 border border-slate-400 focus:bg-amber-100 outline-none"
                      />
                    ) : (
                      <div className="inline-block border border-slate-800 px-6 py-1 font-black text-sm uppercase tracking-wider bg-slate-50">
                        {billTitle || getBillLabel('defaultBillTitle', billDocLanguage)}
                      </div>
                    )}
                  </div>

                  {/* Boxed Grid Table matching Image */}
                  <div className="border border-slate-800 rounded-none overflow-hidden">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-800 text-slate-900 font-extrabold uppercase">
                          <th className="p-2 border-r border-slate-800 text-left">{getBillLabel('itemDesc', billDocLanguage)}</th>
                          <th className="p-2 border-r border-slate-800 text-center w-28">{getBillLabel('qtyUnit', billDocLanguage)}</th>
                          <th className="p-2 border-r border-slate-800 text-right w-28">{getBillLabel('unitRate', billDocLanguage)}</th>
                          <th className="p-2 text-right w-32">{getBillLabel('totalPrice', billDocLanguage)}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 font-medium">
                        {items.map((item) => (
                          <tr key={item.id} className="border-b border-slate-800">
                            <td className="p-2 border-r border-slate-800 font-bold text-slate-900">
                              {isInlineEditing ? (
                                <input
                                  type="text"
                                  value={item.description}
                                  onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                  className="w-full uppercase font-bold focus:bg-amber-50 outline-none"
                                />
                              ) : (
                                item.description
                              )}
                            </td>

                            <td className="p-2 border-r border-slate-800 text-center font-mono">
                              {isInlineEditing ? (
                                <div className="flex justify-center gap-1">
                                  <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                                    className="w-16 text-center font-mono font-bold focus:bg-amber-50 outline-none"
                                  />
                                  <input
                                    type="text"
                                    value={item.unit}
                                    onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                                    className="w-12 text-center text-[10px] font-bold focus:bg-amber-50 outline-none uppercase"
                                  />
                                </div>
                              ) : (
                                `${item.quantity} ${item.unit}`
                              )}
                            </td>

                            <td className="p-2 border-r border-slate-800 text-right font-mono">
                              {isInlineEditing ? (
                                <input
                                  type="number"
                                  value={item.rate}
                                  onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                                  className="w-20 text-right font-mono font-bold focus:bg-amber-50 outline-none"
                                />
                              ) : (
                                `₹${item.rate}`
                              )}
                            </td>

                            <td className="p-2 text-right font-mono font-extrabold text-slate-900">
                              ₹{item.amount.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}

                        {/* Add Row Button right where items finish in inline editing */}
                        {isInlineEditing && (
                          <tr className="no-print bg-amber-50/80 border-b border-slate-800">
                            <td colSpan={4} className="p-1.5 text-center">
                              <button
                                type="button"
                                onClick={handleAddItem}
                                className="px-3 py-1 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-lg shadow transition flex items-center justify-center gap-1 mx-auto cursor-pointer"
                              >
                                <Plus size={14} />
                                <span>+ Add Row to Particulars</span>
                              </button>
                            </td>
                          </tr>
                        )}

                        {/* Subtotal Row */}
                        <tr className="border-b border-slate-800 bg-slate-50 font-bold">
                          <td colSpan={3} className="p-2 border-r border-slate-800 text-right uppercase">
                            {getBillLabel('subtotal', billDocLanguage)}
                          </td>
                          <td className="p-2 text-right font-mono font-black text-slate-900">
                            ₹{subtotal.toLocaleString('en-IN')}
                          </td>
                        </tr>

                        {/* Discount Row */}
                        {discount > 0 && (
                          <tr className="border-b border-slate-800 font-bold text-rose-800">
                            <td colSpan={3} className="p-2 border-r border-slate-800 text-right">
                              {getBillLabel('discount', billDocLanguage)}
                            </td>
                            <td className="p-2 text-right font-mono font-bold">
                              - ₹{discount.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        )}

                        {/* Tax Row */}
                        {isGstEnabled && (
                          <tr className="border-b border-slate-800 font-bold">
                            <td colSpan={3} className="p-2 border-r border-slate-800 text-right">
                              {billDocLanguage === 'en' ? `Tax (${gstRate}% GST):` : getBillLabel('gst', billDocLanguage)}
                            </td>
                            <td className="p-2 text-right font-mono font-bold text-slate-900">
                              + ₹{gstAmount.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        )}

                        {/* Shipping/Transport Row */}
                        {shippingCost > 0 && (
                          <tr className="border-b border-slate-800 font-bold">
                            <td colSpan={3} className="p-2 border-r border-slate-800 text-right">
                              {getBillLabel('shipping', billDocLanguage)}
                            </td>
                            <td className="p-2 text-right font-mono font-bold text-slate-900">
                              + ₹{shippingCost.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        )}

                        {/* Grand Total Row */}
                        <tr className="bg-slate-100 font-black text-xs border-b border-slate-800">
                          <td colSpan={3} className="p-2 border-r border-slate-800 text-right uppercase">
                            {getBillLabel('grandTotal', billDocLanguage)}
                          </td>
                          <td className="p-2 text-right font-mono text-sm font-black text-slate-950">
                            ₹{totalAmount.toLocaleString('en-IN')}
                          </td>
                        </tr>

                        {/* PROMINENT LESS ADVANCE RECEIVED ROW */}
                        <tr className="bg-amber-50 font-black text-xs border-b-2 border-slate-800 text-amber-950">
                          <td colSpan={3} className="p-2 border-r border-slate-800 text-right uppercase">
                            {isInlineEditing ? (
                              <div className="flex items-center justify-end gap-2">
                                <span>{getBillLabel('lessAdvance', billDocLanguage)}</span>
                                <input
                                  type="number"
                                  value={advancePaid}
                                  onChange={(e) => setAdvancePaid(parseFloat(e.target.value) || 0)}
                                  className="w-24 text-right font-mono font-black border border-amber-400 bg-white px-1 py-0.5 rounded outline-none"
                                />
                              </div>
                            ) : (
                              <span>{getBillLabel('lessAdvance', billDocLanguage)}</span>
                            )}
                          </td>
                          <td className="p-2 text-right font-mono text-sm font-black text-amber-900">
                            - ₹{(Number(advancePaid) || 0).toLocaleString('en-IN')}
                          </td>
                        </tr>

                        {/* FINAL BALANCE PAYABLE ROW */}
                        <tr className="bg-slate-900 text-white font-black text-sm">
                          <td colSpan={3} className="p-2.5 border-r border-slate-800 text-right uppercase text-amber-300">
                            {getBillLabel('netDue', billDocLanguage)}
                          </td>
                          <td className="p-2.5 text-right font-mono text-base font-black text-amber-400">
                            ₹{balanceDue.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* AMOUNT IN WORDS SECTION */}
                  <div className="my-3 p-3 bg-slate-50 border border-slate-800 text-xs space-y-1.5 font-sans">
                    <div className="flex items-start gap-2">
                      <span className="font-black text-slate-900 uppercase shrink-0">
                        {getBillLabel('amountInWords', billDocLanguage)}
                      </span>
                      <div className="font-serif italic font-extrabold text-slate-900">
                        {renderAmountInWords(totalAmount, billDocLanguage)}
                      </div>
                    </div>
                    {advancePaid > 0 && (
                      <div className="flex items-start gap-2 pt-1 border-t border-slate-300 text-amber-950">
                        <span className="font-black text-amber-950 uppercase shrink-0">
                          {getBillLabel('balanceInWords', billDocLanguage)}
                        </span>
                        <div className="font-serif italic font-extrabold text-amber-950">
                          {renderAmountInWords(balanceDue, billDocLanguage)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Terms & Conditions */}
                  <div className="pt-4 text-xs space-y-1">
                    <p className="font-extrabold text-slate-900 uppercase">
                      {getBillLabel('terms', billDocLanguage)}
                    </p>
                    {isInlineEditing ? (
                      <textarea
                        rows={3}
                        value={terms}
                        onChange={(e) => setTerms(e.target.value)}
                        className="w-full text-xs font-mono p-1 border border-dashed border-slate-400 focus:bg-amber-50 outline-none"
                      />
                    ) : (
                      <p className="whitespace-pre-line text-slate-700 leading-relaxed font-sans">
                        {terms}
                      </p>
                    )}
                  </div>

                  {/* Signatures */}
                  <div className="pt-10 flex justify-between items-end text-xs">
                    <div>
                      <p className="border-t border-slate-400 pt-1 font-bold text-slate-700">
                        {getBillLabel('clientSignature', billDocLanguage)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900 uppercase">{companyProfile.companyName}</p>
                      <p className="border-t border-slate-400 pt-1 font-bold text-slate-700 mt-8">
                        {getBillLabel('authorizedSignature', billDocLanguage)}
                      </p>
                    </div>
                  </div>

                </div>
              )}

              {/* LAYOUT 2: MEDIA PRODUCTION NAVY BLUE STYLE */}
              {templateTheme === 'NAVY_CORPORATE' && (
                <div className="space-y-4">
                  
                  {/* Top Left Logo & Right Quotation Header */}
                  <div className="flex flex-wrap justify-between items-start border-b-2 border-blue-900 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-900 text-white p-2 rounded-lg font-black text-lg">
                          <Building2 size={22} />
                        </span>
                        <div>
                          <h1 className="text-lg sm:text-xl font-black text-blue-900 tracking-wide uppercase">
                            {companyProfile.companyName}
                          </h1>
                          <p className="text-[10px] font-bold text-blue-700 uppercase">
                            {companyProfile.tagline || 'MEDIA PRODUCTION & CONTRACTING WORKS'}
                          </p>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 space-y-0.5 pt-1">
                        <p>📍 {companyProfile.address}</p>
                        <p>📞 {companyProfile.phone} {companyProfile.altPhone ? `| ${companyProfile.altPhone}` : ''}</p>
                        <p>✉️ {companyProfile.email}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <h2 className="text-3xl font-black text-blue-900 uppercase tracking-widest mb-1">
                        {docType}
                      </h2>
                      <div className="text-xs text-slate-700 space-y-1 font-mono">
                        <p><strong>Date:</strong> {date}</p>
                        <p><strong>Ref No:</strong> {docNumber}</p>
                        <p><strong>Valid Until:</strong> {validUntil}</p>
                        <p><strong>Prepared By:</strong> {preparedBy || companyProfile.contractorName}</p>
                      </div>
                    </div>
                  </div>

                  {/* Client Details Section */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                    <h3 className="font-bold text-blue-900 uppercase mb-1">Client Details:</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p><strong>Name:</strong> {clientName}</p>
                        <p><strong>Company:</strong> {clientCompany || 'N/A'}</p>
                        <p><strong>Phone:</strong> {clientPhone}</p>
                      </div>
                      <div>
                        <p><strong>Address:</strong> {clientAddress || siteLocation}</p>
                        <p><strong>Work Site:</strong> {siteLocation}</p>
                      </div>
                    </div>
                  </div>

                  {/* Navy Strip */}
                  <div className="bg-blue-900 text-white text-xs font-bold p-2.5 rounded-none grid grid-cols-3 text-center uppercase tracking-wider">
                    <div>PO. Number: {poNumber || 'N/A'}</div>
                    <div>Ship Date: {shipDate || date}</div>
                    <div>Terms: Net 30 Days</div>
                  </div>

                  {/* Item Table */}
                  <div className="border border-blue-900">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-blue-900 text-white font-extrabold uppercase">
                          <th className="p-2 border-r border-blue-900 text-center w-24">Qty & Unit</th>
                          <th className="p-2 border-r border-blue-900">Description</th>
                          <th className="p-2 border-r border-blue-900 text-right w-24">Unit Rate</th>
                          <th className="p-2 border-r border-blue-900 text-right w-20">Taxes</th>
                          <th className="p-2 text-right w-28">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-300">
                        {items.map((item) => (
                          <tr key={item.id}>
                            <td className="p-2 border-r border-slate-300 text-center font-mono font-bold">
                              {item.quantity} {item.unit}
                            </td>
                            <td className="p-2 border-r border-slate-300 font-bold text-slate-800">
                              {item.description}
                            </td>
                            <td className="p-2 border-r border-slate-300 text-right font-mono">
                              ₹{item.rate}
                            </td>
                            <td className="p-2 border-r border-slate-300 text-right font-mono text-slate-600">
                              {isGstEnabled ? `${gstRate}%` : '0%'}
                            </td>
                            <td className="p-2 text-right font-mono font-extrabold text-slate-900">
                              ₹{item.amount.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}

                        {/* Inline Add Row Button */}
                        {isInlineEditing && (
                          <tr className="no-print bg-blue-50/80">
                            <td colSpan={5} className="p-1.5 text-center">
                              <button
                                type="button"
                                onClick={handleAddItem}
                                className="px-3 py-1 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded shadow transition flex items-center justify-center gap-1 mx-auto cursor-pointer"
                              >
                                <Plus size={14} />
                                <span>+ Add Row to Particulars</span>
                              </button>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Bottom Totals Right Aligned */}
                  <div className="flex justify-between items-start pt-4 text-xs">
                    <div className="text-slate-600 max-w-sm space-y-2">
                      <div>
                        <p className="font-bold text-slate-800">If you have any questions concerning this document, contact:</p>
                        <p>[{companyProfile.contractorName}] - Ph: {companyProfile.phone}</p>
                      </div>

                      {/* AMOUNT IN WORDS SECTION */}
                      <div className="p-2.5 bg-slate-50 border border-blue-200 rounded text-xs space-y-1 font-sans">
                        <div>
                          <span className="font-extrabold text-blue-900 uppercase block text-[10px]">{getBillLabel('amountInWords', billDocLanguage)}</span>
                          <span className="font-serif italic font-bold text-slate-800">{renderAmountInWords(totalAmount, billDocLanguage)}</span>
                        </div>
                        {advancePaid > 0 && (
                          <div className="pt-1 border-t border-slate-200 text-blue-950">
                            <span className="font-extrabold text-blue-900 uppercase block text-[10px]">{getBillLabel('balanceInWords', billDocLanguage)}</span>
                            <span className="font-serif italic font-extrabold text-blue-950">{renderAmountInWords(balanceDue, billDocLanguage)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="w-72 space-y-1 text-right font-mono">
                      <div className="flex justify-between text-slate-700">
                        <span className="font-bold">SUB TOTAL:</span>
                        <span>₹{subtotal.toLocaleString('en-IN')}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-rose-700">
                          <span className="font-bold">DISCOUNT:</span>
                          <span>- ₹{discount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {isGstEnabled && (
                        <div className="flex justify-between text-slate-700">
                          <span className="font-bold">TAXES ({gstRate}%):</span>
                          <span>₹{gstAmount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {shippingCost > 0 && (
                        <div className="flex justify-between text-slate-700">
                          <span className="font-bold">TRANSPORT:</span>
                          <span>₹{shippingCost.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-black text-sm text-slate-900 pt-1 border-t border-slate-300">
                        <span>TOTAL AMOUNT:</span>
                        <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                      
                      {/* ADVANCE DEDUCTION */}
                      <div className="flex justify-between text-amber-800 font-black bg-amber-50 p-1 rounded">
                        <span>LESS ADVANCE PAID:</span>
                        <span>- ₹{(Number(advancePaid) || 0).toLocaleString('en-IN')}</span>
                      </div>

                      {/* BALANCE PAYABLE */}
                      <div className="flex justify-between font-black text-sm text-blue-950 pt-2 border-t-2 border-blue-900 bg-blue-50 p-1.5 rounded">
                        <span>BALANCE PAYABLE:</span>
                        <span className="text-base text-blue-900 font-mono">₹{balanceDue.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tagline Footer */}
                  <div className="pt-8 text-center font-extrabold text-slate-800 text-xs tracking-wider">
                    Thank you for your business!
                  </div>

                </div>
              )}

              {/* LAYOUT 3: CLASSIC MINIMAL */}
              {templateTheme === 'CLASSIC_MINIMAL' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-4">
                    <div>
                      <h1 className="text-lg sm:text-xl font-black text-slate-900">{companyProfile.companyName}</h1>
                      <p className="text-xs text-slate-600">{companyProfile.address}</p>
                      <p className="text-xs text-slate-600">Ph: {companyProfile.phone}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black bg-slate-900 text-white px-3 py-1 rounded">
                        {docType}
                      </span>
                      <p className="text-xs font-mono mt-1">No: {docNumber}</p>
                      <p className="text-xs font-mono">Date: {date}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded text-xs">
                    <p className="font-bold">Bill To: {clientName}</p>
                    <p>Site Location: {siteLocation}</p>
                  </div>

                  <table className="w-full text-xs text-left border">
                    <thead>
                      <tr className="bg-slate-100 border-b">
                        <th className="p-2 border-r">Particulars</th>
                        <th className="p-2 border-r text-center">Qty / Unit</th>
                        <th className="p-2 border-r text-right">Rate</th>
                        <th className="p-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(item => (
                        <tr key={item.id} className="border-b">
                          <td className="p-2 border-r font-bold">{item.description}</td>
                          <td className="p-2 border-r text-center font-mono">{item.quantity} {item.unit}</td>
                          <td className="p-2 border-r text-right font-mono">₹{item.rate}</td>
                          <td className="p-2 text-right font-mono font-bold">₹{item.amount.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                      {isInlineEditing && (
                        <tr className="no-print bg-slate-50">
                          <td colSpan={4} className="p-1.5 text-center">
                            <button
                              type="button"
                              onClick={handleAddItem}
                              className="px-3 py-1 bg-slate-800 text-white font-bold text-xs rounded shadow transition flex items-center justify-center gap-1 mx-auto cursor-pointer"
                            >
                              <Plus size={14} />
                              <span>+ Add Row</span>
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {/* AMOUNT IN WORDS SECTION */}
                  <div className="p-2.5 bg-slate-50 border border-slate-300 rounded text-xs space-y-1 font-sans">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 uppercase shrink-0">{getBillLabel('amountInWords', billDocLanguage)}</span>
                      <span className="font-serif italic font-bold text-slate-900">{renderAmountInWords(totalAmount, billDocLanguage)}</span>
                    </div>
                    {advancePaid > 0 && (
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-200 text-slate-900">
                        <span className="font-bold text-slate-800 uppercase shrink-0">{getBillLabel('balanceInWords', billDocLanguage)}</span>
                        <span className="font-serif italic font-bold text-slate-900">{renderAmountInWords(balanceDue, billDocLanguage)}</span>
                      </div>
                    )}
                  </div>

                  <div className="w-64 ml-auto space-y-1 text-right text-xs pt-2 font-mono">
                    <div>Subtotal: ₹{subtotal.toLocaleString('en-IN')}</div>
                    <div>Grand Total: ₹{totalAmount.toLocaleString('en-IN')}</div>
                    <div className="text-amber-800 font-bold">Less Advance Paid: - ₹{(Number(advancePaid) || 0).toLocaleString('en-IN')}</div>
                    <div className="text-sm font-black text-slate-900 pt-1 border-t border-slate-800">
                      Balance Payable: ₹{balanceDue.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              )}

              {/* LAYOUT 4: ROYAL GOLD & LUXURY */}
              {templateTheme === 'ROYAL_GOLD' && (
                <div className="space-y-4 font-sans">
                  {/* Top Royal Gold Header */}
                  <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-slate-950 p-4 rounded-xl shadow-md border-b-4 border-amber-800 flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl bg-slate-950 text-amber-400 p-2 rounded-lg border border-amber-400 shadow-sm">
                          {companyProfile.symbol || '👑'}
                        </span>
                        <div>
                          <h1 className="text-xl font-black tracking-wide text-slate-950 uppercase">
                            {companyProfile.companyName}
                          </h1>
                          <p className="text-xs font-black text-slate-900 tracking-widest uppercase">
                            {companyProfile.tagline || 'ROYAL CONTRACTING & DESIGN'}
                          </p>
                        </div>
                      </div>
                      <p className="text-[11px] font-bold text-slate-950 pt-1">
                        📍 {companyProfile.address} | 📞 {companyProfile.phone} {companyProfile.altPhone ? `| ${companyProfile.altPhone}` : ''}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="bg-slate-950 text-amber-300 font-black px-3 py-1 rounded-lg border border-amber-400 text-sm tracking-wider uppercase inline-block shadow-sm">
                        {docType}
                      </div>
                      <div className="text-xs font-mono font-black text-slate-950 mt-2 space-y-0.5">
                        <p>No: {docNumber}</p>
                        <p>Date: {date}</p>
                      </div>
                    </div>
                  </div>

                  {/* Client Details Section */}
                  <div className="bg-amber-50/90 border-2 border-amber-300 rounded-xl p-3 text-xs grid grid-cols-2 gap-2 shadow-xs">
                    <div>
                      <p className="text-[10px] uppercase font-black text-amber-800">{getBillLabel('client', billDocLanguage)}</p>
                      <p className="font-black text-slate-950 text-sm">{clientName}</p>
                      {clientCompany && <p className="font-bold text-slate-700">{clientCompany}</p>}
                      {clientPhone && <p className="font-mono text-slate-700">Ph: {clientPhone}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-black text-amber-800">{getBillLabel('siteLocation', billDocLanguage)}</p>
                      <p className="font-extrabold text-slate-900">{siteLocation || getBillLabel('asSpecified', billDocLanguage)}</p>
                      <p className="font-mono text-slate-600">Valid Till: {validUntil}</p>
                    </div>
                  </div>

                  {/* Bill Title Banner */}
                  <div className="text-center py-1 bg-amber-100 border-y-2 border-amber-400 font-black text-xs uppercase tracking-wider text-amber-950">
                    {billTitle || getBillLabel('defaultBillTitle', billDocLanguage)}
                  </div>

                  {/* Item Table */}
                  <div className="border-2 border-amber-500 rounded-lg overflow-hidden">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black uppercase text-[11px]">
                          <th className="p-2.5 border-r border-amber-600">{getBillLabel('itemDesc', billDocLanguage)}</th>
                          <th className="p-2.5 border-r border-amber-600 text-center w-28">{getBillLabel('qtyUnit', billDocLanguage)}</th>
                          <th className="p-2.5 border-r border-amber-600 text-right w-28">{getBillLabel('unitRate', billDocLanguage)}</th>
                          <th className="p-2.5 text-right w-32">{getBillLabel('totalPrice', billDocLanguage)}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-200">
                        {items.map((item) => (
                          <tr key={item.id} className="hover:bg-amber-50/50">
                            <td className="p-2 border-r border-amber-200 font-bold text-slate-900">{item.description}</td>
                            <td className="p-2 border-r border-amber-200 text-center font-mono font-bold">{item.quantity} {item.unit}</td>
                            <td className="p-2 border-r border-amber-200 text-right font-mono">₹{item.rate}</td>
                            <td className="p-2 text-right font-mono font-black text-slate-950">₹{item.amount.toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                        {isInlineEditing && (
                          <tr className="no-print bg-amber-100/70">
                            <td colSpan={4} className="p-1.5 text-center">
                              <button
                                type="button"
                                onClick={handleAddItem}
                                className="px-3 py-1 bg-amber-500 text-slate-950 font-black text-xs rounded-lg shadow transition flex items-center justify-center gap-1 mx-auto cursor-pointer"
                              >
                                <Plus size={14} />
                                <span>+ Add Row</span>
                              </button>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Amounts in Words & Totals Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div className="space-y-2">
                      <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs space-y-1">
                        <span className="font-black text-amber-900 uppercase block text-[10px]">{getBillLabel('amountInWords', billDocLanguage)}</span>
                        <span className="font-serif italic font-extrabold text-slate-900">{renderAmountInWords(totalAmount, billDocLanguage)}</span>
                        {advancePaid > 0 && (
                          <div className="pt-1 border-t border-amber-200">
                            <span className="font-black text-amber-900 uppercase block text-[10px]">{getBillLabel('balanceInWords', billDocLanguage)}</span>
                            <span className="font-serif italic font-extrabold text-amber-950">{renderAmountInWords(balanceDue, billDocLanguage)}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-[11px] space-y-1">
                        <p className="font-black text-slate-900 uppercase">{getBillLabel('terms', billDocLanguage)}</p>
                        <p className="whitespace-pre-line text-slate-700 leading-tight">{terms}</p>
                      </div>
                    </div>

                    <div className="space-y-1 text-right text-xs font-mono">
                      <div className="flex justify-between py-1 border-b border-amber-200 text-slate-800">
                        <span className="font-bold">{getBillLabel('subtotal', billDocLanguage)}</span>
                        <span className="font-extrabold">₹{subtotal.toLocaleString('en-IN')}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between py-1 border-b border-amber-200 text-rose-800 font-bold">
                          <span>{getBillLabel('discount', billDocLanguage)}</span>
                          <span>- ₹{discount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {isGstEnabled && (
                        <div className="flex justify-between py-1 border-b border-amber-200 text-slate-800">
                          <span className="font-bold">GST ({gstRate}%):</span>
                          <span>+ ₹{gstAmount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {shippingCost > 0 && (
                        <div className="flex justify-between py-1 border-b border-amber-200 text-slate-800">
                          <span className="font-bold">{getBillLabel('shipping', billDocLanguage)}</span>
                          <span>+ ₹{shippingCost.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-1.5 font-black text-sm text-slate-950">
                        <span>{getBillLabel('grandTotal', billDocLanguage)}</span>
                        <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between py-1.5 font-black text-xs text-amber-900 bg-amber-100 p-2 rounded-lg">
                        <span>{getBillLabel('lessAdvance', billDocLanguage)}</span>
                        <span>- ₹{(Number(advancePaid) || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between py-2 font-black text-sm bg-slate-950 text-amber-300 p-2.5 rounded-xl border-2 border-amber-400 shadow-md">
                        <span className="uppercase text-amber-400">{getBillLabel('netDue', billDocLanguage)}</span>
                        <span className="text-base text-amber-300 font-mono">₹{balanceDue.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="pt-6 flex justify-between items-end text-xs">
                    <p className="border-t-2 border-slate-400 pt-1 font-bold text-slate-700">{getBillLabel('clientSignature', billDocLanguage)}</p>
                    <div className="text-right">
                      <p className="font-black text-slate-950 uppercase">{companyProfile.companyName}</p>
                      <p className="border-t-2 border-slate-400 pt-1 font-bold text-slate-700 mt-8">{getBillLabel('authorizedSignature', billDocLanguage)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* LAYOUT 5: EMERALD GREEN MODERN */}
              {templateTheme === 'EMERALD_MODERN' && (
                <div className="space-y-4 font-sans">
                  {/* Top Emerald Header */}
                  <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-950 text-white p-5 rounded-xl shadow-md border-b-4 border-emerald-500 flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl bg-emerald-800 text-emerald-300 p-2 rounded-xl border border-emerald-500 shadow-xs">
                          {companyProfile.symbol || '🌿'}
                        </span>
                        <div>
                          <h1 className="text-xl font-black tracking-wide text-white uppercase">
                            {companyProfile.companyName}
                          </h1>
                          <p className="text-xs font-bold text-emerald-300 tracking-widest uppercase">
                            {companyProfile.tagline || 'MODERN INFRASTRUCTURE & INTERIOR CONTRACTOR'}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-emerald-100/90 pt-1 font-medium">
                        📍 {companyProfile.address} | 📞 {companyProfile.phone} {companyProfile.altPhone ? `| ${companyProfile.altPhone}` : ''}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="bg-emerald-500 text-slate-950 font-black px-3 py-1 rounded-lg text-sm tracking-widest uppercase shadow-xs">
                        {docType}
                      </span>
                      <div className="text-xs font-mono font-bold text-emerald-200 mt-2 space-y-0.5">
                        <p>Ref: {docNumber}</p>
                        <p>Date: {date}</p>
                      </div>
                    </div>
                  </div>

                  {/* Client Details Section */}
                  <div className="bg-emerald-50/80 border-l-4 border-emerald-600 rounded-r-xl p-3 text-xs grid grid-cols-2 gap-2 shadow-xs">
                    <div>
                      <p className="text-[10px] uppercase font-black text-emerald-800">{getBillLabel('client', billDocLanguage)}</p>
                      <p className="font-black text-slate-900 text-sm">{clientName}</p>
                      {clientCompany && <p className="font-bold text-slate-700">{clientCompany}</p>}
                      {clientPhone && <p className="font-mono text-slate-700">Ph: {clientPhone}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-black text-emerald-800">{getBillLabel('siteLocation', billDocLanguage)}</p>
                      <p className="font-extrabold text-slate-900">{siteLocation || getBillLabel('asSpecified', billDocLanguage)}</p>
                      <p className="font-mono text-slate-600">Valid Until: {validUntil}</p>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="border border-emerald-800 rounded-lg overflow-hidden shadow-xs">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-emerald-950 text-white font-black uppercase text-[11px]">
                          <th className="p-2.5 border-r border-emerald-800">{getBillLabel('itemDesc', billDocLanguage)}</th>
                          <th className="p-2.5 border-r border-emerald-800 text-center w-28">{getBillLabel('qtyUnit', billDocLanguage)}</th>
                          <th className="p-2.5 border-r border-emerald-800 text-right w-28">{getBillLabel('unitRate', billDocLanguage)}</th>
                          <th className="p-2.5 text-right w-32">{getBillLabel('totalPrice', billDocLanguage)}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-200">
                        {items.map((item) => (
                          <tr key={item.id} className="hover:bg-emerald-50/40">
                            <td className="p-2 border-r border-emerald-200 font-bold text-slate-900">{item.description}</td>
                            <td className="p-2 border-r border-emerald-200 text-center font-mono font-bold">{item.quantity} {item.unit}</td>
                            <td className="p-2 border-r border-emerald-200 text-right font-mono">₹{item.rate}</td>
                            <td className="p-2 text-right font-mono font-black text-emerald-950">₹{item.amount.toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                        {isInlineEditing && (
                          <tr className="no-print bg-emerald-100/60">
                            <td colSpan={4} className="p-1.5 text-center">
                              <button
                                type="button"
                                onClick={handleAddItem}
                                className="px-3 py-1 bg-emerald-800 text-white font-black text-xs rounded-lg shadow transition flex items-center justify-center gap-1 mx-auto cursor-pointer"
                              >
                                <Plus size={14} />
                                <span>+ Add Row</span>
                              </button>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Bottom Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div className="space-y-2">
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                        <span className="font-black text-emerald-900 uppercase block text-[10px]">{getBillLabel('amountInWords', billDocLanguage)}</span>
                        <span className="font-serif italic font-extrabold text-slate-900">{renderAmountInWords(totalAmount, billDocLanguage)}</span>
                        {advancePaid > 0 && (
                          <div className="pt-1 border-t border-emerald-200">
                            <span className="font-black text-emerald-900 uppercase block text-[10px]">{getBillLabel('balanceInWords', billDocLanguage)}</span>
                            <span className="font-serif italic font-extrabold text-emerald-950">{renderAmountInWords(balanceDue, billDocLanguage)}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-[11px] space-y-1">
                        <p className="font-black text-slate-900 uppercase">{getBillLabel('terms', billDocLanguage)}</p>
                        <p className="whitespace-pre-line text-slate-700 leading-tight">{terms}</p>
                      </div>
                    </div>

                    <div className="space-y-1 text-right text-xs font-mono">
                      <div className="flex justify-between py-1 border-b border-emerald-200 text-slate-800">
                        <span className="font-bold">{getBillLabel('subtotal', billDocLanguage)}</span>
                        <span className="font-extrabold">₹{subtotal.toLocaleString('en-IN')}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between py-1 border-b border-emerald-200 text-rose-800 font-bold">
                          <span>{getBillLabel('discount', billDocLanguage)}</span>
                          <span>- ₹{discount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {isGstEnabled && (
                        <div className="flex justify-between py-1 border-b border-emerald-200 text-slate-800">
                          <span className="font-bold">GST ({gstRate}%):</span>
                          <span>+ ₹{gstAmount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {shippingCost > 0 && (
                        <div className="flex justify-between py-1 border-b border-emerald-200 text-slate-800">
                          <span className="font-bold">{getBillLabel('shipping', billDocLanguage)}</span>
                          <span>+ ₹{shippingCost.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-1.5 font-black text-sm text-slate-950">
                        <span>{getBillLabel('grandTotal', billDocLanguage)}</span>
                        <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between py-1.5 font-black text-xs text-emerald-950 bg-emerald-100/90 p-2 rounded-lg">
                        <span>{getBillLabel('lessAdvance', billDocLanguage)}</span>
                        <span>- ₹{(Number(advancePaid) || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between py-2 font-black text-sm bg-emerald-950 text-emerald-300 p-2.5 rounded-xl border border-emerald-500 shadow-md">
                        <span className="uppercase text-emerald-400">{getBillLabel('netDue', billDocLanguage)}</span>
                        <span className="text-base text-emerald-300 font-mono">₹{balanceDue.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="pt-6 flex justify-between items-end text-xs">
                    <p className="border-t-2 border-emerald-300 pt-1 font-bold text-slate-700">{getBillLabel('clientSignature', billDocLanguage)}</p>
                    <div className="text-right">
                      <p className="font-black text-slate-950 uppercase">{companyProfile.companyName}</p>
                      <p className="border-t-2 border-emerald-300 pt-1 font-bold text-slate-700 mt-8">{getBillLabel('authorizedSignature', billDocLanguage)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* LAYOUT 6: ARCHITECTURAL FRAME & CRIMSON ACCENT */}
              {templateTheme === 'HEADER_FRAME' && (
                <div className="space-y-4 font-sans">
                  {/* Top Dark Slate Frame Header */}
                  <div className="bg-slate-950 text-white p-5 rounded-t-xl border-b-4 border-rose-600 shadow-md flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl bg-rose-600 text-white p-2 rounded-lg font-black shadow-sm">
                          {companyProfile.symbol || '🏛️'}
                        </span>
                        <div>
                          <h1 className="text-xl font-black tracking-wide text-white uppercase">
                            {companyProfile.companyName}
                          </h1>
                          <p className="text-xs font-bold text-rose-400 tracking-widest uppercase">
                            {companyProfile.tagline || 'ARCHITECTURAL & ENGINEERING WORKS'}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 pt-1 font-medium">
                        📍 {companyProfile.address} | 📞 {companyProfile.phone} {companyProfile.altPhone ? `| ${companyProfile.altPhone}` : ''}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="bg-rose-600 text-white font-black px-3 py-1 rounded-md text-sm tracking-wider uppercase shadow-xs">
                        {docType}
                      </span>
                      <div className="text-xs font-mono font-bold text-slate-300 mt-2 space-y-0.5">
                        <p>Doc #: {docNumber}</p>
                        <p>Date: {date}</p>
                      </div>
                    </div>
                  </div>

                  {/* Frame Boxed Client Details */}
                  <div className="border-2 border-slate-900 bg-slate-50 rounded-xl p-3 text-xs grid grid-cols-2 gap-2 shadow-xs">
                    <div>
                      <p className="text-[10px] uppercase font-black text-rose-800">{getBillLabel('client', billDocLanguage)}</p>
                      <p className="font-black text-slate-950 text-sm">{clientName}</p>
                      {clientCompany && <p className="font-bold text-slate-700">{clientCompany}</p>}
                      {clientPhone && <p className="font-mono text-slate-700">Ph: {clientPhone}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-black text-rose-800">{getBillLabel('siteLocation', billDocLanguage)}</p>
                      <p className="font-extrabold text-slate-900">{siteLocation || getBillLabel('asSpecified', billDocLanguage)}</p>
                      <p className="font-mono text-slate-600">Valid Till: {validUntil}</p>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="border-2 border-slate-900 rounded-lg overflow-hidden shadow-xs">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-white font-black uppercase text-[11px]">
                          <th className="p-2.5 border-r border-slate-700">{getBillLabel('itemDesc', billDocLanguage)}</th>
                          <th className="p-2.5 border-r border-slate-700 text-center w-28">{getBillLabel('qtyUnit', billDocLanguage)}</th>
                          <th className="p-2.5 border-r border-slate-700 text-right w-28">{getBillLabel('unitRate', billDocLanguage)}</th>
                          <th className="p-2.5 text-right w-32">{getBillLabel('totalPrice', billDocLanguage)}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-300">
                        {items.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-100/50">
                            <td className="p-2 border-r border-slate-300 font-bold text-slate-900">{item.description}</td>
                            <td className="p-2 border-r border-slate-300 text-center font-mono font-bold">{item.quantity} {item.unit}</td>
                            <td className="p-2 border-r border-slate-300 text-right font-mono">₹{item.rate}</td>
                            <td className="p-2 text-right font-mono font-black text-slate-950">₹{item.amount.toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                        {isInlineEditing && (
                          <tr className="no-print bg-slate-100">
                            <td colSpan={4} className="p-1.5 text-center">
                              <button
                                type="button"
                                onClick={handleAddItem}
                                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-lg shadow transition flex items-center justify-center gap-1 mx-auto cursor-pointer"
                              >
                                <Plus size={14} />
                                <span>+ Add Row</span>
                              </button>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Bottom Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div className="space-y-2">
                      <div className="p-3 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs space-y-1">
                        <span className="font-black text-rose-900 uppercase block text-[10px]">{getBillLabel('amountInWords', billDocLanguage)}</span>
                        <span className="font-serif italic font-extrabold text-slate-900">{renderAmountInWords(totalAmount, billDocLanguage)}</span>
                        {advancePaid > 0 && (
                          <div className="pt-1 border-t border-slate-300">
                            <span className="font-black text-rose-900 uppercase block text-[10px]">{getBillLabel('balanceInWords', billDocLanguage)}</span>
                            <span className="font-serif italic font-extrabold text-rose-950">{renderAmountInWords(balanceDue, billDocLanguage)}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-[11px] space-y-1">
                        <p className="font-black text-slate-900 uppercase">{getBillLabel('terms', billDocLanguage)}</p>
                        <p className="whitespace-pre-line text-slate-700 leading-tight">{terms}</p>
                      </div>
                    </div>

                    <div className="space-y-1 text-right text-xs font-mono">
                      <div className="flex justify-between py-1 border-b border-slate-300 text-slate-800">
                        <span className="font-bold">{getBillLabel('subtotal', billDocLanguage)}</span>
                        <span className="font-extrabold">₹{subtotal.toLocaleString('en-IN')}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between py-1 border-b border-slate-300 text-rose-700 font-bold">
                          <span>{getBillLabel('discount', billDocLanguage)}</span>
                          <span>- ₹{discount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {isGstEnabled && (
                        <div className="flex justify-between py-1 border-b border-slate-300 text-slate-800">
                          <span className="font-bold">GST ({gstRate}%):</span>
                          <span>+ ₹{gstAmount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {shippingCost > 0 && (
                        <div className="flex justify-between py-1 border-b border-slate-300 text-slate-800">
                          <span className="font-bold">{getBillLabel('shipping', billDocLanguage)}</span>
                          <span>+ ₹{shippingCost.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-1.5 font-black text-sm text-slate-950">
                        <span>{getBillLabel('grandTotal', billDocLanguage)}</span>
                        <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between py-1.5 font-black text-xs text-rose-950 bg-rose-50 p-2 rounded-lg border border-rose-200">
                        <span>{getBillLabel('lessAdvance', billDocLanguage)}</span>
                        <span>- ₹{(Number(advancePaid) || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between py-2 font-black text-sm bg-slate-950 text-rose-300 p-2.5 rounded-xl border-2 border-rose-600 shadow-md">
                        <span className="uppercase text-rose-400">{getBillLabel('netDue', billDocLanguage)}</span>
                        <span className="text-base text-rose-300 font-mono">₹{balanceDue.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="pt-6 flex justify-between items-end text-xs">
                    <p className="border-t-2 border-slate-400 pt-1 font-bold text-slate-700">{getBillLabel('clientSignature', billDocLanguage)}</p>
                    <div className="text-right">
                      <p className="font-black text-slate-950 uppercase">{companyProfile.companyName}</p>
                      <p className="border-t-2 border-slate-400 pt-1 font-bold text-slate-700 mt-8">{getBillLabel('authorizedSignature', billDocLanguage)}</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
            </div>
            </div>

          </div>
        )}

        {/* TAB 3: SAVED QUOTATIONS LIST */}
        {activeTab === 'LIST' && (
          <div className="space-y-4">
            
            {/* Search & Filter Bar */}
            <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-wrap gap-3 items-center justify-between">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={language === 'hi' ? 'नाम या बिल नंबर खोजें...' : 'Search client name or bill number...'}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-extrabold rounded-xl px-3 py-2 text-slate-800 dark:text-white cursor-pointer"
                >
                  <option value="ALL">{language === 'hi' ? 'सभी प्रकार (All Bills)' : 'All Types'}</option>
                  <option value="QUOTATION">Quotation / कोटेशन</option>
                  <option value="TAX_INVOICE">Tax Invoice / बिल</option>
                  <option value="DELIVERY_CHALLAN">Delivery Challan / चालान</option>
                  <option value="ESTIMATE">Estimate / अनुमान</option>
                  <option value="PERFORMA">Proforma Invoice</option>
                  <option value="WORK_ORDER">Work Order</option>
                  <option value="PURCHASE_ORDER">Purchase Order</option>
                  <option value="CASH_MEMO">Cash Memo</option>
                  <option value="MEASUREMENT_BILL">Measurement Bill</option>
                </select>

                <button
                  onClick={() => { handleResetForm(); setActiveTab('CREATE'); }}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-3 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={15} />
                  <span>New Bill</span>
                </button>
              </div>
            </div>

            {/* Cards Grid */}
            {filteredQuotations.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-700 space-y-3">
                <Receipt size={40} className="mx-auto text-slate-300 dark:text-slate-600" />
                <h3 className="font-extrabold text-slate-700 dark:text-slate-300 text-base">
                  {language === 'hi' ? 'कोई कोटेशन या बिल नहीं मिला' : 'No Quotation Records Found'}
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {language === 'hi' ? 'नया कोटेशन बनाने के लिए ऊपर कैटेगरी चुनें या "नया बिल बनाएं" पर क्लिक करें।' : 'Click any trade category or "Create New Bill" to generate contractor quotations.'}
                </p>
                <div className="flex flex-wrap gap-2 justify-center pt-2">
                  <button
                    onClick={loadPaintingPreset}
                    className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl transition cursor-pointer"
                  >
                    🎨 Painting Bill
                  </button>
                  <button
                    onClick={loadCarpenterPreset}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-3 py-1.5 rounded-xl transition cursor-pointer"
                  >
                    🪚 Carpenter Bill
                  </button>
                  <button
                    onClick={loadElectricianPreset}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-3 py-1.5 rounded-xl transition cursor-pointer"
                  >
                    ⚡ Electrician Bill
                  </button>
                  <button
                    onClick={loadRealEstatePreset}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-3 py-1.5 rounded-xl transition cursor-pointer"
                  >
                    🏢 Real Estate Bill
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredQuotations.map(quo => {
                  const itemsSum = quo.items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
                  const afterDisc = Math.max(0, itemsSum - (Number(quo.discount) || 0));
                  const tax = quo.isGstEnabled ? afterDisc * (quo.gstRate / 100) : 0;
                  const grand = afterDisc + tax + (Number(quo.shippingCost) || 0);
                  const adv = Number(quo.advancePaid) || 0;
                  const rem = Math.max(0, grand - adv);

                  return (
                    <div 
                      key={quo.id}
                      className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                            {quo.docType}
                          </span>
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-base mt-1">
                            {quo.clientName}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium">Ref: {quo.docNumber} | {quo.date}</p>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-500 block">Total: ₹{grand.toLocaleString('en-IN')}</span>
                          <span className="text-base font-black text-emerald-600 font-mono">
                            Due: ₹{rem.toLocaleString('en-IN')}
                          </span>
                          <p className="text-[10px] text-slate-400">{quo.items.length} Items</p>
                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl text-xs space-y-1">
                        <p className="font-semibold text-slate-700 dark:text-slate-300">
                          🏢 Company: <span className="font-extrabold">{quo.companyName}</span>
                        </p>
                        {adv > 0 && (
                          <p className="text-amber-700 dark:text-amber-400 font-bold">
                            💳 Advance Received: ₹{adv.toLocaleString('en-IN')}
                          </p>
                        )}
                        {quo.siteLocation && (
                          <p className="text-slate-500">📍 Site: {quo.siteLocation}</p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                        <button
                          onClick={() => handlePreviewDirect(quo)}
                          className="bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-blue-100 transition cursor-pointer"
                        >
                          <Eye size={14} />
                          <span>{language === 'hi' ? 'लेटरहेड देखें' : 'Letterhead'}</span>
                        </button>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => {
                              handlePreviewDirect(quo);
                              setTimeout(() => {
                                handleDownloadAsImage();
                              }, 300);
                            }}
                            className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                            title="बिल डाउनलोड करें (Download PNG/Image)"
                          >
                            <Download size={14} />
                            <span>{language === 'hi' ? 'डाउनलोड' : 'Download'}</span>
                          </button>

                          <button
                            onClick={() => {
                              handlePreviewDirect(quo);
                              setTimeout(() => {
                                window.print();
                              }, 300);
                            }}
                            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                            title="प्रिंट निकालें (Print / PDF)"
                          >
                            <Printer size={14} />
                            <span>{language === 'hi' ? 'प्रिंट' : 'Print'}</span>
                          </button>

                          <button
                            onClick={() => handleWhatsAppShare(quo)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer border border-emerald-200"
                            title="WhatsApp पर भेजें"
                          >
                            <Share2 size={16} />
                          </button>

                          <button
                            onClick={() => handleEditQuotation(quo)}
                            className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer border border-slate-200"
                            title="एडिट करें"
                          >
                            <Edit2 size={16} />
                          </button>

                          <button
                            onClick={() => handleDeleteQuotation(quo.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer border border-rose-200"
                            title="डिलीट करें"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* TAB 4: COMPANY HEADER PROFILE SETTINGS */}
        {activeTab === 'SETTINGS' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-4 max-w-2xl mx-auto">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 size={20} className="text-blue-600" />
              <span>{language === 'hi' ? 'ठेकेदार / कंपनी लेटरहेड जानकारी' : 'Contractor Letterhead Profile'}</span>
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Company / Contractor Name</label>
                <input
                  type="text"
                  value={companyProfile.companyName}
                  onChange={(e) => setCompanyProfile({...companyProfile, companyName: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm font-black uppercase text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Tagline / Specialty Work</label>
                <input
                  type="text"
                  value={companyProfile.tagline}
                  onChange={(e) => setCompanyProfile({...companyProfile, tagline: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Primary Mobile</label>
                  <input
                    type="text"
                    value={companyProfile.phone}
                    onChange={(e) => setCompanyProfile({...companyProfile, phone: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Secondary Mobile</label>
                  <input
                    type="text"
                    value={companyProfile.altPhone}
                    onChange={(e) => setCompanyProfile({...companyProfile, altPhone: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Full Business Address</label>
                <textarea
                  rows={2}
                  value={companyProfile.address}
                  onChange={(e) => setCompanyProfile({...companyProfile, address: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl p-2.5 text-xs font-medium text-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">GSTIN (Optional)</label>
                  <input
                    type="text"
                    value={companyProfile.gstin}
                    onChange={(e) => setCompanyProfile({...companyProfile, gstin: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">UPI ID for Payment</label>
                  <input
                    type="text"
                    value={companyProfile.upiId}
                    onChange={(e) => setCompanyProfile({...companyProfile, upiId: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveCompanyProfile}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3 rounded-xl transition cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <Save size={16} />
                <span>{language === 'hi' ? 'प्रोफ़ाइल सहेजीं' : 'Save Header Profile'}</span>
              </button>
            </div>
          </div>
        )}

      {/* PAYWALL MODAL (3 FREE USES EXCEEDED) */}
      {showPaywall && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl p-6 shadow-2xl max-w-sm w-full space-y-4 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Lock size={32} />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-3 py-1 rounded-full">
                {language === 'hi' ? 'मुफ्त उपयोग सीमा समाप्त' : 'Free Trial Ended'}
              </span>
              <h3 className="text-xl font-black pt-1">
                {language === 'hi' ? '3 बार मुफ़्त उपयोग पूरा हुआ!' : '3 Free Uses Reached!'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {language === 'hi'
                  ? `आप 3 बार मुफ्त में बिल बना/डाउनलोड कर चुके हैं। आगे असीमित इस्तेमाल के लिए ₹${paymentSettings?.minPlanPrice || 499} का प्रीमियम प्लान लें।`
                  : `You have reached the limit of 3 free bill exports. Unlock unlimited bills & tools for ₹${paymentSettings?.minPlanPrice || 499}.`}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-left text-xs space-y-1.5 font-bold text-slate-700 dark:text-slate-300">
              <p className="text-amber-600 font-black">⭐ Premium Plan Features (₹{paymentSettings?.minPlanPrice || 499}):</p>
              <p>✓ असीमित बिल डाउनलोड एवं कोटेशन मेक (Unlimited PDF/PNG)</p>
              <p>✓ GST कैलकुलेटर और स्मार्ट डायरी (GST & Construction Diary)</p>
              <p>✓ लेबर अटेंडेंस एवं सैलरी हिसाब (Workers Management)</p>
              <p>✓ UPI QR भुगतान सुविधा (Instant UPI Billing)</p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  setShowPaywall(false);
                  navigate(`/payment?plan=premium_monthly&amount=${paymentSettings?.minPlanPrice || 499}`);
                }}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3.5 rounded-xl text-sm shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{language === 'hi' ? `₹${paymentSettings?.minPlanPrice || 499} का प्रीमियम प्लान लें` : `Get Premium for ₹${paymentSettings?.minPlanPrice || 499}`}</span>
                <span>→</span>
              </button>

              <button
                onClick={() => setShowPaywall(false)}
                className="w-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-bold py-2 rounded-xl text-xs transition cursor-pointer"
              >
                {language === 'hi' ? 'रद्द करें (Cancel)' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SYMBOL PICKER MODAL POPOVER (25 SYMBOLS) */}
      {showSymbolModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-[999] p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md shadow-2xl p-5 flex flex-col max-h-[85vh] relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowSymbolModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-full transition cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="mb-4 text-center">
              <h3 className="text-base font-black text-amber-300 flex items-center justify-center gap-2">
                <span className="text-xl bg-amber-400/20 px-2 py-0.5 rounded-lg border border-amber-400/30">{companyProfile.symbol || '🎨'}</span>
                <span>{language === 'hi' ? 'कंपनी वर्क प्रतीक / सिंबल चुनें' : 'Select Work Symbol Icon'}</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-bold mt-1">
                {language === 'hi' ? '25 वर्क कैटेगरी में से अपना मनपसंद प्रतीक आइकॉन चुनें:' : 'Select matching category symbol icon for your quotation letterhead:'}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 pr-1 scrollbar-thin">
              {WORK_CATEGORY_SYMBOLS.map(item => {
                const isSelected = companyProfile.symbol === item.sym;
                return (
                  <button
                    key={item.sym + item.name}
                    type="button"
                    onClick={() => {
                      setCompanyProfile(prev => ({ ...prev, symbol: item.sym }));
                      setShowSymbolModal(false);
                    }}
                    className={`p-2.5 rounded-xl text-left border flex items-center gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-md scale-[1.02] ring-2 ring-amber-300'
                        : 'bg-slate-800/80 hover:bg-slate-700 text-white border-slate-700/80'
                    }`}
                  >
                    <span className="text-2xl shrink-0 bg-slate-950/30 p-1.5 rounded-lg">{item.sym}</span>
                    <span className="text-xs font-bold leading-tight">{item.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-center">
              <button
                onClick={() => setShowSymbolModal(false)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
              >
                {language === 'hi' ? 'बंद करें (Close)' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
