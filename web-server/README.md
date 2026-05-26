# Web Server: Portal de Inventario (EC2)

## Descripción General
Este directorio contiene el código fuente de la aplicación web desarrollada en Node.js que opera como la capa de presentación del sistema *CloudAsset Manager*. Su función es exponer una interfaz de usuario accesible vía HTTP que consulta en tiempo real los metadatos almacenados en la base de datos Amazon RDS, proporcionando un inventario sincronizado de los activos digitales.

## Funcionamiento del Código (`server.js`)
El servidor utiliza el framework `express` para gestionar las solicitudes web y consta de las siguientes etapas operativas:

1. **Inicialización y Configuración:** El servidor se configura para escuchar el tráfico entrante en el puerto 80 (HTTP estándar). Los parámetros de conexión a la base de datos se definen utilizando las credenciales y el endpoint interno de la instancia RDS.
2. **Conexión Asíncrona (Backend):** Al recibir una solicitud GET en la ruta principal (`/`), el sistema establece una conexión segura con la base de datos ubicada en la subred privada mediante la librería `mysql2/promise`.
3. **Consulta Estructurada:** Ejecuta una instrucción SQL (`SELECT * FROM archivos ORDER BY fecha_subida DESC`) para extraer todos los registros de inventario de forma cronológica inversa.
4. **Renderización (Frontend):** Construye dinámicamente el documento HTML, inyectando los datos obtenidos en una tabla estructurada y aplicando estilos CSS mínimos e integrados para la visualización. En caso de error de red, retorna un código HTTP 500 con un mensaje de fallo.

## Guía de Configuración en AWS
Para el despliegue exitoso de este servidor web en la infraestructura de AWS, la instancia virtual debe configurarse con los siguientes parámetros:

* **Aprovisionamiento (EC2):** Desplegar una instancia (ej. `t2.micro` o `t3.micro`) utilizando una Amazon Machine Image (AMI) basada en Amazon Linux 2023.
* **Redes y Acceso (VPC):**
  * Ubicar la instancia explícitamente en una **Subred Pública** y habilitar la asignación automática de una **IPv4 Pública**.
  * Asignar un Grupo de Seguridad que permita tráfico entrante (Inbound) por el puerto 80 (HTTP) desde cualquier origen (`0.0.0.0/0`).
* **Seguridad de Administración (IAM):** Asignar un Perfil de Instancia (Instance Profile) que incluya la política `AmazonSSMManagedInstanceCore`. Esto permite conectar al servidor mediante AWS Systems Manager (Session Manager) sin necesidad de abrir el puerto 22 (SSH).
* **Despliegue de Código:**
  * Actualizar el sistema e instalar el entorno de ejecución Node.js a través de la terminal conectada.
  * Transferir los archivos `server.js` y `package.json` a un directorio local en la instancia.
  * Ejecutar `npm install` para descargar las dependencias y levantar el servicio utilizando `sudo node server.js` (los privilegios de superusuario son mandatorios para escuchar en el puerto 80).