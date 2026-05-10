// ========================================
// CONFIG Y ESTADO
// ========================================

const STORAGE_KEY = 'discordEmbeds';
const THEME_KEY = 'appTheme';

let embedData = {
  title: null,
  description: null,
  color: '#00B7FF',
  image: null,
  thumbnail: null,
  author: null,
  footer: null,
  url: null,
  fields: []
};

let messageData = {
  username: 'Discord Bot',
  avatar_url: null,
  content: null
};

let componentRows = [];
let imageLoadErrorUrl = null;

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (char) => {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char];
  });
}

function parseDiscordMarkdown(text) {
  if (!text) return '';

  const escaped = escapeHtml(text.replace(/\r\n?/g, '\n'));

  const formattedCodeBlocks = escaped.replace(/```([\s\S]*?)```/g, (_, content) => {
    return `<code class="md-code-block">${content.replace(/\n/g, '<br>')}</code>`;
  });

  const formattedInline = formattedCodeBlocks.replace(/`([^`\n]+?)`/g, '<code class="md-inline-code">$1</code>');
  const formattedUnderlineBoldItalic = formattedInline.replace(/__\*\*\*([\s\S]+?)\*\*\*__/g, '<strong><em><u>$1</u></em></strong>');
  const formattedUnderlineBold = formattedUnderlineBoldItalic.replace(/__\*\*([\s\S]+?)\*\*__/g, '<strong><u>$1</u></strong>');
  const formattedUnderlineItalic = formattedUnderlineBold.replace(/__\*([\s\S]+?)\*__/g, '<em><u>$1</u></em>');
  const formattedUnderline = formattedUnderlineItalic.replace(/__([\s\S]+?)__/g, '<u>$1</u>');
  const formattedBoldItalic = formattedUnderline.replace(/\*\*\*([\s\S]+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  const formattedBold = formattedBoldItalic.replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>');
  const formattedItalic = formattedBold.replace(/(^|[^*])\*([^*\n][\s\S]*?[^*\n])\*(?!\*)/g, '$1<em>$2</em>');
  const formattedItalicUnderscore = formattedItalic.replace(/(^|[^_])_([^_\n][\s\S]*?[^_\n])_(?!_)/g, '$1<em>$2</em>');
  const formattedStrike = formattedItalicUnderscore.replace(/~~([\s\S]+?)~~/g, '<s>$1</s>');
  const formattedBlockquote = formattedStrike.replace(/(^|\n)>\s?(.*?)(?=(\n|$))/g, '$1<span class="md-quote">&gt; $2</span>');
  const formattedLineBreaks = formattedBlockquote.replace(/\n/g, '<br>');

  return formattedLineBreaks;
}

function isImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmedUrl = url.trim();
  try {
    const parsed = new URL(trimmedUrl);
    // Verificar extensión
    if (/\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(parsed.pathname)) {
      return true;
    }
    // Verificar dominios conocidos de hosting de imágenes
    const imageDomains = ['imgur.com', 'imgix.net', 'cloudinary.com', 'i.imgur.com', 'media.discordapp.net', 'cdn.discordapp.com', 'images-ext-1.discordapp.net', 'images-ext-2.discordapp.net'];
    if (imageDomains.some(domain => parsed.hostname.includes(domain))) {
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

function isHttpUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

function extractUrlFromHtml(html) {
  if (!html || typeof html !== 'string') return null;
  const hrefMatch = html.match(/href="(https?:[^"\s]+)"/i);
  if (hrefMatch) return hrefMatch[1];
  const srcMatch = html.match(/src="(https?:[^"\s]+)"/i);
  if (srcMatch) return srcMatch[1];
  return null;
}

function loadPreviewImage(url) {
  const imageEl = document.querySelector('.embed-image');
  if (!imageEl) return;
  
  if (!url) {
    imageEl.style.backgroundImage = '';
    imageEl.style.display = 'none';
    imageEl.classList.remove('active');
    return;
  }

  if (imageLoadErrorUrl === url) {
    imageEl.style.backgroundImage = '';
    imageEl.style.display = 'none';
    imageEl.classList.remove('active');
    return;
  }

  // Limpiar eventos anteriores
  const img = new Image();
  img.onload = null;
  img.onerror = null;

  const loadTimeout = setTimeout(() => {
    imageLoadErrorUrl = url;
    imageEl.style.backgroundImage = '';
    imageEl.style.display = 'none';
    imageEl.classList.remove('active');
    showToast('⏱️ La imagen tardó demasiado en cargar.', 'warning');
  }, 8000);

  img.onload = () => {
    clearTimeout(loadTimeout);
    imageLoadErrorUrl = null;
    imageEl.style.display = 'block';
    imageEl.classList.add('active');
  };

  img.onerror = () => {
    clearTimeout(loadTimeout);
    imageLoadErrorUrl = url;
    imageEl.style.backgroundImage = '';
    imageEl.style.display = 'none';
    imageEl.classList.remove('active');
    showToast('❌ No se pudo cargar la imagen. Revisa la URL o la conexión.', 'error');
  };

  img.src = url;
  imageEl.style.backgroundImage = `url('${url}')`;
}

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setupEventListeners();
  loadEmbedFromStorage();
  updatePreview();
});

// ========================================
// TEMA (LIGHT/DARK)
// ========================================

function initTheme() {
  const html = document.documentElement;
  const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
  
  html.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem(THEME_KEY, newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const btn = document.getElementById('btnTheme');
  if (btn) {
    btn.title = theme === 'light' ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro';
  }
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
  // Tema
  const btnTheme = document.getElementById('btnTheme');
  if (btnTheme) btnTheme.addEventListener('click', toggleTheme);

  // Elementos - abrir modales de edición / arrastrar
  const draggableItems = document.querySelectorAll('.draggable-item');
  draggableItems.forEach(item => {
    item.addEventListener('click', () => {
      const elementType = item.dataset.elementType;
      openEditModal(elementType);
    });
    item.addEventListener('dragstart', handleDragStart);
  });

  const previewWrapper = document.getElementById('previewWrapper');
  if (previewWrapper) {
    previewWrapper.addEventListener('dragenter', handleDragOver);
    previewWrapper.addEventListener('dragover', handleDragOver);
    previewWrapper.addEventListener('dragleave', handleDragLeave);
    previewWrapper.addEventListener('drop', handleDrop);
  }

  const botAvatarWrapper = document.getElementById('botAvatarWrapper');
  if (botAvatarWrapper) {
    botAvatarWrapper.addEventListener('click', () => openEditModal('bot'));
  }

  const messageText = document.getElementById('messageText');
  if (messageText) {
    messageText.addEventListener('click', () => openEditModal('message'));
  }

  const colorIndicator = document.getElementById('embedColorIndicator');
  if (colorIndicator) {
    colorIndicator.addEventListener('click', () => openEditModal('color'));
  }

  // Botones de acción
  const saveBtn = document.getElementById('saveBtn');
  if (saveBtn) saveBtn.addEventListener('click', saveEmbed);

  const copyCodeBtn = document.getElementById('copyCodeBtn');
  if (copyCodeBtn) copyCodeBtn.addEventListener('click', copyToClipboard);

  const sendBtn = document.getElementById('sendBtn');
  if (sendBtn) sendBtn.addEventListener('click', sendToWebhook);

  const clearBtn = document.getElementById('clearBtn');
  if (clearBtn) clearBtn.addEventListener('click', clearForm);

  const btnSaved = document.getElementById('btnSaved');
  if (btnSaved) btnSaved.addEventListener('click', openSavedModal);

  const btnTemplates = document.getElementById('btnTemplates');
  if (btnTemplates) btnTemplates.addEventListener('click', openTemplatesModal);
}

// ========================================
// MODALES DE EDICIÓN
// ========================================

function openEditModal(field) {
  const title = {
    bot: 'Editar Configuración del Bot',
    title: 'Editar Título',
    description: 'Editar Descripción',
    message: 'Editar Mensaje',
    color: 'Seleccionar Color',
    image: 'Imagen del Embed',
    thumbnail: 'Thumbnail',
    author: 'Información del Autor',
    footer: 'Pie de Página',
    fields: 'Editar Campos',
    url: 'URL del Embed',
    row: 'Nueva Fila',
    button: 'Botón',
    link_button: 'Botón de Enlace',
    select_menu: 'Menú de Selección',
    user_role_menu: 'Usuarios/Roles',
    channel_menu: 'Canales',
    image2: 'Imagen 2'
  };

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.tabIndex = '-1';

  let bodyContent = '';

  if (field === 'title') {
    bodyContent = `
      <div class="form-group">
        <label for="editTitle">Título (máx. 256 caracteres)</label>
        <input type="text" id="editTitle" maxlength="256" placeholder="Título del embed" value="${embedData.title || ''}">
        <div class="format-toolbar">
          <button type="button" class="format-button" onclick="applyTextFormat('title', 'bold')">B</button>
          <button type="button" class="format-button" onclick="applyTextFormat('title', 'italic')">I</button>
          <button type="button" class="format-button" onclick="applyTextFormat('title', 'underline')">U</button>
          <button type="button" class="format-button" onclick="applyTextFormat('title', 'strike')">S</button>
          <button type="button" class="format-button" onclick="applyTextFormat('title', 'code')">&lt;/&gt;</button>
          <button type="button" class="format-button" onclick="applyTextFormat('title', 'link')">🔗</button>
        </div>
        <small id="titleLen">0/256</small>
      </div>
      <div class="form-group">
        <label for="editUrl">URL (opcional) - hace el título clickable</label>
        <input type="url" id="editUrl" placeholder="https://ejemplo.com" value="${embedData.url || ''}">
      </div>
    `;
  } else if (field === 'bot') {
    bodyContent = `
      <div class="form-group">
        <label for="editBotName">Nombre del Bot</label>
        <input type="text" id="editBotName" maxlength="64" placeholder="Discord Bot" value="${messageData.username || 'Discord Bot'}">
      </div>
      <div class="form-group">
        <label for="editBotAvatar">URL del Avatar</label>
        <input type="url" id="editBotAvatar" placeholder="https://ejemplo.com/avatar.png" value="${messageData.avatar_url || ''}">
        <small>La imagen debe ser una URL directa</small>
      </div>
    `;
  } else if (field === 'description') {
    bodyContent = `
      <div class="form-group">
        <label for="editDescription">Descripción (máx. 4096 caracteres)</label>
        <div class="format-toolbar">
          <button type="button" class="format-button" onclick="applyTextFormat('description', 'bold')">B</button>
          <button type="button" class="format-button" onclick="applyTextFormat('description', 'italic')">I</button>
          <button type="button" class="format-button" onclick="applyTextFormat('description', 'underline')">U</button>
          <button type="button" class="format-button" onclick="applyTextFormat('description', 'strike')">S</button>
          <button type="button" class="format-button" onclick="applyTextFormat('description', 'code')">&lt;/&gt;</button>
          <button type="button" class="format-button" onclick="applyTextFormat('description', 'link')">🔗</button>
        </div>
        <textarea id="editDescription" maxlength="4096" placeholder="Descripción del embed">${embedData.description || ''}</textarea>
        <small id="descLen">0/4096</small>
        <small>Shift + Enter para nueva línea</small>
      </div>
    `;
  } else if (field === 'fields') {
    const fieldItems = embedData.fields.map(fieldData => `
      <div class="field-item">
        <div>
          <strong>${fieldData.name}</strong>
          <p>${fieldData.value}</p>
        </div>
        <div class="field-actions">
          <button class="btn btn-secondary" type="button" onclick="openFieldModal(${fieldData.id})">Editar</button>
          <button class="btn btn-secondary" type="button" onclick="deleteField(${fieldData.id})">Eliminar</button>
        </div>
      </div>
    `).join('');

    bodyContent = `
      <div class="form-group">
        <button type="button" class="btn btn-primary" onclick="addNewField()">Agregar Campo</button>
      </div>
      <div class="field-list">
        ${fieldItems || '<p style="color: var(--color-text-secondary);">No hay campos agregados aún.</p>'}
      </div>
    `;
  } else if (field === 'row') {
    const row = addNewRow();
    openRowModal(row.id);
    return;
  } else if (['button', 'link_button', 'select_menu', 'user_role_menu', 'channel_menu', 'image2'].includes(field)) {
    const component = addComponentToRow(field);
    openComponentModal(component.id);
    return;
  } else if (field === 'message') {
    bodyContent = `
      <div class="form-group">
        <label for="editMessage">Mensaje del Bot</label>
        <textarea id="editMessage" maxlength="2048" placeholder="Texto del mensaje...">${messageData.content || ''}</textarea>
        <small id="messageLen">${(messageData.content || '').length}/2048</small>
      </div>
    `;
  } else if (field === 'color') {
    bodyContent = `
      <div class="form-group">
        <label>Color Hexadecimal</label>
        <div style="display: flex; gap: 12px; align-items: center;">
          <label for="editColor" style="margin:0; width: 60px; height: 40px; display:flex; align-items:center; justify-content:center;">
            <input type="color" id="editColor" value="${embedData.color || '#00B7FF'}" style="width: 100%; height: 100%; cursor: pointer; border: 1px solid var(--color-border); border-radius: 6px; padding: 0;">
          </label>
          <label for="editColorText" style="flex: 1; margin: 0;">
            <input type="text" id="editColorText" maxlength="7" placeholder="#00B7FF" value="${embedData.color || '#00B7FF'}" style="width: 100%;">
          </label>
        </div>
      </div>
    `;
  } else if (field === 'image') {
    bodyContent = `
      <div class="form-group">
        <label for="editImage">URL de la Imagen</label>
        <input type="url" id="editImage" placeholder="https://ejemplo.com/imagen.png" value="${embedData.image || ''}">
        <small>Usa una URL de imagen directa (PNG, JPG, GIF, WebP, SVG, etc.). La imagen debe ser accesible públicamente desde el navegador.</small>
      </div>
    `;
  } else if (field === 'thumbnail') {
    bodyContent = `
      <div class="form-group">
        <label for="editThumbnail">URL del Thumbnail</label>
        <input type="url" id="editThumbnail" placeholder="https://ejemplo.com/thumb.png" value="${embedData.thumbnail || ''}">
        <small>Usa una URL de imagen directa para el thumbnail.</small>
      </div>
    `;
  } else if (field === 'author') {
    bodyContent = `
      <div class="form-group">
        <label for="editAuthor">Nombre del Autor (máx. 256 caracteres)</label>
        <input type="text" id="editAuthor" maxlength="256" placeholder="Nombre del autor" value="${embedData.author || ''}">
      </div>
    `;
  } else if (field === 'footer') {
    bodyContent = `
      <div class="form-group">
        <label for="editFooter">Pie de Página (máx. 2048 caracteres)</label>
        <input type="text" id="editFooter" maxlength="2048" placeholder="Texto del pie de página" value="${embedData.footer || ''}">
      </div>
    `;
  } else if (field === 'url') {
    bodyContent = `
      <div class="form-group">
        <label for="editUrl">URL del Embed</label>
        <input type="url" id="editUrl" placeholder="https://ejemplo.com" value="${embedData.url || ''}">
        <small>El embed será clickeable hacia esta URL</small>
      </div>
    `;
  }

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>${title[field]}</h3>
        <button class="modal-close">×</button>
      </div>
      <div class="modal-body">
        ${bodyContent}
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
        <button class="btn btn-primary" onclick="saveEditField('${field}')">Guardar</button>
      </div>
    </div>
  `;

  document.getElementById('modalContainer').appendChild(modal);
  modal.focus();

  // Close button
  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
  
  // Enter to save (no lo aplicamos dentro de textarea)
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      saveEditField(field);
    }
  });

  // Update counters
  if (field === 'title') {
    const input = document.getElementById('editTitle');
    input?.addEventListener('input', (e) => {
      document.getElementById('titleLen').textContent = `${e.target.value.length}/256`;
    });
    document.getElementById('titleLen').textContent = `${input?.value.length || 0}/256`;
    input?.focus();
  } else if (field === 'description') {
    const input = document.getElementById('editDescription');
    input?.addEventListener('input', (e) => {
      document.getElementById('descLen').textContent = `${e.target.value.length}/4096`;
    });
    document.getElementById('descLen').textContent = `${input?.value.length || 0}/4096`;
    input?.focus();
  } else if (field === 'message') {
    const input = document.getElementById('editMessage');
    input?.addEventListener('input', (e) => {
      document.getElementById('messageLen').textContent = `${e.target.value.length}/2048`;
    });
    document.getElementById('messageLen').textContent = `${input?.value.length || 0}/2048`;
    input?.focus();
  } else if (field === 'color') {
    const colorInput = document.getElementById('editColor');
    const colorText = document.getElementById('editColorText');
    colorInput?.addEventListener('input', (e) => {
      colorText.value = e.target.value.toUpperCase();
    });
    colorText?.addEventListener('input', (e) => {
      if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
        colorInput.value = e.target.value;
      }
    });
    colorInput?.focus();
  } else {
    const input = modal.querySelector('input[type="url"], input[type="text"]');
    input?.focus();
  }
}

