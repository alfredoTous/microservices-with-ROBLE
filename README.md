# Documentación Técnica — Proyecto Microservicios con ROBLE

## 1. Introducción

Este proyecto implementa una arquitectura de microservicios dinámica integrada con la plataforma **ROBLE (API de Uninorte)**.  
El objetivo es permitir a los usuarios:

- Autenticarse con su cuenta ROBLE.
- Crear, ejecutar, editar y eliminar microservicios en tiempo real.
- Administrar todo desde un dashboard visual desarrollado en React.

La aplicación está totalmente dockerizada, de forma que puede desplegarse con un solo comando:

```bash
docker compose up --build
```

---

## 2. Arquitectura General

### Estructura de servicios

El sistema está compuesto por dos contenedores principales y múltiples microservicios dinámicos que se crean bajo demanda:

| Componente     | Tecnología       | Puerto                         | Rol                                                               |
|----------------|------------------|--------------------------------|-------------------------------------------------------------------|
| Frontend       | React + Vite     | 5173                           | Interfaz web del usuario                                          |
| Backend        | Python + FastAPI | 8000                           | API central que conecta el frontend, ROBLE y los microservicios  |
| Microservicios | FastAPI + Docker | Puertos dinámicos (32768, …)   | Módulos independientes generados y ejecutados en tiempo real     |

### Comunicación entre componentes

```
[Frontend 5173] → [Backend 8000] → [ROBLE API]
           ↘︎
          [Microservicios dinámicos (puertos aleatorios)]
```

El frontend envía solicitudes al backend (`localhost:8000`) para autenticación, gestión y control.  
El backend reenvía las peticiones hacia **ROBLE (API externa)**.  
Cuando se crean nuevos microservicios, estos se ejecutan en contenedores separados y se exponen automáticamente a través de puertos aleatorios gestionados por Docker.

---

## 3. Flujo de Autenticación

El sistema usa autenticación basada en tokens JWT provista por **ROBLE**.

### Etapas del flujo

#### Inicio de sesión (/login)

1. El frontend envía email y password al backend.  
2. El backend reenvía la solicitud a la API de ROBLE.  
3. Si las credenciales son válidas, ROBLE devuelve:
   - `accessToken` → usado para autenticar las peticiones.
   - `refreshToken` → usado para renovar sesiones.

#### Almacenamiento de tokens

- El `refreshToken` se guarda en una cookie HTTPOnly, inaccesible por JavaScript.
- El `accessToken` se guarda en memoria del frontend (mediante `setAccessToken`) y se envía en los headers:

```
Authorization: Bearer <accessToken>
```

#### Renovación de tokens (/refresh-token)

Si el `accessToken` expira, el backend usa el `refreshToken` almacenado en cookie para solicitar uno nuevo.  
Este proceso es **automático y transparente** para el usuario.

#### Verificación de sesión (/guard)

Antes de acceder al dashboard, el frontend verifica que el `accessToken` sigue siendo válido.  
Si no lo es, intenta refrescarlo. Si falla, redirige automáticamente al login.

---

## 4. Dashboard de Administración

Una vez autenticado, el usuario accede al Dashboard, donde puede:

- Listar los microservicios existentes.
- Crear nuevos microservicios (con su código Python).
- Editar o eliminar microservicios existentes.
- Iniciar o detener contenedores Docker asociados.
- Probar los endpoints mediante `/test` o `/run`.

El dashboard solo carga si el backend confirma que el `accessToken` es válido (`/guard = 200 OK`).

---

## 5. Creación de Microservicios Dinámicos

### Proceso general

El usuario crea un microservicio desde el frontend llenando: **nombre**, **descripción** y **código Python**.  

Ejemplo de payload enviado al backend:

```json
{
  "name": "hello",
  "description": "Ejemplo básico",
  "code": "def hello(): return {'msg': 'Hola Mundo'}",
  "includeAccessToken": true
}
```

El backend genera automáticamente:

- Un archivo `app.py` con el código del usuario.
- Un `Dockerfile` con FastAPI + Uvicorn.
- Un endpoint `/test` para validar el estado del microservicio.

---

## 6. Integración del Access Token en Microservicios

Si el usuario activa la opción **“Incluir accessToken”**, el backend agrega al `app.py` del microservicio:

