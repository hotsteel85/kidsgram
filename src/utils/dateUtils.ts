export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseDate = (dateString: string): Date => {
  return new Date(dateString + 'T00:00:00');
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return formatDate(date) === formatDate(today);
};

export const getDateDisplay = (dateString: string): string => {
  const date = parseDate(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (formatDate(date) === formatDate(today)) {
    return '오늘';
  } else if (formatDate(date) === formatDate(yesterday)) {
    return '어제';
  } else {
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  }
}; 