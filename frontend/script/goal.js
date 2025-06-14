document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('로그인이 필요합니다.');
    window.location.href = 'login.html';
    return;
  }

  const openBtn = document.getElementById('open-settings');
  const closeBtn = document.getElementById('close-settings');
  const saveBtn = document.getElementById('saveGoals');
  const popup = document.getElementById('settings-popup');
  const closePopup = document.getElementById('closePopup');
  const resetBtn = document.getElementById('reset-defaults');

  const inputCalories = document.getElementById('targetCalories');
  const inputProtein = document.getElementById('targetProtein');
  const inputFat = document.getElementById('targetFat');
  const inputCarb = document.getElementById('targetCarbohydrate');
  const inputSugar = document.getElementById('targetSugar');
  const inputChol = document.getElementById('targetCholesterol');

  openBtn?.addEventListener('click', () => popup.classList.remove('hidden'));
  closeBtn?.addEventListener('click', () => popup.classList.add('hidden'));
  closePopup?.addEventListener('click', () => popup.classList.add('hidden'));

  // 🔸 UI 갱신 함수
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
    if (proteinText) proteinText.textContent = `85 / ${pro} g`; // 실제 섭취량은 추후 대체 가능

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

  // 🔹 사용자 정보 받아오기
  async function fetchUserInfo() {
    const response = await fetch("http://localhost:4000/api/v1/mypage/profile", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) return null;
    const user = await response.json();
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
    if (bmi < 18.5) return { calories: 2200, protein: 90 };
    if (bmi < 25) return { calories: 2000, protein: 75 };
    if (bmi < 30) return { calories: 1800, protein: 65 };
    return { calories: 1600, protein: 60 };
  }

  // 🔹 기존 목표 불러오기
  (async () => {
    try {
      const res = await fetch('http://localhost:4000/api/v1/goal', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const { goal } = await res.json();

        inputCalories.value = goal.calories || '';
        inputProtein.value = goal.protein || '';
        inputFat.value = goal.fat || '';
        inputCarb.value = goal.carbohydrate || '';
        inputSugar.value = goal.sugar || '';
        inputChol.value = goal.cholesterol || '';

        const user = await fetchUserInfo();
        const bmi = user ? calculateBMI(user.height, user.weight) : null;
        updateGoalUI(goal, bmi);

      } else if (res.status === 404) {
        console.log('✅ 영양 목표 없음: 빈 input 유지');
      } else {
        console.warn('❌ 목표 불러오기 실패:', res.status);
      }
    } catch (err) {
      console.error('❌ 목표 불러오기 에러:', err);
    }
  })();

  // 🔹 목표 저장
  saveBtn?.addEventListener('click', async () => {
    const calories = parseInt(inputCalories.value);
    const protein = parseInt(inputProtein.value);

    if (isNaN(calories) || isNaN(protein)) {
      alert('칼로리와 단백질은 필수 항목입니다.');
      return;
    }

    const payload = { calories, protein };
    const optionalFields = {
      fat: inputFat.value,
      carbohydrate: inputCarb.value,
      sugar: inputSugar.value,
      cholesterol: inputChol.value
    };

    for (const [key, val] of Object.entries(optionalFields)) {
      const num = parseInt(val);
      if (!isNaN(num)) payload[key] = num;
    }

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
        alert('🎉 목표가 성공적으로 저장되었습니다!');
        popup.classList.add('hidden');

        const user = await fetchUserInfo();
        const bmi = user ? calculateBMI(user.height, user.weight) : null;
        updateGoalUI(result.goal, bmi);

      } else {
        alert('❌ 저장 실패: ' + (result.message || '알 수 없는 오류'));
      }
    } catch (err) {
      console.error('❌ 목표 저장 요청 실패:', err);
      alert('서버 연결 오류');
    }
  });

  // 🔹 초기화 버튼 (BMI 기반 기본값 저장)
  resetBtn?.addEventListener("click", async () => {
    const user = await fetchUserInfo();
    if (!user || !user.height || !user.weight) {
      alert("신장과 체중 정보가 필요합니다.");
      return;
    }

    const bmi = calculateBMI(user.height, user.weight);
    const { calories, protein } = getRecommendedGoals(bmi);
    const payload = { calories, protein };

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

      if (res.status === 201 || res.status === 200) {
        popup.classList.add('hidden');
        alert('✅ BMI 기반 기본 목표로 초기화되었습니다.');
        updateGoalUI(result.goal, bmi);
      } else {
        alert('❌ 기본 목표 저장 실패: ' + (result.message || '알 수 없는 오류'));
      }

    } catch (err) {
      console.error("❌ 기본 목표 저장 중 오류:", err);
      alert("서버 오류로 초기화에 실패했습니다.");
    }
  });
});
