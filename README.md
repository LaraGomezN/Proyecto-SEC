# **Documentación del Proyecto-SEC**

## **1. Introducción**
Proyecto-SEC es una plataforma web diseñada para la gestión de publicaciones con etiquetas, autenticación de usuarios y sistema de reseñas. Su objetivo principal es proporcionar un espacio donde los usuarios puedan crear, visualizar, editar y eliminar publicaciones, así como interactuar a través de comentarios y puntuaciones.

---

## **2. Configuración de la Infraestructura**

El proyecto está dividido en **frontend** y **backend**, utilizando una arquitectura basada en microservicios. La infraestructura está diseñada para permitir escalabilidad y facilidad de mantenimiento.

### **2.1 Tecnologías Utilizadas**
- **Frontend:** React 19 con React Bootstrap y React Quill para edición de contenido.
- **Backend:** FastAPI con PostgreSQL como base de datos.
- **Autenticación:** JWT para gestión de sesiones seguras.
- **Infraestructura:** Docker y Docker Compose para contenedorización.
- **Despliegue en la nube:** Google Cloud Platform con soporte para escalabilidad horizontal.

### **2.2 Descripción de la Infraestructura**
- Se utilizan **contenedores Docker** para cada servicio (usuarios, posts, reviews y tags).
- El balanceo de carga se realiza mediante un **API Gateway**.
- Se emplea un **servicio de autenticación** separado para manejar la gestión de usuarios y sesiones.
- **Base de datos PostgreSQL** para almacenamiento de datos, con conexión gestionada por SQLAlchemy en FastAPI.
- Configuración de **CORS y seguridad de cabeceras** para proteger la API.

### **2.3 Esquema de Infraestructura**
_(Aquí se insertará una imagen con el esquema de infraestructura)_

---

## **3. API y Endpoints**

El sistema está dividido en cuatro microservicios principales:
- **Usuarios** (`/users`)
- **Posts** (`/posts`)
- **Reviews** (`/reviews`)
- **Tags** (`/tags`)

Cada servicio expone diferentes endpoints para su gestión.

### **3.1 Endpoints Principales**

#### **Autenticación y Usuarios (`/users`)**
- `POST /auth/register`: Registra un nuevo usuario.
- `POST /auth/login`: Inicia sesión y devuelve un token JWT.
- `GET /auth/verify-token/{token}`: Verifica la validez del token.
- `GET /users/{id}`: Obtiene la información de un usuario específico.

#### **Gestión de Publicaciones (`/posts`)**
- `POST /posts`: Crea un nuevo post (requiere autenticación).
- `GET /posts`: Obtiene todas las publicaciones.
- `GET /posts/{post_id}`: Obtiene los detalles de un post específico.
- `PUT /posts/{post_id}`: Modifica una publicación existente.
- `DELETE /posts/{post_id}`: Elimina un post.

#### **Gestión de Reseñas (`/reviews`)**
- `POST /reviews/`: Agrega una nueva reseña a un post.
- `GET /posts/{post_id}/reviews`: Obtiene todas las reseñas de un post.

#### **Gestión de Etiquetas (`/tags`)**
- `POST /tags`: Crea una nueva etiqueta.
- `GET /tags`: Obtiene todas las etiquetas disponibles.
- `POST /posts/{post_id}/tags/{tag_id}`: Asigna una etiqueta a una publicación.
- `GET /posts/{post_id}/tags`: Obtiene las etiquetas asociadas a un post.

---

## **4. Esquema de la Base de Datos**

El modelo de datos del sistema está diseñado en PostgreSQL con las siguientes entidades principales:

- **Usuarios (`users`)**: Almacena la información de los usuarios registrados.
- **Publicaciones (`posts`)**: Contiene las publicaciones creadas por los usuarios.
- **Reseñas (`reviews`)**: Almacena las reseñas que los usuarios dejan en los posts.
- **Etiquetas (`tags`)**: Lista de etiquetas disponibles en la plataforma.
- **Relaciones Post-Tags (`post_tags`)**: Relaciona las publicaciones con sus etiquetas.

### **Esquema Relacional**
![image](https://github.com/user-attachments/assets/6a368e4e-5bba-466d-9e1f-a608e8884fc2)
_

---

## **5. Decisiones de Diseño**

### **5.1 Arquitectura Basada en Microservicios**
El proyecto se diseñó como un conjunto de microservicios independientes para mejorar la escalabilidad y mantenibilidad. Cada servicio es responsable de una parte específica del sistema y se comunica con los demás mediante solicitudes HTTP.

### **5.2 Diseño de la Interfaz**
- **Frontend responsivo** desarrollado con **React Bootstrap**.
- **Editor WYSIWYG** para enriquecer el contenido de las publicaciones.
- **Filtrado de posts por etiquetas** para facilitar la búsqueda.
- **Confirmación previa** antes de eliminar una publicación.

### **5.3 Implementación de Seguridad**
- **JWT Tokens** para autenticación segura.
- **Protección de rutas sensibles** en el frontend.
- **CORS y cabeceras seguras** en FastAPI.
- **Encriptación de contraseñas** antes de almacenarlas en la base de datos.

---

## **6. Seguridad y Mecanismos de Protección**

Para garantizar la seguridad de la plataforma, se implementaron las siguientes medidas:

- **Autenticación con JWT:**  
  - Cada usuario obtiene un token después de iniciar sesión.
  - Se almacena de forma segura en el frontend y se envía en cada solicitud protegida.

- **Protección contra ataques comunes:**  
  - **CORS configurado** para restringir el acceso a dominios específicos.
  - **Validaciones de entrada** en el backend para evitar inyecciones SQL y XSS.
  - **Roles y permisos** para restringir acciones según el tipo de usuario.

- **Gestión de Errores y Logs:**  
  - Manejo adecuado de errores con mensajes claros.
  - Registros de actividad en la API para auditoría.

---

## **7. Flujo de Uso del Sistema**

1. **Inicio de Sesión y Registro:**  
   - El usuario se registra o inicia sesión.
   - Se genera un token JWT y se almacena en el frontend.

2. **Creación de Publicaciones:**  
   - El usuario crea un post usando el editor WYSIWYG.
   - Puede asignar etiquetas al post.

3. **Visualización y Filtrado de Posts:**  
   - Se muestran todas las publicaciones.
   - El usuario puede filtrar por etiquetas.

4. **Interacción con Posts:**  
   - Se pueden calificar publicaciones con reseñas.
   - Se pueden dejar comentarios.

5. **Administración de Posts:**  
   - Se pueden editar o eliminar publicaciones propias.
   - Se muestra una confirmación antes de eliminar.

---

## **8. Contribuciones**

Se aceptan contribuciones bajo las siguientes reglas:

1. **Realizar un Fork** del repositorio.
2. **Crear una nueva rama** para la funcionalidad (`feature/nueva-funcionalidad`).
3. **Realizar los cambios y hacer commit**.
4. **Abrir un Pull Request** para revisión.

## **9. Tutorial despligue**

Se aceptan contribuciones bajo las siguientes reglas:

1. Se debe realizar un git clone del repositorio en donde se va a crear la aplicación
2. Dentro de la carpeta del clone hay un archivo docker-compose.yml
3. **Realizar los cambios y hacer commit**.
4. **Abrir un Pull Request** para revisión.

---

## **9. Licencia**

Este proyecto está bajo la licencia **MIT**, lo que permite su uso, modificación y distribución libremente.

