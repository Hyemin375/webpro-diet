const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');

// Swagger API 문서 경로 연결
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// 회원가입, 로그인
const authRoutes = require('./routes/auth');
app.use('/api/v1/auth', authRoutes);

// goal 설정
const goalRoutes = require('./routes/goal');
app.use('/api/v1/goal', goalRoutes);

// 테스트용 라우트
app.get('/', (req, res) => res.send('NutriMate API running'));

const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ DB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Sequelize sync failed:', err);
  });

  