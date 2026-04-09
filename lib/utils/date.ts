import SunCalc from "suncalc";

export function isLikelySabbathDay(date: Date, latitude: number, longitude: number): boolean {
  const day = date.getDay();
  if (day !== 6) return false;
  const times = SunCalc.getTimes(date, latitude, longitude);
  return date >= times.sunset && date < new Date(times.sunset.getTime() + 24 * 60 * 60 * 1000);
}
