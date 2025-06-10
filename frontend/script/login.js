document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const userName = document.getElementById('userid').value; // 👈 userId → userName
  const userPw = document.getElementById('password').value;

  try {
    const res = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName, userPw })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('user', JSON.stringify(data));
      alert("로그인 성공!");
      window.location.href = "menu.html";
    } else {
      alert("로그인 실패: " + data.message);
    }
  } catch (err) {
    alert("서버 응답 실패");
  }
});
