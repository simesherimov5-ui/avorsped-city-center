// The privacy policy: structure only, no text yet. TODO(client): the policy text (see docs/content-needed.md).
// The page /privacy stays unpublished (it answers 404, it is not in the sitemap and nothing links to it) until
// PRIVACY_PUBLISHED is switched to true. Then link it from the footer and put one line under the booking form.

export const PRIVACY_PUBLISHED = false;

export type PrivacySection = {
  heading: string;
  /** One string per paragraph. */
  paragraphs: string[];
};

export type PrivacyPolicy = {
  /** When the text was last changed, as shown to visitors, e.g. "1 ноември 2026". */
  updated: string;
  /** Who is responsible for the data (the company's name, address and a contact e-mail). */
  controller: { name: string; address: string; email: string };
  sections: PrivacySection[];
};

export const privacyPolicy: PrivacyPolicy = {
  updated: "",
  controller: { name: "", address: "", email: "" },
  sections: [],
};
