// State & Configuration
let appConfig = {
  nombre_app: "GESTBI LITE",
  subtitulo_app: "Tinder de piezas Concepción",
  color_principal: "#7c3aed"
};

let rawRoomsData = [];
let dbBuscadores = [];
let dbMatches = [];
let dbOneDrivePacks = [];
let filteredRooms = [];
let currentCardIndex = 0;
let currentPhotoIndex = 0;
let currentFilterConvivencia = "todas";
let pubUploadedPhotos = []; // Up to 4 photos for publication

// Web Audio API Synthesized Sound Effect for Match
function playMatchSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
    gain1.gain.setValueAtTime(0.2, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.3);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0.25, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.5);

    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = "sine";
    osc3.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.25);
    gain3.gain.setValueAtTime(0.3, ctx.currentTime + 0.25);
    gain3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(ctx.currentTime + 0.25);
    osc3.stop(ctx.currentTime + 0.7);
  } catch (e) {
    console.warn("Audio Context error:", e);
  }
}

// Toast Notification System
function showToast(message, icon = "⚡") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-10px)";
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

// Initialize App
document.addEventListener("DOMContentLoaded", async () => {
  await loadConfig();
  loadDataFromStorage();
  runAutoMatchAlgorithm();
  setupNavigation();
  setupFilterPills();
  setupActionButtons();
  setupPhotoUploader();
  renderCardStack();
  renderAdminPanel();
});

// Load Config
async function loadConfig() {
  try {
    const res = await fetch("config.json?t=" + Date.now());
    if (res.ok) {
      appConfig = await res.json();
      applyConfigUI();
    }
  } catch (err) {
    console.warn("Usando configuración por defecto.", err);
    applyConfigUI();
  }
}

function applyConfigUI() {
  document.title = `${appConfig.nombre_app} - ${appConfig.subtitulo_app || 'Tinder de piezas Concepción'}`;
  
  const titleEl = document.getElementById("app-title");
  if (titleEl) titleEl.textContent = appConfig.nombre_app || "GESTBI LITE";

  const subEl = document.getElementById("app-subtitle");
  if (subEl) subEl.textContent = appConfig.subtitulo_app || "Tinder de piezas Concepción";

  const logoEl = document.getElementById("app-logo");
  if (logoEl && appConfig.logo_url) logoEl.src = appConfig.logo_url;

  if (appConfig.color_principal) {
    document.documentElement.style.setProperty("--color-principal", appConfig.color_principal);
  }
}

// Storage Management
function loadDataFromStorage() {
  const savedRooms = localStorage.getItem("gestbi_tinder_rooms");
  const savedBuscadores = localStorage.getItem("gestbi_buscadores");
  const savedMatches = localStorage.getItem("matches");
  const savedPacks = localStorage.getItem("gestbi_onedrive_packs");

  if (savedRooms) {
    rawRoomsData = JSON.parse(savedRooms);
  } else {
    // Initial reference property requested by user
    rawRoomsData = [
      {
        id: "ROOM-001",
        sector: "Nonguén",
        direccion: "Pasaje Los Canelos 342",
        precio: 180000,
        convivencia: "mujeres",
        dueno: "Camila (+56 9 8765 4321)",
        footer: "A 7 min del mall del trébol en micro • Dueña Camila • Responde rápido",
        descripcion: "Pieza piola pa' estudiante UdeC, casa tranquila, se comparte con 2 chicas más. Ideal si buscai tranquilidad y buena onda.",
        tags: ["Wifi 300mb", "Baño compartido", "Cocina equipada", "Micro a 2 min"],
        badges: ["SOLO", "CLASE A"],
        fotos: [
          "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=700&q=80",
          "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=700&q=80",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=700&q=80",
          "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=700&q=80"
        ]
      },
      {
        id: "ROOM-002",
        sector: "Collao",
        direccion: "Av. Collao 1420",
        precio: 210000,
        convivencia: "mixto",
        dueno: "Gonzalo (+56 9 7654 3210)",
        footer: "A 3 min de UBB a pie • Dueño Gonzalo • Disponibilidad inmediata",
        descripcion: "Habitación espaciosa e iluminada en sector Collao. Excelente locomoción a toda la ciudad y ambiente de estudio.",
        tags: ["Wifi Fibra", "Baño Privado", "Lavadora", "Locomoción 24/7"],
        badges: ["CLASE A"],
        fotos: [
          "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=700&q=80",
          "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=700&q=80"
        ]
      }
    ];
    saveRoomsToStorage();
  }

  if (savedBuscadores) {
    dbBuscadores = JSON.parse(savedBuscadores);
  } else {
    // Initial Seekers
    dbBuscadores = [
      {
        id: "BUSC-101",
        nombre: "Javier Arriagada",
        sector_deseado: "Nonguén",
        presupuesto: 200000,
        convivencia: "mujeres",
        contacto: "+56 9 5555 1234",
        ocupacion: "Estudiante UdeC (Tranquilo)"
      },
      {
        id: "BUSC-102",
        nombre: "Valentina Henríquez",
        sector_deseado: "Collao",
        presupuesto: 220000,
        convivencia: "mixto",
        contacto: "+56 9 4444 7777",
        ocupacion: "Profesional Salud"
      }
    ];
    saveBuscadoresToStorage();
  }

  dbMatches = savedMatches ? JSON.parse(savedMatches) : [];
  dbOneDrivePacks = savedPacks ? JSON.parse(savedPacks) : [];

  filterRooms();
}

