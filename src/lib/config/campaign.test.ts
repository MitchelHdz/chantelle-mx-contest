import { describe, expect, it } from "vitest";

import { isRegistrationClosed } from "./campaign";

describe("cierre de registros", () => {
  it("acepta registros durante todo el 15 de noviembre en Ciudad de México y cierra el 16", () => {
    expect(isRegistrationClosed(Date.parse("2026-11-16T05:59:59.999Z"))).toBe(false);
    expect(isRegistrationClosed(Date.parse("2026-11-16T06:00:00.000Z"))).toBe(true);
  });
});