function saveEditField(field) {
  let value = null;

  if (field === 'title') {
    value = document.getElementById('editTitle')?.value || null;
    embedData.url = document.getElementById('editUrl')?.value || null;
  } else if (field === 'description') {
    value = document.getElementById('editDescription')?.value || null;
  } else if (field === 'color') {
    value = document.getElementById('editColorText')?.value || '#00B7FF';
  } else if (field === 'image') {
    value = document.getElementById('editImage')?.value.trim() || null;
    if (value && !isImageUrl(value)) {
      showToast('⚠️ Ingresa una URL de imagen directa válida para la imagen.', 'warning');
      return;
    }
  } else if (field === 'thumbnail') {
    value = document.getElementById('editThumbnail')?.value.trim() || null;
    if (value && !isImageUrl(value)) {
      showToast('⚠️ Ingresa una URL de imagen directa válida para el thumbnail.', 'warning');
      return;
    }
  } else if (field === 'author') {
    value = document.getElementById('editAuthor')?.value || null;
  } else if (field === 'footer') {
    value = document.getElementById('editFooter')?.value || null;
  } else if (field === 'url') {
    value = document.getElementById('editUrl')?.value || null;
  } else if (field === 'bot') {
    messageData.username = document.getElementById('editBotName')?.value || 'Discord Bot';
    messageData.avatar_url = document.getElementById('editBotAvatar')?.value || null;
    updatePreview();
    closeAllModals();
    showToast('Bot actualizado', 'success');
    return;
  } else if (field === 'message') {
    messageData.content = document.getElementById('editMessage')?.value || null;
    updatePreview();
    closeAllModals();
    showToast('Mensaje actualizado', 'success');
    return;
  } else if (field === 'fields') {
    updatePreview();
    closeAllModals();
    showToast('Campos actualizados', 'success');
    return;
  }

  embedData[field] = value;
  updatePreview();
  closeAllModals();
  showToast(`${field.charAt(0).toUpperCase() + field.slice(1)} actualizado`, 'success');
}

