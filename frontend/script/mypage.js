// ✅ Check token
const token = localStorage.getItem('token');
if (!token) {
  alert("Login is required.");
  window.location.href = "login.html";
}

// ✅ DOM elements
const userNameInput = document.getElementById('userName');
const userSexInput = document.getElementById('userSex');
const userAgeInput = document.getElementById('userAge');
const userWeightInput = document.getElementById('userWeight');
const userHeightInput = document.getElementById('userHeight');

// ✅ Load user profile info
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('http://localhost:4000/api/v1/mypage/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      const user = await res.json();
      userNameInput.value = user.userName || '';
      userSexInput.value = user.userSex || '';
      userAgeInput.value = user.userAge || '';
      userWeightInput.value = user.userWeight || '';
      userHeightInput.value = user.userHeight || '';
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      console.warn("❌ Failed to load user info.");
    }
  } catch (err) {
    console.error("❌ Error loading profile:", err);
  }
});

// ✅ Update profile info
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
      alert("✅ Your profile has been updated.");
      localStorage.setItem('user', JSON.stringify(data.user));
      location.reload(); // refresh to apply updated BMI
    } else {
      alert("❌ Failed to update profile: " + (data.message || "Unknown error"));
    }
  } catch (err) {
    console.error("❌ Request failed:", err);
    alert("Failed to connect to server.");
  }
});

// ✅ 5. 비밀번호 변경 처리
document.getElementById('passwordForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const userLoginId = document.getElementById('userLoginId').value.trim();
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;

  if (!userLoginId || !currentPassword || !newPassword) {
    alert("Please fill in all fields.");
    return;
  }

  const token = localStorage.getItem('token');

  try {
    const res = await fetch('http://localhost:4000/api/v1/mypage/password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        userLoginId,
        currentPassword,
        newPassword
      })
    });

    const data = await res.json();

    if (res.status === 200) {
      alert(data.message || "Password changed successfully.");
      document.getElementById('userLoginId').value = '';
      document.getElementById('currentPassword').value = '';
      document.getElementById('newPassword').value = '';

      // 1. 입력 필드 초기화
      document.getElementById('userLoginId').value = '';
      document.getElementById('currentPassword').value = '';
      document.getElementById('newPassword').value = '';

      // 2. 저장된 인증 정보 삭제
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userLoginId');
      localStorage.setItem('isLoggedIn', 'false');

      // 3. 로그인 페이지로 이동
      alert("🔒 Please log in again with your new password.");
      window.location.href = "login.html";
    } else {
      alert(data.message || "Failed to change password.");
    }
  } catch (err) {
    console.error("❌ Password change error:", err);
    alert("Server error while changing password.");
  }
});
