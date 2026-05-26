const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
const port = 80; // Puerto HTTP estándar habilitado en el Security Group 
// Configuración de la base de datos (Sustituir con valores reales) 
const dbConfig = {
    host: 'SU_ENDPOINT_DE_RDS.amazonaws.com', // Endpoint de la instancia RDS 
    user: 'admin',
    password: 'SU_CONTRASEÑA',
    database: 'inventario'
};
app.get('/', async (req, res) => {
    let connection;
    try {
        // Establecer conexión con la base de datos privada 
        connection = await mysql.createConnection(dbConfig);
        // Consultar el inventario, ordenando por la fecha de ingreso 
        const [rows] = await connection.execute('SELECT * FROM archivos ORDER BY fecha_subida DESC');
        // Renderización de la Interfaz de Usuario (HTML) 
        let html = ` 
            <!DOCTYPE html> 
            <html lang="es"> 
            <head> 
                <meta charset="UTF-8"> 
                <title>CloudAsset Manager</title> 
                <style> 
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; background-color: #f4f4f9;} 
                    h1 { color: #ff9900; }  
                    .container { max-width: 1000px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); } 
                    table { border-collapse: collapse; width: 100%; margin-top: 20px; } 
                    th, td { padding: 12px; text-align: left; borderbottom: 1px solid #ddd; } 
                    th { background-color: #232f3e; color: white; fontweight: 500; } 
                    tr:hover { background-color: #f1f1f1; } 
                </style> 
            </head> 
            <body> 
                <div class="container"> 
                    <h1>☁️ CloudAsset Manager</h1> 
                    <p>Inventario de activos digitales sincronizado en tiempo real desde Amazon RDS.</p> 
                    <table> 
                        <tr> 
                            <th>ID</th> 
                            <th>Nombre del Activo</th> 
                            <th>Tamaño (Bytes)</th> 
                            <th>Fecha de Registro</th> 
                        </tr> 
        `;

        if (rows.length === 0) {
            html += `<tr><td colspan="4" style="text-align: center;">El inventario está vacío. Suba un archivo a Amazon S3.</td></tr>`;
        } else {
            rows.forEach(row => {
                html += ` 
                    <tr> 
                        <td>${row.id}</td> 
                        <td>${row.nombre_archivo}</td> 
                        <td>${row.tamaño_bytes.toLocaleString()}</td> 
                        <td>${new
                        Date(row.fecha_subida).toLocaleString('es-MX')}</td> 
                    </tr> 
                `;
            });
        }
        html += ` 
</table> 
</div> 
</body> 
</html> 
`;
        res.send(html);
    } catch (error) {
        console.error("Fallo de conexión a base de datos:", error);
        res.status(500).send(`<h2>Error interno del servidor</h2><p>No se pudo conectar a la base de datos.</p>`);
    } finally {
        if (connection) await connection.end();
    }
});
// Inicialización del servicio de escucha 
app.listen(port, () => {
    // Función de registro estandarizada 
    console.log(`Servidor web operativo y escuchando en el puerto 
${port}`);
}); 