const { User, Goal, Tracking, TrackingDetails} = require('../models');
const bcrypt = require('bcrypt');
const { sequelize } = require('../models');

exports.getMyInfo = async (req, res) => {
  try {
    // 인증된 사용자 정보
    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await User.findByPk(userId, {
      attributes: ['userId', 'userName', 'userSex', 'userAge', 'userWeight', 'userHeight']
    });

    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('[getMyInfo] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    // 인증 정보 유효성 체크
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'Unauthorized: user not authenticated' });
    }

    const userId = req.user.userId;
    console.log('[DELETE] req.user:', userId);

    // transaction
    const t = await sequelize.transaction();

    const user = await User.findOne({ where: { userId }, transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ error: 'User not found.' });
    }
    
    // 관련 데이터 삭제 (optional, cascading 되어 있으면 생략 가능)
    await Goal.destroy({ where: { userId }, transaction: t });
    await Tracking.destroy({ where: { userId }, transaction: t });

    // 최종적으로 사용자 삭제
    await user.destroy({ transaction: t });

    await t.commit();

    return res.status(200).json({ message: 'User account deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error occurred.' });
  }
};

exports.updateAccount = async (req, res) => {
  try {
    const userId = req.user.userId; // 인증된 사용자 정보
    const { userName, userSex, userAge, userWeight, userHeight } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 업데이트할 필드만 반영
    if (userName !== undefined) user.userName = userName;
    if (userSex !== undefined) user.userSex = userSex;
    if (userAge !== undefined) user.userAge = userAge;
    if (userWeight !== undefined) user.userWeight = userWeight;
    if (userHeight !== undefined) user.userHeight = userHeight;

    await user.save();

    // 응답에 비밀번호 제외
    const userData = user.get({ plain: true });
    delete userData.userPw;

    res.status(200).json({
      message: 'User information updated successfully',
      user: userData
    });

  } catch (err) {
    console.error('[UPDATE ERROR]', err);
    res.status(500).json({ message: 'Failed to update user information' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const tokenUserId = req.user.userId; // 인증된 사용자 ID
    const { userLoginId, currentPassword, newPassword } = req.body;

    // 요청 값 확인
    if (!userLoginId || !currentPassword || !newPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // userLoginId로 사용자 조회
    const user = await User.findOne({ where: { userLoginId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // 토큰 속 ID와 조회된 유저 ID 일치 확인
    if (user.userId !== tokenUserId) {
      return res.status(403).json({ message: 'Access denied: token-user mismatch.' });
    }

    // 현재 비밀번호 확인
    const isMatch = await bcrypt.compare(currentPassword, user.userPw);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    // 새 비밀번호 해싱 후 저장
    const hashedPw = await bcrypt.hash(newPassword, 10);
    user.userPw = hashedPw;
    await user.save();

    return res.status(200).json({ message: 'Password changed successfully.' });
  } catch (err) {
    console.error('[Password Change Error]', err);
    return res.status(500).json({ message: 'Failed to change password.' });
  }
};
