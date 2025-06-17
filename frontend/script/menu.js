document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const categorySelect = document.getElementById('categorySelect');
  const recommendationList = document.getElementById('recommendationList');

  if (!token) {
    alert("Please log in first.");
    window.location.href = "login.html";
    return;
  }

  // 먼저 현재 칼로리 섭취 정보를 가져옵니다.
  let calorieDeficit = null;

  async function fetchGoalProgress() {
    try {
      const res = await fetch('http://localhost:4000/api/v1/goal/progress', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const today = data.today;
      if (today.caloriesConsumed >= today.caloriesGoal) {
        calorieDeficit = 0;
        displayMessage("You've already reached your calorie goal for today!");
        recommendationList.innerHTML = '';
      } else {
        calorieDeficit = today.caloriesGoal - today.caloriesConsumed;
        console.log(`🔥 Calorie deficit: ${calorieDeficit}`);
      }
    } catch (err) {
      console.error("❌ Failed to fetch goal progress:", err);
      displayMessage("Unable to retrieve calorie information.");
    }
  }

  async function fetchRecommendations(category) {
    if (calorieDeficit === null) {
      await fetchGoalProgress();
    }

    if (calorieDeficit <= 0) return;

    try {
      const res = await fetch(`http://localhost:4000/api/v1/recommendations?category=${category}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok && data.data && data.data.length > 0) {
        renderRecommendations(data.data);
      } else {
        displayMessage("No suitable recommendation found for today.");
      }
    } catch (err) {
      console.error("❌ Failed to fetch food recommendations:", err);
      displayMessage("An error occurred while fetching recommendations.");
    }
  }

  function renderRecommendations(foods) {
    recommendationList.innerHTML = '';
    foods.forEach(food => {
      const li = document.createElement('li');
      li.textContent = `${food.name} - ${food.calories} ${food.unit}`;
      recommendationList.appendChild(li);
    });
  }

  function displayMessage(message) {
    recommendationList.innerHTML = `<li>${message}</li>`;
  }

  categorySelect.addEventListener('change', (e) => {
    const category = e.target.value;
    if (category) {
      fetchRecommendations(category);
    }
  });

  // 첫 로딩 시 목표 정보 가져오기
  fetchGoalProgress();
});
