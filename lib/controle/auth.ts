import { createHash } from "crypto";

export const CONTROLE_ADMIN_COOKIE = "controle_admin_auth";

const DAILY_PASSWORD_PREFIX = "56676009";
const BRAZIL_TIMEZONE = "America/Sao_Paulo";

type ZonedDateParts = {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  second: string;
};

function getZonedDateParts(date = new Date()): ZonedDateParts {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: BRAZIL_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const lookup = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  ) as Record<string, string>;

  return {
    year: lookup.year,
    month: lookup.month,
    day: lookup.day,
    hour: lookup.hour,
    minute: lookup.minute,
    second: lookup.second,
  };
}

export function getDailyAdminPassword(date = new Date()): string {
  const { day, month, year } = getZonedDateParts(date);
  return `${DAILY_PASSWORD_PREFIX}${day}${month}${year}`;
}

function getMinuteSeed(date = new Date()): string {
  const { year, month, day, hour, minute } = getZonedDateParts(date);
  return `${year}${month}${day}${hour}${minute}`;
}

function modHexString(hex: string, divisor: number): number {
  let remainder = 0;

  for (const char of hex) {
    const digit = Number.parseInt(char, 16);
    remainder = (remainder * 16 + digit) % divisor;
  }

  return remainder;
}

export function getRotatingApprovalPassword(date = new Date()): string {
  const seed = `${getDailyAdminPassword(date)}:${getMinuteSeed(date)}`;
  const digest = createHash("sha256").update(seed).digest("hex");
  const numeric = modHexString(digest.slice(0, 16), 100000000);

  return numeric.toString().padStart(8, "0");
}

export function getApprovalPasswordDetails(date = new Date()) {
  const currentCode = getRotatingApprovalPassword(date);
  const { second } = getZonedDateParts(date);
  const secondsElapsed = Number(second);
  const remainingSeconds = Math.max(1, 60 - secondsElapsed);
  const validUntil = new Date(date.getTime() + remainingSeconds * 1000).toISOString();

  return {
    code: currentCode,
    remainingSeconds,
    validUntil,
  };
}

export function isDailyPasswordValid(password: string, date = new Date()): boolean {
  return password === getDailyAdminPassword(date);
}

export function isRotatingApprovalPasswordValid(password: string, date = new Date()): boolean {
  return password === getRotatingApprovalPassword(date);
}

export function getSecondsUntilBrazilMidnight(date = new Date()): number {
  const parts = getZonedDateParts(date);
  const hour = Number(parts.hour);
  const minute = Number(parts.minute);
  const second = Number(parts.second);
  const elapsed = hour * 3600 + minute * 60 + second;

  return Math.max(60, 86400 - elapsed);
}

export function isControleAdminSessionValid(cookieValue?: string | null): boolean {
  if (!cookieValue) return false;
  return cookieValue === getDailyAdminPassword();
}