// ========================================
// VISTA PREVIA
// ========================================

function updatePreview() {
  const embedPreview = document.getElementById('embedPreview');
  const embed = embedPreview.querySelector('.embed-body');
  
  if (!embed) return;

  // Actualizar color
  const colorBox = document.getElementById('embedColorBox');
  const colorIndicator = document.getElementById('embedColorIndicator');
  if (colorBox) {
    colorBox.style.backgroundColor = embedData.color || '#00B7FF';
  }
  if (colorIndicator) {
    colorIndicator.style.borderColor = embedData.color || '#00B7FF';
  }
  if (embedPreview) {
    embedPreview.style.borderLeftColor = embedData.color || '#00B7FF';
  }

  // Actualizar título
  const titleEl = embed.querySelector('.embed-title');
  if (titleEl) {
    titleEl.classList.toggle('empty', !embedData.title);
    titleEl.setAttribute('data-placeholder', 'Haz clic para añadir título');
    titleEl.innerHTML = '';

    if (embedData.title) {
      if (embedData.url) {
        const link = document.createElement('a');
        link.href = embedData.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.innerHTML = parseDiscordMarkdown(embedData.title);
        titleEl.appendChild(link);
      } else {
        titleEl.innerHTML = parseDiscordMarkdown(embedData.title);
      }
    }

    titleEl.onclick = () => openEditModal('title');
  }

  // Actualizar descripción
  const descEl = embed.querySelector('.embed-description');
  if (descEl) {
    descEl.innerHTML = '';
    descEl.classList.toggle('empty', !embedData.description);
    descEl.setAttribute('data-placeholder', 'Haz clic para añadir descripción');
    if (embedData.description) {
      descEl.innerHTML = parseDiscordMarkdown(embedData.description);
    }
    descEl.onclick = () => openEditModal('description');
  }

  // Actualizar autor
  const authorEl = embed.querySelector('.embed-author');
  if (authorEl) {
    authorEl.innerHTML = embedData.author ? parseDiscordMarkdown(embedData.author) : '';
    authorEl.classList.toggle('empty', !embedData.author);
    authorEl.style.display = embedData.author ? 'block' : 'none';
    authorEl.onclick = () => openEditModal('author');
  }

  // Actualizar thumbnail
  const thumbnailEl = embed.querySelector('.embed-thumbnail');
  if (thumbnailEl) {
    if (embedData.thumbnail) {
      thumbnailEl.style.display = 'block';
      thumbnailEl.style.backgroundImage = `url('${embedData.thumbnail}')`;
      thumbnailEl.classList.add('active');
    } else {
      thumbnailEl.style.display = 'block';
      thumbnailEl.style.backgroundImage = 'none';
      thumbnailEl.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
      thumbnailEl.classList.remove('active');
    }
    thumbnailEl.style.cursor = 'pointer';
    thumbnailEl.onclick = () => openEditModal('thumbnail');
  }

  // Actualizar imagen grande
  const imageEl = embed.querySelector('.embed-image');
  if (imageEl) {
    const overlay = imageEl.querySelector('.image-overlay');
    imageEl.style.cursor = 'pointer';
    imageEl.onclick = () => openEditModal('image');

    if (embedData.image) {
      loadPreviewImage(embedData.image);
      imageEl.classList.remove('placeholder');
      if (embedData.url) {
        overlay.textContent = embedData.url;
        imageEl.classList.add('show-url');
      } else {
        overlay.textContent = '📷';
        imageEl.classList.remove('show-url');
      }
    } else {
      overlay.textContent = '📷';
      imageEl.classList.remove('show-url');
      imageEl.style.backgroundImage = '';
      imageEl.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
      imageEl.style.display = 'block';
      imageEl.classList.remove('active');
      imageEl.classList.add('placeholder');
    }
  }

  // Actualizar campos
  const fieldsWrapper = embed.querySelector('.embed-fields');
  if (fieldsWrapper) {
    fieldsWrapper.innerHTML = '';
    embedData.fields.forEach(fieldData => {
      const fieldEl = document.createElement('div');
      fieldEl.className = 'embed-field';
      fieldEl.innerHTML = `
        <div class="embed-field-title">${fieldData.name}</div>
        <div class="embed-field-value">${fieldData.value}</div>
      `;
      fieldsWrapper.appendChild(fieldEl);
    });
  }

  // Actualizar pie de página
  const footerEl = embed.querySelector('.embed-footer');
  if (footerEl) {
    footerEl.innerHTML = embedData.footer ? parseDiscordMarkdown(embedData.footer) : '';
    footerEl.classList.toggle('empty', !embedData.footer);
    footerEl.style.display = embedData.footer ? 'block' : 'none';
    footerEl.onclick = () => openEditModal('footer');
  }

  // Actualizar filas y componentes
  const rowsContainer = document.getElementById('componentRows');
  if (rowsContainer) {
    rowsContainer.innerHTML = '';
    componentRows.forEach((row) => {
      const rowEl = document.createElement('div');
      rowEl.className = 'component-row';
      rowEl.innerHTML = `
        <div class="row-header">
          <span>${row.label}</span>
          <div class="row-actions">
            <button class="btn btn-secondary" type="button" onclick="openRowModal(${row.id})">Editar</button>
            <button class="btn btn-secondary" type="button" onclick="deleteRow(${row.id})">Eliminar</button>
          </div>
        </div>
        <div class="row-components">
          ${row.components.map(component => `
            <button class="component-chip component-${component.type}" type="button" onclick="openComponentModal(${component.id})">
              ${component.label}
            </button>
          `).join('')}
        </div>
      `;
      rowsContainer.appendChild(rowEl);
    });
  }

  // Actualizar mensaje del bot
  const messageTextEl = document.getElementById('messageText');
  if (messageTextEl) {
    if (messageData.content) {
      messageTextEl.innerHTML = parseDiscordMarkdown(messageData.content);
    } else {
      messageTextEl.textContent = 'Haz clic para agregar un mensaje...';
    }
    messageTextEl.classList.toggle('empty', !messageData.content);
    messageTextEl.setAttribute('data-placeholder', 'Haz clic para agregar un mensaje...');
    messageTextEl.onclick = () => openEditModal('message');
  }

  // Actualizar bot
  const botNameEl = document.querySelector('.bot-username');
  const botAvatarEl = document.querySelector('.bot-avatar');
  if (botNameEl) {
    botNameEl.textContent = messageData.username;
    botNameEl.onclick = () => openEditModal('bot');
  }
  if (botAvatarEl) {
    if (messageData.avatar_url) {
      botAvatarEl.innerHTML = `<img src="${messageData.avatar_url}" alt="Bot Avatar">`;
    } else {
      botAvatarEl.textContent = messageData.username?.charAt(0).toUpperCase() || 'B';
    }
    botAvatarEl.onclick = () => openEditModal('bot');
  }

  saveEmbedToStorage();
}

