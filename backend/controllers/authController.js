const { User, Goal, Tracking, TrackingDetails } = require('../models');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/token');
const { sequelize } = require('../models');

exports.register = async (req, res) => {
  try {
    const { 
      userLoginId, 
      userPw, 
      userName, 
      userSex, 
      userAge, 
      userWeight, 
      userHeight 
    } = req.body;

    // 필수 필드 누락 점검
    if (
      !userLoginId || 
      !userPw || 
      !userName || 
      !userSex || 
      userAge == null || 
      userWeight == null || 
      userHeight == null
    ) {
      return res.status(400).json({ message: 'All fields are required.' });
    }


    // 중복 아이디 확인
    const existingUser = await User.findOne({ where: { userLoginId } });
    if (existingUser) {
      return res.status(409).json({ message: 'User login ID already exists.' });
    }

    // password
    const hashedPw = await bcrypt.hash(userPw, 10);
    
    // 유저 생성
    const user = await User.create({
      userLoginId,
      userPw: hashedPw,
      userName,
      userSex,
      userAge,
      userWeight,
      userHeight
    });

    // 응답 시 비밀번호 제외
    const { userPw: _, ...userSafe } = user.toJSON();

    res.status(201).json({ message: 'User registered successfully', user: userSafe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { userLoginId, userPw } = req.body;

    // 필수값 존재 여부 확인
    if (!userLoginId || !userPw) {
      return res.status(400).json({ message: 'Login ID and password are required.' });
    }

    const user = await User.findOne({ where: { userLoginId } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(userPw, user.userPw);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user);

    res.status(200).json({ message: 'Login successful', accessToken: token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
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
    const userId = req.user.id;
    const { userName, userSex, userAge, userWeight, userHeight } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 업데이트할 필드만 적용
    if (userName) user.userName = userName;
    if (userSex) user.userSex = userSex;
    if (userAge) user.userAge = userAge;
    if (userWeight) user.userWeight = userWeight;
    if (userHeight) user.userHeight = userHeight;

    await user.save();

    res.status(200).json({ message: 'User information updated successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update user information' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.userPw);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    const hashedNewPw = await bcrypt.hash(newPassword, 10);
    user.userPw = hashedNewPw;
    await user.save();

    return res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to change password.' });
  }
};