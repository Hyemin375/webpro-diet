const { User, Goal, Tracking, TrackingDetails } = require('../models');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/token');

exports.register = async (req, res) => {
  try {
    const { userPw, userName, userSex, userAge, userWeight, userHeight } = req.body;

    const hashedPw = await bcrypt.hash(userPw, 10);
    const user = await User.create({
      userPw: hashedPw,
      userName,
      userSex,
      userAge,
      userWeight,
      userHeight
    });

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { userName, userPw } = req.body;

    const user = await User.findOne({ where: { userName } });
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
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // 관련 데이터 삭제 (optional, cascading 되어 있으면 생략 가능)
    await Goal.destroy({ where: { userId } });
    await Tracking.destroy({ where: { userId } });

    // 최종적으로 사용자 삭제
    await user.destroy();

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