function saveRoomsToStorage() {
  localStorage.setItem("gestbi_tinder_rooms", JSON.stringify(rawRoomsData));
}

function saveBuscadoresToStorage() {
  localStorage.setItem("gestbi_buscadores", JSON.stringify(dbBuscadores));
}

function saveMatchesToStorage() {
  localStorage.setItem("matches", JSON.stringify(dbMatches));
  localStorage.setItem("gestbi_matches", JSON.stringify(dbMatches));
  updateHeaderMatchCount();
}

function saveOneDrivePacksToStorage() {
  localStorage.setItem("gestbi_onedrive_packs", JSON.stringify(dbOneDrivePacks));
}

function updateHeaderMatchCount() {
  const el = document.getElementById("match-count");
  if (el) el.textContent = `${dbMatches.length} match hoy`;
  const adminQty = document.getElementById("admin-match-qty");
  if (adminQty) adminQty.textContent = dbMatches.length;
}

// 1. AUTOMATED MATCHING ALGORITHM
function runAutoMatchAlgorithm() {
  let newMatchesFound = 0;

  rawRoomsData.forEach(room => {
    dbBuscadores.forEach(seeker => {
      // Rule 1: Sector match
      const sameSector = room.sector.toLowerCase().includes(seeker.sector_deseado.toLowerCase()) || seeker.sector_deseado.toLowerCase().includes(room.sector.toLowerCase());
      // Rule 2: Seeker Budget >= Room Price
      const budgetOk = Number(seeker.presupuesto) >= Number(room.precio);
      // Rule 3: Convivencia filter match
      const convOk = seeker.convivencia === "todas" || room.convivencia === "mixto" || room.convivencia === seeker.convivencia;

      if (sameSector && budgetOk && convOk) {
        const matchId = `AUTO-MATCH-${room.id}-${seeker.id}`;
        const alreadyExists = dbMatches.some(m => m.id === matchId);

        if (!alreadyExists) {
          const autoMatchRecord = {
            id: matchId,
            match_type: "auto_algorithm",
            fecha: new Date().toLocaleString("es-CL"),
            propiedad_id: room.id,
            propiedad_sector: room.sector,
            propiedad_precio: room.precio,
            dueno_nombre: room.dueno,
            buscador_id: seeker.id,
            buscador_nombre: seeker.nombre,
            buscador_contacto: seeker.contacto,
            buscador_presupuesto: seeker.presupuesto
          };
          dbMatches.unshift(autoMatchRecord);
          newMatchesFound++;
        }
      }
    });
  });

  saveMatchesToStorage();

  if (newMatchesFound > 0) {
    showToast(`⚡ ${newMatchesFound} nuevo(s) Auto-Match(es) generado(s) automáticamente.`, "🔥");
  }
}

