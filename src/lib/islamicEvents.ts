import { ISLAMIC_MONTHS } from './hijri';

export type EventCategory = 'EID' | 'SUNNAH_FAST' | 'HISTORICAL' | 'SPECIAL_NIGHT' | 'SACRED_MONTH';

export interface IslamicEvent {
  id: string;
  monthNum: number; // 1 to 12
  monthName: string;
  dayStart: number; // 1 to 30
  dayEnd?: number;   // optional end day for multi-day events or ranges
  dayLabel: string;  // e.g. "10 Muharram", "9–10 Muharram", "1–9 Dhul Hijjah"
  title: string;
  description: string;
  category: EventCategory;
  notes?: string;
}

export interface IslamicMonthDetail {
  monthNum: number;
  name: string;
  isSacred: boolean;
  overview: string;
  events: IslamicEvent[];
}

export const ISLAMIC_EVENTS_DATA: IslamicEvent[] = [
  // --- 1. Muharram ---
  {
    id: 'muharram-new-year',
    monthNum: 1,
    monthName: 'Muharram',
    dayStart: 1,
    dayLabel: '1 Muharram',
    title: 'Islamic New Year (Hijri New Year)',
    description: 'Marks the beginning of the Hijri lunar year and the migration (Hijrah) of Prophet Muhammad (SAW) from Makkah to Madinah.',
    category: 'SACRED_MONTH'
  },
  {
    id: 'muharram-umar-martyrdom',
    monthNum: 1,
    monthName: 'Muharram',
    dayStart: 1,
    dayLabel: '1 Muharram',
    title: 'Martyrdom of Umar ibn al-Khattab (RA)',
    description: 'Commonly cited date for the passing of the 2nd Caliph of Islam. He was stabbed on 26 Dhul Hijjah and passed away a few days later.',
    category: 'HISTORICAL'
  },
  {
    id: 'muharram-fasting-9-10',
    monthNum: 1,
    monthName: 'Muharram',
    dayStart: 9,
    dayEnd: 10,
    dayLabel: '9–10 Muharram',
    title: 'Sunnah Fasting of Tasu\'a & Ashura',
    description: 'Highly recommended Sunnah fasting on the 9th and 10th of Muharram, commemorating Prophet Musa (AS) and Bani Israel\'s deliverance from Pharaoh.',
    category: 'SUNNAH_FAST'
  },
  {
    id: 'muharram-ashura',
    monthNum: 1,
    monthName: 'Muharram',
    dayStart: 10,
    dayLabel: '10 Muharram',
    title: 'Day of Ashura',
    description: 'The blessed day Allah saved Prophet Musa (AS) from Pharaoh. A highly recommended fasting day in Islam.',
    category: 'SUNNAH_FAST'
  },
  {
    id: 'muharram-hussain-martyrdom',
    monthNum: 1,
    monthName: 'Muharram',
    dayStart: 10,
    dayLabel: '10 Muharram',
    title: 'Martyrdom of Imam Hussain ibn Ali (RA)',
    description: 'Martyrdom of Imam Hussain (RA), grandson of Prophet Muhammad (SAW), at the Battle of Karbala (61 AH) — a significant historical event remembered across the Muslim world.',
    category: 'HISTORICAL'
  },

  // --- 2. Safar ---
  // No fixed major events; month free of pre-Islamic superstitions

  // --- 3. Rabi al-Awwal ---
  {
    id: 'rabi-awwal-mawlid',
    monthNum: 3,
    monthName: "Rabi' al-Awwal",
    dayStart: 12,
    dayLabel: '12 Rabi al-Awwal',
    title: 'Mawlid al-Nabi (Birth & Passing of Prophet Muhammad ﷺ)',
    description: 'Widely cited date marking the birth of Prophet Muhammad (SAW) and also cited as the date of his passing from this world (11 AH).',
    category: 'HISTORICAL'
  },

  // --- 4. Rabi al-Thani ---
  {
    id: 'rabi-thani-gyarhvin',
    monthNum: 4,
    monthName: "Rabi' al-Thani",
    dayStart: 11,
    dayLabel: '11 Rabi al-Thani',
    title: 'Gyarhvin Sharif (Urs of Sheikh Abdul Qadir Jilani)',
    description: 'Death anniversary (Urs) of Sheikh Abdul Qadir Jilani (Ghaus-e-Azam), widely remembered among Sufi-oriented Muslims.',
    category: 'HISTORICAL'
  },

  // --- 5. Jumada al-Awwal ---
  // No major fixed commemorative dates widely observed

  // --- 6. Jumada al-Thani ---
  // No major fixed commemorative dates widely observed

  // --- 7. Rajab ---
  {
    id: 'rajab-isra-miraj',
    monthNum: 7,
    monthName: 'Rajab',
    dayStart: 27,
    dayLabel: '27 Rajab',
    title: 'Isra and Mi\'raj (Night Journey & Ascension)',
    description: 'The miraculous Night Journey of Prophet Muhammad (SAW) from Makkah to Jerusalem (Al-Aqsa) and his Ascension to the heavens, where the 5 daily prayers were prescribed.',
    category: 'SPECIAL_NIGHT'
  },

  // --- 8. Sha'ban ---
  {
    id: 'shaban-shab-e-barat',
    monthNum: 8,
    monthName: "Sha'ban",
    dayStart: 15,
    dayLabel: '15 Sha\'ban',
    title: 'Laylat al-Bara\'ah (Shab-e-Barat)',
    description: 'The Night of Forgiveness & Records. Observed by many Muslims with voluntary night prayers, dua, and fasting on the 15th.',
    category: 'SPECIAL_NIGHT'
  },

  // --- 9. Ramadan ---
  {
    id: 'ramadan-fasting-begins',
    monthNum: 9,
    monthName: 'Ramadan',
    dayStart: 1,
    dayLabel: '1 Ramadan',
    title: 'First Day of Ramadan Fasting',
    description: 'The month of holy fasting begins. Fasting from dawn to sunset is obligatory for all adult healthy Muslims.',
    category: 'SACRED_MONTH'
  },
  {
    id: 'ramadan-battle-badr',
    monthNum: 9,
    monthName: 'Ramadan',
    dayStart: 17,
    dayLabel: '17 Ramadan',
    title: 'Battle of Badr (2 AH)',
    description: 'The first major victory in Islamic history, where 313 Muslims triumphed over a vastly larger army with divine aid.',
    category: 'HISTORICAL'
  },
  {
    id: 'ramadan-ali-martyrdom',
    monthNum: 9,
    monthName: 'Ramadan',
    dayStart: 21,
    dayLabel: '21 Ramadan',
    title: 'Martyrdom of Imam Ali ibn Abi Talib (RA)',
    description: 'Passing of the 4th Caliph of Islam, Imam Ali (RA), who was assassinated in Kufa while entering the mosque for Fajr prayer.',
    category: 'HISTORICAL'
  },
  {
    id: 'ramadan-laylat-al-qadr',
    monthNum: 9,
    monthName: 'Ramadan',
    dayStart: 21,
    dayEnd: 29,
    dayLabel: 'Last 10 Nights (esp. 27th)',
    title: 'Laylat al-Qadr (The Night of Decree/Power)',
    description: 'The night when the first verses of the Quran were revealed. Seeking this night in the odd nights of the last ten days of Ramadan is better than 1,000 months of worship.',
    category: 'SPECIAL_NIGHT'
  },
  {
    id: 'ramadan-nuzul-quran',
    monthNum: 9,
    monthName: 'Ramadan',
    dayStart: 27,
    dayLabel: '27 Ramadan',
    title: 'Nuzul al-Quran',
    description: 'Commemorated by many as the night the Holy Quran was first revealed to Prophet Muhammad (SAW).',
    category: 'SPECIAL_NIGHT'
  },

  // --- 10. Shawwal ---
  {
    id: 'shawwal-eid-al-fitr',
    monthNum: 10,
    monthName: 'Shawwal',
    dayStart: 1,
    dayLabel: '1 Shawwal',
    title: 'Eid al-Fitr (Festival of Fast-Breaking)',
    description: 'Major Islamic celebration marking the conclusion of the holy month of Ramadan.',
    category: 'EID'
  },
  {
    id: 'shawwal-six-fasts',
    monthNum: 10,
    monthName: 'Shawwal',
    dayStart: 2,
    dayEnd: 7,
    dayLabel: '2–7 Shawwal',
    title: 'Six Days of Sunnah Fasting in Shawwal',
    description: 'Fasting 6 voluntary days in Shawwal after Eid al-Fitr yields the spiritual reward of fasting the entire year.',
    category: 'SUNNAH_FAST'
  },
  {
    id: 'shawwal-battle-uhud',
    monthNum: 10,
    monthName: 'Shawwal',
    dayStart: 7,
    dayLabel: '7 Shawwal',
    title: 'Battle of Uhud (3 AH)',
    description: 'Second major battle in Islamic history, occurring near Mount Uhud outside Madinah.',
    category: 'HISTORICAL'
  },

  // --- 11. Dhul Qa'dah ---
  // Sacred month; preparation for Hajj

  // --- 12. Dhul Hijjah ---
  {
    id: 'dhul-hijjah-best-10-days',
    monthNum: 12,
    monthName: 'Dhu al-Hijjah',
    dayStart: 1,
    dayEnd: 9,
    dayLabel: '1–9 Dhul Hijjah',
    title: 'The Best 10 Days of the Year',
    description: 'The most beloved 10 days to Allah for righteous deeds, voluntary fasting, Dhikr, and extra prayers.',
    category: 'SUNNAH_FAST'
  },
  {
    id: 'dhul-hijjah-yawm-tarwiyah',
    monthNum: 12,
    monthName: 'Dhu al-Hijjah',
    dayStart: 8,
    dayLabel: '8 Dhul Hijjah',
    title: 'Yawm al-Tarwiyah (Hajj Begins)',
    description: 'Pilgrims don Ihram and proceed from Makkah to Mina as the formal rites of Hajj begin.',
    category: 'SACRED_MONTH'
  },
  {
    id: 'dhul-hijjah-arafah',
    monthNum: 12,
    monthName: 'Dhu al-Hijjah',
    dayStart: 9,
    dayLabel: '9 Dhul Hijjah',
    title: 'Day of Arafah',
    description: 'The pinnacle day of Hajj at Mount Arafat. For non-pilgrims, fasting on this day expiates sins for the preceding and coming year.',
    category: 'SUNNAH_FAST'
  },
  {
    id: 'dhul-hijjah-eid-al-adha',
    monthNum: 12,
    monthName: 'Dhu al-Hijjah',
    dayStart: 10,
    dayLabel: '10 Dhul Hijjah',
    title: 'Eid al-Adha (Festival of Sacrifice)',
    description: 'Major Islamic Eid commemorating Prophet Ibrahim\'s (AS) devotion and willingness to sacrifice his son for Allah.',
    category: 'EID'
  },
  {
    id: 'dhul-hijjah-days-tashreeq',
    monthNum: 12,
    monthName: 'Dhu al-Hijjah',
    dayStart: 11,
    dayEnd: 13,
    dayLabel: '11–13 Dhul Hijjah',
    title: 'Days of Tashreeq',
    description: 'Continuation of Eid al-Adha celebrations, days of eating, drinking, and reciting Takbeerat of Tashreeq.',
    category: 'EID'
  },
  {
    id: 'dhul-hijjah-umar-stabbing',
    monthNum: 12,
    monthName: 'Dhu al-Hijjah',
    dayStart: 26,
    dayLabel: '26 Dhul Hijjah',
    title: 'Stabbing of Umar ibn al-Khattab (RA)',
    description: 'Caliph Umar (RA) was fatally wounded while leading Fajr prayer in Madinah.',
    category: 'HISTORICAL'
  }
];

