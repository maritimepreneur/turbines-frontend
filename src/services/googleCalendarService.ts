// Google Calendar API service for fetching public holidays
// Uses the Google Calendar API v3 with a public calendar for Indonesian holidays

export interface GoogleHoliday {
  id: string;
  title: string;
  date: string; // format "YYYY-MM-DD"
  description?: string;
}

const GOOGLE_CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3/calendars';

// Indonesian public holidays calendar ID
// Other options:
//   - en.indonesian#holiday@group.v.calendar.google.com (English)
//   - id.indonesian#holiday@group.v.calendar.google.com (Indonesian)
const INDONESIA_HOLIDAY_CALENDAR_ID = 'en.indonesian%23holiday%40group.v.calendar.google.com';

/**
 * Fetch public holidays from Google Calendar API for a given month range.
 * Requires a Google API key with Calendar API enabled.
 *
 * @param apiKey - Google API Key
 * @param timeMin - Start date (ISO string, e.g. "2026-01-01T00:00:00Z")
 * @param timeMax - End date (ISO string, e.g. "2026-02-01T00:00:00Z")
 * @param calendarId - Optional custom calendar ID (defaults to Indonesian holidays)
 */
export async function fetchGoogleHolidays(
  apiKey: string,
  timeMin: string,
  timeMax: string,
  calendarId: string = INDONESIA_HOLIDAY_CALENDAR_ID
): Promise<GoogleHoliday[]> {
  try {
    const url = new URL(`${GOOGLE_CALENDAR_API_BASE}/${calendarId}/events`);
    url.searchParams.set('key', apiKey);
    url.searchParams.set('timeMin', timeMin);
    url.searchParams.set('timeMax', timeMax);
    url.searchParams.set('singleEvents', 'true');
    url.searchParams.set('orderBy', 'startTime');
    url.searchParams.set('maxResults', '50');

    const response = await fetch(url.toString());

    if (!response.ok) {
      console.error('Google Calendar API error:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();

    if (!data.items || !Array.isArray(data.items)) {
      return [];
    }

    // Map Google Calendar events to our simplified holiday interface
    const holidays: GoogleHoliday[] = data.items.map((item: {
      id: string;
      summary?: string;
      description?: string;
      start?: { date?: string; dateTime?: string };
    }) => ({
      id: item.id || '',
      title: item.summary || 'Holiday',
      date: item.start?.date || item.start?.dateTime?.split('T')[0] || '',
      description: item.description || '',
    }));

    return holidays;
  } catch (error) {
    console.error('Failed to fetch Google holidays:', error);
    return [];
  }
}

/**
 * Helper to build ISO date range for a given month.
 * Returns { timeMin, timeMax } as ISO strings.
 */
export function getMonthRange(year: number, month: number): { timeMin: string; timeMax: string } {
  // month is 0-indexed (0 = January)
  const timeMin = new Date(year, month, 1).toISOString();
  const timeMax = new Date(year, month + 1, 1).toISOString();
  return { timeMin, timeMax };
}