// ========================================
// GUARDAR EMBED
// ========================================

function saveEmbed() {
  if (!embedData.title) {
    showToast('Por favor ingresa un título', 'error');
    return;
  }

  const embeds = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const newEmbed = {
    id: Date.now(),
    ...embedData,
    messageData: { ...messageData },
    componentRows: [...componentRows],
    createdAt: new Date().toLocaleString('es-ES')
  };

  embeds.push(newEmbed);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(embeds));
  showToast('✅ Embed guardado correctamente', 'success');
}

function saveEmbedToStorage() {
  sessionStorage.setItem('currentEmbed', JSON.stringify({ embedData, messageData, componentRows }));
}

function loadEmbedFromStorage() {
  const saved = sessionStorage.getItem('currentEmbed');
  if (saved) {
    try {
      const stored = JSON.parse(saved);
      embedData = stored.embedData || embedData;
      messageData = stored.messageData || messageData;
      componentRows = stored.componentRows || [];
    } catch (e) {
      console.log('No saved embed found');
    }
  }
}

// ========================================
// COPIAR JSON
// ========================================

function copyToClipboard() {
  const jsonData = {
    message: messageData.content,
    username: messageData.username,
    avatar_url: messageData.avatar_url,
    title: embedData.title,
    description: embedData.description,
    color: embedData.color,
    image: embedData.image,
    thumbnail: embedData.thumbnail,
    author: embedData.author,
    footer: embedData.footer,
    url: embedData.url,
    fields: embedData.fields,
    componentRows
  };

  const jsonString = JSON.stringify(jsonData, null, 2);
  
  navigator.clipboard.writeText(jsonString).then(() => {
    showToast('📋 JSON copiado al portapapeles', 'success');
  }).catch(() => {
    showToast('Error al copiar', 'error');
  });
}

// ========================================
// ENVIAR A WEBHOOK
// ========================================

