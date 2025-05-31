const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
app.use('/api/v1/auth', authRoutes);

// 테스트용 라우트
app.get('/', (req, res) => res.send('NutriMate API running'));

// DB 연결 및 서버 시작
sequelize.sync({ alter: true }).then(() => {
  console.log('✅ DB connected');
  app.listen(process.env.PORT || 4000, () => {
    console.log('🚀 Server running');
  });
});
