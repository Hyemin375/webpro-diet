document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Login is required.');
    window.location.href = 'login.html';
    return;
  }

  const openBtn = document.getElementById('open-settings');
  const saveBtn = document.getElementById('saveGoals');
  const popup = document.getElementById('settings-popup');
  const closePopup = document.getElementById('close-settings');
  const reloadBtn = document.getElementById('reload');
  const recoBtn = document.getElementById('reset');

  const inputCalories = document.getElementById('targetCalories');
  const inputProtein = document.getElementById('targetProtein');
  const inputFat = document.getElementById('targetFat');
  const inputCarb = document.getElementById('targetCarbohydrate');
  const inputSugar = document.getElementById('targetSugar');
  const inputChol = document.getElementById('targetCholesterol');

  function updateGoalUI(goal, bmi = null) {
    const cal = goal.calories || 0;
    const pro = goal.protein || 0;

    document.getElementById('target-calories').textContent = cal;
    document.getElementById('target-val').textContent = cal;

    const bmiText = document.querySelector('.user-profile p');
    if (bmi !== null && bmiText) {
      bmiText.innerHTML = `BMI: ${bmi.toFixed(1)} | Target Calories: <span id="target-calories">${cal}</span> kcal`;
    }

    const proteinText = document.querySelectorAll('.goal-status strong')[1];
    if (proteinText) proteinText.textContent = `85 / ${pro} g`;

    const progressBars = document.querySelectorAll('.goal-status .progress-bar');
    if (progressBars[0]) {
      progressBars[0].max = cal;
      applyProgressColor(progressBars[0]);
    }
    if (progressBars[1]) {
      progressBars[1].max = pro;
      applyProgressColor(progressBars[1]);
    }
  }

  async function fetchUserInfo() {
    const response = await fetch("http://localhost:4000/api/v1/mypage/profile", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) return null;
    const user = await response.json();
    document.querySelector('.user-profile h3').textContent = `Welcome, ${user.userName}`;

    return {
      height: parseFloat(user.userHeight),
      weight: parseFloat(user.userWeight)
    };
  }

  function calculateBMI(heightCm, weightKg) {
    const heightM = heightCm / 100;
    return weightKg / (heightM * heightM);
  }

  function getRecommendedGoals(bmi) {
    if (bmi < 18.5) {
      return { calories: 2200, protein: 90, fat: 60, carbohydrate: 300, sugar: 30, cholesterol: 200 };
    }
    if (bmi < 25) {
      return { calories: 2000, protein: 75, fat: 55, carbohydrate: 250, sugar: 25, cholesterol: 180 };
    }
    if (bmi < 30) {
      return { calories: 1800, protein: 65, fat: 50, carbohydrate: 220, sugar: 20, cholesterol: 160 };
    }
    return { calories: 1600, protein: 60, fat: 45, carbohydrate: 200, sugar: 15, cholesterol: 150 };
  }

  async function loadGoal() {
    const user = await fetchUserInfo();
    const bmi = user ? calculateBMI(user.height, user.weight) : null;

    try {
      const res = await fetch('http://localhost:4000/api/v1/goal', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const { goal } = await res.json();
        inputCalories.value = goal.calories || '';
        inputProtein.value = goal.protein || '';
        inputFat.value = goal.fat || '';
        inputCarb.value = goal.carbohydrate || '';
        inputSugar.value = goal.sugar || '';
        inputChol.value = goal.cholesterol || '';
        updateGoalUI(goal, bmi);
      } else {
        console.warn('❌ Failed to load goal:', res.status);
      }
    } catch (err) {
      console.error('❌ Error loading goal:', err);
    }
  }

  loadGoal();

  openBtn?.addEventListener('click', () => {
    popup.classList.remove('hidden');
    loadGoal(); // sync with latest when opening
  });
  closePopup?.addEventListener('click', () => popup.classList.add('hidden'));

  saveBtn?.addEventListener('click', async () => {
    const calories = parseInt(inputCalories.value);
    const protein = parseInt(inputProtein.value);
    const fat = parseInt(inputFat.value);
    const carbohydrate = parseInt(inputCarb.value);
    const sugar = parseInt(inputSugar.value);
    const cholesterol = parseInt(inputChol.value);

    if (
      isNaN(calories) || isNaN(protein) || isNaN(fat) ||
      isNaN(carbohydrate) || isNaN(sugar) || isNaN(cholesterol)
    ) {
      alert('⚠️ All fields are required. Please fill in every target value.');
      return;
    }

    const payload = {
      calories,
      protein,
      fat,
      carbohydrate,
      sugar,
      cholesterol
    };

    try {
      const res = await fetch('http://localhost:4000/api/v1/goal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (res.status === 201) {
        alert('🎉 Goal saved successfully!');
        popup.classList.add('hidden');
        const user = await fetchUserInfo();
        const bmi = user ? calculateBMI(user.height, user.weight) : null;
        updateGoalUI(result.goal, bmi);
      } else {
        alert('❌ Failed to save: ' + (result.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('❌ Failed to send goal request:', err);
      alert('Server connection failed.');
    }
  });

  reloadBtn?.addEventListener('click', () => {
    loadGoal();
    alert('✅ Restored to the currently saved goals.');
  });

  recoBtn?.addEventListener("click", async () => {
    const user = await fetchUserInfo();
    if (!user || !user.height || !user.weight) {
      alert("Height and weight info is required.");
      return;
    }

    const bmi = calculateBMI(user.height, user.weight);
    const recommended = getRecommendedGoals(bmi);

    try {
      const res = await fetch('http://localhost:4000/api/v1/goal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(recommended)
      });

      const result = await res.json();
      if (res.status === 201 || res.status === 200) {
        popup.classList.add('hidden');
        alert('✅ Initialized with BMI-based recommended goals.');
        updateGoalUI(result.goal, bmi);
      } else {
        alert('❌ Failed to apply default goals: ' + (result.message || 'Unknown error'));
      }
    } catch (err) {
      console.error("❌ Error applying default goals:", err);
      alert("Failed to initialize due to server error.");
    }
  });
});
