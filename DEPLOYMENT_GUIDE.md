# 🚀 Guía de Despliegue en Netlify

Esta guía te ayudará a desplegar tu Discord Embed Creator en Netlify de forma rápida y sencilla.

## ¿Por qué Netlify?

- ✅ **Gratuito**: Plan gratuito completo
- ✅ **Rápido**: CDN global para máxima velocidad
- ✅ **Fácil**: Despliegue con un clic
- ✅ **Seguro**: HTTPS automático
- ✅ **Perfecto para sitios estáticos**: No requiere servidor

## 📋 Requisitos Previos

- Cuenta de GitHub (recomendado, pero opcional)
- El código del proyecto descargado o clonado

## 🔑 Método 1: Deploy con GitHub (Recomendado)

### Paso 1: Preparar tu repositorio en GitHub

```bash
# Si aún no tienes un repositorio
git init
git add .
git commit -m "Initial commit: Discord Embed Creator"
git remote add origin https://github.com/tuusuario/discord-embed-creator.git
git branch -M main
git push -u origin main
```

### Paso 2: Conectar a Netlify

1. Ve a [netlify.com](https://www.netlify.com) e **inicia sesión** (o crea una cuenta)
2. Haz clic en **"New site from Git"** o **"Add new site"**
3. Selecciona **"GitHub"** como proveedor
4. Autoriza a Netlify para acceder a tu cuenta de GitHub
5. Busca y selecciona el repositorio `discord-embed-creator`
6. Deja las configuraciones por defecto:
   - **Build command**: (vacío)
   - **Publish directory**: `.` (punto)
7. Haz clic en **"Deploy site"**

¡Listo! Tu sitio estará en vivo en pocos segundos.

### Paso 3: Configurar dominio personalizado (Opcional)

1. En Netlify, ve a **Site settings** → **Domain management**
2. Haz clic en **"Add custom domain"**
3. Ingresa tu dominio personalizado
4. Sigue las instrucciones para configurar los registros DNS

## 📦 Método 2: Drag & Drop (Más Rápido)

### Paso 1: Preparar los archivos

1. Descarga o copia todos los archivos del proyecto
2. Asegúrate de tener estos archivos en la carpeta principal:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `netlify.toml`
   - Otros archivos opcionales

### Paso 2: Subir a Netlify

1. Ve a [app.netlify.com](https://app.netlify.com)
2. Inicia sesión
3. Busca la sección **"Drag & drop your site"**
4. **Arrastra y suelta** toda la carpeta del proyecto
5. ¡Listo! Tu sitio estará en vivo inmediatamente

**Nota**: Con este método, los futuros cambios deberás subirlos manualmente nuevamente.

## 🔧 Método 3: Netlify CLI (Para Desarrolladores)

### Instalación

```bash
# Con npm
npm install -g netlify-cli

# Con yarn
yarn global add netlify-cli

# Con Homebrew (Mac)
brew install netlify-cli
```

### Despliegue

```bash
# Inicia sesión
netlify login

# Navega a tu proyecto
cd /ruta/a/discord-embed-creator

# Deploy en preview
netlify deploy

# Deploy a producción
netlify deploy --prod
```

## ✅ Verificar el Despliegue

Después de desplegar, verifica que todo funciona correctamente:

1. **Accede a tu sitio**: Haz clic en el enlace proporcionado por Netlify
2. **Prueba las funciones**:
   - Crea un embed
   - Modifica los valores
   - Guarda un embed
   - Copia el JSON
   - Carga desde plantillas

3. **Verifica en DevTools** (F12):
   - No debe haber errores en la consola
   - Los estilos deben cargarse correctamente

## 🔒 Configuración Recomendada en Netlify

### Site Settings

1. **General**:
   - Asegúrate de que el sitio está en **"Active"**

2. **Domain management**:
   - Configura un dominio personalizado si lo deseas

3. **Build & deploy**:
   - **Build settings**: Sin comando de build requerido
   - **Publish directory**: `.` (punto - directorio raíz)

### Despliegues Continuos

Una vez conectado con GitHub, Netlify automáticamente:
- Detecta cambios en tu repositorio
- Redeploy automático en cada push a `main`
- Crea previsualizaciones de pull requests

## 🚨 Solución de Problemas

### "Cannot GET /" Error

**Causa**: El archivo `netlify.toml` no se está procesando correctamente.

**Solución**:
1. Verifica que `netlify.toml` esté en la raíz del proyecto
2. Asegúrate de que contiene la regla de redirect:
   ```toml
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```
3. Redeploy desde Netlify Dashboard

### Los archivos CSS/JS no cargan

**Causa**: Rutas relativas incorrectas.

**Solución**:
1. Los archivos deben estar en el mismo directorio que `index.html`
2. Verifica que los nombres de archivo coincidan exactamente
3. Reinicia el navegador y borra el caché (Ctrl+Shift+Del)

### Los datos no se guardan

**Causa**: Esto es normal en modo incógnito o si `localStorage` está deshabilitado.

**Solución**:
- Los datos se guardan en `localStorage` del navegador
- Abre en modo normal (no incógnito)
- Verifica que permitiste almacenamiento local

## 📊 Monitoreo y Analytics

Netlify ofrece estadísticas útiles:

1. Ve a **Analytics** en tu sitio Netlify
2. Puedes ver:
   - Visitas y tráfico
   - Desempeño
   - Errores de despliegue

## 🔄 Actualizar el Sitio

### Con GitHub
```bash
git add .
git commit -m "Descripción del cambio"
git push origin main
```
Netlify detectará automáticamente el cambio y desplegará.

### Con Netlify CLI
```bash
netlify deploy --prod
```

### Con Drag & Drop
1. Ve al dashboard de Netlify
2. Arrastra y suelta nuevamente los archivos

## 🆘 Soporte

- **Documentación Netlify**: https://docs.netlify.com/
- **Discord Developers**: https://discord.com/developers/docs
- **Comunidad**: GitHub Issues

---

¡Tu sitio ahora está en vivo! 🎉

Comparte el enlace de tu sitio Netlify con tus amigos y usalo para crear embeds de Discord.
