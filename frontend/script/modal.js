const modal = document.getElementById('modal');
const modalName = document.getElementById('modal-name');
const modalCalories = document.getElementById('modal-calories');
const modalDescription = document.getElementById('modal-description');
const chartCanvas = document.getElementById('nutritionChart');
const addToMealBtn = document.getElementById('addToMeal');
const calendarSection = document.getElementById('calendar-section');
const confirmAddBtn = document.getElementById('confirmAdd');
const selectDate = document.getElementById('selectDate');
const mealTime = document.getElementById('mealTime');
const closeBtn = document.querySelector('.close');

let currentMenu = '';
let chart;

// Sample menu data (translated)
const menuData = {
  "Salad": {
    calories: "180 kcal",
    nutrition: { Carbohydrates: 10, Protein: 5, Fat: 3 },
    description: "A healthy salad made with fresh vegetables."
  },
  "Brown Rice Bento": {
    calories: "420 kcal",
    nutrition: { Carbohydrates: 40, Protein: 25, Fat: 15 },
    description: "A high-protein bento with brown rice and chicken breast."
  },
  "Veggie Smoothie": {
    calories: "150 kcal",
    nutrition: { Carbohydrates: 20, Protein: 3, Fat: 2 },
    description: "A smoothie made with kale, banana, and almond milk."
  },
  "Avocado Toast": {
    calories: "320 kcal",
    nutrition: { Carbohydrates: 30, Protein: 6, Fat: 18 },
    description: "A nutritious snack with avocado on whole grain toast."
  }
};

// Open modal when image is clicked
document.querySelectorAll('.slides img').forEach(img => {
  img.addEventListener('click', () => {
    const name = img.dataset.name;
    const info = menuData[name];
    if (!info) return;

    currentMenu = name;
    modalName.textContent = name;
    modalCalories.textContent = info.calories;
    modalDescription.textContent = info.description;

    if (chart) chart.destroy();
    chart = new Chart(chartCanvas, {
      type: 'doughnut',
      data: {
        labels: Object.keys(info.nutrition),
        datasets: [{
          data: Object.values(info.nutrition),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
        }]
      },
      options: {
        responsive: false,
        plugins: { legend: { position: 'bottom' } }
      }
    });

    calendarSection.classList.add('hidden');
    modal.classList.remove('hidden');
  });
});

// Close modal
closeBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
});

// Show calendar section when "Add to Meal" is clicked
addToMealBtn.addEventListener('click', () => {
  calendarSection.classList.remove('hidden');
});

// Confirm addition
confirmAddBtn.addEventListener('click', () => {
  const date = selectDate.value;
  const time = mealTime.value;
  if (!date || !time) {
    alert('Please select both date and meal time.');
    return;
  }
  alert(`"${currentMenu}" has been added to your meal on ${date} at ${time}.`);
  modal.classList.add('hidden');
});
