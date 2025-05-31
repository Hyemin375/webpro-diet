document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const inputId = parseInt(document.getElementById('userid').value); // ID must be numeric
  const inputPw = document.getElementById('password').value;
  const user = JSON.parse(localStorage.getItem('user'));

  if (user && user.userId === inputId && user.userPw === inputPw) {
    alert("Login successful!");
    window.location.href = "menu.html";
  } else {
    alert("Incorrect username or password.");
  }
});
