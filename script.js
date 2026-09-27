// This script manages the tab switching, progress tracking, daily checklist state,
// countdown timer, and local persistence using sessionStorage for a more realistic client portal experience.

const tabButtons = document.querySelectorAll('.nav-item');
const tabPanels = document.querySelectorAll('.tab-panel');
const trackerInputs = document.querySelectorAll('[data-week]');
const progressBar = document.getElementById('progress-bar');
const miniProgressBar = document.getElementById('mini-progress-bar');
const progressPercent = document.getElementById('progress-percent');
const completedWeeksLabel = document.getElementById('completed-weeks');
const checklistInputs = document.querySelectorAll('[data-check]');
const saveChecklistButton = document.getElementById('save-checklist');
const checklistMessage = document.getElementById('checklist-message');
const weightForm = document.getElementById('weight-form');
const weightInput = document.getElementById('weight-input');
const heightInput = document.getElementById('height-input');
const weightMessage = document.getElementById('weight-message');
const timelineSteps = document.querySelectorAll('.timeline-step');

// Switch active tab without reloading the page.
function activateTab(tabId) {
  tabButtons.forEach((button) => {
    const isActive = button.dataset.tab === tabId;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-selected', String(isActive));
  });

  tabPanels.forEach((panel) => {
    panel.classList.toggle('active', panel.id === tabId);
  });
}

tabButtons.forEach((button) => {
  button.addEventListener('click', () => activateTab(button.dataset.tab));
});

// Update the 12-week visual tracker and save completion state in sessionStorage.
function updateTrackerProgress() {
  const completedCount = [...trackerInputs].filter((input) => input.checked).length;
  const total = trackerInputs.length;
  const percent = Math.round((completedCount / total) * 100);

  progressBar.style.width = `${percent}%`;
  miniProgressBar.style.width = `${percent}%`;
  progressPercent.textContent = `${percent}%`;
  completedWeeksLabel.textContent = String(completedCount);

  const savedProgress = {};
  trackerInputs.forEach((input) => {
    savedProgress[input.dataset.week] = input.checked;
  });

  sessionStorage.setItem('ak12Weeks', JSON.stringify(savedProgress));
}

function loadTrackerProgress() {
  const savedProgress = JSON.parse(sessionStorage.getItem('ak12Weeks') || '{}');

  trackerInputs.forEach((input) => {
    const weekNumber = input.dataset.week;
    input.checked = Boolean(savedProgress[weekNumber]);
  });

  updateTrackerProgress();
}

trackerInputs.forEach((input) => {
  input.addEventListener('change', updateTrackerProgress);
});

// Save daily checklist values in sessionStorage.
function updateChecklistState() {
  const savedValues = {};

  checklistInputs.forEach((input) => {
    savedValues[input.dataset.check] = input.checked;
  });

  sessionStorage.setItem('ak12Checklist', JSON.stringify(savedValues));
}

function loadChecklistState() {
  const savedValues = JSON.parse(sessionStorage.getItem('ak12Checklist') || '{}');

  checklistInputs.forEach((input) => {
    const key = input.dataset.check;
    input.checked = Boolean(savedValues[key]);
  });
}

function updateChecklistMessage() {
  const checkedCount = [...checklistInputs].filter((input) => input.checked).length;
  const totalCount = checklistInputs.length;

  if (checkedCount === totalCount) {
    checklistMessage.textContent = 'أحسنت! لقد أنهيت يومك بشكل ممتاز.';
    checklistMessage.style.color = '#66fcf1';
    return;
  }

  if (checkedCount >= Math.ceil(totalCount / 2)) {
    checklistMessage.textContent = 'رائع! أنت على الطريق الصحيح، استمر بنفس الت momentum.';
    checklistMessage.style.color = '#66fcf1';
    return;
  }

  if (checkedCount > 0) {
    checklistMessage.textContent = 'خطوة جيدة، ما زال لديك فرصة لإكمال الباقي اليوم.';
    checklistMessage.style.color = '#ffd166';
    return;
  }

  checklistMessage.textContent = 'ابدأ بخطوة صغيرة اليوم، أنت قادر على ذلك.';
  checklistMessage.style.color = '#ff9ca7';
}

checklistInputs.forEach((input) => {
  input.addEventListener('change', () => {
    updateChecklistState();
    updateChecklistMessage();
  });
});

