import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Repo guardrails (see CLAUDE.md "Conventions"). Each baseline list below is a known violation.
// Roadmap item 2 (and 3 for the data imports) fixes them and deletes the list; never add to one.

const UI_FILES = ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "lib/**/*.{ts,tsx}"];

// Colours come from the tokens in app/globals.css. Six-digit hex only, so "#anchor" strings pass.
const NO_HEX_COLOUR = [
  {
    selector: "Literal[value=/#[0-9a-fA-F]{6}\\b/]",
    message: "Use a colour token from app/globals.css instead of a hex literal.",
  },
  {
    selector: "TemplateElement[value.raw=/#[0-9a-fA-F]{6}\\b/]",
    message: "Use a colour token from app/globals.css instead of a hex literal.",
  },
];

// Apartment status labels come from lib/format.ts (statusLabel).
const LABEL_WORDS = "Достапен|Резервиран|Продаден";
const NO_LABEL_LITERAL = ["Literal", "JSXText"].map((node) => ({
  selector: `${node}[value=/^\\s*(${LABEL_WORDS})\\s*$/]`,
  message: "Status labels come from lib/format.ts (statusLabel).",
}));

const HEX_BASELINE = ["components/FloorPlan.tsx"];
const LABEL_BASELINE = ["components/ApartmentFilters.tsx"];

// Components must not import the dataset; pages pass plain props (roadmap item 3).
const DATA_IMPORT_BASELINE = [
  "components/ApartmentCard.tsx",
  "components/ApartmentFilters.tsx",
  "components/BookingForm.tsx",
  "components/CompareBar.tsx",
  "components/DojranFacade.tsx",
  "components/Footer.tsx",
  "components/Hero.tsx",
  "components/OtherProjects.tsx",
];

const noNextImage = {
  paths: [{ name: "next/image", message: "Project photography goes through components/ui/Media.tsx." }],
};
const noDataImport = {
  patterns: [{ group: ["@/data", "@/data/*"], message: "Components receive data as props; pages import @/data." }],
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: UI_FILES,
    rules: {
      "no-restricted-syntax": ["error", ...NO_HEX_COLOUR, ...NO_LABEL_LITERAL],
      "no-restricted-imports": ["error", noNextImage],
    },
  },
  {
    files: ["components/**/*.{ts,tsx}"],
    rules: { "no-restricted-imports": ["error", { ...noNextImage, ...noDataImport }] },
  },
  // Baselines and sanctioned homes. Later blocks replace the rule, so each lists what still applies.
  { files: HEX_BASELINE, rules: { "no-restricted-syntax": ["error", ...NO_LABEL_LITERAL] } },
  { files: LABEL_BASELINE, rules: { "no-restricted-syntax": ["error", ...NO_HEX_COLOUR] } },
  {
    files: DATA_IMPORT_BASELINE,
    rules: { "no-restricted-imports": ["error", noNextImage] },
  },
  { files: ["lib/format.ts", "**/*.test.{ts,tsx}"], rules: { "no-restricted-syntax": ["error", ...NO_HEX_COLOUR] } },
  { files: ["components/ui/Media.tsx"], rules: { "no-restricted-imports": ["error", noDataImport] } },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
