const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// 모델 불러오기
db.User = require('./User')(sequelize, Sequelize.DataTypes);
db.Goal = require('./goal')(sequelize, Sequelize.DataTypes);
db.Tracking = require('./tracking')(sequelize, Sequelize.DataTypes);           // 추가 ✅
db.TrackingDetails = require('./trackingDetails')(sequelize, Sequelize.DataTypes); // 추가 ✅


// 관계 설정
db.User.hasOne(db.Goal, { foreignKey: 'userId' });
db.Goal.belongsTo(db.User, { foreignKey: 'userId' });

// 1:N 관계 설정
db.Tracking.hasMany(db.TrackingDetails, { foreignKey: 'trackingId' });
db.TrackingDetails.belongsTo(db.Tracking, { foreignKey: 'trackingId' });

// Tracking → User 관계도 필요
db.User.hasMany(db.Tracking, { foreignKey: 'userId' });
db.Tracking.belongsTo(db.User, { foreignKey: 'userId' });


module.exports = db;
