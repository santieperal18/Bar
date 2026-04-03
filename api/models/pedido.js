import { DataTypes, Model } from "sequelize";
import sequelize from "../db.js";
import Cliente from "./cliente.js";
import Repartidor from "./repartidor.js";

class Pedido extends Model {}

Pedido.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "id"
    },
    idCliente: {
      type: DataTypes.INTEGER,
      field: "id_cliente"
    },
    idRepartidor: {
      type: DataTypes.INTEGER,
      field: "id_repartidor"
    },
    fecha: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "fecha"
    },
    tipoEntrega: {
      type: DataTypes.ENUM('local', 'delivery'),
      defaultValue: 'local',
      field: "tipo_entrega"
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'preparando', 'en_camino', 'entregado', 'cancelado'),
      defaultValue: 'pendiente',
      field: "estado"
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      field: "total"
    },
    direccionEntrega: {
      type: DataTypes.TEXT,
      field: "direccion_entrega"
    },
    observaciones: {
      type: DataTypes.TEXT,
      field: "observaciones"
    }
  },
  {
    sequelize,
    modelName: "Pedido",
    tableName: "pedido",
    timestamps: false
  }
);

// Asociaciones
Pedido.belongsTo(Cliente, {
  foreignKey: "idCliente",
  as: "cliente"
});

Pedido.belongsTo(Repartidor, {
  foreignKey: "idRepartidor",
  as: "repartidor"
});

Cliente.hasMany(Pedido, {
  foreignKey: "idCliente",
  as: "pedidos"
});

Repartidor.hasMany(Pedido, {
  foreignKey: "idRepartidor",
  as: "pedidos"
});

export default Pedido;