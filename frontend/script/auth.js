document.addEventListener("DOMContentLoaded", function () {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  const loginLink = document.getElementById("login-link");
  const registerLink = document.getElementById("register-link");
  const logoutLink = document.getElementById("logout");
  const deleteBtn = document.getElementById("delete-account");

  // Toggle UI based on login status
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
      localStorage.clear();
      alert("You have been logged out.");
      window.location.href = "landing.html";
    });
  }

  // Login
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
          localStorage.setItem('isLoggedIn', 'true');
          alert("Login successful!");
          window.location.href = "index.html";
        } else {
          alert("❌ Login failed: " + (data.message || "Unknown error"));
        }
      } catch (err) {
        alert("Server error: " + err.message);
      }
    });
  }

  // Register
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const user = {
        userLoginId: document.getElementById('userId').value.trim(),
        userPw: document.getElementById('userPw').value,
        userName: document.getElementById('userName').value.trim(),
        userSex: document.getElementById('userSex').value,
        userAge: parseInt(document.getElementById('userAge').value),
        userWeight: parseFloat(document.getElementById('userWeight').value),
        userHeight: parseFloat(document.getElementById('userHeight').value)
      };

      if (Object.values(user).some(v => v === '' || v === null || Number.isNaN(v))) {
        alert("❗ Please fill in all required fields correctly.");
        return;
      }

      try {
        const res = await fetch('http://localhost:4000/api/v1/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user)
        });

        const result = await res.json();

        if (!res.ok) {
          alert("❌ Registration failed: " + (result.message || "Unknown error"));
          return;
        }

        // Auto-login after successful registration
        const loginRes = await fetch('http://localhost:4000/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userLoginId: user.userLoginId, userPw: user.userPw })
        });

        const loginData = await loginRes.json();
        const token = loginData.accessToken;

        // Set goals based on BMI
        const bmi = user.userWeight / Math.pow(user.userHeight / 100, 2);
        const goal = getRecommendedGoals(bmi);

        await fetch('http://localhost:4000/api/v1/goal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(goal)
        });

        alert("🎉 Registration and goal setup complete!");
        window.location.href = 'login.html';
      } catch (err) {
        alert("Server connection failed: " + err.message);
      }
    });

    function getRecommendedGoals(bmi) {
      if (bmi < 18.5) return { calories: 2200, protein: 90, fat: 60, carbohydrate: 300, sugar: 30, cholesterol: 200 };
      if (bmi < 25) return { calories: 2000, protein: 75, fat: 55, carbohydrate: 250, sugar: 25, cholesterol: 180 };
      if (bmi < 30) return { calories: 1800, protein: 65, fat: 50, carbohydrate: 220, sugar: 20, cholesterol: 160 };
      return { calories: 1600, protein: 60, fat: 45, carbohydrate: 200, sugar: 15, cholesterol: 150 };
    }
  }

  // Delete account
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      const confirmed = confirm('Are you sure you want to delete your account? This action cannot be undone.');
      if (!confirmed) return;

      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in first.');
        window.location.href = 'login.html';
        return;
      }

      try {
        const res = await fetch('http://localhost:4000/api/v1/mypage/delete', {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          alert('Account deleted successfully.');
          localStorage.clear();
          window.location.href = 'landing.html';
        } else {
          const data = await res.json();
          alert('❌ Failed to delete account: ' + (data.message || 'Server error'));
        }
      } catch (err) {
        alert('Server connection failed.');
      }
    });
  }
});
