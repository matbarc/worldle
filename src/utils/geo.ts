import { type Country } from "~/utils/countries";

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (d: number) => (d * 180) / Math.PI;

export function arrowToAnswer(country1: Country, country2: Country): string {
  //borrowed from geolib, slightly modified
  if (country1.code === country2.code) return "🎉";

  const roundedDirection = Math.round(angle(country1, country2) / 45);
  const arrowChar = ["⬆️", "↗️", "➡️", "↘️", "⬇️", "↙️", "⬅️", "↖️", "⬆️"][
    roundedDirection
  ];

  return arrowChar!;
}

function angle(country1: Country, country2: Country) {
  let deltaLongitude = rad(country2.longitude - country1.longitude);
  const deltaLatitude = Math.log(
    Math.tan(rad(country2.latitude) / 2 + Math.PI / 4) /
      Math.tan(rad(country1.latitude) / 2 + Math.PI / 4),
  );
  if (Math.abs(deltaLongitude) > Math.PI) {
    if (deltaLongitude > 0) {
      deltaLongitude = (Math.PI * 2 - deltaLongitude) * -1;
    } else {
      deltaLongitude = Math.PI * 2 + deltaLongitude;
    }
  }
  return (deg(Math.atan2(deltaLongitude, deltaLatitude)) + 360) % 360;
}

// magic formula, do not know how it works
export function distance(country1: Country, country2: Country): number {
  const deltaLatitude = rad(country2.latitude - country1.latitude);
  const deltaLongitude = rad(country2.longitude - country1.longitude);

  const a =
    Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) +
    Math.cos(rad(country1.latitude)) *
      Math.cos(rad(country2.latitude)) *
      Math.sin(deltaLongitude / 2) *
      Math.sin(deltaLongitude / 2);
  return 12742 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const MAX_DISTANCE = 20_000;
