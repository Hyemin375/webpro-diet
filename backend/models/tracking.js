module.exports = (sequelize, DataTypes) => {
  const Tracking = sequelize.define('Tracking', {
    trackingId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY, // YYYY-MM-DD 형식
      allowNull: false,
    },
    totalCalories: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isSuccess: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  }, {
    tableName: 'Tracking',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'modifiedAt',
  });

  Tracking.associate = models => {
    Tracking.hasMany(models.TrackingDetails, {
      foreignKey: 'trackingId',
      sourceKey: 'trackingId',
      as: 'details',
      onDelete: 'CASCADE'
    });
  };

  return Tracking;
};
