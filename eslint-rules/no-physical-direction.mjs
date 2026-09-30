/**
 * Forbids physical (left/right) Tailwind utilities in class strings.
 * The app renders in both RTL (ar) and LTR (en), so layout must use logical
 * utilities (ms-/me-/ps-/pe-/start-/end-/text-start …) that flip with `dir`.
 */

const REPLACEMENTS = [
  [/^-?ml-/, "ms-"],
  [/^-?mr-/, "me-"],
  [/^pl-/, "ps-"],
  [/^pr-/, "pe-"],
  [/^-?left-/, "start-"],
  [/^-?right-/, "end-"],
  [/^text-left$/, "text-start"],
  [/^text-right$/, "text-end"],
  [/^float-left$/, "float-start"],
  [/^float-right$/, "float-end"],
  [/^clear-left$/, "clear-start"],
  [/^clear-right$/, "clear-end"],
  [/^border-l(-|$)/, "border-s"],
  [/^border-r(-|$)/, "border-e"],
  [/^rounded-l(-|$)/, "rounded-s"],
  [/^rounded-r(-|$)/, "rounded-e"],
  [/^rounded-(tl|bl)(-|$)/, "rounded-ss / rounded-es"],
  [/^rounded-(tr|br)(-|$)/, "rounded-se / rounded-ee"],
  [/^scroll-m[lr]-/, "scroll-ms- / scroll-me-"],
  [/^scroll-p[lr]-/, "scroll-ps- / scroll-pe-"],
];

/** Returns the suggested logical replacement, or null if the class is fine. */
export function findPhysicalClass(token) {
  // Strip variants (md:, hover:, rtl:) and the important modifier.
  const base = token.split(":").pop()?.replace(/^!/, "") ?? "";
  for (const [pattern, suggestion] of REPLACEMENTS) {
    if (pattern.test(base)) return suggestion;
  }
  return null;
}

const CLASS_ATTRIBUTES = new Set(["className", "class"]);
const CLASS_HELPERS = new Set(["cn", "clsx", "cva", "twMerge"]);

function isClassHelperCall(node) {
  return node.callee.type === "Identifier" && CLASS_HELPERS.has(node.callee.name);
}

/** @type {import("eslint").Rule.RuleModule} */
const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow physical left/right Tailwind utilities; use logical ones so RTL and LTR both work.",
    },
    schema: [],
    messages: {
      physical:
        "'{{token}}' is a physical-direction utility and breaks when the page flips between RTL and LTR. Use '{{suggestion}}' instead.",
    },
  },
  create(context) {
    function checkText(node, text) {
      for (const token of text.split(/\s+/)) {
        if (!token) continue;
        const suggestion = findPhysicalClass(token);
        if (suggestion) {
          context.report({ node, messageId: "physical", data: { token, suggestion } });
        }
      }
    }

    function checkExpression(node) {
      if (!node) return;
      switch (node.type) {
        case "Literal":
          if (typeof node.value === "string") checkText(node, node.value);
          break;
        case "TemplateLiteral":
          for (const quasi of node.quasis) checkText(quasi, quasi.value.cooked ?? "");
          node.expressions.forEach(checkExpression);
          break;
        case "ConditionalExpression":
          checkExpression(node.consequent);
          checkExpression(node.alternate);
          break;
        case "LogicalExpression":
          checkExpression(node.left);
          checkExpression(node.right);
          break;
        case "ArrayExpression":
          node.elements.forEach(checkExpression);
          break;
        case "ObjectExpression":
          for (const prop of node.properties) {
            if (prop.type === "Property") {
              if (prop.key.type === "Literal") checkExpression(prop.key);
              checkExpression(prop.value);
            }
          }
          break;
        case "CallExpression":
          // Known class helpers are checked by the CallExpression visitor below.
          if (!isClassHelperCall(node)) node.arguments.forEach(checkExpression);
          break;
      }
    }

    return {
      JSXAttribute(node) {
        if (!CLASS_ATTRIBUTES.has(node.name.name) || !node.value) return;
        if (node.value.type === "Literal") checkExpression(node.value);
        else if (node.value.type === "JSXExpressionContainer") {
          checkExpression(node.value.expression);
        }
      },
      CallExpression(node) {
        if (isClassHelperCall(node)) node.arguments.forEach(checkExpression);
      },
    };
  },
};

export default rule;
