# Cómo correr el backend de IA con Uvicorn

Este backend es el que debe quedar corriendo en local para que WordPress pueda hacer la petición a `http://localhost:8000/predict`.

## Requisitos

- Python instalado en Windows.
- Este proyecto dentro de la carpeta `back/`.
- El archivo `model.h5` y `scaler.pkl` deben estar en la misma carpeta que `py.py`.

## 1. Abrir una terminal en la carpeta `back`

La terminal debe apuntar a la carpeta del backend:

```powershell
RUTA\A\TU\PROYECTO\back
```

Si ya estás en otra carpeta, entra con:

```powershell
cd RUTA\A\TU\PROYECTO\back
```

## 2. Activar el entorno virtual

Si el entorno virtual ya existe en `venv/`, actívalo con:

```powershell
.\venv\Scripts\activate
```

Cuando se active, normalmente verás algo como `venv` al inicio de la línea de la terminal.

## 3. Instalar dependencias

Si todavía no instalaste los paquetes, ejecuta:

```powershell
pip install -r requirements.txt
```

Si el entorno virtual no estaba activo, este paso puede instalar cosas fuera del entorno correcto. Por eso conviene activarlo primero.

## 4. Levantar Uvicorn

Como el archivo principal se llama `py.py`, el comando correcto es:

```powershell
uvicorn py:app --reload --port 8000
```

Explicación:

- `py` es el nombre del archivo sin `.py`.
- `app` es la instancia de FastAPI que está dentro de `py.py`.
- `--port 8000` es importante porque el JavaScript espera ese puerto.
- `--reload` sirve para desarrollo local y reinicia el servidor cuando cambias el código.

## 5. Verificar que quedó levantado

Si todo salió bien, deberías poder abrir:

```text
http://localhost:8000/docs
```

Ahí FastAPI muestra la documentación automática y también puedes probar el endpoint `/predict`.

## 6. Qué debe pasar para que WordPress lo use

Para que el plugin de WordPress funcione, este backend debe estar corriendo al mismo tiempo que XAMPP.

El flujo correcto es:

1. Levantas XAMPP para WordPress.
2. Levantas este backend con Uvicorn.
3. La página de WordPress llama a `http://localhost:8000/predict`.

## Problemas comunes

### `Could not import module "py"`

Suele pasar si no ejecutas `uvicorn` desde la carpeta `back/`.

Solución:

```powershell
cd RUTA\A\TU\PROYECTO\back
uvicorn py:app --reload --port 8000
```

### `No such file or directory: model.h5` o `scaler.pkl`

Pasa si ejecutas el servidor desde otra carpeta.

Solución:

- Ejecuta `uvicorn` dentro de `back/`.
- Verifica que `model.h5` y `scaler.pkl` estén junto a `py.py`.

### `Address already in use`

Significa que el puerto `8000` ya está ocupado.

Solución:

- Cierra el proceso que está usando ese puerto.
- O cambia el puerto, por ejemplo:

```powershell
uvicorn py:app --reload --port 8001
```

Si cambias el puerto, también tendrías que actualizar la URL en el JavaScript que hace la petición.
