# 💜 Discord Embed Creator - v2.0

Una aplicación moderna, elegante y completamente funcional para crear, previsualizar y guardar embeds de Discord. Diseñada con inspiración en herramientas profesionales con un sistema de temas claro/oscuro.

## ✨ Características Principales

### 🎨 Diseño Moderno
- **Interfaz de 3 columnas**: Panel de elementos, Vista previa en tiempo real, Acciones
- **Sistema de temas**: Cambio dinámico entre modo claro y oscuro
- **Animaciones suaves**: Transiciones elegantes y fluidas
- **Responsive**: Funciona perfectamente en desktop, tablet y móvil
- **Variables CSS avanzadas**: Sistema de diseño profesional

### 📝 Editor Visual
- **Modales elegantes**: Edición de cada campo en diálogos profesionales
- **Vista previa en vivo**: Ve los cambios instantáneamente
- **Contadores de caracteres**: Respeta los límites de Discord
- **Color picker**: Selector visual de colores para embeds

### 💾 Gestión de Embeds
- **Guardar localmente**: Almacenamiento en navegador sin servidor
- **Ver historial**: Acceso fácil a todos tus embeds guardados
- **Editar y eliminar**: Control total sobre tus creaciones
- **Exportar JSON**: Copia el código para usar en bots

### 📚 Plantillas Predefinidas
- 👋 Bienvenida
- 📢 Anuncio
- ❌ Error  
- ✅ Éxito

## 🚀 Inicio Rápido

### Opción 1: Usar localmente
```bash
# Simplemente abre index.html en tu navegador
# No requiere instalación ni dependencias
```

