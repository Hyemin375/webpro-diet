document.getElementById('logout')?.addEventListener('click', function () {
  localStorage.clear();
  window.location.href = 'landing.html'; // 또는 login.html 원하면 수정
});

window.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');

  const deleteBtn = document.getElementById('delete-account');
  const logoutBtn = document.getElementById('logout');
  const loginLink = document.getElementById('login-link');
  const registerLink = document.getElementById('register-link');

  if (token) {
    deleteBtn?.style.setProperty('display', 'inline');
    logoutBtn?.style.setProperty('display', 'inline');
    loginLink?.style.setProperty('display', 'none');
    registerLink?.style.setProperty('display', 'none');
  } else {
    deleteBtn?.style.setProperty('display', 'none');
    logoutBtn?.style.setProperty('display', 'none');
    loginLink?.style.setProperty('display', 'inline');
    registerLink?.style.setProperty('display', 'inline');
  }
});
