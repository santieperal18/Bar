import { DataTypes, Model } from "sequelize";
import sequelize from "../db.js";

class Repartidor extends Model {}

Repartidor.init(
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
      allowNull: false,
      field: "telefono"
    },
    vehiculo: {
      type: DataTypes.TEXT,
      field: "vehiculo"
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "activo"
    }
  },
  {
    sequelize,
    modelName: "Repartidor",
    tableName: "repartidor",
    timestamps: false
  }
);

export default Repartidor;