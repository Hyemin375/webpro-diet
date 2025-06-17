// goal.js

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Login is required.');
    window.location.href = 'login.html';
    return;
  }

  const dom = {
    openBtn: document.getElementById('open-settings'),
    saveBtn: document.getElementById('saveGoals'),
    popup: document.getElementById('settings-popup'),
    closePopup: document.getElementById('close-settings'),
    reloadBtn: document.getElementById('reload'),
    recoBtn: document.getElementById('reset'),
    inputCalories: document.getElementById('targetCalories'),
    inputProtein: document.getElementById('targetProtein'),
    inputFat: document.getElementById('targetFat'),
    inputCarb: document.getElementById('targetCarbohydrate'),
    inputSugar: document.getElementById('targetSugar'),
    inputChol: document.getElementById('targetCholesterol'),
    avatar: document.getElementById('avatar'),
    firstCurrVal: document.querySelector('.curr-val'),
    firstMaxVal: document.querySelector('.max-val')
  };

  function calculateBMI(heightCm, weightKg) {
    const heightM = heightCm / 100;
    return weightKg / (heightM * heightM);
  }

  function getRecommendedGoals(bmi) {
    if (bmi < 18.5) return { calories: 2200, protein: 90, fat: 60, carbohydrate: 300, sugar: 30, cholesterol: 200 };
    if (bmi < 25) return { calories: 2000, protein: 75, fat: 55, carbohydrate: 250, sugar: 25, cholesterol: 180 };
    if (bmi < 30) return { calories: 1800, protein: 65, fat: 50, carbohydrate: 220, sugar: 20, cholesterol: 160 };
    return { calories: 1600, protein: 60, fat: 45, carbohydrate: 200, sugar: 15, cholesterol: 150 };
  }

  async function fetchUserInfo() {
    const res = await fetch("http://localhost:4000/api/v1/mypage/profile", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) return null;
    const user = await res.json();
    document.querySelector('.user-profile h3').textContent = `Welcome, ${user.userName}`;
    return { height: parseFloat(user.userHeight), weight: parseFloat(user.userWeight) };
  }

  function updateGoalUI(goal, bmi = null) {
    const cal = goal.calories || 0;
    const pro = goal.protein || 0;
    document.getElementById('target-calories').textContent = cal;
    document.getElementById('target-val').textContent = cal;

    if (bmi !== null) {
      document.querySelector('.user-profile p').innerHTML = `BMI: ${bmi.toFixed(1)} | Target Calories: <span id="target-calories">${cal}</span> kcal`;
    }

    document.querySelectorAll('.goal-status strong')[1].textContent = `85 / ${pro} g`;

    const bars = document.querySelectorAll('.goal-status .progress-bar');
    if (bars[0]) bars[0].max = cal;
    if (bars[1]) bars[1].max = pro;
    bars.forEach(applyProgressColor);
  }

  async function loadGoal() {
    const user = await fetchUserInfo();
    const bmi = user ? calculateBMI(user.height, user.weight) : null;

    try {
      const res = await fetch('http://localhost:4000/api/v1/goal', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) return console.warn('❌ Failed to load goal:', res.status);

      const { goal } = await res.json();
      Object.entries(goal).forEach(([key, val]) => {
        if (dom[`input${key.charAt(0).toUpperCase() + key.slice(1)}`]) {
          dom[`input${key.charAt(0).toUpperCase() + key.slice(1)}`].value = val || '';
        }
      });
      updateGoalUI(goal, bmi);
    } catch (err) {
      console.error('❌ Error loading goal:', err);
    }
  }

  function handleAvatarEmoji() {
    const { avatar, firstCurrVal, firstMaxVal } = dom;
    if (!avatar || !firstCurrVal || !firstMaxVal) return;

    const today = parseFloat(firstCurrVal.textContent.trim());
    const target = parseFloat(firstMaxVal.textContent.trim());
    if (isNaN(today) || isNaN(target) || target === 0) return;

    const percent = (today / target) * 100;
    const emoji = percent >= 100 ? '😆' : percent >= 80 ? '😊' : percent >= 50 ? '🥲' : '😭';

    avatar.outerHTML = `<div id="avatar" style="font-size: 3rem;">${emoji}</div>`;
  }

  async function saveGoal() {
    const goal = ['Calories', 'Protein', 'Fat', 'Carbohydrate', 'Sugar', 'Cholesterol'].reduce((acc, key) => {
      const val = parseInt(dom[`input${key}`].value);
      if (isNaN(val)) acc.error = true;
      acc[key.toLowerCase()] = val;
      return acc;
    }, {});

    if (goal.error) {
      alert('⚠️ All fields are required. Please fill in every target value.');
      return;
    }

    delete goal.error;

    try {
      const res = await fetch('http://localhost:4000/api/v1/goal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(goal)
      });

      const result = await res.json();
      if ([200, 201].includes(res.status)) {
        alert('🎉 Goal saved successfully!');
        dom.popup.classList.add('hidden');
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
  }

  async function applyRecommendedGoals() {
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
      if ([200, 201].includes(res.status)) {
        dom.popup.classList.add('hidden');
        alert('✅ Initialized with BMI-based recommended goals.');
        updateGoalUI(result.goal, bmi);
      } else {
        alert('❌ Failed to apply default goals: ' + (result.message || 'Unknown error'));
      }
    } catch (err) {
      console.error("❌ Error applying default goals:", err);
      alert("Failed to initialize due to server error.");
    }
  }

  // Event Listeners
  dom.openBtn?.addEventListener('click', () => {
    dom.popup.classList.remove('hidden');
    loadGoal();
  });

  dom.closePopup?.addEventListener('click', () => dom.popup.classList.add('hidden'));
  dom.saveBtn?.addEventListener('click', saveGoal);
  dom.reloadBtn?.addEventListener('click', () => {
    loadGoal();
    alert('✅ Restored to the currently saved goals.');
  });
  dom.recoBtn?.addEventListener('click', applyRecommendedGoals);

  loadGoal();
  handleAvatarEmoji();
});