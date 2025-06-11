const token = localStorage.getItem('token');


function getCurrentUserName() {
  return localStorage.getItem('userName');
}

async function deleteAccount() {
  const userName = getCurrentUserName();
  const token = localStorage.getItem('token');

  if (!userName) {
    alert('User name not found.');
    return;
  }

  const confirmDelete = confirm(`Are you sure you want to delete the account for ${userName}?`);
  if (!confirmDelete) return;

  try {
    const response = await fetch('http://localhost:4000/api/v1/auth/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ userName }),
    });

    const data = await response.json();

    if (response.ok) {
      alert('Account successfully deleted.');
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      window.location.href = './index.html';
    } else {
        console.log("백엔드 응답:", data);
      alert('Failed to delete account: ' + data.message);
    }
  } catch (err) {
    console.error(err);
    alert('Server error occurred.');
  }
}
