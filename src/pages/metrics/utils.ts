import dayjs from "dayjs";

export const getTickDateFormat = (timeframe: string, value: number) => {
  if (timeframe === 'day') return dayjs.unix(value).format('HH:mm');
  return dayjs.unix(value).format('DD/MM HH:mm');
}