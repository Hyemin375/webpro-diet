const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// swagger
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// auth router
const authRoutes = require('./routes/auth');
app.use('/api/v1/auth', authRoutes);

// goal router
const goalRoutes = require('./routes/goal');
app.use('/api/v1/goal', goalRoutes);

// 기본 라우트
app.get('/', (req, res) => res.send('NutriMate API running'));

const PORT = process.env.PORT || 4000;

if (require.main === module) {
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
}

module.exports = app;