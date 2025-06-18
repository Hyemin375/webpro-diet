// calender.js (최종 버전 + 선택 날짜 하이라이팅 + 캘린더 셀 하이라이트)
let currentDate = new Date();
let selectedDate = null;
let mealData = {}; // 날짜별 식사 정보 저장

document.addEventListener("DOMContentLoaded", () => {
  populateYearDropdown();
  updateCalendarDisplay();
  bindCalendarControls();
  bindTrackingForm();

  document.getElementById("add-meal-form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!selectedDate) return;

    const meal = {
      food: document.getElementById("add-food").value,
      calories: +document.getElementById("add-calories").value,
      mealType: document.getElementById("add-meal-type").value,
      protein: +document.getElementById("add-protein").value || 0,
      fat: +document.getElementById("add-fat").value || 0,
      carbohydrate: +document.getElementById("add-carbohydrate").value || 0,
      sugar: +document.getElementById("add-sugar").value || 0,
      cholesterol: +document.getElementById("add-cholesterol").value || 0
    };

    if (!mealData[selectedDate]) mealData[selectedDate] = [];
    mealData[selectedDate].push(meal);

    loadMealsForDate(selectedDate);
    updateCalendarDisplay();
    e.target.reset();
  });
});

function bindCalendarControls() {
  document.getElementById("prev-month").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendarDisplay();
  });

  document.getElementById("next-month").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendarDisplay();
  });
}

function populateYearDropdown() {
  const yearSelect = document.getElementById("year-select");
  const currentYear = new Date().getFullYear();
  yearSelect.innerHTML = "";

  for (let y = currentYear - 5; y <= currentYear + 5; y++) {
    const option = document.createElement("option");
    option.value = y;
    option.textContent = y;
    yearSelect.appendChild(option);
  }

  yearSelect.value = currentDate.getFullYear();
  yearSelect.addEventListener("change", () => {
    currentDate.setFullYear(parseInt(yearSelect.value));
    updateCalendarDisplay();
  });
}

function updateCalendarDisplay() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  document.getElementById("current-month-year").textContent = `${monthNames[month]} ${year}`;
  generateCalendar(year, month);
}

function generateCalendar(year, month) {
  const calendar = document.getElementById("calendar-placeholder");
  calendar.innerHTML = "";

  const date = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0).getDate();
  const startDay = date.getDay();

  const table = document.createElement("table");
  table.classList.add("calendar-table");

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const headerRow = document.createElement("tr");
  days.forEach(d => {
    const th = document.createElement("th");
    th.textContent = d;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  let row = document.createElement("tr");
  for (let i = 0; i < startDay; i++) row.appendChild(document.createElement("td"));

  for (let day = 1; day <= lastDay; day++) {
    const cell = document.createElement("td");
    const thisDate = new Date(year, month, day);
    const dateStr = thisDate.toISOString().split("T")[0];

    cell.textContent = day;
    cell.classList.add("calendar-cell");
    if (mealData[dateStr]) cell.classList.add("has-data");
    if (selectedDate === dateStr) cell.classList.add("selected-day");

    cell.addEventListener("click", () => {
      selectedDate = dateStr;
      document.getElementById("selected-date-text").textContent = selectedDate;
      loadMealsForDate(selectedDate);
      document.getElementById("meal-info-section").classList.remove("hidden");
      document.getElementById("add-meal-form-section").classList.remove("hidden");
      updateCalendarDisplay();
    });

    row.appendChild(cell);

    if ((startDay + day) % 7 === 0 || day === lastDay) {
      table.appendChild(row);
      row = document.createElement("tr");
    }
  }

  calendar.appendChild(table);
}

function bindTrackingForm() {
  document.getElementById("add-meal-form-section").addEventListener("submit", (e) => {
    e.preventDefault();
  });
}

function loadMealsForDate(date) {
  const ul = document.getElementById("meal-list");
  ul.innerHTML = "";

  const meals = mealData[date] || [];
  meals.forEach((meal, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${meal.mealType.toUpperCase()}</strong> - ${meal.food} 
      (${meal.calories} kcal, ${meal.protein}g protein)
      <button class="edit-btn" data-index="${index}">Edit</button>
      <button class="delete-btn" data-index="${index}">🗑️</button>
    `;

    li.querySelector(".edit-btn").addEventListener("click", () => openEditModal(date, index));
    li.querySelector(".delete-btn").addEventListener("click", () => {
      mealData[date].splice(index, 1);
      loadMealsForDate(date);
      updateCalendarDisplay();
    });

    ul.appendChild(li);
  });
}

function openEditModal(date, index) {
  const meal = mealData[date][index];
  document.getElementById("edit-food").value = meal.food;
  document.getElementById("edit-calories").value = meal.calories;
  document.getElementById("edit-meal-type").value = meal.mealType;
  document.getElementById("edit-protein").value = meal.protein;
  document.getElementById("edit-fat").value = meal.fat;
  document.getElementById("edit-carbohydrate").value = meal.carbohydrate;
  document.getElementById("edit-sugar").value = meal.sugar;
  document.getElementById("edit-cholesterol").value = meal.cholesterol;

  document.getElementById("edit-modal").classList.remove("hidden");

  document.getElementById("save-edit").onclick = () => {
    const updatedMeal = {
      food: document.getElementById("edit-food").value,
      calories: +document.getElementById("edit-calories").value,
      mealType: document.getElementById("edit-meal-type").value,
      protein: +document.getElementById("edit-protein").value || 0,
      fat: +document.getElementById("edit-fat").value || 0,
      carbohydrate: +document.getElementById("edit-carbohydrate").value || 0,
      sugar: +document.getElementById("edit-sugar").value || 0,
      cholesterol: +document.getElementById("edit-cholesterol").value || 0
    };

    mealData[date][index] = updatedMeal;
    loadMealsForDate(date);
    updateCalendarDisplay();
    document.getElementById("edit-modal").classList.add("hidden");
  };

  document.getElementById("cancel-edit").onclick = () => {
    document.getElementById("edit-modal").classList.add("hidden");
  }
}
