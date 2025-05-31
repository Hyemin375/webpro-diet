document.getElementById('registerForm').addEventListener('submit', function (e) {
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

  // Basic field validation
  if (!user.userSex || isNaN(user.userId) || isNaN(user.userAge)) {
    alert("Please check your input values.");
    return;
  }

  localStorage.setItem('user', JSON.stringify(user));
  alert("Registration completed! Redirecting to the login page.");
  window.location.href = "login.html";
});
