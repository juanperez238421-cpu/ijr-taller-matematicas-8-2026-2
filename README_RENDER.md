# Factorización 8.º — dos videos ManimCE

Proyecto audiovisual para **Instituto Jorge Robledo · Taller de Matemáticas 8.º · Docente: Juan Diego Pérez**.

## Videos

1. `Factorizacion8PresentacionEjercicios`
   - Reconocimiento de siete familias.
   - Mapa de decisiones.
   - Clasificación del taller original de 25 ejercicios.
   - Presentación detallada de ocho ejercicios sin revelar respuestas.

2. `Factorizacion8SolucionesPasoAPaso`
   - Solución explícita de los siete ejercicios diagnósticos y el reto.
   - Identificación del caso, transformación, factorización y verificación.
   - Dos posiciones fijas para los pasos activos, evitando colisiones con la verificación y el pie de página.

## Entorno de entrega

- Python 3.12 compatible.
- Manim Community Edition 0.20.1.
- 1920 × 1080.
- 30 fps.
- Fondo blanco.
- MP4 H.264, pixel format yuv420p.
- Normalización final explícita a 1920 × 1080 para evitar redondeos internos del marco lógico 16:9.
- Conversión de color dentro del filtro y codificación H.264 con un hilo para estabilidad en CI.
- La entrega incorpora `ffprobe`, decodificación integral, fotogramas de inspección y SHA-256.
- Ejecución final vinculada al PR técnico de control de calidad.
- El workflow remoto entrega primero los MP4 nativos; la normalización final se ejecuta fuera del runner.
- Sincronización final del artefacto nativo iniciada desde el PR 4.

## Prueba local

```bash
python -m py_compile factorizacion_8_dos_videos.py
manim -pql factorizacion_8_dos_videos.py Factorizacion8PresentacionEjercicios --format=mp4 --disable_caching
manim -pql factorizacion_8_dos_videos.py Factorizacion8SolucionesPasoAPaso --format=mp4 --disable_caching
```

## Render final

```bash
JR_FAST_MODE=0 JR_REAL_TIMER=0 manim -pqh factorizacion_8_dos_videos.py Factorizacion8PresentacionEjercicios --format=mp4 --disable_caching
JR_FAST_MODE=0 JR_REAL_TIMER=0 manim -pqh factorizacion_8_dos_videos.py Factorizacion8SolucionesPasoAPaso --format=mp4 --disable_caching
```

En un entorno sin interfaz, se neutraliza `xdg-open` para conservar el indicador literal `-pqh`.
