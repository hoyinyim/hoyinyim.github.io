export const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

export const number = (value) => String(value).padStart(2, '0');

export const externalAttrs = 'target="_blank" rel="noopener noreferrer"';

export const groupBy = (items, key) => items.reduce((groups, item) => {
  const value = item[key] || '其他';
  (groups[value] ||= []).push(item);
  return groups;
}, {});

export const unique = (values) => [...new Set(values)];
