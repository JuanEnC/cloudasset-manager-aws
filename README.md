# CloudAsset Manager

Plataforma automatizada de gestión, análisis y catalogación de activos digitales en la nube mediante arquitectura orientada a eventos (Event-Driven) e infraestructura aislada en subredes privadas.

[![AWS-Capa-Gratuita](https://img.shields.io/badge/AWS-Free%20Tier-FF9900?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)
[![Node.js-Version](https://img.shields.io/badge/Node.js-v20.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MySQL-Database](https://img.shields.io/badge/MySQL-v8.0-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License-ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

---

## Descripción del Proyecto

CloudAsset Manager es una solución de infraestructura cloud diseñada para automatizar por completo el ciclo de vida de los datos estructurados y no estructurados dentro de una organización. El sistema elimina la intervención humana en el registro de inventarios: la simple acción de cargar un archivo en un repositorio central desencadena un flujo automatizado que extrae sus metadatos (nombre, peso y fecha de creación) y los persiste de forma segura.

Toda la infraestructura crítica se encuentra blindada dentro de una Nube Virtual Privada (VPC), aislando los motores de base de datos del tráfico público de internet y exponiendo los resultados exclusivamente a través de un portal web de consulta en tiempo real.

---

## Arquitectura y Stack Tecnológico

El proyecto se despliega íntegramente sobre los límites del **AWS Free Tier**, garantizando un costo operativo de $0.00 USD mediante el uso estratégico de endpoints de red y lógica sin servidor (Serverless).

| Servicio / Tecnología | Componente | Función en la Arquitectura |
| :--- | :--- | :--- |
| **AWS IAM** | Gestión de Identidades | Control de permisos estricto mediante roles y políticas de menor privilegio. |
| **Amazon VPC** | Red Virtual Privada | Segmentación de red, aislamiento en subredes públicas/privadas y control de tráfico. |
| **Amazon S3** | Almacenamiento de Objetos | Repositorio central de archivos y detonador de eventos. |
| **AWS Lambda** | Computación Serverless | Microservicio encargado del procesamiento y extracción de metadatos. |
| **Amazon RDS (MySQL)** | Base de Datos Relacional | Almacenamiento estructurado de inventario en subred privada. |
| **Amazon EC2** | Servidor Virtual Linux | Servidor web encargado de la capa de presentación al usuario. |
| **Amazon CloudWatch** | Observabilidad | Recopilación de registros logs y gestión de alarmas de rendimiento. |
| **Express / Node.js** | Entorno de Desarrollo | Framework backend para la API de consulta y el procesador de datos. |

> [!NOTE]
> Para mantener el entorno libre de costos, la arquitectura omite intencionalmente el uso de NAT Gateways. En su lugar, utiliza un **S3 Gateway Endpoint** que permite a la función Lambda privada comunicarse de forma gratuita y segura con Amazon S3 sin salir al internet público.

---

## Estructura del Repositorio

El proyecto se organiza de forma modular para separar las responsabilidades de la capa lógica, la capa de presentación y la documentación técnica:

```text
cloudasset-manager/
│
├── lambda-processor/          # Microservicio Serverless (Capa Lógica)
│   ├── index.mjs              # Manejador del evento S3 e inserción en base de datos
│   ├── package.json           # Dependencias del procesador (mysql2)
│   └── README.md              # Especificaciones técnicas de la función Lambda
│
├── web-server/                # Servidor de Presentación (Capa de Interfaz)
│   ├── server.js              # Servidor HTTP Express y consultas SQL
│   ├── package.json           # Dependencias del servidor (express, mysql2)
│   └── README.md              # Instrucciones de despliegue en la instancia EC2
│
└── docs/                      # Activos de Documentación e Infraestructura
    ├── CloudAsset_Manager_Manual.pdf  # Manual técnico formal de implementación
    └── architecture-diagram.png       # Diagrama visual de la topología de red

```

---

## Flujo de Operación

El flujo de información a través del sistema sigue un patrón lineal y asíncrono para asegurar la escalabilidad:

1. **Carga de Archivo:** Un sistema externo u operador deposita un activo digital en el bucket de **Amazon S3**.
2. **Invocación por Evento:** S3 detecta la nueva inserción y publica un evento que despierta automáticamente a **AWS Lambda**.
3. **Procesamiento de Metadatos:** La función Lambda analiza el JSON del evento, extrae las dimensiones del objeto y establece una conexión con la base de datos a través de la red interna de la VPC.
4. **Persistencia Segura:** Los metadatos se insertan en la tabla de **Amazon RDS** utilizando consultas parametrizadas.
5. **Consulta Web:** Los usuarios acceden a la IP pública del servidor **Amazon EC2**, el cual realiza una petición de lectura a la base de datos privada y renderiza el inventario actualizado en tiempo real.

> [!IMPORTANT]
> Los Grupos de Seguridad (Security Groups) actúan como firewalls virtuales restrictivos. La base de datos RDS rechaza cualquier IP externa; solo acepta conexiones entrantes por el puerto 3306 si provienen explícitamente del Grupo de Seguridad del Servidor Web o del Grupo de Seguridad de la función Lambda.

---

## Guía de Despliegue Rápido

### Requisitos Previos

* Cuenta activa en Amazon Web Services (AWS).
* Node.js v20.x instalado en el entorno de desarrollo local para empaquetado.

### Pasos Fundamentales

1. **Configuración de Red:** Genere la VPC con 2 subredes públicas y 2 subredes privadas. Configure el S3 Gateway Endpoint en las tablas de enrutamiento privadas.
2. **Despliegue de Base de Datos:** Instancie un motor MySQL en RDS bajo la plantilla de capa gratuita, asegurando que el acceso público esté deshabilitado.
3. **Carga de Código Serverless:** Ingrese al directorio `lambda-processor/`, ejecute `npm install`, empaquete el contenido en un archivo `.zip` y súbalo a AWS Lambda asignando el rol correspondiente.
4. **Lanzamiento del Servidor Web:** Inicialice la instancia EC2 en la subred pública, clone los archivos de `web-server/`, instale las dependencias y ejecute `sudo node server.js`.

> [!WARNING]
> Nunca almacene credenciales de acceso, contraseñas maestras o llaves privadas (`.pem`) directamente en los archivos de este repositorio. Utilice variables de entorno o servicios de gestión de secretos para producción.

---

## Documentación Completa

Para acceder a las instrucciones detalladas paso a paso, explicaciones exhaustivas de cada comando, guías de resolución de problemas técnicos y configuraciones avanzadas de alertas operativas, consulte el documento principal del proyecto:

* [Manual Técnico de Implementación (PDF)](docs/CloudAsset_Manager_Manual.pdf)

---

## Autores

* **Juan Carlos López** - [JuanEnC](http://github.com/JuanEnC)
