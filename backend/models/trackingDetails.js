module.exports = (sequelize, DataTypes) => {
  const TrackingDetails = sequelize.define('TrackingDetails', {
    detailId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    trackingId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    mealtype: {
      type: DataTypes.ENUM('breakfast', 'lunch', 'dinner'),
      allowNull: false,
    },
    eatCalories: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    eatProtein: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    eatFat: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    eatCarbon: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    eatSugar: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    eatChole: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    tableName: 'TrackingDetails',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'modifiedAt',
  });

  return TrackingDetails;
};
