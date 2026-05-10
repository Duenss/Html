# 📚 Guía de Uso - Discord Embed Creator

## 🎯 Inicio Rápido

### 1. Acceder a la Aplicación
- Abre la URL de tu sitio Netlify en cualquier navegador
- Verás la interfaz con el editor en la izquierda y la previsualización en la derecha

### 2. Crear tu Primer Embed

1. **Ingresa un Título**
   - Escribe el título del embed (ej: "Bienvenida")
   - Máximo 256 caracteres
   - Verás el contador actualizar en tiempo real

2. **Escribe la Descripción**
   - Escribe el contenido principal
   - Máximo 4096 caracteres
   - Se actualiza en la previsualización al instante

3. **Selecciona un Color**
   - Haz clic en el cuadrado de color
   - Elige el color que prefieras
   - O escribe el código hexadecimal manualmente

4. **Opcional: Añade Detalles**
   - Imagen URL: Imagen grande del embed
   - Thumbnail: Imagen pequeña en la esquina
   - Autor: Nombre del autor
   - Pie de página: Texto al final
   - URL: Enlace del embed

5. **Guarda tu Embed**
   - Haz clic en "💾 Guardar Embed"
   - Verás una notificación de confirmación

### 3. Usar Plantillas (Acceso Rápido)

1. Haz clic en **"Plantillas"** en el menú lateral
2. Elige una plantilla:
   - 👋 Bienvenida
   - 📢 Anuncio
   - ❌ Error
   - ✅ Éxito
3. La plantilla se cargará automáticamente en el editor
4. Personaliza según necesites

### 4. Exportar el Código

1. Completa tu embed
2. Haz clic en **"📋 Copiar JSON"**
3. El código se copia automáticamente
4. Úsalo en tu bot de Discord

## 🎨 Personalización Detallada

### Colores Sugeridos

| Color | Código | Uso |
|-------|--------|-----|
| Azul Discord | #7289DA | General |
| Verde | #43B581 | Éxito |
| Rojo | #F04747 | Error |
| Naranja | #FAA61A | Advertencia |
| Púrpura | #9C27B0 | Premium |
| Cyan | #00BCD4 | Información |

### Ejemplos de URLs de Imagen

Para URLs de imagen, puedes usar:
- Imágenes hospedadas en tu servidor web
- URLs de Discord CDN
- URLs de sitios como Imgur, etc.

Formato: `https://ejemplo.com/imagen.png`

## 💾 Gestionar tus Embeds

### Ver Embeds Guardados
1. Haz clic en **"Mis Embeds"** en el menú
2. Verás todas tus creaciones guardadas
3. Ordenadas de más reciente a más antigua

### Operaciones en Embeds
- **✏️ Editar**: Carga el embed en el editor para modificarlo
- **🗑️ Eliminar**: Borra ese embed específico
- **🗑️ Limpiar Todo**: Elimina TODOS los embeds (⚠️ No se puede deshacer)

### Información por Embed
- Título del embed
- Vista previa de la descripción
- Fecha y hora de creación
- Color del embed

## 🤖 Usar en tu Bot de Discord

### Con Python (discord.py)

```python
import discord
from discord.ext import commands
import json

bot = commands.Bot(command_prefix='!')

@bot.command()
async def embed(ctx):
    # Copia el JSON desde la aplicación
    embed_data = {
        "title": "Mi Embed",
        "description": "Descripción del embed",
        "color": 0x7289DA
    }
    
    embed = discord.Embed(
        title=embed_data['title'],
        description=embed_data['description'],
        color=int(embed_data['color'].replace('#', ''), 16)
    )
    
    await ctx.send(embed=embed)

bot.run('TU_TOKEN')
```

### Con JavaScript (discord.js v14)

```javascript
const { EmbedBuilder } = require('discord.js');

const embed = new EmbedBuilder()
    .setTitle("Mi Embed")
    .setDescription("Descripción del embed")
    .setColor(0x7289DA)
    .setAuthor({ name: "Nombre del Autor" })
    .setFooter({ text: "Pie de página" });

interaction.reply({ embeds: [embed] });
```

### Con Webhooks de Discord

