document.addEventListener('DOMContentLoaded', () => {
  const deleteBtn = document.getElementById('delete-account');

  deleteBtn?.addEventListener('click', async () => {
    const confirmed = confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (!confirmed) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('You need to log in first.');
      window.location.href = 'login.html';
      return;
    }

    try {
      const res = await fetch('http://localhost:4000/api/v1/mypage/delete', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        alert('Your account has been successfully deleted.');
        localStorage.clear(); // Clear token and data
        window.location.href = 'home.html'; // Redirect to homepage
      } else {
        const data = await res.json();
        alert('❌ Account deletion failed: ' + (data.message || 'Unknown error occurred.'));
      }
    } catch (err) {
      console.error('❌ Account deletion request error:', err);
      alert('Failed to connect to the server.');
    }
  });
});
