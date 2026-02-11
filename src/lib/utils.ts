import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import slugify from 'slugify';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createSlug(text: string): string {
  return slugify(text, { lower: true, strict: true, trim: true });
}

export function formatDate(date: Date | string, locale: string = 'en'): string {
  const d = new Date(date);
  return d.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getLocalizedField<T extends Record<string, any>>(
  item: T,
  field: string,
  locale: string
): string {
  const localeSuffix = locale === 'ar' ? 'Ar' : 'En';
  const fallbackSuffix = locale === 'ar' ? 'En' : 'Ar';
  return item[`${field}${localeSuffix}`] || item[`${field}${fallbackSuffix}`] || '';
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'PUBLISHED':
      return 'badge-published';
    case 'DRAFT':
      return 'badge-draft';
    case 'ARCHIVED':
      return 'badge-archived';
    default:
      return 'badge';
  }
}

export function getCompletionScore(item: Record<string, any>, fields: string[]): number {
  const filled = fields.filter((f) => {
    const val = item[f];
    return val !== null && val !== undefined && val !== '';
  }).length;
  return Math.round((filled / fields.length) * 100);
}
