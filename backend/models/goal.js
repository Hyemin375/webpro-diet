module.exports = (sequelize, DataTypes) => {
  const Goal = sequelize.define('Goal', {
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true, // 유저당 하나만 가질 수 있음
      references: {
        model: 'Users',
        key: 'userId',
      },
      onDelete: 'CASCADE',
    },
    goalCalories: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '단위: kcal',
    },
    goalProtein: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '단위: g',
    },
    goalFat: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '단위: g',
    },
    goalCarbon: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '단위: g',
    },
    goalSugar: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '단위: g',
    },
    goalChole: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '단위: mg',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    modifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'Goals',
    timestamps: true,
    createdAt: 'createdAt',       // 생성 날짜 컬럼명 명시
    updatedAt: 'modifiedAt' 
  });

  return Goal;
};
