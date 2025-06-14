let currentDate = new Date();

console.log("✅ script.js 실행됨");


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

function setupPopup() {
  const openBtn = document.getElementById('open-settings'); // 수정됨
  const closeBtn = document.getElementById('close-settings'); // 수정됨
  const popup = document.getElementById('settings-popup'); // 수정됨

  if (openBtn && closeBtn && popup) {
    openBtn.addEventListener('click', () => {
      popup.classList.remove('hidden');
    });

    closeBtn.addEventListener('click', () => {
      popup.classList.add('hidden');
    });

    window.addEventListener('click', (event) => {
      if (event.target === popup) {
        popup.classList.add('hidden');
      }
    });
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

  // 팝업 설정
  setupPopup();

    // 로그인 상태 기반 버튼 토글
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  console.log("📌 로그인 상태:", isLoggedIn);

  const loginLink = document.getElementById("login-link");
  const registerLink = document.getElementById("register-link");
  const logoutLink = document.getElementById("logout");
  const deleteAccountLink = document.getElementById("delete-account");

  if (isLoggedIn) {
    loginLink.style.display = "none";
    registerLink.style.display = "none";
    logoutLink.style.display = "inline";
    deleteAccountLink.style.display = "inline";
  } else {
    loginLink.style.display = "inline";
    registerLink.style.display = "inline";
    logoutLink.style.display = "none";
    deleteAccountLink.style.display = "none";
  }

  // 로그아웃 동작
  logoutLink.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.setItem("isLoggedIn", "false");
    alert("You have been logged out.");
    window.location.href = "login.html";
  });

  // 회원탈퇴 동작
  deleteAccountLink.addEventListener("click", (e) => {
    e.preventDefault();
    if (confirm("정말로 계정을 삭제하시겠습니까?")) {
      localStorage.setItem("isLoggedIn", "false");
      alert("계정이 삭제되었습니다.");
      location.reload();
    }
  });

});

document.getElementById('saveGoals').addEventListener('click', () => {
  const height = document.getElementById('height').value;
  const weight = document.getElementById('weight').value;
  const calories = document.getElementById('targetCalories').value;
  const protein = document.getElementById('targetProtein').value;

  // 예시로 콘솔 출력
  console.log(`Height: ${height}, Weight: ${weight}`);
  console.log(`Target Calories: ${calories}, Target Protein: ${protein}`);

  // 팝업 닫기
  document.getElementById('goal-popup').classList.add('hidden');
});