```python
ACCESS_TOKEN = None  # Reemplazado automáticamente al ejecutar
```

Cuando el contenedor se enciende, el backend reemplaza esta variable con el **accessToken actual del usuario**, permitiendo que el microservicio haga solicitudes autenticadas directamente a ROBLE.

### Ejemplo de uso dentro de un microservicio:

```python
import os, requests

token = os.getenv("ACCESS_TOKEN")
headers = {"Authorization": f"Bearer {token}"}
res = requests.get("https://roble-api.openlab.uninorte.edu.co/data", headers=headers)
return res.json()
```

De esta forma, el usuario puede integrar peticiones autenticadas dentro de su propio código Python **sin exponer su token manualmente**.

---

## 7. Estructura Interna de los Microservicios

Cada microservicio creado tiene la siguiente estructura:

```
📦 microservice_name/
 ┣ 📜 app.py            ← Código del microservicio (FastAPI)
 ┣ 📜 Dockerfile        ← Definición del contenedor
 ┗ 🐳 imagen Docker     ← Se construye automáticamente al encenderlo
```

El backend crea y destruye contenedores automáticamente según las acciones del usuario (encender, detener o eliminar).

---

## 8. Ejemplos de Microservicios

### 🧩 Ejemplo 1 — Hello World

```python
def hello():
    return {"message": "Hello, World!"}
```

📍 Acceso:
```
http://localhost:<puerto>/hello
```

📤 Respuesta:
```json
{"message": "Hello, World!"}
```

---

### 🧮 Ejemplo 2 — Suma con parámetros GET

```python
from fastapi import Request

def sum(request: Request):
    a = int(request.query_params.get("a", 0))
    b = int(request.query_params.get("b", 0))
    result = a + b
    return {"sum": result, "detail": f"the sum of {a} + {b} es {result}"}
```

📍 Acceso:
```
http://localhost:<puerto>/sum?a=5&b=10
```

📤 Respuesta:
```json
{"sum": 15, "detail": "the sum of 5 + 10 es 15"}
```

---

## 9. Ejecución y Puertos Dinámicos

Cuando el usuario presiona “Encender”, el backend:

1. Construye la imagen Docker:
   ```bash
   docker build -t <name>_image .
   ```
2. Elimina contenedores antiguos del mismo nombre.
3. Inicia un nuevo contenedor con un puerto aleatorio:
   ```bash
   docker run -d -p 0:8000 <name>_image
   ```
4. Devuelve el estado y el puerto asignado al frontend.

Ejemplo de URLs:
- `http://localhost:32769/test`
- `http://localhost:32769/`

---

## 10. Despliegue Local (Docker Compose)

### Requisitos

- Docker y Docker Compose v2+
- Puertos 5173 y 8000 libres
- Archivo `.env` con:

```env
ROBLE_API_BASE_URL=https://roble-api.openlab.uninorte.edu.co
ROBLE_PROJECT_NAME=prueba_35940e468f
```

### Comandos

```bash
docker compose down -v
docker compose up --build
```

### Acceso

| Servicio  | URL                        |
|-----------|----------------------------|
| Frontend  | http://localhost:5173      |
| Backend   | http://localhost:8000/docs |

---

## 11. Seguridad y Consideraciones

- El `refreshToken` **nunca** es accesible por JavaScript.
- Los microservicios corren en contenedores aislados.
- Todos los puertos son asignados dinámicamente y liberados al detener.
- El `accessToken` se reemplaza automáticamente sin exponer credenciales en el código.

---

## 12. Flujo General del Sistema

```
[1] Usuario → /login (frontend)
       ↓
[2] FastAPI backend → /auth/login (ROBLE)
       ↓
[3] ROBLE responde con accessToken + refreshToken
       ↓
[4] accessToken en memoria (frontend), refreshToken en cookie
       ↓
[5] Dashboard se desbloquea
       ↓
[6] Usuario crea/edita microservicios
       ↓
[7] Backend genera app.py + Dockerfile + contenedor
       ↓
[8] ACCESS_TOKEN se inyecta si el toggle está activado
       ↓
[9] Usuario ejecuta /test o /run desde la interfaz
```

---

💡 **Nota final:**  
Este sistema ofrece una integración completa entre FastAPI, React y ROBLE, permitiendo crear y ejecutar microservicios autenticados y aislados desde una interfaz visual moderna.