// 2. AUTOMATED ONEDRIVE ZIP PACK GENERATION
async function generateOneDriveZipPack(room) {
  const folderPath = `/GESTBI/Piezas/${room.sector.replace(/\s+/g, '_')}/`;
  const timestamp = Date.now();
  const packFileName = `Pack_OneDrive_${room.id}_${timestamp}.zip`;

  // CSV content with property + owner data
  const csvContent = `ID,Sector,Direccion,Precio,Convivencia,Dueño_Contacto,Descripcion,Fecha_Registro
${room.id},"${room.sector}","${room.direccion}",${room.precio},"${room.convivencia}","${room.dueno}","${room.descripcion.replace(/"/g, '""')}","${new Date().toISOString()}"`;

  let zipUrl = "#";

  if (window.JSZip) {
    try {
      const zip = new JSZip();
      zip.file("datos_propiedad.csv", csvContent);
      zip.file("LEAME_ONEDRIVE.txt", `Pack respaldado para OneDrive de Empresa.\nRuta remota: ${folderPath}\nID: ${room.id}`);

      // If Base64 or Blob photos present
      if (room.fotos) {
        room.fotos.forEach((fotoData, idx) => {
          if (fotoData.startsWith("data:image")) {
            const base64Data = fotoData.split(",")[1];
            zip.file(`foto_${idx + 1}.jpg`, base64Data, { base64: true });
          } else {
            zip.file(`foto_${idx + 1}_link.txt`, fotoData);
          }
        });
      }

      const blob = await zip.generateAsync({ type: "blob" });
      zipUrl = URL.createObjectURL(blob);
    } catch (e) {
      console.warn("Error generando ZIP con JSZip, usando fallback:", e);
    }
  }

  const packRecord = {
    id: `PACK-${timestamp}`,
    propiedad_id: room.id,
    sector: room.sector,
    dueno: room.dueno,
    onedrive_path: `${folderPath}${packFileName}`,
    zip_url: zipUrl,
    filename: packFileName,
    fecha: new Date().toLocaleString("es-CL")
  };

  dbOneDrivePacks.unshift(packRecord);
  saveOneDrivePacksToStorage();

  // Show Toast
  showToast(`Pack subido a OneDrive ${folderPath}`, "☁️");
  renderAdminPanel();

  return packRecord;
}

// Filtering Rooms for Descubrir Feed
function filterRooms() {
  if (currentFilterConvivencia === "todas") {
    filteredRooms = [...rawRoomsData];
  } else {
    filteredRooms = rawRoomsData.filter(r => r.convivencia === currentFilterConvivencia);
  }
  currentCardIndex = 0;
  currentPhotoIndex = 0;
}

// Navigation & Tab Switcher
function setupNavigation() {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-view").forEach(v => v.classList.remove("active"));

      btn.classList.add("active");
      const targetId = btn.dataset.tab;
      document.getElementById(targetId)?.classList.add("active");
    });
  });

  document.getElementById("btn-cerrar-match")?.addEventListener("click", () => {
    document.getElementById("match-overlay").classList.remove("active");
  });
}

function switchFormMode(mode) {
  document.querySelectorAll(".btn-mode").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".form-mode-content").forEach(f => f.classList.remove("active"));

  if (mode === "dueno") {
    document.getElementById("btn-mode-dueno")?.classList.add("active");
    document.getElementById("form-publicar-dueno")?.classList.add("active");
  } else {
    document.getElementById("btn-mode-buscador")?.classList.add("active");
    document.getElementById("form-publicar-buscador")?.classList.add("active");
  }
}

// Convivencia Filter Pills
function setupFilterPills() {
  document.querySelectorAll(".filter-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      document.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");

      currentFilterConvivencia = pill.dataset.convivencia;
      filterRooms();
      renderCardStack();
    });
  });
}

// Action Buttons: Pass & Like
function setupActionButtons() {
  document.getElementById("btn-pass")?.addEventListener("click", () => swipeCard("left"));
  document.getElementById("btn-like")?.addEventListener("click", () => swipeCard("right"));
}

