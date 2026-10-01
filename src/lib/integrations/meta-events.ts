import { createHash } from "node:crypto";
import { isIP } from "node:net";

export type MetaEventName = "PageView" | "CompleteRegistration";

type MetaUserData = {
  client_user_agent?: string;
  client_ip_address?: string;
  fbp?: string;
  fbc?: string;
  em?: string;
  ph?: string;
};

export type MetaEvent = {
  event_name: MetaEventName;
  event_time: number;
  event_id: string;
  event_source_url: string;
  action_source: "website";
  user_data: MetaUserData;
};

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function buildMetaEvent(input: {
  name: MetaEventName;
  eventId: string;
  sourceUrl: string;
  userAgent?: string | null;
  clientIp?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  email?: string;
  phone?: string;
  now?: number;
}): MetaEvent {
  const userData: MetaUserData = {};
  if (input.userAgent) userData.client_user_agent = input.userAgent;
  if (input.clientIp && isIP(input.clientIp)) userData.client_ip_address = input.clientIp;
  if (input.fbp?.startsWith("fb.1.")) userData.fbp = input.fbp;
  if (input.fbc?.startsWith("fb.1.")) userData.fbc = input.fbc;
  if (input.email) userData.em = sha256(input.email.trim().toLowerCase());
  if (input.phone) {
    const digits = input.phone.replace(/\D/g, "");
    const normalized = digits.length === 10 ? `52${digits}` : digits;
    if (normalized) userData.ph = sha256(normalized);
  }

  return {
    event_name: input.name,
    event_time: Math.floor((input.now ?? Date.now()) / 1000),
    event_id: input.eventId,
    event_source_url: input.sourceUrl,
    action_source: "website",
    user_data: userData,
  };
}
