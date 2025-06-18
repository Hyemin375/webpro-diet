
let currentDate = new Date();

function updateCalendarDisplay() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  document.getElementById('current-month-year').textContent =
    `${monthNames[month]} ${year}`;

  document.getElementById('year-select').value = year;

  generateCalendar(year, month);
}

function generateCalendar(year, month) {
  const calendar = document.getElementById('calendar-placeholder');
  calendar.innerHTML = '';

  const date = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0).getDate();
  const startDay = date.getDay();

  const table = document.createElement('table');
  table.classList.add('calendar-table');

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const headerRow = document.createElement('tr');
  for (const d of days) {
    const th = document.createElement('th');
    th.textContent = d;
    headerRow.appendChild(th);
  }
  table.appendChild(headerRow);

  let row = document.createElement('tr');
  for (let i = 0; i < startDay; i++) {
    row.appendChild(document.createElement('td'));
  }

  for (let day = 1; day <= lastDay; day++) {
    const cell = document.createElement('td');
    cell.textContent = day;

    const today = new Date();
    if (
      year === today.getFullYear() &&
      month === today.getMonth() &&
      day === today.getDate()
    ) {
      cell.classList.add('today');
    }

    row.appendChild(cell);

    if ((startDay + day) % 7 === 0 || day === lastDay) {
      table.appendChild(row);
      row = document.createElement('tr');
    }
  }

  calendar.appendChild(table);
}

function populateYearDropdown() {
  const yearSelect = document.getElementById('year-select');
  const currentYear = new Date().getFullYear();

  for (let y = currentYear - 10; y <= currentYear + 10; y++) {
    const option = document.createElement('option');
    option.value = y;
    option.textContent = y;
    yearSelect.appendChild(option);
  }

  yearSelect.addEventListener('change', () => {
    const selectedYear = parseInt(yearSelect.value);
    currentDate.setFullYear(selectedYear);
    updateCalendarDisplay();
  });
}

function applyProgressColor(progress) {
  const value = parseFloat(progress.value);
  const max = parseFloat(progress.max);
  const percent = (value / max) * 100;

  if (percent < 50) {
    progress.style.setProperty('accent-color', '#e74c3c'); // 빨간색
  } else if (percent < 80) {
    progress.style.setProperty('accent-color', '#f39c12'); // 주황색
  } else {
    progress.style.setProperty('accent-color', '#27ae60'); // 초록색
  }
}


document.addEventListener('DOMContentLoaded', () => {
  
  document.getElementById('prev-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendarDisplay();
  });

  document.getElementById('next-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendarDisplay();
  });

  populateYearDropdown();
  updateCalendarDisplay();

  // 색상 적용
  document.querySelectorAll('.progress-bar').forEach((progress) => {
    applyProgressColor(progress);
  });
});

function applyIndividualProgressColors() {
  const progressBars = document.querySelectorAll('.progress-bar');

  progressBars.forEach((bar) => {
    const container = bar.previousElementSibling; // 바로 위에 <p> 요소

    const currSpan = container.querySelector('.curr-val');
    const maxSpan = container.querySelector('.max-val');

    if (!currSpan || !maxSpan) return;

    const curr = parseFloat(currSpan.textContent);
    const max = parseFloat(maxSpan.textContent);
    const percent = (curr / max) * 100;

    let color;
    if (percent <= 40) color = 'red';
    else if (percent < 100) color = 'orange';
    else if (percent == 100) color = 'green';
    else color = 'green';

    bar.style.setProperty('--bar-color', color);
  });
}
applyIndividualProgressColors();

