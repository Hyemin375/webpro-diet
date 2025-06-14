// ✅ 1. 토큰 확인
const token = localStorage.getItem('token');
if (!token) {
  alert("로그인이 필요합니다.");
  window.location.href = "login.html";
}

// ✅ 2. DOM 요소 참조
const userNameInput = document.getElementById('userName');
const userSexInput = document.getElementById('userSex');
const userAgeInput = document.getElementById('userAge');
const userWeightInput = document.getElementById('userWeight');
const userHeightInput = document.getElementById('userHeight');

// ✅ 3. 사용자 정보 불러오기
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('http://localhost:4000/api/v1/mypage/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.ok) {
      const user = await res.json();
      userNameInput.value = user.userName || '';
      userSexInput.value = user.userSex || '';
      userAgeInput.value = user.userAge || '';
      userWeightInput.value = user.userWeight || '';
      userHeightInput.value = user.userHeight || '';
    } else {
      console.warn("사용자 정보를 불러올 수 없습니다.");
    }
  } catch (err) {
    console.error("불러오기 실패:", err);
  }
});

// ✅ 4. 회원 정보 수정
document.getElementById('infoForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const updatedUser = {
    userName: userNameInput.value.trim(),
    userSex: userSexInput.value,
    userAge: parseInt(userAgeInput.value),
    userWeight: parseFloat(userWeightInput.value),
    userHeight: parseFloat(userHeightInput.value)
  };

  try {
    const res = await fetch('http://localhost:4000/api/v1/mypage/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updatedUser)
    });

    const data = await res.json();

    if (res.ok) {
      alert("회원 정보가 수정되었습니다.");
      localStorage.setItem('user', JSON.stringify(data.user));
    } else {
      alert("수정 실패: " + (data.message || "오류"));
    }
  } catch (err) {
    alert("요청 실패");
  }
});
