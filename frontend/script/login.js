document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const userLoginId = document.getElementById('userid').value.trim();
  const userPw = document.getElementById('password').value;

  try {
    const res = await fetch('http://localhost:4000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userLoginId, userPw })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('userLoginId', userLoginId);

      console.log("data", data);

      // ✅ 유저 정보 전체 저장
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      localStorage.setItem("isLoggedIn", "true");


      console.log("Token:", data.accessToken);
      alert("로그인 성공!");
      window.location.href = "index.html";
    } else {
      alert("로그인 실패: " + data.message);
    }
  } catch (err) {
    alert("서버 응답 실패");
  }
});
