import { DataTypes, Model } from "sequelize";
import sequelize from "../db.js";

class Cliente extends Model {}

Cliente.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "id"
    },
    nombre: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "nombre"
    },
    apellido: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "apellido"
    },
    telefono: {
      type: DataTypes.TEXT,
      field: "telefono"
    },
    direccion: {
      type: DataTypes.TEXT,
      field: "direccion"
    },
    email: {
      type: DataTypes.TEXT,
      validate: {
        isEmail: true
      },
      field: "email"
    },
    fechaRegistro: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "fecha_registro"
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "activo"
    }
  },
  {
    sequelize,
    modelName: "Cliente",
    tableName: "cliente",
    timestamps: false
  }
);

export default Cliente;