export const MONTH_DETAILS: Record<number, IslamicMonthDetail> = {
  1: {
    monthNum: 1,
    name: 'Muharram',
    isSacred: true,
    overview: 'First month of the Islamic calendar and one of the four Sacred Months. Fasting in Muharram is the best fast after Ramadan.',
    events: ISLAMIC_EVENTS_DATA.filter(e => e.monthNum === 1)
  },
  2: {
    monthNum: 2,
    name: 'Safar',
    isSacred: false,
    overview: 'Second month of the Islamic calendar. Historically regarded as a month free of pre-Islamic Arabian superstitions.',
    events: []
  },
  3: {
    monthNum: 3,
    name: "Rabi' al-Awwal",
    isSacred: false,
    overview: 'Third month of the Islamic calendar, known for the birth and passing of Prophet Muhammad (SAW).',
    events: ISLAMIC_EVENTS_DATA.filter(e => e.monthNum === 3)
  },
  4: {
    monthNum: 4,
    name: "Rabi' al-Thani",
    isSacred: false,
    overview: 'Fourth month of the Islamic calendar.',
    events: ISLAMIC_EVENTS_DATA.filter(e => e.monthNum === 4)
  },
  5: {
    monthNum: 5,
    name: 'Jumada al-Awwal',
    isSacred: false,
    overview: 'Fifth month of the Islamic calendar.',
    events: []
  },
  6: {
    monthNum: 6,
    name: 'Jumada al-Thani',
    isSacred: false,
    overview: 'Sixth month of the Islamic calendar.',
    events: []
  },
  7: {
    monthNum: 7,
    name: 'Rajab',
    isSacred: true,
    overview: 'Seventh month and one of the four Sacred Months. Features the Night Journey of Isra and Mi\'raj.',
    events: ISLAMIC_EVENTS_DATA.filter(e => e.monthNum === 7)
  },
  8: {
    monthNum: 8,
    name: "Sha'ban",
    isSacred: false,
    overview: 'Eighth month of the Islamic calendar. Prophet Muhammad (SAW) observed abundant fasting during Sha\'ban as preparation for Ramadan.',
    events: ISLAMIC_EVENTS_DATA.filter(e => e.monthNum === 8)
  },
  9: {
    monthNum: 9,
    name: 'Ramadan',
    isSacred: false,
    overview: 'Ninth month and the holy month of obligatory fasting, intense worship, and Quranic revelation.',
    events: ISLAMIC_EVENTS_DATA.filter(e => e.monthNum === 9)
  },
  10: {
    monthNum: 10,
    name: 'Shawwal',
    isSacred: false,
    overview: 'Tenth month beginning with Eid al-Fitr and followed by the recommended 6 Sunnah fasts.',
    events: ISLAMIC_EVENTS_DATA.filter(e => e.monthNum === 10)
  },
  11: {
    monthNum: 11,
    name: "Dhu al-Qi'dah",
    isSacred: true,
    overview: 'Eleventh month and one of the four Sacred Months. Historically a peaceful month of preparation for Hajj.',
    events: []
  },
  12: {
    monthNum: 12,
    name: 'Dhu al-Hijjah',
    isSacred: true,
    overview: 'Twelfth month and one of the four Sacred Months. Features the 10 best days of the year, Hajj pilgrimage, Day of Arafah, and Eid al-Adha.',
    events: ISLAMIC_EVENTS_DATA.filter(e => e.monthNum === 12)
  }
};

