async function deleteAccount() {
  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('userName');

  if (!token) {
    alert('로그인이 필요합니다.');
    return;
  }

  const confirmDelete = confirm(`정말로 해당 계정을 삭제하시겠습니까?`);
  if (!confirmDelete) return;

  try {
    const response = await fetch('http://localhost:4000/api/v1/auth/delete', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      alert('계정이 성공적으로 삭제되었습니다.');
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      window.location.href = 'index.html';
    } else {
      alert('계정 삭제 실패: ' + (data.message || data.error || '알 수 없는 오류'));
    }
  } catch (err) {
    console.error('삭제 요청 중 오류:', err);
    alert('서버 오류가 발생했습니다.');
  }
}
