import sequelize from '../db.js';

// Importar modelos para registrar asociaciones
import '../models/categoria.js';
import '../models/producto.js';
import '../models/cliente.js';
import '../models/repartidor.js';
import '../models/pedido.js';
import '../models/pedidoProducto.js';

(async () => {
  try {
    console.log('Sincronizando modelos con la base de datos (archivo: ./data/restoBar.db)...');
    // Usamos alter para ajustar la estructura sin perder datos cuando sea posible
    await sequelize.sync({ alter: true });
    console.log('Sincronización completada. La base de datos debería existir en ./data/restoBar.db');
    process.exit(0);
  } catch (err) {
    console.error('Error al sincronizar la base de datos:', err);
    process.exit(1);
  }
})();
