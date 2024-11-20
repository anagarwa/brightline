import createField from './form-fields.js';
import {readBlockConfig} from "../../scripts/aem.js";

async function createForm(blockConfig) {
  // const { pathname } = new URL(formHref);
  // const resp = await fetch(pathname);
  // const json = await resp.json();

  let fieldJsonArray = [];
  const form = document.createElement('form');

  for (const [key, value] of Object.entries(blockConfig)) {
        console.log(`${key}: ${value}`);
        if (key === 'action') {
            form.dataset.action = value;
        } else if (key === 'submit') {
          let fieldJson = {
                  "Name": "submit",
                  "Type": "submit",
                  "Label": value,
                  "Placeholder": "",
                  "Value": value,
                  "Options": "",
                  "Mandatory": "",
                  "Style": "",
                  "ID": "",
                  "Fieldset": ""
              };
              fieldJsonArray.push(fieldJson);
          } else {
            const fieldJson = {
                "Name": "",
                "Type": "text",
                "Label": value,
                "Placeholder": "",
                "Value": "",
                "Options": "",
                "Mandatory": "true",
                "Style": "",
                "ID": "",
                "Fieldset": "quoteFS"
            };
            fieldJsonArray.push(fieldJson);
        }

  }

  const json = fieldJsonArray;// await resp.json();


  // form.dataset.action = blockConfig.action;

  const fields = await Promise.all(json.map((fd) => createField(fd, form)));
  fields.forEach((field) => {
    if (field) {
      form.append(field);
    }
  });

  // group fields into fieldsets
  const fieldsets = form.querySelectorAll('fieldset');
  fieldsets.forEach((fieldset) => {
    form.querySelectorAll(`[data-fieldset="${fieldset.name}"`).forEach((field) => {
      fieldset.append(field);
    });
  });

  return form;
}

function generatePayload(form) {
  const payload = {};

  [...form.elements].forEach((field) => {
    if (field.name && field.type !== 'submit' && !field.disabled) {
      if (field.type === 'radio') {
        if (field.checked) payload[field.name] = field.value;
      } else if (field.type === 'checkbox') {
        if (field.checked) payload[field.name] = payload[field.name] ? `${payload[field.name]},${field.value}` : field.value;
      } else {
        payload[field.name] = field.value;
      }
    }
  });
  return payload;
}

async function handleSubmit(form) {
  if (form.getAttribute('data-submitting') === 'true') return;

  const submit = form.querySelector('button[type="submit"]');
  try {
    form.setAttribute('data-submitting', 'true');
    submit.disabled = true;

    // create payload
    const payload = generatePayload(form);
    const response = await fetch(form.dataset.action, {
      method: 'POST',
      body: JSON.stringify({ data: payload }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      if (form.dataset.confirmation) {
        window.location.href = form.dataset.confirmation;
      }
    } else {
      const error = await response.text();
      throw new Error(error);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  } finally {
    form.setAttribute('data-submitting', 'false');
    submit.disabled = false;
  }
}

export default async function decorate(block) {
    const {heading, logo, ...blockConfig} = readBlockConfig(block);
    const pictureDiv = block.children[1].children[1].children[0];

    block.innerHTML = '';
  const formHeading = document.createElement('div');
  formHeading.classList.add('form-heading');
  formHeading.innerHTML = `<h2>${heading}</h2>`;
  block.append(formHeading);

    const formLogo = document.createElement('div');
    formLogo.classList.add('form-logo');
    formLogo.innerHTML = `<picture>${pictureDiv.innerHTML}</picture>`;
    block.append(formLogo);

  const form = await createForm(blockConfig);
  const requiredFieldsText = document.createElement('p');
    requiredFieldsText.classList.add('required-fields');
  requiredFieldsText.innerHTML = '* indicates a required field';

  const disclaimerDiv = document.createElement('div');
  disclaimerDiv.classList.add('disclaimer');
  disclaimerDiv.innerHTML = `<p>By signing up for emails, you agree to our  <a href="/privacy-policy">Privacy Policy</a></p>`;
  const formDiv = document.createElement('div');
  formDiv.classList.add('form-container');
  formDiv.append(requiredFieldsText);
  formDiv.append(form);
  formDiv.append(disclaimerDiv);
  block.append(formDiv);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const valid = form.checkValidity();
    if (valid) {
      handleSubmit(form);
    } else {
      const firstInvalidEl = form.querySelector(':invalid:not(fieldset)');
      if (firstInvalidEl) {
        firstInvalidEl.focus();
        firstInvalidEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });

    const inputs = block.querySelectorAll('input');

// Add event listeners for focus and blur events
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            const label = document.querySelector(`label[for="${input.id}"]`);
            if (label) {
                label.classList.add('label-focused');
            }
        });

        input.addEventListener('blur', function() {
            const label = document.querySelector(`label[for="${input.id}"]`);
            if (label && input.value === '') {
                label.classList.remove('label-focused');
            }
        });
    });
}
