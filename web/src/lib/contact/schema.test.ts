import { describe, it, expect } from "vitest";
import { contactSchema, toFieldErrors } from "./schema";

const valid = {
  name: "Sara",
  company: "",
  email: "sara@example.com",
  phone: "",
  division: "woodworks",
  projectType: "",
  message: "We need a hotel fit-out.",
};

describe("contactSchema", () => {
  it("accepts a minimal valid submission", () => {
    const r = contactSchema.safeParse(valid);
    expect(r.success).toBe(true);
  });

  it("normalizes omitted optional fields to empty strings", () => {
    const r = contactSchema.safeParse({
      name: "Sara",
      email: "sara@example.com",
      division: "blue",
      message: "hi",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.company).toBe("");
      expect(r.data.phone).toBe("");
      expect(r.data.projectType).toBe("");
    }
  });

  it("requires name, email, division, message", () => {
    const r = contactSchema.safeParse({
      name: "",
      email: "",
      division: "",
      message: "",
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      const codes = toFieldErrors(r.error);
      expect(codes.name).toBe("required");
      expect(codes.email).toBe("required");
      expect(codes.division).toBe("required");
      expect(codes.message).toBe("required");
    }
  });

  it("flags a malformed email as invalidEmail (not required)", () => {
    const r = contactSchema.safeParse({ ...valid, email: "notanemail" });
    expect(r.success).toBe(false);
    if (!r.success) expect(toFieldErrors(r.error).email).toBe("invalidEmail");
  });

  it("treats a blank email as required, not invalidEmail", () => {
    const r = contactSchema.safeParse({ ...valid, email: "   " });
    expect(r.success).toBe(false);
    if (!r.success) expect(toFieldErrors(r.error).email).toBe("required");
  });

  it("rejects an unknown division code", () => {
    const r = contactSchema.safeParse({ ...valid, division: "spaceship" });
    expect(r.success).toBe(false);
  });

  it("rejects an unknown projectType but allows empty", () => {
    expect(contactSchema.safeParse({ ...valid, projectType: "bogus" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, projectType: "hotel" }).success).toBe(true);
    expect(contactSchema.safeParse({ ...valid, projectType: "" }).success).toBe(true);
  });

  it("enforces max lengths (abuse bound)", () => {
    const r = contactSchema.safeParse({ ...valid, message: "x".repeat(4001) });
    expect(r.success).toBe(false);
  });
});
