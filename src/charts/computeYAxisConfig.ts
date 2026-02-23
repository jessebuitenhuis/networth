type YAxisConfig = {
  domain: [number, number];
  ticks: number[];
};

const TARGET_TICK_COUNT = 5;

export function computeYAxisConfig(dataMin: number, dataMax: number): YAxisConfig {
  if (dataMin === 0 && dataMax === 0) {
    return { domain: [-100, 100], ticks: [-100, -50, 0, 50, 100] };
  }

  const hasNegative = dataMin < 0;

  if (hasNegative) {
    const maxAbsolute = Math.max(Math.abs(dataMin), dataMax);
    const niceMax = _roundUpToNice(maxAbsolute);
    return {
      domain: [-niceMax, niceMax],
      ticks: _generateTicks(-niceMax, niceMax),
    };
  }

  const niceMax = _roundUpToNice(dataMax);
  return {
    domain: [0, niceMax],
    ticks: _generateTicks(0, niceMax),
  };
}

function _roundUpToNice(value: number): number {
  if (value === 0) return 100;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude;

  let niceNormalized: number;
  if (normalized <= 1) niceNormalized = 1;
  else if (normalized <= 1.2) niceNormalized = 1.2;
  else if (normalized <= 1.5) niceNormalized = 1.5;
  else if (normalized <= 2) niceNormalized = 2;
  else if (normalized <= 2.5) niceNormalized = 2.5;
  else if (normalized <= 3) niceNormalized = 3;
  else if (normalized <= 3.5) niceNormalized = 3.5;
  else if (normalized <= 4) niceNormalized = 4;
  else if (normalized <= 5) niceNormalized = 5;
  else if (normalized <= 6) niceNormalized = 6;
  else if (normalized <= 7) niceNormalized = 7;
  else if (normalized <= 8) niceNormalized = 8;
  else if (normalized <= 9) niceNormalized = 9;
  else niceNormalized = 10;

  return Math.round(niceNormalized * magnitude);
}

function _generateTicks(min: number, max: number): number[] {
  const range = max - min;
  const rawStep = range / TARGET_TICK_COUNT;
  const step = _roundUpToNice(rawStep);

  const ticks: number[] = [];
  const start = Math.ceil(min / step) * step;

  for (let v = start; v <= max + step * 0.01; v += step) {
    ticks.push(Math.round(v) || 0); // avoid -0
  }

  if (ticks[0] !== min) ticks.unshift(min);
  if (ticks[ticks.length - 1] !== max) ticks.push(max);

  return ticks;
}
