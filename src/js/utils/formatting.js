let currentNumberFormat = 'standard';

export function setNumberFormat(format) {
  currentNumberFormat = format;
}

export function formatNumber(num) {
  if (typeof num !== 'number') return String(num);

  switch (currentNumberFormat) {
    case 'shortened':
      return formatShortened(num);
    case 'scientific':
      return num.toExponential(2);
    case 'standard':
    default:
      return num.toLocaleString('en-US');
  }
}

function formatShortened(num) {
  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (abs >= 1e12) return sign + (abs / 1e12).toFixed(2) + 'T';
  if (abs >= 1e9) return sign + (abs / 1e9).toFixed(2) + 'B';
  if (abs >= 1e6) return sign + (abs / 1e6).toFixed(2) + 'M';
  if (abs >= 1e3) return sign + (abs / 1e3).toFixed(2) + 'K';

  return num.toLocaleString('en-US');
}
