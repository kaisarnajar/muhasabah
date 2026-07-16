/**
 * Helper utility to calculate and format Hijri Dates using standard
 * browser/Node.js Internationalisation APIs.
 */

export function getHijriDateString(date: Date, offsetDays: number = 0): string {
  // Apply manual offset (convert offset in days to milliseconds)
  const adjustedTime = date.getTime() + offsetDays * 24 * 60 * 60 * 1000;
  const adjustedDate = new Date(adjustedTime);

  try {
    const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const parts = formatter.formatToParts(adjustedDate);
    const day = parts.find(p => p.type === 'day')?.value;
    const month = parts.find(p => p.type === 'month')?.value;
    const year = parts.find(p => p.type === 'year')?.value;
    const era = parts.find(p => p.type === 'era')?.value || 'AH';

    return `${day} ${month} ${year} ${era}`;
  } catch (e) {
    console.error('Failed to format Hijri date using Intl', e);
    // Fallback to local date string
    return adjustedDate.toLocaleDateString();
  }
}
