import { readBlockConfig } from '../../scripts/aem.js';
import { dispatchCustomEvent } from '../../scripts/custom-events.js';

function getSubmitLink(block, config) {
  // readBlockConfig uses toClassName(label) so "Submit button link" -> "submit-button-link"
  const fromConfig = (config['submit-button-link'] ?? config['submit-link'] ?? config.redirectUrl ?? config.submitLink ?? '').toString().trim();
  if (fromConfig) return fromConfig;
  // UE may use data-aue-prop="submitLink" or "submit-link"
  const propEl = block.querySelector('[data-aue-prop="submitLink"]') || block.querySelector('[data-aue-prop="submit-link"]');
  if (propEl) {
    const a = propEl.querySelector('a[href]');
    const href = a?.getAttribute('href')?.trim();
    if (href) return href;
    const text = (propEl.textContent || propEl.innerText || '').trim();
    if (text) return text;
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
            value: "checking-account",
            properties: { colspan: 12 },
          },
          {
            id: "transfer-to",
            name: "transferTo",
            fieldType: "drop-down",
            label: { value: "Transfer to" },
            enum: ["Retirement Account"],
            value: "retirement-account",
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
  const form = formContainer.querySelector('form');
  if (!form) return;
  const REDIRECT_PATH_AFTER_TRANSFER = '/en/dashboard/submitted-successfully';
  function redirectAfterTransferSubmit() {
    setTimeout(() => {
      window.location.href = REDIRECT_PATH_AFTER_TRANSFER;
    }, 2000);
  }
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    event.stopPropagation();
    dispatchCustomEvent('transfer-funds-form-submit');
    redirectAfterTransferSubmit();
  });
}
