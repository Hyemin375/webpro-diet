document.getElementById('registerForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const user = {
    userId: parseInt(document.getElementById('userId').value),
    userPw: document.getElementById('userPw').value,
    userName: document.getElementById('userName').value,
    userSex: document.getElementById('userSex').value,
    userAge: parseInt(document.getElementById('userAge').value),
    userWeight: parseFloat(document.getElementById('userWeight').value),
    userHeight: parseFloat(document.getElementById('userHeight').value)
  };

  try {
    const res = await fetch('http://localhost:5000/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });

    if (res.ok) {
      alert("회원가입 성공!");
      window.location.href = "login.html";
    } else {
      const err = await res.json();
      alert("에러: " + err.message);
    }
  } catch (err) {
    alert("서버 연결 실패");
  }
});