// Render Card Stack
function renderCardStack() {
  const stack = document.getElementById("card-stack");
  if (!stack) return;

  if (filteredRooms.length === 0 || currentCardIndex >= filteredRooms.length) {
    stack.innerHTML = `
      <div style="width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:2rem; background:#ffffff; border-radius:24px; box-shadow:0 10px 30px rgba(0,0,0,0.05);">
        <div style="font-size:3rem; margin-bottom:10px;">🎉</div>
        <h3 style="font-size:1.3rem; font-weight:800; color:#0f172a;">¡Viste todas las piezas!</h3>
        <p style="font-size:0.9rem; color:#64748b; margin:8px 0 1.5rem 0;">No hay más habitaciones en esta categoría por ahora.</p>
        <button class="btn-submit" onclick="resetFeed()" style="max-width:200px;">Reiniciar Feed</button>
      </div>
    `;
    return;
  }

  const room = filteredRooms[currentCardIndex];
  const photosCount = room.fotos ? room.fotos.length : 1;
  const currentPhoto = room.fotos && room.fotos[currentPhotoIndex] ? room.fotos[currentPhotoIndex] : 'https://via.placeholder.com/700x500?text=Pieza+Concepcion';

  stack.innerHTML = `
    <article class="tinder-card" id="active-card">
      <div class="swipe-stamp stamp-like">LIKE</div>
      <div class="swipe-stamp stamp-nope">NOPE</div>

      <div class="photo-area">
        <img class="photo-img" src="${currentPhoto}" alt="${room.sector}">
        
        <div class="photo-nav-left" onclick="prevPhoto(event)"></div>
        <div class="photo-nav-right" onclick="nextPhoto(event)"></div>

        <div class="over-badges">
          ${room.badges ? room.badges.map(b => `<span class="${b === 'SOLO' ? 'badge-solo' : 'badge-clase'}">${b}</span>`).join('') : ''}
        </div>

        <div class="pill-price">$${Number(room.precio).toLocaleString('es-CL')}/mes</div>
        <div class="pill-counter">${currentPhotoIndex + 1}/${photosCount}</div>
      </div>

      <div class="card-details">
        <div>
          <h2 class="location-title">${room.sector}</h2>
          <div class="location-address">📍 ${room.direccion}</div>
          <p class="description-text">"${room.descripcion}"</p>

          <div class="purple-tags-grid">
            ${room.tags ? room.tags.map(t => `<span class="purple-tag">✓ ${t}</span>`).join('') : ''}
          </div>
        </div>

        <div>
          <div class="card-footer-info">${room.footer}</div>
          <button class="btn-onedrive-card" onclick="downloadOneDriveManual('${room.id}')">
            📁 Descargar Ficha y Photos OneDrive
          </button>
        </div>
      </div>
    </article>
  `;

  attachSwipeEvents();
}

function nextPhoto(e) {
  e.stopPropagation();
  const room = filteredRooms[currentCardIndex];
  if (!room || !room.fotos) return;
  if (currentPhotoIndex < room.fotos.length - 1) {
    currentPhotoIndex++;
    renderCardStack();
  }
}

function prevPhoto(e) {
  e.stopPropagation();
  if (currentPhotoIndex > 0) {
    currentPhotoIndex--;
    renderCardStack();
  }
}

