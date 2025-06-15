document.addEventListener("DOMContentLoaded", function () {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  const loginLink = document.getElementById("login-link");
  const registerLink = document.getElementById("register-link");
  const logoutLink = document.getElementById("logout");
  const deleteBtn = document.getElementById("delete-account");

  // 🔹 로그인/로그아웃 UI 토글
  if (loginLink && registerLink && logoutLink) {
    if (isLoggedIn) {
      loginLink.style.display = "none";
      registerLink.style.display = "none";
      logoutLink.style.display = "inline";
    } else {
      loginLink.style.display = "inline";
      registerLink.style.display = "inline";
      logoutLink.style.display = "none";
    }

    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.setItem("isLoggedIn", "false");
      alert("You have been logged out.");
      window.location.href = "landing.html";
    });
  }

  // 🔹 로그인
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
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
          if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem("isLoggedIn", "true");
          alert("로그인 성공!");
          window.location.href = "index.html";
        } else {
          alert("로그인 실패: " + data.message);
        }
      } catch (err) {
        alert("서버 응답 실패");
      }
    });
  }

  // 🔹 회원가입
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const userLoginId = document.getElementById('userId').value.trim();
      const userPw = document.getElementById('userPw').value;
      const userName = document.getElementById('userName').value.trim();
      const userSex = document.getElementById('userSex').value;
      const userAge = parseInt(document.getElementById('userAge').value);
      const userWeight = parseFloat(document.getElementById('userWeight').value);
      const userHeight = parseFloat(document.getElementById('userHeight').value);

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

        if (!res.ok) {
          const err = await res.json();
          alert("회원가입 실패: " + (err.message || "알 수 없는 오류"));
          return;
        }

        const bmi = userWeight / Math.pow(userHeight / 100, 2);
        function getRecommendedGoals(bmi) {
          if (bmi < 18.5) return { calories: 2200, protein: 90, fat: 60, carbohydrate: 300, sugar: 30, cholesterol: 200 };
          if (bmi < 25) return { calories: 2000, protein: 75, fat: 55, carbohydrate: 250, sugar: 25, cholesterol: 180 };
          if (bmi < 30) return { calories: 1800, protein: 65, fat: 50, carbohydrate: 220, sugar: 20, cholesterol: 160 };
          return { calories: 1600, protein: 60, fat: 45, carbohydrate: 200, sugar: 15, cholesterol: 150 };
        }

        const goal = getRecommendedGoals(bmi);

        const loginRes = await fetch('http://localhost:4000/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userLoginId, userPw })
        });

        const loginData = await loginRes.json();
        const token = loginData.accessToken;

        await fetch('http://localhost:4000/api/v1/goal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(goal)
        });

        alert("회원가입 및 기본 목표 설정 완료!");
        window.location.href = "login.html";
      } catch (err) {
        alert("서버 연결 실패: " + err.message);
      }
    });
  }

  // 🔹 계정 삭제
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      const confirmed = confirm('정말로 계정을 삭제하시겠습니까? 복구할 수 없습니다.');
      if (!confirmed) return;

      const token = localStorage.getItem('token');
      if (!token) {
        alert('먼저 로그인하세요.');
        window.location.href = 'login.html';
        return;
      }

      try {
        const res = await fetch('http://localhost:4000/api/v1/mypage/delete', {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          alert('계정이 삭제되었습니다.');
          localStorage.clear();
          window.location.href = 'landing.html';
        } else {
          const data = await res.json();
          alert('❌ 계정 삭제 실패: ' + (data.message || '오류 발생'));
        }
      } catch (err) {
        alert('서버 연결 실패');
      }
    });
  }
});
