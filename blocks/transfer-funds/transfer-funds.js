import { readBlockConfig } from '../../scripts/aem.js';

function getSubmitLink(block, config) {
  const fromConfig = config['submit-link'] ?? config.redirectUrl ?? config.submitLink ?? '';
  if (fromConfig) return fromConfig.trim();
  const propEl = block.querySelector('[data-aue-prop="submitLink"]');
  if (propEl) {
    const a = propEl.querySelector('a[href]');
    return (a?.getAttribute('href') || propEl.textContent || '').trim();
  }
  return '';
}

export default async function decorate(block) {
  const config = readBlockConfig(block) || {};
  const submitLink = getSubmitLink(block, config);

  const formDef = {
    id: "transfer-funds",
    fieldType: "form",
    appliedCssClassNames: "transfer-funds-form",
    ...(submitLink && { redirectUrl: submitLink }),
    items: [
      {
        id: "heading-transfer-funds",
        fieldType: "heading",
        label: { value: "Transfer funds" },
        appliedCssClassNames: "col-12",
      },
      {
        id: "panel-main",
        name: "main",
        fieldType: "panel",
        items: [
          {
            id: "transfer-from",
            name: "transferFrom",
            fieldType: "drop-down",
            label: { value: "Transfer from" },
            enum: ["Checking Account"],
            value: "Checking Account",
            properties: { colspan: 12 },
          },
          {
            id: "transfer-to",
            name: "transferTo",
            fieldType: "drop-down",
            label: { value: "Transfer to" },
            enum: ["Select account"],
            value: "Select account",
            properties: { colspan: 12 },
          },
          {
            id: "amount",
            name: "amount",
            fieldType: "text-input",
            label: { value: "Amount" },
            value: "$100.00",
            properties: { colspan: 12 },
          },
          {
            id: "submit-btn",
            name: "submitButton",
            fieldType: "button",
            buttonType: "submit",
            label: { value: "Submit" },
            appliedCssClassNames: "submit-wrapper col-12",
          },
        ],
      },
    ],
  };

  const formContainer = document.createElement("div");
  formContainer.className = "form";

  const pre = document.createElement("pre");
  const code = document.createElement("code");
  code.textContent = JSON.stringify(formDef);
  pre.append(code);
  formContainer.append(pre);
  block.replaceChildren(formContainer);

  const formModule = await import("../form/form.js");
  await formModule.default(formContainer);
}