function sendToWebhook() {
  const webhookUrl = document.getElementById('webhookUrl').value.trim();
  if (!webhookUrl) {
    showToast('⚠️ Ingresa la URL del webhook', 'warning');
    return;
  }

  if (!webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
    showToast('⚠️ URL del webhook inválida', 'warning');
    return;
  }

  const payload = {
    username: messageData.username,
    avatar_url: messageData.avatar_url,
    content: messageData.content
  };

  if (embedData.title || embedData.description || embedData.fields.length > 0) {
    payload.embeds = [{
      title: embedData.title,
      description: embedData.description,
      color: parseInt(embedData.color.replace('#', ''), 16),
      image: embedData.image ? { url: embedData.image } : undefined,
      thumbnail: embedData.thumbnail ? { url: embedData.thumbnail } : undefined,
      author: embedData.author ? { name: typeof embedData.author === 'string' ? embedData.author : embedData.author.name, icon_url: embedData.author?.icon_url, url: embedData.author?.url } : undefined,
      footer: embedData.footer ? { text: typeof embedData.footer === 'string' ? embedData.footer : embedData.footer.text, icon_url: embedData.footer?.icon_url } : undefined,
      url: embedData.url,
      fields: embedData.fields
    }];
  }

  if (componentRows.length > 0) {
    payload.components = componentRows;
  }

  fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  .then(response => {
    if (response.ok) {
      showToast('✅ Mensaje enviado a Discord', 'success');
    } else {
      return response.text().then(text => {
        throw new Error(`Error ${response.status}: ${text}`);
      });
    }
  })
  .catch(error => {
    console.error('Error sending webhook:', error);
    showToast('❌ Error al enviar: ' + error.message, 'error');
  });
}

// ========================================
// LIMPIAR FORMULARIO
// ========================================

function clearForm() {
  if (confirm('¿Deseas limpiar todos los campos?')) {
    embedData = {
      title: null,
      description: null,
      color: '#00B7FF',
      image: null,
      thumbnail: null,
      author: null,
      footer: null,
      url: null,
      fields: []
    };
    messageData = {
      username: 'Discord Bot',
      avatar_url: null,
      content: null
    };
    componentRows = [];
    updatePreview();
    showToast('🔄 Formulario limpiado', 'success');
  }
}

// ========================================
// MODALES DE LISTA
// ========================================

function openSavedModal() {
  const embeds = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.tabIndex = '-1';

  let contentHTML = '';
  if (embeds.length === 0) {
    contentHTML = '<p style="text-align: center; color: var(--color-text-secondary);">📭 No hay embeds guardados</p>';
  } else {
    contentHTML = embeds.reverse().map(embed => `
      <div style="padding: 12px; border: 1px solid var(--color-border); border-radius: 6px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
        <div style="flex: 1;">
          <p style="font-weight: 600; margin-bottom: 4px;">${embed.title}</p>
          <small style="color: var(--color-text-secondary);">${embed.createdAt}</small>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-secondary" onclick="loadEmbedToEditor(${embed.id})">Editar</button>
          <button class="btn btn-secondary" onclick="deleteEmbed(${embed.id})" style="background-color: rgba(255, 84, 89, 0.1); color: var(--color-error);">Eliminar</button>
        </div>
      </div>
    `).join('');
  }

  modal.innerHTML = `
    <div class="modal-content" style="max-width: 600px;">
      <div class="modal-header">
        <h3>Mis Embeds Guardados</h3>
        <button class="modal-close">×</button>
      </div>
      <div class="modal-body" style="max-height: 60vh; overflow-y: auto;">
        ${contentHTML}
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cerrar</button>
      </div>
    </div>
  `;

  document.getElementById('modalContainer').appendChild(modal);
  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
}

function loadEmbedToEditor(id) {
  const embeds = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const embed = embeds.find(e => e.id === id);
  
  if (embed) {
    const { id: _id, createdAt, messageData: savedMessageData, componentRows: savedRows, ...rest } = embed;
    embedData = { ...rest };
    messageData = savedMessageData || messageData;
    componentRows = savedRows || [];
    updatePreview();
    closeAllModals();
    showToast('✏️ Embed cargado en el editor', 'success');
  }
}

function deleteEmbed(id) {
  if (confirm('¿Deseas eliminar este embed?')) {
    let embeds = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    embeds = embeds.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(embeds));
    
    // Reabrir modal
    closeAllModals();
    openSavedModal();
    showToast('🗑️ Embed eliminado', 'success');
  }
}

// ========================================
// PLANTILLAS
// ========================================

const templates = {
  welcome: {
    title: '👋 Bienvenido',
    description: 'Nos alegra que te unas a nuestra comunidad',
    color: '#8A2BE2',
    author: 'Servidor'
  },
  announcement: {
    title: '📢 Anuncio Importante',
    description: 'Este es un anuncio importante',
    color: '#FAA61A',
    author: 'Anuncios'
  },
  error: {
    title: '❌ Error',
    description: 'Ha ocurrido un error',
    color: '#FF5454',
    author: 'Sistema'
  },
  success: {
    title: '✅ Éxito',
    description: 'Operación completada correctamente',
    color: '#22C55E',
    author: 'Sistema'
  }
};

function openTemplatesModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.tabIndex = '-1';

  const templatesHTML = Object.entries(templates).map(([key, template]) => `
    <button onclick="loadTemplate('${key}')" style="padding: 16px; background-color: var(--color-background); border: 1px solid var(--color-border); border-radius: 8px; margin-bottom: 12px; text-align: left; cursor: pointer; transition: all 250ms; width: 100%;" onmouseover="this.style.borderColor='var(--color-primary)'" onmouseout="this.style.borderColor='var(--color-border)'">
      <p style="font-weight: 600; margin-bottom: 4px;">${template.title}</p>
      <small style="color: var(--color-text-secondary);">Color: ${template.color}</small>
    </button>
  `).join('');

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Plantillas</h3>
        <button class="modal-close">×</button>
      </div>
      <div class="modal-body">
        ${templatesHTML}
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cerrar</button>
      </div>
    </div>
  `;

  document.getElementById('modalContainer').appendChild(modal);
  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
}

function loadTemplate(templateName) {
  const template = templates[templateName];
  if (template) {
    embedData = {
      ...embedData,
      ...template
    };
    updatePreview();
    closeAllModals();
    showToast(`📋 Plantilla "${template.title}" cargada`, 'success');
  }
}

// ========================================
// UTILIDADES
// ========================================

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function applyTextFormat(field, command) {
  const input = document.getElementById(field === 'title' ? 'editTitle' : 'editDescription');
  if (!input) return;

  const start = input.selectionStart;
  const end = input.selectionEnd;
  const value = input.value;
  const selected = value.slice(start, end) || 'Texto';
  let formatted = selected;

  switch (command) {
    case 'bold':
      formatted = `**${selected}**`;
      break;
    case 'italic':
      formatted = `*${selected}*`;
      break;
    case 'underline':
      formatted = `__${selected}__`;
      break;
    case 'strike':
      formatted = `~~${selected}~~`;
      break;
    case 'code':
      formatted = '`' + selected + '`';
      break;
    case 'link': {
      const url = prompt('URL para el texto clickeable', 'https://');
      if (!url) return;
      formatted = `[${selected}](${url})`;
      if (field === 'title') {
        const urlInput = document.getElementById('editUrl');
        if (urlInput) urlInput.value = url;
      }
      break;
    }
  }

  input.value = value.slice(0, start) + formatted + value.slice(end);
  input.focus();
  const cursorPos = start + formatted.length;
  input.setSelectionRange(cursorPos, cursorPos);

  if (field === 'title') {
    document.getElementById('titleLen').textContent = `${input.value.length}/256`;
  } else {
    document.getElementById('descLen').textContent = `${input.value.length}/4096`;
  }
}

function handleDragStart(event) {
  event.dataTransfer.setData('text/plain', event.currentTarget.dataset.elementType);
}

function handleDragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'copy';
  event.currentTarget.classList.add('drop-target');
}

function handleDragLeave(event) {
  event.currentTarget.classList.remove('drop-target');
}

function handleDrop(event) {
  event.preventDefault();
  event.currentTarget.classList.remove('drop-target');
  const field = event.dataTransfer.getData('text/plain');
  const uriList = event.dataTransfer.getData('text/uri-list') || '';
  const htmlData = event.dataTransfer.getData('text/html') || '';
  const urlFromUri = uriList.split('\n').find(Boolean) || '';
  const textUrl = event.dataTransfer.getData('text/plain') || '';
  const htmlUrl = extractUrlFromHtml(htmlData);
  const candidateUrl = urlFromUri || htmlUrl || textUrl;
  const imageUrl = isHttpUrl(candidateUrl) ? candidateUrl.trim() : null;

  if (imageUrl) {
    embedData.image = imageUrl;
    updatePreview();
    showToast('✅ Imagen cargada en el preview', 'success');
    return;
  }

  if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
    const file = event.dataTransfer.files[0];
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        embedData.image = e.target.result;
        updatePreview();
        showToast('✅ Imagen local cargada en el preview', 'success');
      };
      reader.readAsDataURL(file);
      return;
    }
  }

  if (field === 'fields') {
    addNewField();
    openEditModal('fields');
    return;
  }

  if (field) {
    openEditModal(field);
    return;
  }

  showToast('Arrastra un elemento válido o una URL de imagen directa.', 'warning');
}

function addNewField() {
  const id = Date.now();
  embedData.fields.push({
    id,
    name: 'Nuevo campo',
    value: 'Valor del campo',
    inline: false
  });
  updatePreview();
  openFieldModal(id);
}

function openFieldModal(fieldId) {
  const fieldData = embedData.fields.find((item) => item.id === fieldId);
  if (!fieldData) return;

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.tabIndex = '-1';

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Editar Campo</h3>
        <button class="modal-close">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Nombre</label>
          <input type="text" id="editFieldName" maxlength="256" value="${fieldData.name}">
        </div>
        <div class="form-group">
          <label>Valor</label>
          <textarea id="editFieldValue" maxlength="1024">${fieldData.value}</textarea>
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" id="editFieldInline" ${fieldData.inline ? 'checked' : ''}>
            Mostrar inline
          </label>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
        <button class="btn btn-secondary" onclick="deleteField(${fieldId})">Eliminar</button>
        <button class="btn btn-primary" onclick="saveFieldById(${fieldId})">Guardar</button>
      </div>
    </div>
  `;

  document.getElementById('modalContainer').appendChild(modal);
  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
}

function saveFieldById(fieldId) {
  const fieldData = embedData.fields.find((item) => item.id === fieldId);
  if (!fieldData) return;

  fieldData.name = document.getElementById('editFieldName')?.value || fieldData.name;
  fieldData.value = document.getElementById('editFieldValue')?.value || fieldData.value;
  fieldData.inline = document.getElementById('editFieldInline')?.checked || false;

  updatePreview();
  closeAllModals();
  showToast('Campo actualizado', 'success');
}

function deleteField(fieldId) {
  embedData.fields = embedData.fields.filter((item) => item.id !== fieldId);
  updatePreview();
  closeAllModals();
  showToast('Campo eliminado', 'success');
}

function addNewRow() {
  const row = {
    id: Date.now(),
    label: `Row ${componentRows.length + 1}`,
    components: []
  };
  componentRows.push(row);
  updatePreview();
  saveEmbedToStorage();
  return row;
}

function addComponentToRow(type, rowId) {
  if (!componentRows.length) addNewRow();
  const row = componentRows.find(r => r.id === rowId) || componentRows[componentRows.length - 1];
  const component = {
    id: Date.now(),
    type,
    label: getDefaultComponentLabel(type),
    style: type === 'link_button' ? 'link' : 'primary',
    url: type === 'link_button' ? 'https://example.com' : null,
    placeholder: type === 'select_menu' ? 'Elige una opción...' : null,
    options: type === 'select_menu' ? ['Opción 1', 'Opción 2'] : [],
    flow: []
  };
  row.components.push(component);
  updatePreview();
  saveEmbedToStorage();
  return component;
}

function getDefaultComponentLabel(type) {
  switch (type) {
    case 'button': return 'Botón';
    case 'link_button': return 'Botón enlace';
    case 'select_menu': return 'Seleccionar';
    case 'user_role_menu': return 'Seleccionar usuario/rol';
    case 'channel_menu': return 'Seleccionar canal';
    case 'image2': return 'Imagen 2';
    default: return 'Componente';
  }
}

function openRowModal(rowId) {
  const row = componentRows.find(r => r.id === rowId);
  if (!row) return;

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.tabIndex = '-1';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Editar Fila</h3>
        <button class="modal-close">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Nombre de la fila</label>
          <input type="text" id="editRowLabel" maxlength="50" value="${row.label}">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
        <button class="btn btn-secondary" onclick="deleteRow(${row.id})">Eliminar fila</button>
        <button class="btn btn-primary" onclick="saveRowLabel(${row.id})">Guardar</button>
      </div>
    </div>
  `;

  document.getElementById('modalContainer').appendChild(modal);
  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
}

function saveRowLabel(rowId) {
  const row = componentRows.find(r => r.id === rowId);
  if (!row) return;
  row.label = document.getElementById('editRowLabel')?.value || row.label;
  updatePreview();
  closeAllModals();
  showToast('Fila actualizada', 'success');
}

function openComponentModal(componentId) {
  const { row, component } = findComponentById(componentId);
  if (!component) return;

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.tabIndex = '-1';

  let settings = `
    <div class="form-group">
      <label>Etiqueta</label>
      <input type="text" id="editComponentLabel" maxlength="80" value="${component.label}">
    </div>
  `;

  if (component.type === 'link_button') {
    settings += `
      <div class="form-group">
        <label>URL</label>
        <input type="url" id="editComponentUrl" placeholder="https://ejemplo.com" value="${component.url || ''}">
      </div>
    `;
  }

  if (component.type === 'select_menu') {
    settings += `
      <div class="form-group">
        <label>Placeholder</label>
        <input type="text" id="editComponentPlaceholder" value="${component.placeholder || ''}">
      </div>
      <div class="form-group">
        <label>Opciones (separadas por coma)</label>
        <input type="text" id="editComponentOptions" value="${component.options.join(', ')}">
      </div>
    `;
  }

  if (component.type === 'image2') {
    settings += `
      <div class="form-group">
        <label>URL de imagen</label>
        <input type="url" id="editComponentUrl" placeholder="https://ejemplo.com/imagen.png" value="${component.url || ''}">
      </div>
    `;
  }

  settings += `
    <div class="form-group flow-panel">
      <label>Flujo</label>
      <div id="flowList-${component.id}" class="flow-list"></div>
      <button type="button" class="btn btn-secondary" onclick="addFlowActionToComponent(${component.id})">Agregar acción</button>
    </div>
  `;

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Editar Componente</h3>
        <button class="modal-close">×</button>
      </div>
      <div class="modal-body">
        ${settings}
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
        <button class="btn btn-secondary" onclick="deleteComponentById(${component.id})">Eliminar</button>
        <button class="btn btn-primary" onclick="saveComponentById(${component.id})">Guardar</button>
      </div>
    </div>
  `;

  document.getElementById('modalContainer').appendChild(modal);
  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
  renderFlowList(component.id);
}

