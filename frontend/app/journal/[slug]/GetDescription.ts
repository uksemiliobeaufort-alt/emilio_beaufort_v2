
export function getDescription(html: string, maxLength = 160): string {
  if (!html) return '';
  const tempDiv = typeof document !== 'undefined' ? document.createElement('div') : { innerHTML: html, textContent: '' };
  tempDiv.innerHTML = html;
  const textContent = tempDiv.textContent || '';
  return textContent.length > maxLength ? textContent.slice(0, maxLength) + '...' : textContent;
}
