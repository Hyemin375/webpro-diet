module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    userLoginId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    },
    userPw: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userSex: {
      type: DataTypes.ENUM('male', 'female'),
      allowNull: false,
    },
    userAge: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userWeight: {
      type: DataTypes.FLOAT, 
      allowNull: false,
    },
    userHeight: {
      type: DataTypes.FLOAT, 
      allowNull: false,
    },
  }, {
    tableName: 'Users',
    timestamps: true,
    createdAt: 'createdAt',       // 생성 날짜 컬럼명 명시
    updatedAt: 'modifiedAt'     // 수정 날짜 컬럼명 명시
  });

  return User;
};
