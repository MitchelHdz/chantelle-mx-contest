import { createHash, randomUUID } from "node:crypto";

const eventTime = Math.floor(Date.now() / 1000);
const sourceUrl = "https://chantelletellevaaparis.com/";
const userData = {
  client_ip_address: "192.0.2.1",
  client_user_agent: "Meta-CAPI-test/1.0",
};

const data = ["PageView", "CompleteRegistration"].map((eventName) => ({
  event_name: eventName,
  event_time: eventTime,
  event_id: `test-${randomUUID()}`,
  event_source_url: sourceUrl,
  action_source: "website",
  user_data: eventName === "CompleteRegistration" ? {
    ...userData,
    em: createHash("sha256").update("test@example.com").digest("hex"),
    ph: createHash("sha256").update("525512345678").digest("hex"),
  } : userData,
}));

console.log(JSON.stringify({
  data,
  ...(process.env.META_TEST_EVENT_CODE ? { test_event_code: process.env.META_TEST_EVENT_CODE } : {}),
}, null, 2));
