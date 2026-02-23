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

const NICE_NUMBERS = [1, 2, 5, 10];

function _roundUpToNice(value: number): number {
  if (value === 0) return 100;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude;
  const niceNormalized = NICE_NUMBERS.find((n) => n >= normalized) ?? 10;

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