function saveComponentById(componentId) {
  const found = findComponentById(componentId);
  if (!found) return;
  const { component } = found;
  component.label = document.getElementById('editComponentLabel')?.value || component.label;
  if (['link_button', 'image2'].includes(component.type)) {
    component.url = document.getElementById('editComponentUrl')?.value || component.url;
  }
  if (component.type === 'select_menu') {
    component.placeholder = document.getElementById('editComponentPlaceholder')?.value || component.placeholder;
    const options = document.getElementById('editComponentOptions')?.value || '';
    component.options = options.split(',').map(s => s.trim()).filter(Boolean);
  }
  updatePreview();
  saveEmbedToStorage();
  closeAllModals();
  showToast('Componente actualizado', 'success');
}

function deleteComponentById(componentId) {
  for (const row of componentRows) {
    const index = row.components.findIndex(c => c.id === componentId);
    if (index !== -1) {
      row.components.splice(index, 1);
      updatePreview();
      closeAllModals();
      showToast('Componente eliminado', 'success');
      return;
    }
  }
}

function addFlowActionToComponent(componentId) {
  const found = findComponentById(componentId);
  if (!found) return;
  const { component } = found;
  component.flow = component.flow || [];
  component.flow.push({
    type: 'none',
    title: 'No hacer nada',
    data: {}
  });
  openFlowActionModal(componentId, component.flow.length - 1);
}

