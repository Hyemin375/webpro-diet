// ✅ 모달 요소 가져오기
const modal = document.getElementById("modal");
const modalName = document.getElementById("modal-name");
const modalCalories = document.getElementById("modal-calories");
const modalDescription = document.getElementById("modal-description");
const modalCloseBtn = document.querySelector(".close");

// ✅ 카테고리 선택 & 버튼 클릭 시 추천 요청
document.getElementById("getRecommendationBtn").addEventListener("click", async () => {
  const category = document.getElementById("categorySelect").value;
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`http://localhost:4000/api/v1/recommendations?category=${category}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const result = await res.json();
    console.log("🍽️ Recommendation response: ", result);

    if (res.ok && result.data && result.data.length > 0) {
      renderRecommendations(result.data);
    } else {
      renderNoResults("No suitable recommendation found for today.");
    }
  } catch (err) {
    console.error("❌ Failed to get recommendation:", err);
    renderNoResults("Server error. Please try again later.");
  }
});

// ✅ 추천 음식 카드 렌더링
function renderRecommendations(foods) {
  const list = document.getElementById("recommendationList");
  list.innerHTML = "";

  foods.forEach(food => {
    const li = document.createElement("li");
    li.className = "recommend-item";

    li.innerHTML = `
      <div class="recommend-card">
        <h4>${food.name}</h4>
        <p>Calories: ${food.calories} ${food.unit}</p>
        <button class="details-btn">Details</button>
      </div>
    `;

    // 모달 상세정보 이벤트
    li.querySelector(".details-btn").addEventListener("click", () => {
      openModal(food);
    });

    list.appendChild(li);
  });
}

// ✅ 결과 없음 처리
function renderNoResults(message) {
  const list = document.getElementById("recommendationList");
  list.innerHTML = `<li class="no-result">${message}</li>`;
}

// ✅ 모달 열기
function openModal(food) {
  modalName.textContent = food.name;
  modalCalories.textContent = `${food.calories} ${food.unit}`;
  modalDescription.textContent = "More detailed nutritional data is not available in this demo.";

  modal.classList.remove("hidden");
}

// ✅ 모달 닫기
modalCloseBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
});
