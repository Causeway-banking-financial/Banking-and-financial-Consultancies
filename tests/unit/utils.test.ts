import { createSlug, formatFileSize, getLocalizedField, truncate, getCompletionScore, cn } from '@/lib/utils';

describe('createSlug', () => {
  it('creates a URL-friendly slug', () => {
    expect(createSlug('Hello World')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(createSlug('Hello! @World# 2024')).toBe('hello-world-2024');
  });

  it('handles empty string', () => {
    expect(createSlug('')).toBe('');
  });
});

describe('formatFileSize', () => {
  it('formats bytes', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(500)).toBe('500 B');
  });

  it('formats kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(2560)).toBe('2.5 KB');
  });

  it('formats megabytes', () => {
    expect(formatFileSize(1048576)).toBe('1 MB');
    expect(formatFileSize(15728640)).toBe('15 MB');
  });
});

describe('getLocalizedField', () => {
  const item = {
    titleEn: 'English Title',
    titleAr: 'عنوان عربي',
    descriptionEn: 'English Description',
    descriptionAr: '',
  };

  it('returns English field for en locale', () => {
    expect(getLocalizedField(item, 'title', 'en')).toBe('English Title');
  });

  it('returns Arabic field for ar locale', () => {
    expect(getLocalizedField(item, 'title', 'ar')).toBe('عنوان عربي');
  });

  it('falls back to other language when field is empty', () => {
    expect(getLocalizedField(item, 'description', 'ar')).toBe('English Description');
  });
});

describe('truncate', () => {
  it('returns full string if shorter than limit', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates and adds ellipsis', () => {
    expect(truncate('hello world', 5)).toBe('hello...');
  });
});

describe('getCompletionScore', () => {
  it('returns 100 when all fields are filled', () => {
    const item = { a: 'hello', b: 'world' };
    expect(getCompletionScore(item, ['a', 'b'])).toBe(100);
  });

  it('returns 50 when half fields are filled', () => {
    const item = { a: 'hello', b: '' };
    expect(getCompletionScore(item, ['a', 'b'])).toBe(50);
  });

  it('returns 0 when no fields are filled', () => {
    const item = { a: '', b: null };
    expect(getCompletionScore(item, ['a', 'b'])).toBe(0);
  });
});

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('p-4', 'text-red-500')).toBe('p-4 text-red-500');
  });

  it('handles tailwind merge conflicts', () => {
    expect(cn('p-4', 'p-8')).toBe('p-8');
  });
});
