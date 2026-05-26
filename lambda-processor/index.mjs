/* index.mjs - Lógica de Procesamiento de Metadatos */ 
import mysql from 'mysql2/promise'; 
 
export const handler = async (event) => { 
    // Extracción de datos del evento S3 
    const bucket = event.Records[0].s3.bucket.name; 
    const key = 
decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' ')); 
    const size = event.Records[0].s3.object.size; 
 
    // Configuración de conexión (Utilizar variables de entorno en producción) 
    const dbConfig = { 
        host: 'SU_ENDPOINT_DE_RDS', 
        user: 'admin', 
        password: 'SU_CONTRASEÑA', 
        database: 'inventario' 
    }; 
 
    let connection; 
    try { 
        connection = await mysql.createConnection(dbConfig); 
 
        // Creación preventiva de la tabla estructurada 
        await connection.execute(` 
            CREATE TABLE IF NOT EXISTS archivos ( 
                id INT AUTO_INCREMENT PRIMARY KEY, 
                nombre_archivo VARCHAR(255) NOT NULL, 
                tamaño_bytes INT NOT NULL, 
                fecha_subida DATETIME NOT NULL 
            ) 
        `); 
 
        // Inserción de metadatos analíticos 
        await connection.execute( 
            'INSERT INTO archivos (nombre_archivo, tamaño_bytes, fecha_subida) VALUES (?, ?, ?)', 
            [key, size, new Date()] 
        ); 
 
        return { statusCode: 200, body: "Registro exitoso" }; 
    } catch (error) { 
        console.error("Error operativo:", error); 
        throw error; 
    } finally { 
        if (connection) await connection.end(); 
    } 
}; 