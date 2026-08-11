"use client";

type TrackingPayload = Record<string, unknown>;
const TRACKING_ENDPOINT = "/api/track-event";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown> | IArguments>;
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

function cleanPayload(payload: TrackingPayload) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );
}

function getOrCreateVisitorId() {
  if (typeof window === "undefined") return undefined;

  try {
    const existing = localStorage.getItem("visitor_id");
    if (existing) return existing;

    const created = `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    localStorage.setItem("visitor_id", created);
    return created;
  } catch {
    return undefined;
  }
}

function persistTrackingEvent(event: string, payload: TrackingPayload = {}) {
  if (typeof window === "undefined") return;

  try {
    const body = JSON.stringify({
      event,
      payload: {
        ...payload,
        visitor_id: payload.visitor_id || getOrCreateVisitorId(),
      },
    });

    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(TRACKING_ENDPOINT, blob);
      return;
    }

    void fetch(TRACKING_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    // Silently fail to avoid affecting user actions.
  }
}

export function trackEvent(event: string, payload: TrackingPayload = {}) {
  if (typeof window === "undefined") return;

  const clean = cleanPayload(payload);

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event, ...clean });
  }

  if (typeof window.gtag === "function") {
    window.gtag("event", event, clean);
  }

  if (typeof window.fbq === "function") {
    window.fbq("trackCustom", event, clean);
  }
}

export function trackLeadEvent(
  event: string,
  payload: TrackingPayload = {},
  value = 1
) {
  const eventPayload = {
    ...payload,
    event_category: "lead",
    value,
  };

  trackEvent(event, eventPayload);
  persistTrackingEvent(event, cleanPayload(eventPayload));
}

export function trackWhatsAppClick(payload: TrackingPayload = {}) {
  trackLeadEvent("whatsapp_click", {
    channel: "whatsapp",
    ...payload,
  });
}

export function trackPhoneClick(payload: TrackingPayload = {}) {
  trackLeadEvent("phone_click", {
    channel: "phone",
    ...payload,
  });
}

export function trackMailClick(payload: TrackingPayload = {}) {
  trackLeadEvent("email_click", {
    channel: "email",
    ...payload,
  });
}

export function trackFormAttempt(payload: TrackingPayload = {}) {
  trackLeadEvent("lead_form_attempt", payload);
}

export function trackFormSuccess(payload: TrackingPayload = {}) {
  trackLeadEvent("lead_form_success", payload);
}

export function trackFormError(payload: TrackingPayload = {}) {
  trackLeadEvent("lead_form_error", payload);
}

export function trackPageLeadView(payload: TrackingPayload = {}) {
  trackLeadEvent("lead_section_view", payload, 0);
}
