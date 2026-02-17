'use strict';

type Options = {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
};

const generatePassword = (options: Options) => {
  const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const symbolChars = '!@#$%^&*()_+[]{}<>?';

  let availableChars = '';

  if (options.uppercase) {
    availableChars += upperChars;
  }

  if (options.lowercase) {
    availableChars += lowerChars;
  }

  if (options.numbers) {
    availableChars += numberChars;
  }

  if (options.symbols) {
    availableChars += symbolChars;
  }

  if (!availableChars) return '';

  let password = '';

  for (let i = 0; i < options.length; i++) {
    const randomIndex = Math.floor(Math.random() * availableChars.length);
    password += availableChars[randomIndex];
  }

  return password;
};

const calculateStrength = (password: string, options: Options) => {
  let score = 0;
  let types = 0;

  if (password.length >= 8) {
    score++;
  }

  if (password.length >= 12) {
    score++;
  }

  if (options.uppercase) {
    types++;
  }

  if (options.lowercase) {
    types++;
  }

  if (options.numbers) {
    types++;
  }

  if (options.symbols) {
    types++;
  }

  if (types >= 2) {
    score++;
  }

  if (types >= 4) {
    score++;
  }

  if (score <= 1) {
    return { classname: 'too-weak', score: 1, text: 'TOO WEAK!' };
  }

  if (score === 2) {
    return { classname: 'weak', score: 2, text: 'WEAK' };
  }

  if (score === 3) {
    return { classname: 'medium', score: 3, text: 'MEDIUM' };
  }

  return { classname: 'strong', score: 4, text: 'STRONG' };
};

const handleCopyButtonClick = () => {
  const input = document.querySelector<HTMLInputElement>('#passgen-main-input');
  const button = document.querySelector<HTMLButtonElement>(
    '#passgen-copy-button',
  );

  if (!input || !button) {
    return;
  }

  button.addEventListener('click', async (event: Event) => {
    event.preventDefault();

    try {
      await navigator.clipboard.writeText(input.value);
      button.classList.add('active');

      setTimeout(() => {
        button.classList.remove('active');
      }, 1500);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  });
};

const handleTypicalRangeInput = () => {
  const fields = document.querySelectorAll('.typical-range');

  if (!fields.length) {
    return;
  }

  fields.forEach((field) => {
    const output = field.querySelector('.typical-range__output');
    const input = field.querySelector<HTMLInputElement>(
      '.typical-range__input',
    );

    if (!output || !input) {
      return;
    }

    if (input.value === '0') {
      input.setCustomValidity("Character length can't be zero");
    } else {
      input.setCustomValidity('');
    }

    input.addEventListener('input', (event: Event) => {
      const min: number = Number(input.min);
      const max: number = Number(input.max);
      const currentValue: number = Number(input.value);

      input.style.backgroundSize =
        ((currentValue - min) / (max - min)) * 100 + '% 100%';

      if (event.target instanceof HTMLInputElement) {
        output.textContent = event.target.value;

        if (event.target.value === '0') {
          input.setCustomValidity("Character length can't be zero");
        } else {
          input.setCustomValidity('');
        }
      }
    });
  });
};

const handleStrengthIndicators = (result: {
  classname: string;
  score: number;
  text: string;
}) => {
  const container = document.querySelector('.indicators');
  const value = document.querySelector('.indicators__value');
  const points = document.querySelectorAll('.indicators__point');

  console.log(result);

  if (!container || !value || !points.length) {
    return;
  }

  container.classList.remove('too-weak');
  container.classList.remove('weak');
  container.classList.remove('medium');
  container.classList.remove('strong');
  container.classList.add(result.classname);

  value.textContent = result.text;

  points.forEach((point) => {
    point.classList.remove('active');
  });

  points.forEach((point) => {
    if (Number(point.getAttribute('data-point')) === result.score) {
      console.log(result.score);
      point.classList.add('active');
    }
  });
};

const handlePassgenFormSubmit = () => {
  const form = document.querySelector<HTMLFormElement>('#passgen-form');

  if (!form) {
    return;
  }

  const mainInput = form.querySelector<HTMLInputElement>('#passgen-main-input');
  const lengthRange = form.querySelector<HTMLInputElement>('#passgen-length');
  const checkboxes = [
    form.querySelector<HTMLInputElement>('#passgen-uppercase'),
    form.querySelector<HTMLInputElement>('#passgen-lowercase'),
    form.querySelector<HTMLInputElement>('#passgen-numbers'),
    form.querySelector<HTMLInputElement>('#passgen-symbols'),
  ];
  const submitButton = form.querySelector<HTMLButtonElement>(
    '.button[type=submit]',
  );

  if (!mainInput || !lengthRange || !checkboxes.length || !submitButton) {
    return;
  }

  form.addEventListener('submit', (event: Event) => {
    event.preventDefault();
  });

  submitButton.addEventListener('click', (event: Event) => {
    event.preventDefault();

    const hasChecked = checkboxes.some((checkbox) => checkbox?.checked);

    if (lengthRange.value === '0') {
      lengthRange.reportValidity();
      return;
    }

    if (checkboxes[0]) {
      if (hasChecked) {
        checkboxes[0].setCustomValidity('');
      } else {
        checkboxes[0].setCustomValidity('Please select at least one type');
        checkboxes[0].reportValidity();
        return;
      }
    }

    const formData = new FormData(form);
    const options = {
      length: Number(formData.get('passgen-length')),
      uppercase: formData.has('passgen-uppercase'),
      lowercase: formData.has('passgen-lowercase'),
      numbers: formData.has('passgen-numbers'),
      symbols: formData.has('passgen-symbols'),
    };

    const password = generatePassword(options);
    const strength = calculateStrength(password, options);

    if (mainInput) {
      mainInput.value = password;
      handleStrengthIndicators(strength);
    }
  });
};

const main = () => {
  handleCopyButtonClick();
  handleTypicalRangeInput();
  handlePassgenFormSubmit();
};

window.addEventListener('load', () => {
  main();
});
