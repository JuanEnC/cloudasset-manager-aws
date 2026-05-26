# Lambda Processor: Extractor de Metadatos (S3 a RDS)

## Descripción General
Este directorio contiene el código fuente de la función AWS Lambda encargada de procesar los eventos de almacenamiento. Actúa como el componente lógico central dentro de la arquitectura orientada a eventos, interceptando las notificaciones de archivos cargados en Amazon S3, extrayendo sus metadatos y registrándolos en una base de datos Amazon RDS (MySQL) ubicada en una subred privada.

## Funcionamiento del Código (`index.mjs`)
El script principal se ejecuta de manera asíncrona al ser invocado por un evento de S3. Su flujo de operación consta de tres etapas fundamentales:

1. **Análisis del Evento (Parsing):** El manejador (`handler`) recibe la estructura JSON generada por S3. Analiza el arreglo de registros para extraer el nombre del bucket, la clave del objeto (decodificando espacios y caracteres especiales) y el tamaño del archivo en bytes.
2. **Conexión a Base de Datos:** A través de la librería `mysql2/promise`, la función establece una conexión segura con la instancia de base de datos utilizando parámetros de entorno definidos.
3. **Persistencia y Ejecución SQL:**
   * Ejecuta una instrucción preventiva `CREATE TABLE IF NOT EXISTS` para garantizar la integridad del esquema lógico previo a la inserción.
   * Ejecuta una consulta parametrizada `INSERT INTO` para almacenar los metadatos y la marca de tiempo (timestamp) de la carga, previniendo vulnerabilidades de inyección SQL.
   * Cierra la conexión de red y retorna un código de estado HTTP 200 al servicio de origen.

## Guía de Configuración en AWS
Para asegurar el correcto funcionamiento de este código en la nube, la función Lambda debe aprovisionarse con las siguientes especificaciones críticas en la consola de AWS:

* **Entorno de Ejecución:** Desplegar sobre Node.js 20.x (o superior) en arquitectura x86_64.
* **Gestión de Accesos (IAM):** Asignar un Rol de Ejecución que incorpore explícitamente las políticas `AWSLambdaVPCAccessExecutionRole` (para la creación de interfaces de red elásticas) y `AmazonS3ReadOnlyAccess`.
* **Aislamiento de Red (VPC):** Integrar la función Lambda en la misma red virtual (VPC) que aloja la instancia de RDS, seleccionando exclusivamente las subredes privadas y un Grupo de Seguridad que autorice el tráfico saliente hacia el puerto 3306.
* **Tiempo de Espera (Timeout):** Incrementar el parámetro de finalización predeterminado a 30 segundos en la sección *General configuration* para mitigar fallos por arranques en frío (Cold Starts) dentro de la VPC.
* **Enrutamiento del Controlador:** Si el archivo `index.mjs` y el directorio `node_modules` se encuentran encapsulados en una subcarpeta (ej. `lambda-code/`), actualizar el valor del *Handler* en *Runtime settings* para reflejar la ruta exacta (ej. `lambda-code/index.handler`).
* **Activación por Eventos:** Añadir un disparador (Trigger) apuntando al bucket de S3 objetivo, filtrando exclusivamente para eventos de tipo *All object create events*.