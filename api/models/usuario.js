import { DataTypes, Model } from "sequelize";
import sequelize from "../db.js";

class Usuario extends Model {}

Usuario.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "id"
    },
    usuario: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
      field: "usuario"
    },
    contrasena: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "contrasena"
    },
    roles: {
      type: DataTypes.TEXT, // JSON stringified array
      defaultValue: "owner",
      field: "roles"
    }
  },
  {
    sequelize,
    modelName: "Usuario",
    tableName: "usuario",
    timestamps: false
  }
);

export default Usuario;
