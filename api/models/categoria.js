import { DataTypes, Model } from "sequelize";
import sequelize from "../db.js";

class Categoria extends Model {}

Categoria.init(
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
      unique: true,
      field: "nombre"
    },
    tipo: {
      type: DataTypes.ENUM('desayuno', 'comida', 'bebida'),
      allowNull: false,
      field: "tipo"
    },
    descripcion: {
      type: DataTypes.TEXT,
      field: "descripcion"
    }
  },
  {
    sequelize,
    modelName: "Categoria",
    tableName: "categoria",
    timestamps: false
  }
);

export default Categoria;