```bash
curl -X POST \
  https://discordapp.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN \
  -H 'Content-Type: application/json' \
  -d '{
    "embeds": [{
      "title": "Mi Embed",
      "description": "Descripción",
      "color": 7506394
    }]
  }'
```

**Nota**: El color debe ser un número decimal. Convierte hex a decimal:
- #7289DA → 7506394

## 🖼️ Trabajo con Imágenes

### Insertar Imagen Principal
1. Abre una URL de una imagen (debe ser válida y accesible)
2. Cópiala en el campo "Imagen URL"
3. Verás cómo se actualiza en la previsualización

### Insertar Thumbnail (Imagen Pequeña)
1. Similar al anterior, pero en "Thumbnail URL"
2. Se mostrará en la esquina del embed

### Tips para Imágenes
- Usa URLs con extensión (.png, .jpg, etc)
- Asegúrate de que sean URLs directas
- Las imágenes deben ser accesibles públicamente
- Tamaño recomendado: 1200x630px para imagen principal

## 🔤 Límites de Caracteres Discord

Discord tiene límites oficiales:

| Campo | Límite |
|-------|--------|
| Título | 256 caracteres |
| Descripción | 4096 caracteres |
| Autor | 256 caracteres |
| Pie de página | 2048 caracteres |
| Campo nombre | 256 caracteres |
| Campo valor | 1024 caracteres |

**Nota**: La aplicación respeta estos límites automáticamente.

## 💾 Dónde se Guardan mis Embeds

Los embeds se guardan en **localStorage** de tu navegador:

- **Ventaja**: Siempre disponibles, sin servidor
- **Ubicación**: Almacenamiento local del navegador
- **Persistencia**: Permanecen incluso después de cerrar
- **Privacidad**: Solo tú tienes acceso

## ⚠️ Precauciones

1. **No limpies el caché del navegador**
   - Borraría todos tus embeds guardados

2. **No uses navegación privada**
   - Los datos no se guardarán permanentemente

3. **Exporta regularmente**
   - Copia el JSON de tus embeds importantes

4. **Respalda tus datos**
   - Guarda los JSON en un archivo de texto

## 🐛 Problemas Comunes

### Las imágenes no aparecen
- **Causa**: URL inválida o imagen inaccesible
- **Solución**: Verifica que la URL sea correcta y directa

### Los datos no se guardan
- **Causa**: Modo incógnito o localStorage deshabilitado
- **Solución**: Abre en modo normal, permite almacenamiento local

### El embed se ve raro
- **Causa**: Caracteres especiales
- **Solución**: Usa texto plano, evita caracteres raros

### No puedo copiar el JSON
- **Causa**: Problema de permisos
- **Solución**: Intenta nuevamente, verifica permisos del navegador

## 🎓 Mejores Prácticas

### Para Embeds Bonitos
1. ✅ Usa títulos claros y concisos
2. ✅ Descripción detallada pero no excesiva
3. ✅ Color que contraste con tu servidor
4. ✅ Imágenes de buena calidad
5. ✅ Pie de página descriptivo

### Para Embeds Informativos
1. ✅ Título: Asunto principal
2. ✅ Descripción: Detalles importantes
3. ✅ Autor: Quién/qué lo publicó
4. ✅ Pie: Fecha o fuente

### Para Embeds de Error/Éxito
1. ✅ Usa colores apropiados (rojo para error, verde para éxito)
2. ✅ Mensajes claros
3. ✅ Instrucciones si es necesario

## 🚀 Casos de Uso

- 📋 **Paneles de reglas**: Embeds informativos bonitos
- 🎉 **Anuncios**: Con imágenes y colores llamativos
- 👋 **Bienvenida**: Para nuevos miembros
- ✅ **Confirmaciones**: De acciones realizadas
- 📊 **Estadísticas**: Con información formateada
- 🎮 **Logs**: De eventos del servidor

## 📖 Recursos Adicionales

- [Discord Embed Limits](https://discord.com/developers/docs/resources/message#embed-object)
- [Discord.py Documentation](https://discordpy.readthedocs.io/)
- [Discord.js Guide](https://discord.js.org/#/docs)
- [Discord Webhooks](https://discord.com/api/docs/resources/webhook)

---

¿Necesitas ayuda adicional? Revisa la documentación oficial o abre un issue en GitHub.

¡Happy embed creating! 🎨✨
