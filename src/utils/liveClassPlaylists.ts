import { LiveClass } from '../types';

export interface PlaylistDef {
  id: string;
  name: string;
  hindiName: string;
  shortLabel: string;
  desc: string;
  iconName: 'zap' | 'book' | 'calculator' | 'atom' | 'landmark' | 'award' | 'languages' | 'sparkles';
  gradient: string;
  bgLight: string;
  borderLight: string;
  textColor: string;
  badgeBg: string;
  badgeText: string;
  isSpecial?: boolean;
}

export const LIVE_PLAYLISTS: PlaylistDef[] = [
  {
    id: 'vvi_tricks',
    name: 'VVI & Trick Classes',
    hindiName: '🔥 VVI & ट्रिक क्लासेज (रामबाण)',
    shortLabel: 'VVI & ट्रिक्स',
    desc: 'बिहार बोर्ड परीक्षा में 100% पूछे जाने वाले VVI प्रश्न, रामबाण ट्रिक्स & शॉर्टकट मेथड्स',
    iconName: 'zap',
    gradient: 'from-amber-600 via-orange-600 to-red-600',
    bgLight: 'bg-amber-50',
    borderLight: 'border-amber-300',
    textColor: 'text-amber-900',
    badgeBg: 'bg-amber-400',
    badgeText: 'text-stone-950 font-black',
    isSpecial: true
  },
  {
    id: 'hindi',
    name: 'हिन्दी',
    hindiName: '📖 हिन्दी (गोधूलि, वर्णिका & व्याकरण)',
    shortLabel: 'हिन्दी',
    desc: 'गोधूलि भाग-2, वर्णिका भाग-2 सम्पूर्ण पाठ व्याख्या, लेखक परिचय, प्रश्नोत्तर एवं हिन्दी व्याकरण',
    iconName: 'book',
    gradient: 'from-orange-600 via-amber-700 to-red-800',
    bgLight: 'bg-orange-50',
    borderLight: 'border-orange-200',
    textColor: 'text-orange-950',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-800'
  },
  {
    id: 'math',
    name: 'गणित',
    hindiName: '📐 गणित (Mathematics)',
    shortLabel: 'गणित',
    desc: 'वास्तविक संख्याएं, त्रिकोणमिति, द्विघात समीकरण, नियामक ज्यामिति, पृष्ठीय क्षेत्रफल & सूत्र',
    iconName: 'calculator',
    gradient: 'from-blue-700 via-indigo-800 to-slate-900',
    bgLight: 'bg-blue-50',
    borderLight: 'border-blue-200',
    textColor: 'text-blue-950',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800'
  },
  {
    id: 'science',
    name: 'विज्ञान',
    hindiName: '🔬 विज्ञान (भौतिकी, रसायन, जीवविज्ञान)',
    shortLabel: 'विज्ञान',
    desc: 'प्रकाश, विद्युत, अम्ल-क्षार, धातु-अधातु, जैव प्रक्रम, नियंत्रण & सम्पूर्ण NCERT प्रयोग',
    iconName: 'atom',
    gradient: 'from-emerald-700 via-teal-800 to-stone-900',
    bgLight: 'bg-emerald-50',
    borderLight: 'border-emerald-200',
    textColor: 'text-emerald-950',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800'
  },
  {
    id: 'social_science',
    name: 'सामाजिक विज्ञान',
    hindiName: '🏛️ सामाजिक विज्ञान (इतिहास, भूगोल, राजनीति, अर्थशास्त्र)',
    shortLabel: 'सामाजिक विज्ञान (SST)',
    desc: 'यूरोप में राष्ट्रवाद, भारत में राष्ट्रवाद, संसाधन, लोकतंत्र, अर्थव्यवस्था & आपदा प्रबंधन',
    iconName: 'landmark',
    gradient: 'from-rose-700 via-red-800 to-stone-900',
    bgLight: 'bg-rose-50',
    borderLight: 'border-rose-200',
    textColor: 'text-rose-950',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-800'
  },
  {
    id: 'sanskrit',
    name: 'संस्कृत',
    hindiName: '🪔 संस्कृत (पीयूषम् भाग-2 & व्याकरण)',
    shortLabel: 'संस्कृत',
    desc: 'मङ्गलम्, पाटलिपुत्रवैभवम्, आलसकथा, श्लोक अर्थ, संस्कृत अनुवाद & अनुच्छेद लेखन ट्रिक्स',
    iconName: 'award',
    gradient: 'from-purple-700 via-indigo-900 to-stone-900',
    bgLight: 'bg-purple-50',
    borderLight: 'border-purple-200',
    textColor: 'text-purple-950',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-800'
  },
  {
    id: 'english',
    name: 'अंग्रेजी',
    hindiName: '🔤 अंग्रेजी (Panorama Part-2 & Grammar)',
    shortLabel: 'अंग्रेजी',
    desc: 'The Pace for Living, Me and the Ecology Bit, Gillu, English Grammar & Translation',
    iconName: 'languages',
    gradient: 'from-cyan-700 via-sky-800 to-stone-900',
    bgLight: 'bg-cyan-50',
    borderLight: 'border-cyan-200',
    textColor: 'text-cyan-950',
    badgeBg: 'bg-cyan-100',
    badgeText: 'text-cyan-800'
  },
  {
    id: 'general',
    name: 'सामान्य',
    hindiName: '🎯 टॉपर्स गाइड & स्पेशल रणनीति',
    shortLabel: 'टॉपर्स गाइड',
    desc: 'बोर्ड परीक्षा टाइम-टेबल, मोटिवेशन, कॉपी लिखने का सही तरीका एवं टॉपर्स गाइडेंस',
    iconName: 'sparkles',
    gradient: 'from-stone-800 via-stone-900 to-black',
    bgLight: 'bg-stone-50',
    borderLight: 'border-stone-200',
    textColor: 'text-stone-950',
    badgeBg: 'bg-stone-100',
    badgeText: 'text-stone-800'
  }
];