### Opción 2: Desplegar en Netlify
1. Descarga o clona este repositorio
2. Arrastra la carpeta a [netlify.com](https://netlify.com) (Drag & Drop)
3. ¡Listo! Tu sitio estará en vivo en segundos

### Opción 3: GitHub + Netlify
1. Sube el repositorio a GitHub
2. Conecta tu repositorio en Netlify
3. Despliegue automático en cada push

## 🎯 Cómo Usar

### 1. Crear un Embed
1. Haz clic en el campo que quieres editar (Título, Descripción, Color, etc.)
2. Se abrirá un modal elegante para editar
3. Los cambios se ven en la previsualización al instante
4. Haz clic en "Guardar" cuando termines

### 2. Guardar tu Embed
1. Una vez completo, haz clic en "Guardar Embed"
2. El embed se guardará en tu navegador
3. Puedes verlo en "Mis Embeds Guardados" en cualquier momento

### 3. Copiar el Código
1. Haz clic en "Copiar JSON"
2. El código JSON se copia automáticamente
3. Úsalo en tu bot de Discord

### 4. Usar Plantillas
1. Haz clic en el botón de "Plantillas"
2. Selecciona una plantilla
3. Se cargará automáticamente en el editor

## 🎨 Características de Diseño

### Sistema de Temas
- **Automático**: Detecta preferencia del sistema
- **Manual**: Botón para cambiar tema en el header
- **Persistente**: Tu elección se guarda

### Variables CSS Modernas
```css
--color-primary: Color principal (púrpura)
--color-background: Fondo
--color-surface: Superficies
--color-text: Texto principal
--color-text-secondary: Texto secundario
--color-border: Bordes
```

### Animaciones
- Fade in/out suave
- Slide up para modales
- Scale para elementos
- Transiciones en hover

## 🔧 Estructura del Proyecto

```
discord-embed-creator/
├── index.html              # HTML principal (estructura de 3 columnas)
├── styles.css              # CSS moderno con variables y temas
├── script.js               # JavaScript con modales dinámicos
├── netlify.toml            # Configuración Netlify
├── package.json            # Metadata y scripts
├── .gitignore              # Git ignore
└── Documentación/
    ├── README.md           # Este archivo
    ├── QUICK_START.md      # Inicio en 60 segundos
    ├── DEPLOYMENT_GUIDE.md # Guía de despliegue detallada
    ├── HOW_TO_USE.md       # Manual completo
    ├── FEATURES.md         # Lista de características
    └── example-embed.json   # Ejemplo de JSON
```

## 💻 Compatibilidad

- ✅ Chrome/Chromium (últimas 2 versiones)
- ✅ Firefox (últimas 2 versiones)  
- ✅ Safari (últimas 2 versiones)
- ✅ Edge (últimas 2 versiones)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🌐 Desplegar en Netlify

### Drag & Drop (Más Fácil)
1. Ve a [netlify.com](https://netlify.com)
2. Inicia sesión o crea cuenta
3. Arrastra la carpeta del proyecto
4. ¡Listo!

### GitHub Integration (Recomendado)
1. Sube a GitHub
2. Conecta en Netlify
3. Despliegue automático

### Netlify CLI
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

## 📊 Características Técnicas

### Frontend Puro
- Sin dependencias externas
- HTML5 semántico
- CSS3 con variables personalizadas
- JavaScript vanilla (ES6+)

### Storage
- **LocalStorage**: Para guardar embeds
- **SessionStorage**: Para estado temporal del editor
- **Totalmente offline**: Funciona sin internet

### Accesibilidad
- Estructura HTML accesible
- Focus management en modales
- Keyboard navigation completa
- Colores con contraste adecuado

## 🔐 Privacidad y Seguridad

- ✅ Todos los datos se guardan **localmente** en tu navegador
- ✅ **No se envía** información a ningún servidor
- ✅ **No se recopilan** datos personales
- ✅ Totalmente privado y seguro
- ✅ HTTPS automático en Netlify

## 📝 Límites de Discord

Discord tiene límites oficiales que respetamos:

| Campo | Límite |
|-------|--------|
| Título | 256 caracteres |
| Descripción | 4096 caracteres |
| Autor | 256 caracteres |
| Pie de página | 2048 caracteres |
| URL de imagen | Ilimitado |

## 🤖 Usar en Bots

### Python (discord.py)
```python
embed = discord.Embed(
    title="Tu Título",
    description="Tu descripción",
    color=discord.Color.from_rgb(138, 43, 226)  # #8A2BE2
)
await ctx.send(embed=embed)
```

### JavaScript (discord.js)
```javascript
const embed = new EmbedBuilder()
    .setTitle("Tu Título")
    .setDescription("Tu descripción")
    .setColor(0x8A2BE2);
```

## 🐛 Solución de Problemas

### No se guardan datos
- ✅ Abre en modo normal (no incógnito)
- ✅ Permite almacenamiento local
- ✅ Verifica que localStorage esté habilitado

### Los estilos se ven raro
- ✅ Actualiza la página (Ctrl+F5)
- ✅ Borra el caché del navegador
- ✅ Intenta en otro navegador

### Los embeds no aparecen
- ✅ Verifica que hayas completado al menos el título
- ✅ Intenta recargar la página
- ✅ Abre la consola (F12) para ver errores

## 📚 Documentación

- **[QUICK_START.md](QUICK_START.md)** - Inicia en 60 segundos
- **[HOW_TO_USE.md](HOW_TO_USE.md)** - Guía completa de uso
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Despliegue detallado
- **[FEATURES.md](FEATURES.md)** - Lista completa de características

## 🙏 Créditos

Desarrollado con ❤️ para la comunidad de Discord.

Inspirado en herramientas modernas como la página de Emed.

## 📄 Licencia

Este proyecto está bajo licencia MIT. Siéntete libre de usar, modificar y distribuir.

## 🔗 Enlaces Útiles

- [Documentación Discord](https://discord.com/developers/docs)
- [Discord.py](https://discordpy.readthedocs.io/)
- [Discord.js](https://discord.js.org/)
- [Netlify Docs](https://docs.netlify.com/)

---

**¿Preguntas?** Revisa la documentación o abre un issue en GitHub.

**¡Disfruta creando embeds!** 🚀✨

