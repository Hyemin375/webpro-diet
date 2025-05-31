const { User } = require('../models');
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
