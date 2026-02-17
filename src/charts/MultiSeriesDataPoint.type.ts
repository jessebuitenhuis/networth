export type MultiSeriesDataPoint = {
  date: string;
  [seriesKey: string]: string | number;
};
