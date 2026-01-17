import { formatTimeUntilEnd } from '~/utils/dateFormat';

describe('formatTimeUntilEnd', () => {
  beforeEach(() => {
    // Mock Date.now() to have consistent test results
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return null if event has ended', () => {
    const now = new Date('2026-01-20T12:00:00Z');
    jest.setSystemTime(now);

    const endTime = new Date('2026-01-20T11:00:00Z').toISOString(); // 1 hour ago
    const result = formatTimeUntilEnd(endTime, 'en');

    expect(result).toBeNull();
  });

  it('should format minutes correctly in English', () => {
    const now = new Date('2026-01-20T12:00:00Z');
    jest.setSystemTime(now);

    const endTime = new Date('2026-01-20T12:30:00Z').toISOString(); // 30 minutes from now
    const result = formatTimeUntilEnd(endTime, 'en');

    expect(result).toBe('30 minutes');
  });

  it('should format 1 minute correctly in English', () => {
    const now = new Date('2026-01-20T12:00:00Z');
    jest.setSystemTime(now);

    const endTime = new Date('2026-01-20T12:01:00Z').toISOString(); // 1 minute from now
    const result = formatTimeUntilEnd(endTime, 'en');

    expect(result).toBe('1 minute');
  });

  it('should format hours correctly in English', () => {
    const now = new Date('2026-01-20T12:00:00Z');
    jest.setSystemTime(now);

    const endTime = new Date('2026-01-20T14:00:00Z').toISOString(); // 2 hours from now
    const result = formatTimeUntilEnd(endTime, 'en');

    expect(result).toBe('2 hours');
  });

  it('should format 1 hour correctly in English', () => {
    const now = new Date('2026-01-20T12:00:00Z');
    jest.setSystemTime(now);

    const endTime = new Date('2026-01-20T13:00:00Z').toISOString(); // 1 hour from now
    const result = formatTimeUntilEnd(endTime, 'en');

    expect(result).toBe('1 hour');
  });

  it('should format hours and minutes correctly in English', () => {
    const now = new Date('2026-01-20T12:00:00Z');
    jest.setSystemTime(now);

    const endTime = new Date('2026-01-20T13:30:00Z').toISOString(); // 1 hour 30 minutes from now
    const result = formatTimeUntilEnd(endTime, 'en');

    expect(result).toBe('1 hour 30 minutes');
  });

  it('should format minutes correctly in Finnish', () => {
    const now = new Date('2026-01-20T12:00:00Z');
    jest.setSystemTime(now);

    const endTime = new Date('2026-01-20T12:30:00Z').toISOString(); // 30 minutes from now
    const result = formatTimeUntilEnd(endTime, 'fi');

    expect(result).toBe('30 minuuttia');
  });

  it('should format 1 minute correctly in Finnish', () => {
    const now = new Date('2026-01-20T12:00:00Z');
    jest.setSystemTime(now);

    const endTime = new Date('2026-01-20T12:01:00Z').toISOString(); // 1 minute from now
    const result = formatTimeUntilEnd(endTime, 'fi');

    expect(result).toBe('1 minuutti');
  });

  it('should format hours correctly in Finnish', () => {
    const now = new Date('2026-01-20T12:00:00Z');
    jest.setSystemTime(now);

    const endTime = new Date('2026-01-20T14:00:00Z').toISOString(); // 2 hours from now
    const result = formatTimeUntilEnd(endTime, 'fi');

    expect(result).toBe('2 tuntia');
  });

  it('should format 1 hour correctly in Finnish', () => {
    const now = new Date('2026-01-20T12:00:00Z');
    jest.setSystemTime(now);

    const endTime = new Date('2026-01-20T13:00:00Z').toISOString(); // 1 hour from now
    const result = formatTimeUntilEnd(endTime, 'fi');

    expect(result).toBe('1 tunti');
  });

  it('should format hours and minutes correctly in Finnish', () => {
    const now = new Date('2026-01-20T12:00:00Z');
    jest.setSystemTime(now);

    const endTime = new Date('2026-01-20T13:30:00Z').toISOString(); // 1 hour 30 minutes from now
    const result = formatTimeUntilEnd(endTime, 'fi');

    expect(result).toBe('1 tunti 30 minuuttia');
  });
});