/**
  * Calculate upcoming Islamic events within a target window of days (e.g. 2 days ahead, 1 day ahead, today)
  * taking into account the user's custom Hijri offset.
  */
export function getUpcomingIslamicEvents(
  today: Date = new Date(),
  offsetDays: number = 0,
  maxWindowDays: number = 2
): { event: IslamicEvent; status: 'TODAY' | 'IN_1_DAY' | 'IN_2_DAYS'; targetDate: Date }[] {
  const results: { event: IslamicEvent; status: 'TODAY' | 'IN_1_DAY' | 'IN_2_DAYS'; targetDate: Date }[] = [];
  const seenEventIds = new Set<string>();

  // Check offset for today (0 days ahead), tomorrow (1 day ahead), and 2 days ahead
  for (let deltaDays = 0; deltaDays <= maxWindowDays; deltaDays++) {
    const futureGregorian = new Date(today.getTime() + deltaDays * 24 * 60 * 60 * 1000);
    const adjustedTime = futureGregorian.getTime() + offsetDays * 24 * 60 * 60 * 1000;
    const adjustedDate = new Date(adjustedTime);

    try {
      const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'numeric'
      });
      const parts = formatter.formatToParts(adjustedDate);
      const dayVal = parts.find(p => p.type === 'day')?.value;
      const monthVal = parts.find(p => p.type === 'month')?.value;

      if (dayVal && monthVal) {
        const hijriDay = parseInt(dayVal, 10);
        const hijriMonth = parseInt(monthVal, 10);

        // Find events matching this Hijri month and day
        const matchingEvents = ISLAMIC_EVENTS_DATA.filter(e => {
          if (e.monthNum !== hijriMonth) return false;
          if (e.dayEnd) {
            // Range check
            return hijriDay >= e.dayStart && hijriDay <= e.dayEnd;
          }
          return e.dayStart === hijriDay;
        });

        for (const ev of matchingEvents) {
          if (!seenEventIds.has(ev.id)) {
            seenEventIds.add(ev.id);
            const status = deltaDays === 0 ? 'TODAY' : deltaDays === 1 ? 'IN_1_DAY' : 'IN_2_DAYS';
            results.push({
              event: ev,
              status,
              targetDate: futureGregorian
            });
          }
        }
      }
    } catch (e) {
      console.error('Error calculating Hijri date for upcoming events:', e);
    }
  }

  return results;
}
