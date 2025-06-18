// goal.js

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('updated') === 'true') {
  location.reload(); // index.html 재진입 시 강제로 새로고침
}

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error("❌ 인증 토큰이 없습니다. 로그인 후 이용해주세요.");
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
    inputCarbohydrate: document.getElementById('targetCarbohydrate'),  //수정
    inputSugar: document.getElementById('targetSugar'),
    inputCholesterol: document.getElementById('targetCholesterol'),   //수정
    avatar: document.getElementById('avatar'),
    firstCurrVal: document.querySelector('.curr-val'),
    firstMaxVal: document.querySelector('.max-val')
  };

  function calculateBMI(heightCm, weightKg) {
    const heightM = heightCm / 100;
    return weightKg / (heightM * heightM);
  }

  function applyProgressColor(bar) {
    const ratio = bar.value / bar.max;
    if (ratio >= 1) {
      bar.style.backgroundColor = '#4CAF50'; // 초록
    } else if (ratio >= 0.75) {
      bar.style.backgroundColor = '#FFC107'; // 노랑
    } else if (ratio >= 0.5) {
      bar.style.backgroundColor = '#FF9800'; // 주황
    } else {
      bar.style.backgroundColor = '#F44336'; // 빨강
    }
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

    const welcomeEl = document.querySelector('.user-profile h3');
    if (welcomeEl) welcomeEl.textContent = `Welcome, ${user.userName}`;

    return {
      height: parseFloat(user.userHeight),
      weight: parseFloat(user.userWeight)
    };
  }

  function updateGoalUI(goal, bmi = null) {
    const cal = goal.calories || 0;
    const pro = goal.protein || 0;

    console.log("cal", cal, "pro", pro);

    // 🔹 칼로리 숫자 바꾸기
    const calSpan = document.getElementById('target-calories');
    if (calSpan) calSpan.textContent = cal;
    document.querySelector(".today-max").textContent = cal;
    document.querySelector(".protein-max").textContent = pro;
    console.log(cal);

    // 🔹 BMI 숫자 바꾸기
    if (bmi !== null) {
      const bmiSpan = document.getElementById('bmi');
      if (bmiSpan) bmiSpan.textContent = bmi.toFixed(1);
    }

    // 🔹 프로그레스 바의 max 값 바꾸기
    const bars = document.querySelectorAll('.goal-status .progress-bar');
    if (bars[0]) bars[0].max = cal;
    if (bars[1]) bars[1].max = pro;
    bars.forEach(bar => applyProgressColor?.(bar));
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

      console.log(goal);

      Object.entries(goal).forEach(([key, val]) => {
        const inputKey = `input${key.charAt(0).toUpperCase() + key.slice(1)}`;
        if (dom[inputKey]) dom[inputKey].value = val || '';
      });

      updateGoalUI(goal, bmi);
    } catch (err) {
      console.error('❌ Error loading goal:', err);
    }
  }

  async function loadGoalProgress() {
    try {
      const res = await fetch('http://localhost:4000/api/v1/goal/progress', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) return console.warn('❌ Failed to fetch progress:', res.status);
      const data = await res.json();

      // 오늘 칼로리
      const todayEl = document.querySelector('.goal-status .today-progress');
      if (todayEl) {
        const { caloriesConsumed, caloriesGoal, achievedPercent } = data.today;
        todayEl.innerHTML = `${caloriesConsumed} / ${caloriesGoal} kcal (${achievedPercent.toFixed(1)}%)`;
      }

      // 오늘 단백질
      const proteinEl = document.querySelector('.goal-status .today-protein');
      if (proteinEl && data.todayProtein) {
        const { consumed, goal, percent } = data.todayProtein;
        proteinEl.innerHTML = `${consumed} / ${goal} g (${percent.toFixed(1)}%)`;
      }

      // 지난 7일
      const weekEl = document.querySelector('.goal-status .week-progress');
      if (weekEl) {
        const avg = data.summary.last7days.averageAchievedPercent;
        const max = 1800 * 7;
        const consumed = Math.round((avg / 100) * max);
        weekEl.innerHTML = `${consumed} / ${max} kcal (${avg.toFixed(1)}%)`;
      }

      // 지난 30일
      const monthEl = document.querySelector('.goal-status .month-progress');
      if (monthEl) {
        const avg = data.summary.last30days.averageAchievedPercent;
        const max = 1800 * 30;
        const consumed = Math.round((avg / 100) * max);
        monthEl.innerHTML = `${consumed} / ${max} kcal (${avg.toFixed(1)}%)`;
      }
    } catch (err) {
      console.error('❌ Error loading progress:', err);
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

    avatar.innerHTML = `<span style="font-size: 3rem;">${emoji}</span>`;
  }

  async function saveGoal() {
    const goal = ['Calories', 'Protein', 'Fat', 'Carbohydrate', 'Sugar', 'Cholesterol'].reduce((acc, key) => {
      const val = parseInt(dom[`input${key}`]?.value);
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
        await updateGoalStatus();
        await loadGoalProgress();
        handleAvatarEmoji();
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

  async function updateGoalStatus() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    try {
      const res = await fetch("http://localhost:4000/api/v1/tracking/calendar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ year, month })
      });

      if (!res.ok) throw new Error("Fetch failed");

      const data = await res.json();
      console.log("✅ 목표 달성 데이터:", data);

      const today = now.toISOString().split("T")[0];
      const todayData = data.data.days.find(d => d.date === today);

      if (todayData) {
        const cal = todayData.caloriesGoal;
        const consumed = todayData.caloriesConsumed;
        const percent = (consumed / cal) * 100;

        document.querySelector(".today-val").textContent = consumed;
        document.querySelector(".today-max").textContent = cal;
        document.querySelector(".today-percent").textContent = percent.toFixed(1);
        const bar = document.querySelector(".today-bar");
        if (bar) {
          bar.value = consumed;
          bar.max = cal;
          applyProgressColor(bar);
        }
      }

      // ✅ 단백질 정보 반영
      const protein = todayData?.protein || {};
      if (protein.goal && protein.consumed) {
        const percent = (protein.consumed / protein.goal) * 100;
        document.querySelector(".protein-val").textContent = protein.consumed;
        document.querySelector(".protein-max").textContent = protein.goal;
        document.querySelector(".protein-percent").textContent = percent.toFixed(1);
        const bar = document.querySelector(".protein-bar");
        if (bar) {
          bar.value = protein.consumed;
          bar.max = protein.goal;
          applyProgressColor(bar);
        }
      }

      // ✅ 지난 주
      const avgWeek = data.data.summary.last7days.averageAchievedPercent;
      const maxWeek = todayData.caloriesGoal * 7;
      const weekVal = Math.round((avgWeek / 100) * maxWeek);
      document.querySelector(".week-val").textContent = weekVal;
      document.querySelector(".week-max").textContent = maxWeek;
      document.querySelector(".week-percent").textContent = avgWeek.toFixed(1);
      document.querySelector(".week-bar").value = weekVal;
      document.querySelector(".week-bar").max = maxWeek;

      // ✅ 지난 달
      const avgMonth = data.data.summary.last30days.averageAchievedPercent;
      const maxMonth = todayData.caloriesGoal * 30;
      const monthVal = Math.round((avgMonth / 100) * maxMonth);
      document.querySelector(".month-val").textContent = monthVal;
      document.querySelector(".month-max").textContent = maxMonth;
      document.querySelector(".month-percent").textContent = avgMonth.toFixed(1);
      document.querySelector(".month-bar").value = monthVal;
      document.querySelector(".month-bar").max = maxMonth;

    } catch (err) {
      console.error("목표 상태 불러오기 실패:", err);
    }
  }


  // Event Listeners
  dom.openBtn?.addEventListener('click', () => {
    dom.popup.classList.remove('hidden');
    loadGoal();
  });
  dom.closePopup?.addEventListener('click', () => {
    dom.popup.classList.add('hidden')
    
  });
  dom.saveBtn?.addEventListener('click', saveGoal);
  dom.reloadBtn?.addEventListener('click', () => {
    loadGoal();
    alert('✅ Restored to the currently saved goals.');
  });
  dom.recoBtn?.addEventListener('click', applyRecommendedGoals);

  // 초기 실행
  loadGoal();
  loadGoalProgress();
  handleAvatarEmoji();
  updateGoalStatus();
});
