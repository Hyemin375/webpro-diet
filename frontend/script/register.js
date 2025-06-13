document.getElementById('registerForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  // 사용자 입력값 수집
  const userLoginId = document.getElementById('userId').value.trim();
  const userPw = document.getElementById('userPw').value;
  const userName = document.getElementById('userName').value.trim();
  const userSex = document.getElementById('userSex').value;
  const userAge = parseInt(document.getElementById('userAge').value);
  const userWeight = parseFloat(document.getElementById('userWeight').value);
  const userHeight = parseFloat(document.getElementById('userHeight').value);

  // 유효성 검사
  if (!userLoginId || !userPw || !userName || !userSex || isNaN(userAge) || isNaN(userWeight) || isNaN(userHeight)) {
    alert("모든 필드를 올바르게 입력해주세요.");
    return;
  }

  if (userAge <= 0 || userWeight <= 0 || userHeight <= 0) {
    alert("나이, 키, 몸무게는 0보다 커야 합니다.");
    return;
  }

  const user = {
    userLoginId,
    userPw,
    userName,
    userSex,
    userAge,
    userWeight,
    userHeight
  };

  try {
    const res = await fetch('http://localhost:4000/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });

    if (res.ok) {
      alert("회원가입 성공!");
      window.location.href = "login.html";
    } else {
      const err = await res.json();
      alert("회원가입 실패: " + (err.message || "알 수 없는 오류"));
    }
  } catch (err) {
    alert("서버 연결 실패: " + err.message);
  }
});
