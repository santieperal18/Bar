import { DataTypes, Model } from "sequelize";
import sequelize from "../db.js";
import Pedido from "./pedido.js";
import Producto from "./producto.js";

class PedidoProducto extends Model {}

PedidoProducto.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "id"
    },
    idPedido: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "id_pedido",
      references: {
        model: Pedido,
        key: 'id'
      }
    },
    idProducto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "id_producto",
      references: {
        model: Producto,
        key: 'id'
      }
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      field: "cantidad"
    },
    precioUnitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "precio_unitario"
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "subtotal"
    }
  },
  {
    sequelize,
    modelName: "PedidoProducto",
    tableName: "pedido_producto",
    timestamps: false
  }
);

// Asociaciones
Pedido.belongsToMany(Producto, {
  through: PedidoProducto,
  foreignKey: 'idPedido',
  otherKey: 'idProducto',
  as: 'productos'
});

Producto.belongsToMany(Pedido, {
  through: PedidoProducto,
  foreignKey: 'idProducto',
  otherKey: 'idPedido',
  as: 'pedidos'
});

export default PedidoProducto;