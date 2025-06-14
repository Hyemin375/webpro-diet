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