saveChecklistButton.addEventListener('click', () => {
  const savedValues = {};

  checklistInputs.forEach((input) => {
    savedValues[input.dataset.check] = input.checked;
  });

  sessionStorage.setItem('ak12Checklist', JSON.stringify(savedValues));

  const checkedCount = [...checklistInputs].filter((input) => input.checked).length;

  if (checkedCount === checklistInputs.length) {
    checklistMessage.textContent = 'تم حفظ التزام اليوم بنجاح. أحسنت!';
  } else if (checkedCount > 0) {
    checklistMessage.textContent = 'تم حفظ التزام اليوم بنجاح. استمر، أنت قريب.';
  } else {
    checklistMessage.textContent = 'تم حفظ التزام اليوم بنجاح. ابدأ بخطوة صغيرة اليوم.';
  }

  checklistMessage.style.color = '#66fcf1';
});

updateChecklistMessage();

// Save the logged weight and provide realistic confirmation feedback.
weightForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const weight = Number.parseFloat(weightInput.value);
  const height = Number.parseFloat(heightInput.value);

  if (weightForm.querySelector('[data-form-action="height"]') === event.submitter) {
    if (!Number.isFinite(height) || height <= 0) {
      weightMessage.textContent = 'يرجى إدخال طول صحيح قبل الحفظ.';
      weightMessage.style.color = '#ff9ca7';
      return;
    }

    sessionStorage.setItem('ak12Height', String(height));
    weightMessage.textContent = 'تم تسجيل الطول بنجاح للمتابعة.';
    weightMessage.style.color = '#66fcf1';
    return;
  }

  if (!Number.isFinite(weight) || weight <= 0) {
    weightMessage.textContent = 'يرجى إدخال وزن صحيح قبل الحفظ.';
    weightMessage.style.color = '#ff9ca7';
    return;
  }

  sessionStorage.setItem('ak12Weight', String(weight));
  weightMessage.textContent = 'تم تسجيل الوزن بنجاح للمتابعة الأسبوعية.';
  weightMessage.style.color = '#66fcf1';
});

function loadSavedWeight() {
  const savedWeight = sessionStorage.getItem('ak12Weight');
  const savedHeight = sessionStorage.getItem('ak12Height');

  if (savedWeight) {
    weightInput.value = savedWeight;
  }

  if (savedHeight) {
    heightInput.value = savedHeight;
  }

  if (savedWeight && savedHeight) {
    weightMessage.textContent = `آخر وزن مسجل: ${savedWeight} كغم | آخر طول مسجل: ${savedHeight} سم`;
    weightMessage.style.color = '#66fcf1';
  } else if (savedWeight) {
    weightMessage.textContent = `آخر وزن مسجل: ${savedWeight} كغم`;
    weightMessage.style.color = '#66fcf1';
  } else if (savedHeight) {
    weightMessage.textContent = `آخر طول مسجل: ${savedHeight} سم`;
    weightMessage.style.color = '#66fcf1';
  }
}

// Highlight timeline steps on hover or click.
timelineSteps.forEach((step) => {
  step.addEventListener('mouseenter', () => {
    timelineSteps.forEach((item) => item.classList.remove('active'));
    step.classList.add('active');
  });

  step.addEventListener('click', () => {
    timelineSteps.forEach((item) => item.classList.remove('active'));
    step.classList.add('active');
  });
});

// Countdown timer for the weekly Sunday report check-in.
function getNextSundayDeadline() {
  const now = new Date();
  const nextSunday = new Date(now);
  const currentDay = now.getDay();
  const daysUntilSunday = (7 - currentDay) % 7;

  nextSunday.setDate(now.getDate() + (daysUntilSunday === 0 ? 7 : daysUntilSunday));
  nextSunday.setHours(18, 0, 0, 0);

  if (now.getDay() === 0 && now.getHours() >= 18) {
    nextSunday.setDate(nextSunday.getDate() + 7);
  }

  return nextSunday;
}

function updateCountdown() {
  const deadline = getNextSundayDeadline();
  const difference = deadline.getTime() - Date.now();

  if (difference <= 0) {
    document.getElementById('days').textContent = '00';
    document.getElementById('hours').textContent = '00';
    document.getElementById('minutes').textContent = '00';
    document.getElementById('seconds').textContent = '00';
    return;
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / (1000 * 60)) % 60);
  const seconds = Math.floor((difference / 1000) % 60);

  document.getElementById('days').textContent = String(days).padStart(2, '0');
  document.getElementById('hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
  document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

setInterval(updateCountdown, 1000);
updateCountdown();

// Initialize all persisted states on first load.
loadTrackerProgress();
loadChecklistState();
loadSavedWeight();