export function getPlaylistIdForClass(cls: LiveClass): string {
  // 1. Direct explicit playlist assignment
  if (cls.playlistId) {
    return cls.playlistId;
  }

  const sub = (cls.subjectName || '').toLowerCase().trim();
  const title = (cls.title || '').toLowerCase().trim();

  // 2. Explicit VVI & Trick Classes
  if (
    sub.includes('vvi') || 
    sub.includes('trick') || 
    sub.includes('ट्रिक') ||
    sub.includes('रामबाण')
  ) {
    return 'vvi_tricks';
  }

  // 3. Hindi (गोधूलि, वर्णिका & व्याकरण)
  if (
    sub.includes('हिन्दी') || 
    sub.includes('हिंदी') || 
    sub.includes('hindi') || 
    title.includes('गोधूलि') || 
    title.includes('वर्णिका') ||
    title.includes('हिन्दी') ||
    title.includes('हिंदी') ||
    title.includes('दही वाली') ||
    title.includes('ढहते विश्वास') ||
    title.includes('धरती कब तक') ||
    title.includes('श्रम विभाजन')
  ) {
    return 'hindi';
  }

  // 4. Math (गणित)
  if (
    sub.includes('गणित') || 
    sub.includes('math') || 
    sub.includes('maths') ||
    title.includes('गणित') ||
    title.includes('त्रिकोणमिति') ||
    title.includes('द्विघात') ||
    title.includes('समांतर श्रेणी') ||
    title.includes('वास्तविक संख्या')
  ) {
    return 'math';
  }

  // 5. Science (विज्ञान)
  if (
    (sub.includes('विज्ञान') && !sub.includes('सामाजिक')) || 
    sub.includes('science') || 
    sub.includes('भौतिकी') || 
    sub.includes('रसायन') || 
    sub.includes('जीवविज्ञान') ||
    title.includes('भौतिकी') ||
    title.includes('रसायन') ||
    title.includes('जीवविज्ञान') ||
    (title.includes('विज्ञान') && !title.includes('सामाजिक'))
  ) {
    return 'science';
  }

  // 6. Sanskrit (संस्कृत)
  if (
    sub.includes('संस्कृत') || 
    sub.includes('sanskrit') ||
    title.includes('संस्कृत') ||
    title.includes('मंगलम') ||
    title.includes('मङ्गलम्') ||
    title.includes('पीयूषम्') ||
    title.includes('पाटलिपुत्र')
  ) {
    return 'sanskrit';
  }

  // 7. Social Science (सामाजिक विज्ञान / SST)
  if (
    sub.includes('सामाजिक') || 
    sub.includes('sst') || 
    sub.includes('social') || 
    sub.includes('इतिहास') || 
    sub.includes('भूगोल') || 
    sub.includes('राजनीति') || 
    sub.includes('अर्थशास्त्र') ||
    title.includes('इतिहास') ||
    title.includes('भूगोल') ||
    title.includes('नागरिक') ||
    title.includes('अर्थशास्त्र') ||
    title.includes('आपदा प्रबंधन')
  ) {
    return 'social_science';
  }

  // 8. English (अंग्रेजी)
  if (
    sub.includes('अंग्रेजी') || 
    sub.includes('english') ||
    title.includes('english') ||
    title.includes('panorama')
  ) {
    return 'english';
  }

  // 9. Title-based fallback for VVI & Tricks
  if (
    title.includes('ट्रिक') ||
    title.includes('trick') ||
    title.includes('vvi') ||
    title.includes('रामबाण') ||
    title.includes('शॉर्टकट') ||
    title.includes('shortcut')
  ) {
    return 'vvi_tricks';
  }

  return 'general';
}

export function getPlaylistClasses(playlistId: string, classes: LiveClass[]): LiveClass[] {
  return classes.filter(cls => getPlaylistIdForClass(cls) === playlistId);
}