function attachSwipeEvents() {
  const card = document.getElementById("active-card");
  if (!card) return;

  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let currentY = 0;
  let isDragging = false;

  const stampLike = card.querySelector(".stamp-like");
  const stampNope = card.querySelector(".stamp-nope");

  card.addEventListener("pointerdown", (e) => {
    if (e.target.classList.contains("photo-nav-left") || e.target.classList.contains("photo-nav-right") || e.target.classList.contains("btn-onedrive-card")) {
      return;
    }
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    card.setPointerCapture(e.pointerId);
  });

  card.addEventListener("pointermove", (e) => {
    if (!isDragging) return;
    currentX = e.clientX - startX;
    currentY = e.clientY - startY;

    const rotate = currentX * 0.08;
    card.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${rotate}deg)`;

    if (currentX > 30) {
      if (stampLike) stampLike.style.opacity = Math.min(currentX / 100, 1);
      if (stampNope) stampNope.style.opacity = 0;
    } else if (currentX < -30) {
      if (stampNope) stampNope.style.opacity = Math.min(Math.abs(currentX) / 100, 1);
      if (stampLike) stampLike.style.opacity = 0;
    } else {
      if (stampLike) stampLike.style.opacity = 0;
      if (stampNope) stampNope.style.opacity = 0;
    }
  });

  card.addEventListener("pointerup", (e) => {
    if (!isDragging) return;
    isDragging = false;

    const threshold = 120;
    if (currentX > threshold) {
      swipeCard("right");
    } else if (currentX < -threshold) {
      swipeCard("left");
    } else {
      card.style.transform = "translate(0, 0) rotate(0deg)";
      if (stampLike) stampLike.style.opacity = 0;
      if (stampNope) stampNope.style.opacity = 0;
    }
  });
}

// 4. REAL MATCH PERSISTENCE ON SWIPE RIGHT
function swipeCard(direction) {
  const card = document.getElementById("active-card");
  if (!card) return;

  const flyX = direction === "right" ? 600 : -600;
  const rotate = direction === "right" ? 25 : -25;

  card.style.transition = "transform 0.4s ease, opacity 0.4s ease";
  card.style.transform = `translate(${flyX}px, 0px) rotate(${rotate}deg)`;
  card.style.opacity = 0;

  setTimeout(() => {
    if (direction === "right") {
      const room = filteredRooms[currentCardIndex];
      if (room) {
        // Save real match record in localStorage matches
        const swipeMatchRecord = {
          id: `SWIPE-MATCH-${room.id}-${Date.now().toString().slice(-4)}`,
          match_type: "manual_swipe",
          fecha: new Date().toLocaleString("es-CL"),
          propiedad_id: room.id,
          propiedad_sector: room.sector,
          propiedad_precio: room.precio,
          dueno_nombre: room.dueno,
          buscador_nombre: "Usuario App (Swipe)",
          buscador_contacto: "Contacto Directo por App"
        };
        dbMatches.unshift(swipeMatchRecord);
        saveMatchesToStorage();
        triggerMatch(room);
        renderAdminPanel();
      }
    }
    currentCardIndex++;
    currentPhotoIndex = 0;
    renderCardStack();
  }, 300);
}

function triggerMatch(room) {
  playMatchSound();
  const overlay = document.getElementById("match-overlay");
  const subtitle = document.getElementById("match-subtitle");

  if (overlay && room) {
    if (subtitle) {
      subtitle.innerHTML = `Te gustó la pieza en <strong>${room.sector}</strong>.<br>La dueña/o <strong>${room.dueno}</strong> fue notificada.`;
    }
    overlay.classList.add("active");
  }
}

function resetFeed() {
  currentCardIndex = 0;
  currentPhotoIndex = 0;
  renderCardStack();
}

// Setup Photo Uploader & Forms
function setupPhotoUploader() {
  const input = document.getElementById("pub-photos-input");
  input?.addEventListener("change", (e) => {
    const files = Array.from(e.target.files);
    const slotsLeft = 4 - pubUploadedPhotos.length;

    if (slotsLeft <= 0) {
      alert("Puedes subir un máximo de 4 fotos.");
      return;
    }

    files.slice(0, slotsLeft).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        pubUploadedPhotos.push(event.target.result);
        renderPubPhotoPreviews();
      };
      reader.readAsDataURL(file);
    });
  });

  document.getElementById("form-publicar-dueno")?.addEventListener("submit", handlePublicarDueno);
  document.getElementById("form-publicar-buscador")?.addEventListener("submit", handlePublicarBuscador);
}

function renderPubPhotoPreviews() {
  const grid = document.getElementById("preview-4-grid");
  if (!grid) return;

  grid.innerHTML = pubUploadedPhotos.map((src, idx) => `
    <div class="thumb-4">
      <img src="${src}" alt="Foto ${idx + 1}">
    </div>
  `).join("");
}

// Form Handlers
async function handlePublicarDueno(e) {
  e.preventDefault();

  const newRoom = {
    id: "ROOM-" + Date.now().toString().slice(-4),
    sector: document.getElementById("pub-sector").value,
    direccion: document.getElementById("pub-direccion").value,
    precio: Number(document.getElementById("pub-precio").value),
    convivencia: document.getElementById("pub-convivencia").value,
    dueno: document.getElementById("pub-duena").value,
    footer: document.getElementById("pub-footer").value,
    descripcion: document.getElementById("pub-descripcion").value,
    tags: document.getElementById("pub-tags").value.split(",").map(t => t.trim()).filter(Boolean),
    badges: ["SOLO"],
    fotos: pubUploadedPhotos.length > 0 ? [...pubUploadedPhotos] : [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=700&q=80"
    ]
  };

  rawRoomsData.unshift(newRoom);
  saveRoomsToStorage();

  // Generate Automatic OneDrive Pack ZIP
  await generateOneDriveZipPack(newRoom);

  // Run auto match
  runAutoMatchAlgorithm();

  document.getElementById("form-publicar-dueno").reset();
  pubUploadedPhotos = [];
  renderPubPhotoPreviews();

  // Switch back to Descubrir
  document.querySelector('.tab-btn[data-tab="tab-descubrir"]')?.click();
  filterRooms();
  renderCardStack();
}

function handlePublicarBuscador(e) {
  e.preventDefault();

  const newSeeker = {
    id: "BUSC-" + Date.now().toString().slice(-4),
    nombre: document.getElementById("busc-nombre").value,
    sector_deseado: document.getElementById("busc-sector").value,
    presupuesto: Number(document.getElementById("busc-presupuesto").value),
    convivencia: document.getElementById("busc-convivencia").value,
    contacto: document.getElementById("busc-contacto").value,
    ocupacion: document.getElementById("busc-ocupacion").value
  };

  dbBuscadores.unshift(newSeeker);
  saveBuscadoresToStorage();

  showToast(`¡Perfil de ${newSeeker.nombre} guardado! Ejecutando Auto-Match...`, "👤");
  runAutoMatchAlgorithm();

  document.getElementById("form-publicar-buscador").reset();

  // Switch to PLANES/ADMIN to see results
  document.querySelector('.tab-btn[data-tab="tab-planes"]')?.click();
  toggleAdminPanel(true);
}

// 3. ADMIN PANEL SYSTEM
function toggleAdminPanel(forceShow = false) {
  const secPricing = document.getElementById("sec-planes-pricing");
  const secAdmin = document.getElementById("sec-panel-admin");
  const btnToggle = document.getElementById("btn-toggle-admin");

  if (!secAdmin || !secPricing) return;

  const isHidden = secAdmin.style.display === "none";
  if (isHidden || forceShow) {
    secAdmin.style.display = "block";
    secPricing.style.display = "none";
    if (btnToggle) btnToggle.textContent = "✖️ Ver Planes";
    renderAdminPanel();
  } else {
    secAdmin.style.display = "none";
    secPricing.style.display = "block";
    if (btnToggle) btnToggle.textContent = "🛠️ Panel ADMIN";
  }
}

function switchAdminTab(tabName) {
  document.querySelectorAll(".admin-tab-btn").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".admin-tab-content").forEach(c => c.classList.remove("active"));

  if (tabName === "matches") {
    document.querySelector('.admin-tab-btn:nth-child(1)')?.classList.add("active");
    document.getElementById("admin-tab-matches")?.classList.add("active");
  } else if (tabName === "onedrive") {
    document.querySelector('.admin-tab-btn:nth-child(2)')?.classList.add("active");
    document.getElementById("admin-tab-onedrive")?.classList.add("active");
  } else {
    document.querySelector('.admin-tab-btn:nth-child(3)')?.classList.add("active");
    document.getElementById("admin-tab-perfiles")?.classList.add("active");
  }
}

function renderAdminPanel() {
  updateHeaderMatchCount();

  // 1. Matches List
  const matchesContainer = document.getElementById("admin-matches-list");
  if (matchesContainer) {
    if (dbMatches.length === 0) {
      matchesContainer.innerHTML = `<p style="color:#64748b; font-size:0.8rem;">No hay matches registrados aún.</p>`;
    } else {
      matchesContainer.innerHTML = dbMatches.map(m => `
        <div class="admin-card-item">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <span class="${m.match_type === 'auto_algorithm' ? 'admin-badge-auto' : 'admin-badge-manual'}">
              ${m.match_type === 'auto_algorithm' ? '🔥 AUTO-MATCH' : '💜 SWIPE LIKE'}
            </span>
            <span style="font-size:0.7rem; color:#94a3b8;">${m.fecha}</span>
          </div>
          <div><strong>Propiedad:</strong> ${m.propiedad_sector} ($${Number(m.propiedad_precio).toLocaleString('es-CL')}) - Dueño: ${m.dueno_nombre}</div>
          <div><strong>Buscador:</strong> ${m.buscador_nombre} (${m.buscador_contacto || 'Contacto directo'})</div>
        </div>
      `).join("");
    }
  }

  // 2. OneDrive Packs List
  const onedriveContainer = document.getElementById("admin-onedrive-list");
  if (onedriveContainer) {
    if (dbOneDrivePacks.length === 0) {
      onedriveContainer.innerHTML = `<p style="color:#64748b; font-size:0.8rem;">No hay packs ZIP generados aún. Publica una propiedad para ver el empaquetado automático.</p>`;
    } else {
      onedriveContainer.innerHTML = dbOneDrivePacks.map(p => `
        <div class="admin-card-item">
          <div style="font-size:0.78rem; font-weight:700; color:var(--color-principal);">📁 ${p.filename}</div>
          <div style="font-size:0.75rem; color:#475569; margin:3px 0;"><strong>Ruta OneDrive:</strong> ${p.onedrive_path}</div>
          <div style="font-size:0.72rem; color:#94a3b8;">Dueño: ${p.dueno} • ${p.fecha}</div>
          ${p.zip_url !== '#' ? `
            <a href="${p.zip_url}" download="${p.filename}" class="btn-onedrive-card" style="margin-top:6px; text-decoration:none; display:inline-block;">
              ⬇️ Descargar Pack ZIP para OneDrive
            </a>
          ` : ''}
        </div>
      `).join("");
    }
  }

  // 3. Perfiles List
  const perfilesContainer = document.getElementById("admin-perfiles-list");
  if (perfilesContainer) {
    perfilesContainer.innerHTML = `
      <h4 style="font-size:0.85rem; margin-bottom:6px;">🏠 Propiedades Publicadas (${rawRoomsData.length})</h4>
      ${rawRoomsData.map(r => `
        <div class="admin-card-item">
          <div><strong>${r.id} - ${r.sector}</strong> ($${Number(r.precio).toLocaleString('es-CL')})</div>
          <div style="font-size:0.75rem; color:#64748b;">Dueño: ${r.dueno} • Convivencia: ${r.convivencia}</div>
        </div>
      `).join("")}

      <h4 style="font-size:0.85rem; margin:10px 0 6px 0;">🔍 Buscadores Registrados (${dbBuscadores.length})</h4>
      ${dbBuscadores.map(b => `
        <div class="admin-card-item">
          <div><strong>${b.nombre}</strong> (Busca en ${b.sector_deseado})</div>
          <div style="font-size:0.75rem; color:#64748b;">Presupuesto: $${Number(b.presupuesto).toLocaleString('es-CL')} • ${b.ocupacion}</div>
        </div>
      `).join("")}
    `;
  }
}

// Download Manual Ficha OneDrive
function downloadOneDriveManual(roomId) {
  const room = rawRoomsData.find(r => r.id === roomId);
  if (!room) return;
  generateOneDriveZipPack(room);
}

// Global Exports
window.prevPhoto = prevPhoto;
window.nextPhoto = nextPhoto;
window.resetFeed = resetFeed;
window.switchFormMode = switchFormMode;
window.toggleAdminPanel = toggleAdminPanel;
window.switchAdminTab = switchAdminTab;
window.downloadOneDriveManual = downloadOneDriveManual;