function openFlowActionModal(componentId, actionIndex) {
  const found = findComponentById(componentId);
  if (!found) return;
  const { component } = found;
  const action = component.flow[actionIndex];
  if (!action) return;

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.tabIndex = '-1';

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Editar acción del flujo</h3>
        <button class="modal-close">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Tipo de acción</label>
          <select id="editFlowType" class="form-select">
            <option value="none">No hacer nada</option>
            <option value="verify">Verificar</option>
            <option value="stop">Detener</option>
            <option value="wait">Esperar X segundos</option>
            <option value="add_role">Agregar rol</option>
            <option value="remove_role">Eliminar rol</option>
            <option value="change_role">Cambiar rol</option>
            <option value="send_message">Enviar mensaje</option>
            <option value="send_webhook">Enviar mensaje de webhook</option>
            <option value="create_thread">Crear hilo</option>
            <option value="create_ticket">Crear ticket</option>
            <option value="set_variable">Establecer variable</option>
            <option value="delete_message">Eliminar mensaje</option>
          </select>
        </div>
        <div id="flowActionSettings"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
        <button class="btn btn-secondary" onclick="deleteFlowAction(${componentId}, ${actionIndex})">Eliminar</button>
        <button class="btn btn-primary" onclick="saveFlowAction(${componentId}, ${actionIndex})">Guardar</button>
      </div>
    </div>
  `;

  document.getElementById('modalContainer').appendChild(modal);
  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
  const typeSelect = modal.querySelector('#editFlowType');
  const settingsContainer = modal.querySelector('#flowActionSettings');
  typeSelect.value = action.type;
  typeSelect.addEventListener('change', () => renderFlowActionFields(typeSelect.value, action.data, settingsContainer));
  renderFlowActionFields(action.type, action.data, settingsContainer);
}

function renderFlowActionFields(type, data, container) {
  const value = data || {};
  let html = '';

  switch (type) {
    case 'verify':
      html = `
        <div class="form-group">
          <label>Condición</label>
          <select id="flowVerifyOperator" class="form-select">
            <option value="and">Y</option>
            <option value="or">O</option>
            <option value="not">No</option>
            <option value="equal">Igual</option>
            <option value="contains">Dentro</option>
          </select>
        </div>
        <div class="form-group">
          <label>Valor A</label>
          <input type="text" id="flowVerifyA" value="${value.a || ''}">
        </div>
        <div class="form-group">
          <label>Valor B</label>
          <input type="text" id="flowVerifyB" value="${value.b || ''}">
        </div>
      `;
      break;
    case 'stop':
      html = `
        <div class="form-group">
          <label>Mensaje opcional</label>
          <input type="text" id="flowStopMessage" value="${value.message || ''}">
        </div>
      `;
      break;
    case 'wait':
      html = `
        <div class="form-group">
          <label>Segundos</label>
          <input type="number" id="flowWaitSeconds" min="0" value="${value.seconds || 1}">
        </div>
      `;
      break;
    case 'add_role':
    case 'remove_role':
    case 'change_role':
      html = `
        <div class="form-group">
          <label>Rol</label>
          <input type="text" id="flowRoleName" value="${value.role || ''}" placeholder="Nombre del rol">
        </div>
      `;
      break;
    case 'send_message':
    case 'send_webhook':
      html = `
        <div class="form-group">
          <label>Mensaje</label>
          <textarea id="flowMessageText">${value.message || ''}</textarea>
        </div>
      `;
      break;
    case 'create_thread':
      html = `
        <div class="form-group">
          <label>Nombre del hilo</label>
          <input type="text" id="flowThreadName" value="${value.threadName || ''}">
        </div>
      `;
      break;
    case 'create_ticket':
      html = `
        <div class="form-group">
          <label>Prefijo del ticket</label>
          <input type="text" id="flowTicketPrefix" value="${value.ticketPrefix || 'ticket'}" placeholder="ticket">
          <small>Se usará como ticket-1, ticket-2, etc.</small>
        </div>
        <div class="form-group">
          <label>Nombre personalizado (opcional)</label>
          <input type="text" id="flowTicketName" value="${value.ticketName || ''}" placeholder="Ej: soporte-usuario">
          <small>Si se deja vacío, se usa el prefijo secuencial.</small>
        </div>
        <div class="form-group">
          <label>Categoría</label>
          <input type="text" id="flowTicketCategory" value="${value.category || ''}" placeholder="Soporte, Ventas, Tickets">
        </div>
        <div class="form-group">
          <label>Visibilidad</label>
          <p style="margin: 0; font-size: 0.9rem; color: var(--color-text-secondary);">
            El canal se creará como privado y solo verá owner/admin y el usuario que abra el ticket.
          </p>
        </div>
      `;
      break;
    case 'set_variable':
      html = `
        <div class="form-group">
          <label>Nombre de variable</label>
          <input type="text" id="flowVariableName" value="${value.name || ''}">
        </div>
        <div class="form-group">
          <label>Valor</label>
          <input type="text" id="flowVariableValue" value="${value.value || ''}">
        </div>
      `;
      break;
    case 'delete_message':
      html = `
        <div class="form-group">
          <label>Variable mensaje</label>
          <input type="text" id="flowDeleteMessageVar" value="${value.variable || 'messageId'}">
        </div>
      `;
      break;
    default:
      html = `<p>Esta acción no requiere configuración adicional.</p>`;
  }

  container.innerHTML = html;
  const selectEl = container.closest('.modal-content')?.querySelector('#editFlowType');
  if (selectEl) selectEl.value = type;
}

function saveFlowAction(componentId, actionIndex) {
  const found = findComponentById(componentId);
  if (!found) return;
  const { component } = found;
  const modals = document.querySelectorAll('.modal-overlay');
  const modal = modals[modals.length - 1] || document.querySelector('.modal-overlay:last-child');
  if (!modal) return;

  const type = modal.querySelector('#editFlowType')?.value || 'none';
  const action = component.flow[actionIndex];
  if (!action) return;

  action.type = type;
  action.title = getFlowActionLabel(type);
  action.data = {};

  switch (type) {
    case 'verify':
      action.data.operator = modal.querySelector('#flowVerifyOperator')?.value || 'and';
      action.data.a = modal.querySelector('#flowVerifyA')?.value || '';
      action.data.b = modal.querySelector('#flowVerifyB')?.value || '';
      break;
    case 'stop':
      action.data.message = modal.querySelector('#flowStopMessage')?.value || '';
      break;
    case 'wait':
      action.data.seconds = Number(modal.querySelector('#flowWaitSeconds')?.value) || 0;
      break;
    case 'add_role':
    case 'remove_role':
    case 'change_role':
      action.data.role = modal.querySelector('#flowRoleName')?.value || '';
      break;
    case 'send_message':
    case 'send_webhook':
      action.data.message = modal.querySelector('#flowMessageText')?.value || '';
      break;
    case 'create_thread':
      action.data.threadName = modal.querySelector('#flowThreadName')?.value || '';
      break;
    case 'create_ticket':
      action.data.ticketPrefix = modal.querySelector('#flowTicketPrefix')?.value || 'ticket';
      action.data.ticketName = modal.querySelector('#flowTicketName')?.value || '';
      action.data.category = modal.querySelector('#flowTicketCategory')?.value || '';
      action.data.visibility = 'owner_admin_requester';
      break;
    case 'set_variable':
      action.data.name = modal.querySelector('#flowVariableName')?.value || '';
      action.data.value = modal.querySelector('#flowVariableValue')?.value || '';
      break;
    case 'delete_message':
      action.data.variable = modal.querySelector('#flowDeleteMessageVar')?.value || 'messageId';
      break;
  }

  updatePreview();
  saveEmbedToStorage();
  if (typeof closeAllModals === 'function') closeAllModals();
  showToast('Acción del flujo guardada', 'success');
}

function deleteFlowAction(componentId, actionIndex) {
  const found = findComponentById(componentId);
  if (!found) return;
  const { component } = found;
  component.flow.splice(actionIndex, 1);
  updatePreview();
  saveEmbedToStorage();
  closeAllModals();
  openComponentModal(componentId);
}

function renderFlowList(componentId) {
  const found = findComponentById(componentId);
  if (!found) return;
  const { component } = found;
  const flowList = document.getElementById(`flowList-${component.id}`);
  if (!flowList) return;
  if (!component.flow || !component.flow.length) {
    flowList.innerHTML = '<p style="color: var(--color-text-secondary);">No hay acciones en este flujo.</p>';
    return;
  }
  flowList.innerHTML = component.flow.map((action, index) => `
    <div class="flow-action-item">
      <div>
        <strong>${getFlowActionLabel(action.type)}</strong>
        <span>${getFlowSummary(action)}</span>
      </div>
      <div class="flow-action-buttons">
        <button type="button" class="btn btn-secondary" onclick="openFlowActionModal(${componentId}, ${index})">Editar</button>
        <button type="button" class="btn btn-secondary" onclick="deleteFlowAction(${componentId}, ${index})">Eliminar</button>
      </div>
    </div>
  `).join('');
}

function getFlowActionLabel(type) {
  switch (type) {
    case 'verify': return 'Verificar';
    case 'stop': return 'Detener';
    case 'wait': return 'Esperar';
    case 'add_role': return 'Agregar rol';
    case 'remove_role': return 'Eliminar rol';
    case 'change_role': return 'Cambiar rol';
    case 'send_message': return 'Enviar mensaje';
    case 'send_webhook': return 'Enviar webhook';
    case 'create_thread': return 'Crear hilo';
    case 'create_ticket': return 'Crear ticket';
    case 'set_variable': return 'Establecer variable';
    case 'delete_message': return 'Eliminar mensaje';
    default: return 'No hacer nada';
  }
}

function getFlowSummary(action) {
  if (!action || !action.type) return 'Sin configuración';
  const data = action.data || {};
  switch (action.type) {
    case 'verify':
      return `${data.operator || 'and'}: ${data.a || ''} vs ${data.b || ''}`;
    case 'stop':
      return data.message ? `Mensaje: ${data.message}` : 'Detener flujo';
    case 'wait':
      return `Esperar ${data.seconds || 0}s`;
    case 'add_role':
    case 'remove_role':
    case 'change_role':
      return `Rol: ${data.role || 'sin rol'}`;
    case 'send_message':
    case 'send_webhook':
      return `Mensaje: ${data.message ? data.message.slice(0, 40) : ''}`;
    case 'create_thread':
      return `Hilo: ${data.threadName || ''}`;
    case 'create_ticket':
      return `Ticket: ${data.ticketName || `${data.ticketPrefix || 'ticket'}-{n}`} ${data.category ? `(${data.category})` : ''}`;
    case 'set_variable':
      return `Variable: ${data.name || ''}`;
    case 'delete_message':
      return `Variable: ${data.variable || 'messageId'}`;
    default:
      return 'Sin acción';
  }
}

function deleteRow(rowId) {
  componentRows = componentRows.filter(r => r.id !== rowId);
  updatePreview();
  closeAllModals();
  showToast('Fila eliminada', 'success');
}

function findComponentById(componentId) {
  for (const row of componentRows) {
    const component = row.components.find(item => item.id === componentId);
    if (component) return { row, component };
  }
  return null;
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.remove());
}
window.closeAllModals = closeAllModals;

