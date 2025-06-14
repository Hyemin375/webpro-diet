// ✅ 1. 토큰 확인
const token = localStorage.getItem('token');
if (!token) {
  alert("로그인이 필요합니다.");
  window.location.href = "login.html";
}

// ✅ 2. 사용자 정보 불러오기 (payload에서 추출)
const payload = JSON.parse(atob(token.split('.')[1]));
const userNameInput = document.getElementById('userName');
const userSexInput = document.getElementById('userSex');
const userAgeInput = document.getElementById('userAge');
const userWeightInput = document.getElementById('userWeight');
const userHeightInput = document.getElementById('userHeight');

// ✅ 사용자 정보 초기값 세팅
window.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    alert('사용자 정보를 불러올 수 없습니다.');
    return;
  }

  userNameInput.value = user.userName;
  userSexInput.value = user.userSex;
  userAgeInput.value = user.userAge;
  userWeightInput.value = user.userWeight;
  userHeightInput.value = user.userHeight;
});

// ✅ 3. 회원 정보 수정
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
    const res = await fetch('http://localhost:4000/api/v1/auth/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`  // ✅ 헤더에 토큰 포함
      },
      body: JSON.stringify(updatedUser)
    });

    const data = await res.json();

    if (res.ok) {
      alert("회원 정보가 수정되었습니다.");
      localStorage.setItem('user', JSON.stringify(data.user)); // ✅ 정보 갱신
    } else {
      alert("수정 실패: " + (data.message || "오류"));
    }
  } catch (err) {
    alert("요청 실패");
  }
});
