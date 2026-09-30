import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import rule from "../eslint-rules/no-physical-direction.mjs";

RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

tester.run("no-physical-direction", rule, {
  valid: [
    `<div className="ms-4 me-2 ps-3 pe-1 start-0 end-4 text-start border-s rounded-e" />`,
    `<div className="mx-4 px-2 mt-3 left" />`,
    `<div className={cn("ms-2", active && "text-end")} />`,
    "<div className={`ps-${size}`} />",
    `const label = "left-handed";`,
  ],
  invalid: [
    { code: `<div className="ml-4" />`, errors: [{ messageId: "physical" }] },
    { code: `<div className="md:pr-2 hover:right-0" />`, errors: 2 },
    { code: `<div className="-mr-1 text-left" />`, errors: 2 },
    { code: `<div className="border-l-2 rounded-tr-lg" />`, errors: 2 },
    { code: `<div className={cn("pl-2", cond ? "left-0" : "end-0")} />`, errors: 2 },
    { code: "<div className={`float-right ${x}`} />", errors: 1 },
    { code: `<div class="!ml-2" />`, errors: 1 },
    { code: `<div className={custom ?? "pl-4"} />`, errors: 1 },
    { code: `<div className={"mr-2" || fallback} />`, errors: 1 },
  ],
});
