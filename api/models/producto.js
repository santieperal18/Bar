import { DataTypes, Model } from "sequelize";
import sequelize from "../db.js";
import Categoria from "./categoria.js";

class Producto extends Model {}

Producto.init(
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
    descripcion: {
      type: DataTypes.TEXT,
      field: "descripcion"
    },
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "precio"
    },
    idCategoria: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "id_categoria"
    },
    disponible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "disponible"
    },
    imagen: {
      type: DataTypes.TEXT,
      field: "imagen"
    }
  },
  {
    sequelize,
    modelName: "Producto",
    tableName: "producto",
    timestamps: false
  }
);

// Asociaciones
Producto.belongsTo(Categoria, {
  foreignKey: "idCategoria",
  as: "categoria"
});

Categoria.hasMany(Producto, {
  foreignKey: "idCategoria",
  as: "productos"
});

export default Producto;