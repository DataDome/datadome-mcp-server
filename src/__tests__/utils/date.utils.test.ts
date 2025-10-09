import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { parseTimeRange, formatDateForApi, formatDateForElasticsearch } from '../../utils/date.utils.js';

describe('date.utils', () => {
  describe('parseTimeRange', () => {
    let mockNow: Date;

    beforeEach(() => {
      // Set a fixed date for testing: 2025-10-07 15:30:00 (Tuesday)
      mockNow = new Date('2025-10-07T15:30:00.000Z');
      vi.setSystemTime(mockNow);
    });

    afterEach(() => {
      // Restore real time after each test
      vi.useRealTimers();
    });

    describe('relative time periods', () => {
      it('should parse "today" correctly', () => {
        const result = parseTimeRange('today');

        expect(result.start.getFullYear()).toBe(2025);
        expect(result.start.getMonth()).toBe(9); // October (0-indexed)
        expect(result.start.getDate()).toBe(7);
        expect(result.start.getHours()).toBe(0);
        expect(result.start.getMinutes()).toBe(0);
        expect(result.start.getSeconds()).toBe(0);
        expect(result.end).toEqual(mockNow);
      });

      it('should parse "yesterday" correctly', () => {
        const result = parseTimeRange('yesterday');

        expect(result.start.getFullYear()).toBe(2025);
        expect(result.start.getMonth()).toBe(9);
        expect(result.start.getDate()).toBe(6);
        expect(result.start.getHours()).toBe(0);
        expect(result.start.getMinutes()).toBe(0);

        expect(result.end.getDate()).toBe(6);
        expect(result.end.getHours()).toBe(23);
        expect(result.end.getMinutes()).toBe(59);
        expect(result.end.getSeconds()).toBe(59);
        expect(result.end.getMilliseconds()).toBe(999);
      });

      it('should parse "this week" correctly (Monday start)', () => {
        const result = parseTimeRange('this week');

        // 2025-10-07 is a Tuesday, so Monday would be 2025-10-06
        expect(result.start.getDate()).toBe(6);
        expect(result.start.getHours()).toBe(0);
        expect(result.end).toEqual(mockNow);
      });

      it('should parse "this month" correctly', () => {
        const result = parseTimeRange('this month');

        expect(result.start.getFullYear()).toBe(2025);
        expect(result.start.getMonth()).toBe(9);
        expect(result.start.getDate()).toBe(1);
        expect(result.start.getHours()).toBe(0);
        expect(result.end).toEqual(mockNow);
      });

      it('should parse "month" as alias for "this month"', () => {
        const result = parseTimeRange('month');

        expect(result.start.getFullYear()).toBe(2025);
        expect(result.start.getMonth()).toBe(9);
        expect(result.start.getDate()).toBe(1);
      });

      it('should parse "this quarter" correctly', () => {
        const result = parseTimeRange('this quarter');

        // October is in Q4 (Oct, Nov, Dec), which starts in October (month 9)
        expect(result.start.getFullYear()).toBe(2025);
        expect(result.start.getMonth()).toBe(9); // October
        expect(result.start.getDate()).toBe(1);
        expect(result.end).toEqual(mockNow);
      });

      it('should parse "quarter" as alias for "this quarter"', () => {
        const result = parseTimeRange('quarter');

        expect(result.start.getMonth()).toBe(9);
        expect(result.start.getDate()).toBe(1);
      });

      it('should parse "this year" correctly', () => {
        const result = parseTimeRange('this year');

        expect(result.start.getFullYear()).toBe(2025);
        expect(result.start.getMonth()).toBe(0);
        expect(result.start.getDate()).toBe(1);
        expect(result.start.getHours()).toBe(0);
        expect(result.end).toEqual(mockNow);
      });

      it('should parse "year" as alias for "this year"', () => {
        const result = parseTimeRange('year');

        expect(result.start.getFullYear()).toBe(2025);
        expect(result.start.getMonth()).toBe(0);
        expect(result.start.getDate()).toBe(1);
      });
    });

    describe('last X periods', () => {
      it('should parse "last week" correctly', () => {
        const result = parseTimeRange('last week');

        // Should be 7 days ago from now
        const expected = new Date(mockNow);
        expected.setDate(expected.getDate() - 7);

        expect(result.start.getTime()).toBe(expected.getTime());
        expect(result.end).toEqual(mockNow);
      });

      it('should parse "last month" correctly', () => {
        const result = parseTimeRange('last month');

        expect(result.start.getMonth()).toBe(8); // September
        expect(result.start.getDate()).toBe(7);
        expect(result.end).toEqual(mockNow);
      });

      it('should parse "last quarter" correctly', () => {
        const result = parseTimeRange('last quarter');

        expect(result.start.getMonth()).toBe(6); // July (3 months ago)
        expect(result.end).toEqual(mockNow);
      });

      it('should parse "last year" correctly', () => {
        const result = parseTimeRange('last year');

        expect(result.start.getFullYear()).toBe(2024);
        expect(result.start.getMonth()).toBe(9);
        expect(result.start.getDate()).toBe(7);
        expect(result.end).toEqual(mockNow);
      });
    });

    describe('last X units', () => {
      it('should parse "last 30 minutes" correctly', () => {
        const result = parseTimeRange('last 30 minutes');

        const expected = new Date(mockNow.getTime() - 30 * 60_000);
        expect(result.start.getTime()).toBe(expected.getTime());
        expect(result.end).toEqual(mockNow);
      });

      it('should parse "last 1 minute" (singular) correctly', () => {
        const result = parseTimeRange('last 1 minute');

        const expected = new Date(mockNow.getTime() - 1 * 60_000);
        expect(result.start.getTime()).toBe(expected.getTime());
      });

      it('should clamp minutes to maximum 2880', () => {
        const result = parseTimeRange('last 5000 minutes');

        // Should clamp to 2880 minutes (48 hours)
        const expected = new Date(mockNow.getTime() - 2880 * 60_000);
        expect(result.start.getTime()).toBe(expected.getTime());
      });

      it('should parse "last 24 hours" correctly', () => {
        const result = parseTimeRange('last 24 hours');

        const expected = new Date(mockNow.getTime() - 24 * 3_600_000);
        expect(result.start.getTime()).toBe(expected.getTime());
        expect(result.end).toEqual(mockNow);
      });

      it('should parse "last 1 hour" (singular) correctly', () => {
        const result = parseTimeRange('last 1 hour');

        const expected = new Date(mockNow.getTime() - 1 * 3_600_000);
        expect(result.start.getTime()).toBe(expected.getTime());
      });

      it('should clamp hours to maximum 48', () => {
        const result = parseTimeRange('last 100 hours');

        // Should clamp to 48 hours
        const expected = new Date(mockNow.getTime() - 48 * 3_600_000);
        expect(result.start.getTime()).toBe(expected.getTime());
      });

      it('should parse "last 7 days" correctly', () => {
        const result = parseTimeRange('last 7 days');

        const expected = new Date(mockNow);
        expected.setDate(expected.getDate() - 7);

        expect(result.start.getTime()).toBe(expected.getTime());
        expect(result.end).toEqual(mockNow);
      });

      it('should parse "last 1 day" (singular) correctly', () => {
        const result = parseTimeRange('last 1 day');

        const expected = new Date(mockNow);
        expected.setDate(expected.getDate() - 1);

        expect(result.start.getTime()).toBe(expected.getTime());
      });

      it('should parse "last 3 months" correctly', () => {
        const result = parseTimeRange('last 3 months');

        expect(result.start.getMonth()).toBe(6); // July
        expect(result.start.getDate()).toBe(7);
        expect(result.end).toEqual(mockNow);
      });

      it('should parse "last 1 month" (singular) correctly', () => {
        const result = parseTimeRange('last 1 month');

        expect(result.start.getMonth()).toBe(8); // September
        expect(result.start.getDate()).toBe(7);
      });

      it('should parse "last 2 years" correctly', () => {
        const result = parseTimeRange('last 2 years');

        expect(result.start.getFullYear()).toBe(2023);
        expect(result.start.getMonth()).toBe(9);
        expect(result.start.getDate()).toBe(7);
        expect(result.end).toEqual(mockNow);
      });

      it('should parse "last 1 year" (singular) correctly', () => {
        const result = parseTimeRange('last 1 year');

        expect(result.start.getFullYear()).toBe(2024);
        expect(result.start.getMonth()).toBe(9);
      });
    });

    describe('case insensitivity', () => {
      it('should handle uppercase', () => {
        const result = parseTimeRange('TODAY');
        expect(result.start.getDate()).toBe(7);
      });

      it('should handle mixed case', () => {
        const result = parseTimeRange('Last 5 Minutes');
        const expected = new Date(mockNow.getTime() - 5 * 60_000);
        expect(result.start.getTime()).toBe(expected.getTime());
      });
    });

    describe('error handling', () => {
      it('should throw error for invalid format', () => {
        expect(() => parseTimeRange('invalid')).toThrow(/Invalid 'range' qualifier/);
      });

      it('should throw error for unsupported unit', () => {
        expect(() => parseTimeRange('last 5 weeks')).toThrow(/Invalid 'range' qualifier/);
      });

      it('should throw error for malformed string', () => {
        expect(() => parseTimeRange('last minutes 5')).toThrow(/Invalid 'range' qualifier/);
      });
    });
  });

  describe('formatDateForApi', () => {
    it('should format date correctly for API', () => {
      const date = new Date('2025-10-07T15:30:45.123Z');
      const result = formatDateForApi(date);

      expect(result).toBe('2025-10-07T15:30:45Z');
    });

    it('should remove milliseconds', () => {
      const date = new Date('2025-10-07T15:30:45.999Z');
      const result = formatDateForApi(date);

      expect(result).not.toContain('.999');
      expect(result).toBe('2025-10-07T15:30:45Z');
    });

    it('should pad single-digit values', () => {
      const date = new Date('2025-01-01T01:01:01.000Z');
      const result = formatDateForApi(date);

      expect(result).toBe('2025-01-01T01:01:01Z');
    });
  });

  describe('formatDateForElasticsearch', () => {
    it('should format date in ISO 8601 format', () => {
      const date = new Date('2025-10-07T15:30:45.123Z');
      const result = formatDateForElasticsearch(date);

      expect(result).toBe('2025-10-07T15:30:45.123Z');
    });

    it('should preserve milliseconds', () => {
      const date = new Date('2025-10-07T15:30:45.999Z');
      const result = formatDateForElasticsearch(date);

      expect(result).toContain('.999');
      expect(result).toBe('2025-10-07T15:30:45.999Z');
    });

    it('should handle midnight correctly', () => {
      const date = new Date('2025-10-07T00:00:00.000Z');
      const result = formatDateForElasticsearch(date);

      expect(result).toBe('2025-10-07T00:00:00.000Z');
    });
  });
});
