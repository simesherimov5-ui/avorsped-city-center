import { describe, expect, it } from "vitest";
import { contactHref } from "@/lib/contact-link";

describe("contactHref", () => {
  it("is the plain Контакт page on ordinary pages", () => {
    expect(contactHref("/")).toBe("/contact");
    expect(contactHref("/about")).toBe("/contact");
    expect(contactHref("/projects")).toBe("/contact");
    expect(contactHref("/contact")).toBe("/contact");
  });

  it("carries the apartment, building or project being looked at", () => {
    expect(contactHref("/apartments/b01-f1-101")).toBe("/contact?apartment=b01-f1-101");
    expect(contactHref("/development/b01")).toBe("/contact?building=b01");
    expect(contactHref("/development/b01/2")).toBe("/contact?building=b01");
    expect(contactHref("/projects/city-center")).toBe("/contact?project=city-center");
    expect(contactHref("/dojran")).toBe("/contact?project=dojranski-raj");
    expect(contactHref("/dojran/2")).toBe("/contact?project=dojranski-raj");
  });
});
