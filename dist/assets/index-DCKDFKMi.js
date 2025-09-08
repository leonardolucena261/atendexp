(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))a(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&a(o)}).observe(document,{childList:!0,subtree:!0});function t(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function a(i){if(i.ep)return;i.ep=!0;const s=t(i);fetch(i.href,s)}})();class f{constructor(e){this.onToggleSidebar=e,this.isDarkMode=localStorage.getItem("darkMode")==="true"}render(){const e=document.createElement("header");return e.className="header",e.innerHTML=`
      <div class="header-content">
        <div class="header-left">
          <button class="sidebar-toggle" id="sidebarToggle">
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
          </button>
          <div class="logo">
            <div class="logo-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7V10H22V7L12 2Z" fill="currentColor"/>
                <path d="M4 11V20H8V15H16V20H20V11H4Z" fill="currentColor"/>
              </svg>
            </div>
            <div class="logo-text">
              <h1>Cidade do Saber</h1>
              <span>Sistema Administrativo</span>
            </div>
          </div>
        </div>
        <div class="header-right">
          <button class="theme-toggle" id="themeToggle" title="Alternar tema">
            <span class="theme-icon">${this.isDarkMode?"☀️":"🌙"}</span>
          </button>
          <div class="user-info">
            <div class="user-avatar">👤</div>
            <span>Administrador</span>
          </div>
        </div>
      </div>
    `,e.querySelector("#sidebarToggle").addEventListener("click",()=>{this.onToggleSidebar&&this.onToggleSidebar()}),e.querySelector("#themeToggle").addEventListener("click",()=>{this.toggleTheme()}),this.applyTheme(),e}toggleTheme(){this.isDarkMode=!this.isDarkMode,localStorage.setItem("darkMode",this.isDarkMode.toString()),this.applyTheme();const e=document.querySelector(".theme-icon");e&&(e.textContent=this.isDarkMode?"☀️":"🌙")}applyTheme(){this.isDarkMode?document.body.classList.add("dark-theme"):document.body.classList.remove("dark-theme")}}class y{constructor(e,t){this.onNavigate=e,this.dataManager=t,this.isCollapsed=!1,this.expandedMenus=new Set}render(){const e=document.createElement("aside");e.className="sidebar",e.id="sidebar";const t=[{id:"dashboard",label:"Dashboard",icon:"📊"},{id:"buildings",label:"Prédios",icon:"🏢",hasSubmenu:!0,submenu:[{id:"buildings-manage",label:"Gerenciar Prédios",icon:"🏢"},{id:"rooms",label:"Salas de Aula",icon:"🚪"},{id:"classes",label:"Turmas",icon:"👥"}]},{id:"academic",label:"Acadêmico",icon:"🎓",hasSubmenu:!0,submenu:[{id:"periods",label:"Períodos Letivos",icon:"📅"}]}],a=document.createElement("nav");return a.className="sidebar-nav",t.forEach(i=>{const s=this.createMenuItem(i);a.appendChild(s)}),e.appendChild(a),e}createMenuItem(e){const t=document.createElement("div");t.className="menu-item-container";const a=document.createElement("button");if(a.className="sidebar-item",a.dataset.view=e.id,e.id==="dashboard"&&a.classList.add("active"),a.innerHTML=`
      <span class="sidebar-icon">${e.icon}</span>
      <span class="sidebar-label">${e.label}</span>
      ${e.hasSubmenu?'<span class="submenu-arrow">▶</span>':""}
    `,a.addEventListener("click",()=>{e.hasSubmenu?this.toggleSubmenu(e.id):(this.onNavigate(e.id),this.updateActiveState(e.id))}),t.appendChild(a),e.hasSubmenu&&e.submenu){const i=document.createElement("div");i.className="submenu",i.id=`submenu-${e.id}`,e.submenu.forEach(s=>{const o=document.createElement("button");o.className="submenu-item",o.dataset.view=s.id,o.innerHTML=`
          <span class="submenu-icon">${s.icon}</span>
          <span class="submenu-label">${s.label}</span>
        `,o.addEventListener("click",()=>{s.id==="buildings-manage"?this.onNavigate("buildings"):s.id==="rooms"&&this.onNavigate("rooms"),this.updateActiveState(s.id)}),i.appendChild(o)}),t.appendChild(i)}return t}toggleSubmenu(e){const t=document.getElementById(`submenu-${e}`),a=document.querySelector(`[data-view="${e}"] .submenu-arrow`);this.expandedMenus.has(e)?(this.expandedMenus.delete(e),t.classList.remove("expanded"),a.style.transform="rotate(0deg)"):(this.expandedMenus.add(e),t.classList.add("expanded"),a.style.transform="rotate(90deg)")}toggleCollapse(){const e=document.getElementById("sidebar");this.isCollapsed=!this.isCollapsed,this.isCollapsed?e.classList.add("collapsed"):e.classList.remove("collapsed")}updateActiveState(e,t=null){if(document.querySelectorAll(".sidebar-item, .submenu-item").forEach(i=>{i.classList.remove("active")}),e==="buildings"||e==="rooms"){this.expandedMenus.add("buildings");const i=document.getElementById("submenu-buildings"),s=document.querySelector('[data-view="buildings"] .submenu-arrow');i&&s&&(i.classList.add("expanded"),s.style.transform="rotate(90deg)");const o=e==="buildings"?"buildings-manage":"rooms",d=document.querySelector(`[data-view="${o}"]`);d&&d.classList.add("active")}else{const i=document.querySelector(`[data-view="${e}"]`);i&&i.classList.add("active")}}}class p{constructor(e,t){this.title=e,this.content=t,this.modal=null}render(){return this.modal=document.createElement("div"),this.modal.className="modal-overlay",this.modal.innerHTML=`
      <div class="modal">
        <div class="modal-header">
          <h3>${this.title}</h3>
          <button class="modal-close" id="modalClose">✕</button>
        </div>
        <div class="modal-content">
          ${this.content}
        </div>
      </div>
    `,this.modal.addEventListener("click",e=>{e.target===this.modal&&this.close()}),this.modal.querySelector("#modalClose").addEventListener("click",()=>{this.close()}),document.addEventListener("keydown",this.handleEscape.bind(this)),this.modal}handleEscape(e){e.key==="Escape"&&this.close()}close(){document.removeEventListener("keydown",this.handleEscape.bind(this)),this.modal.remove()}}class S{constructor(e){this.dataManager=e,this.container=null}render(){return this.container=document.createElement("div"),this.container.className="building-manager",this.renderContent(),this.container}renderContent(){const e=this.dataManager.getBuildings();this.container.innerHTML=`
      <div class="page-header">
        <div class="page-title">
          <h2>Gerenciamento de Prédios</h2>
          <p>Cadastre e gerencie os prédios da Cidade do Saber</p>
        </div>
        <button class="btn btn-primary" id="addBuildingBtn">
          <span>➕</span>
          Novo Prédio
        </button>
      </div>

      <div class="content-section">
        <div class="buildings-grid" id="buildingsGrid">
          ${e.map(t=>this.renderBuildingCard(t)).join("")}
        </div>
      </div>
    `,this.container.querySelector("#addBuildingBtn").addEventListener("click",()=>{this.showBuildingModal()}),e.forEach(t=>{const a=this.container.querySelector(`[data-building-id="${t.id}"]`);a.querySelector(".edit-btn").addEventListener("click",()=>{this.showBuildingModal(t)}),a.querySelector(".delete-btn").addEventListener("click",()=>{this.deleteBuilding(t.id)})})}renderBuildingCard(e){const t=this.dataManager.getRoomsByBuilding(e.id);return`
      <div class="building-card" data-building-id="${e.id}">
        <div class="building-header">
          <h3>${e.name}</h3>
          <div class="building-actions">
            <button class="btn-icon edit-btn" title="Editar">✏️</button>
            <button class="btn-icon delete-btn" title="Excluir">🗑️</button>
          </div>
        </div>
        <div class="building-info">
          <p class="building-description">${e.description}</p>
          <div class="building-stats">
            <span class="stat">
              <strong>${t.length}</strong> salas
            </span>
            <span class="stat">
              <strong>${e.floors}</strong> andares
            </span>
          </div>
        </div>
      </div>
    `}showBuildingModal(e=null){const t=e!==null,a=t?"Editar Prédio":"Novo Prédio",i=`
      <form id="buildingForm" class="modal-form">
        <div class="form-group">
          <label for="buildingName">Nome do Prédio</label>
          <input 
            type="text" 
            id="buildingName" 
            value="${e?.name||""}" 
            placeholder="Ex: Prédio Principal"
            required
          >
        </div>
        
        <div class="form-group">
          <label for="buildingDescription">Descrição</label>
          <textarea 
            id="buildingDescription" 
            placeholder="Descrição do prédio..."
            rows="3"
          >${e?.description||""}</textarea>
        </div>
        
        <div class="form-group">
          <label for="buildingFloors">Número de Andares</label>
          <input 
            type="number" 
            id="buildingFloors" 
            value="${e?.floors||1}" 
            min="1"
            required
          >
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="cancelBtn">Cancelar</button>
          <button type="submit" class="btn btn-primary">
            ${t?"Atualizar":"Cadastrar"}
          </button>
        </div>
      </form>
    `,s=new p(a,i);document.body.appendChild(s.render()),document.getElementById("buildingForm").addEventListener("submit",d=>{d.preventDefault(),this.saveBuildingData(e?.id),s.close()}),document.getElementById("cancelBtn").addEventListener("click",()=>{s.close()})}saveBuildingData(e=null){const t=document.getElementById("buildingName").value,a=document.getElementById("buildingDescription").value,i=parseInt(document.getElementById("buildingFloors").value),s={name:t,description:a,floors:i,createdAt:e?void 0:new Date().toISOString()};e?this.dataManager.updateBuilding(e,s):this.dataManager.addBuilding(s),this.renderContent()}deleteBuilding(e){confirm("Tem certeza que deseja excluir este prédio? Esta ação não pode ser desfeita.")&&(this.dataManager.deleteBuilding(e),this.renderContent())}}class ${constructor(e,t=null){this.dataManager=e,this.buildingFilter=t,this.container=null}render(){return this.container=document.createElement("div"),this.container.className="room-manager",this.renderContent(),this.container}renderContent(){let e=this.dataManager.getRooms();this.buildingFilter&&(e=e.filter(s=>s.buildingId===this.buildingFilter));const t=this.dataManager.getBuildings(),a=t.find(s=>s.id===this.buildingFilter),i=this.buildingFilter?`Salas - ${a?.name||"Prédio"}`:"Gerenciamento de Salas";this.container.innerHTML=`
      <div class="page-header">
        <div class="page-title">
          <h2>${i}</h2>
          <p>${this.buildingFilter?"Salas de aula deste prédio":"Cadastre e gerencie as salas de aula dos prédios"}</p>
        </div>
        <button class="btn btn-primary" id="addRoomBtn">
          <span>➕</span>
          Nova Sala
        </button>
      </div>

      <div class="content-section">
        ${this.buildingFilter?"":`
          <div class="filter-section">
            <select id="buildingFilter" class="filter-select">
              <option value="">Todos os prédios</option>
              ${t.map(s=>`<option value="${s.id}">${s.name}</option>`).join("")}
            </select>
          </div>
        `}
        <div class="rooms-grid" id="roomsGrid">
          ${e.map(s=>this.renderRoomCard(s,t)).join("")}
        </div>
      </div>
    `,this.container.querySelector("#addRoomBtn").addEventListener("click",()=>{this.showRoomModal()}),this.buildingFilter||this.container.querySelector("#buildingFilter").addEventListener("change",o=>{this.buildingFilter=o.target.value||null,this.renderContent()}),e.forEach(s=>{const o=this.container.querySelector(`[data-room-id="${s.id}"]`);o.querySelector(".edit-btn").addEventListener("click",()=>{this.showRoomModal(s)}),o.querySelector(".photos-btn").addEventListener("click",()=>{this.showPhotosCarousel(s)}),o.querySelector(".delete-btn").addEventListener("click",()=>{this.deleteRoom(s.id)})})}renderRoomCard(e,t){const a=t.find(l=>l.id===e.buildingId),i=a?a.name:"Prédio não encontrado",o=this.dataManager.getClassesByRoom(e.id).reduce((l,u)=>l+u.enrolledStudents,0),d=Math.min(o/e.capacity*100,100);let r="normal",n="#10b981";return d>100?(r="exceeded",n="#ef4444"):d>85&&(r="high",n="#f59e0b"),`
      <div class="room-card" data-room-id="${e.id}">
        <div class="room-header">
          <h3>${e.name}</h3>
          <div class="room-actions">
            <button class="btn-icon edit-btn" title="Editar">✏️</button>
            <button class="btn-icon photos-btn" title="Ver fotos">📷</button>
            <button class="btn-icon delete-btn" title="Excluir">🗑️</button>
          </div>
        </div>
        <div class="room-info">
          <div class="room-detail">
            <span class="label">Prédio:</span>
            <span class="value">${i}</span>
          </div>
          <div class="room-detail">
            <span class="label">Andar:</span>
            <span class="value">${e.floor}º andar</span>
          </div>
          <div class="room-detail">
            <span class="label">Capacidade:</span>
            <span class="value">${e.capacity} pessoas</span>
          </div>
          <div class="room-detail">
            <span class="label">Tipo:</span>
            <span class="value">${e.type}</span>
          </div>
          <div class="room-detail">
            <span class="label">Ocupação:</span>
            <span class="value">${o}/${e.capacity} alunos</span>
          </div>
          <div class="capacity-bar">
            <div class="capacity-fill" style="width: ${d}%; background-color: ${n}"></div>
          </div>
          <div class="capacity-status ${r}">
            ${r==="exceeded"?"⚠️ Capacidade excedida":r==="high"?"⚡ Quase lotada":"✅ Capacidade adequada"}
          </div>
        </div>
      </div>
    `}showPhotosCarousel(e){const t=["https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg?auto=compress&cs=tinysrgb&w=800","https://images.pexels.com/photos/256490/pexels-photo-256490.jpeg?auto=compress&cs=tinysrgb&w=800","https://images.pexels.com/photos/289737/pexels-photo-289737.jpeg?auto=compress&cs=tinysrgb&w=800"],a=`
      <div class="photo-carousel">
        <div class="carousel-container">
          <div class="carousel-slides" id="carouselSlides">
            ${t.map((n,l)=>`
              <div class="carousel-slide ${l===0?"active":""}">
                <img src="${n}" alt="Foto da ${e.name}" />
              </div>
            `).join("")}
          </div>
          <button class="carousel-btn prev" id="prevBtn">‹</button>
          <button class="carousel-btn next" id="nextBtn">›</button>
        </div>
        <div class="carousel-indicators">
          ${t.map((n,l)=>`
            <button class="indicator ${l===0?"active":""}" data-slide="${l}"></button>
          `).join("")}
        </div>
      </div>
    `,i=new p(`Fotos - ${e.name}`,a);document.body.appendChild(i.render());let s=0;const o=document.querySelectorAll(".carousel-slide"),d=document.querySelectorAll(".indicator"),r=n=>{o.forEach((l,u)=>{l.classList.toggle("active",u===n)}),d.forEach((l,u)=>{l.classList.toggle("active",u===n)}),s=n};document.getElementById("prevBtn").addEventListener("click",()=>{const n=s===0?t.length-1:s-1;r(n)}),document.getElementById("nextBtn").addEventListener("click",()=>{const n=s===t.length-1?0:s+1;r(n)}),d.forEach((n,l)=>{n.addEventListener("click",()=>r(l))})}showRoomModal(e=null){const t=e!==null,a=t?"Editar Sala":"Nova Sala",s=this.dataManager.getBuildings().map(n=>`<option value="${n.id}" ${e?.buildingId===n.id?"selected":""}>
        ${n.name}
      </option>`).join(""),o=`
      <form id="roomForm" class="modal-form">
        <div class="form-group">
          <label for="roomName">Nome da Sala</label>
          <input 
            type="text" 
            id="roomName" 
            value="${e?.name||""}" 
            placeholder="Ex: Sala 101"
            required
          >
        </div>
        
        <div class="form-group">
          <label for="roomBuilding">Prédio</label>
          <select id="roomBuilding" required>
            <option value="">Selecione um prédio</option>
            ${s}
          </select>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="roomFloor">Andar</label>
            <input 
              type="number" 
              id="roomFloor" 
              value="${e?.floor||1}" 
              min="1"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="roomCapacity">Capacidade</label>
            <input 
              type="number" 
              id="roomCapacity" 
              value="${e?.capacity||20}" 
              min="1"
              required
            >
          </div>
        </div>
        
        <div class="form-group">
          <label for="roomType">Tipo de Sala</label>
          <select id="roomType" required>
            <option value="">Selecione o tipo</option>
            <option value="Cultura" ${e?.type==="Cultura"?"selected":""}>Cultura</option>
            <option value="Educação" ${e?.type==="Educação"?"selected":""}>Educação</option>
            <option value="Esporte" ${e?.type==="Esporte"?"selected":""}>Esporte</option>
            <option value="Multiuso" ${e?.type==="Multiuso"?"selected":""}>Multiuso</option>
          </select>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="cancelBtn">Cancelar</button>
          <button type="submit" class="btn btn-primary">
            ${t?"Atualizar":"Cadastrar"}
          </button>
        </div>
      </form>
    `,d=new p(a,o);document.body.appendChild(d.render()),document.getElementById("roomForm").addEventListener("submit",n=>{n.preventDefault(),this.saveRoomData(e?.id),d.close()}),document.getElementById("cancelBtn").addEventListener("click",()=>{d.close()})}saveRoomData(e=null){const t=document.getElementById("roomName").value,a=document.getElementById("roomBuilding").value,i=parseInt(document.getElementById("roomFloor").value),s=parseInt(document.getElementById("roomCapacity").value),o=document.getElementById("roomType").value,d={name:t,buildingId:a,floor:i,capacity:s,type:o,createdAt:e?void 0:new Date().toISOString()};e?this.dataManager.updateRoom(e,d):this.dataManager.addRoom(d),this.renderContent()}deleteRoom(e){confirm("Tem certeza que deseja excluir esta sala? Esta ação não pode ser desfeita.")&&(this.dataManager.deleteRoom(e),this.renderContent())}}class E{constructor(e){this.dataManager=e}render(){const e=document.createElement("div");e.className="dashboard";const t=this.dataManager.getBuildings(),a=this.dataManager.getRooms(),i=this.dataManager.getClasses(),s=this.dataManager.getPeriods();return e.innerHTML=`
      <div class="dashboard-header">
        <h2>Dashboard</h2>
        <p>Visão geral do sistema de gerenciamento</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">🏢</div>
          <div class="stat-content">
            <h3>${t.length}</h3>
            <p>Prédios Cadastrados</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🚪</div>
          <div class="stat-content">
            <h3>${a.length}</h3>
            <p>Salas de Aula</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🎓</div>
          <div class="stat-content">
            <h3>${i.length}</h3>
            <p>Turmas Ativas</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📚</div>
          <div class="stat-content">
            <h3>${s.length}</h3>
            <p>Períodos Letivos</p>
          </div>
        </div>
      </div>

      <div class="dashboard-content">
        <div class="recent-activity">
          <h3>Atividade Recente</h3>
          <div class="activity-list">
            <div class="activity-item">
              <div class="activity-icon">🏢</div>
              <div class="activity-text">
                <p>Sistema iniciado</p>
                <span>Agora</span>
              </div>
            </div>
          </div>
        </div>

        <div class="quick-actions">
          <h3>Ações Rápidas</h3>
          <div class="action-buttons">
            <button class="action-btn" onclick="window.adminSystem?.handleNavigation('buildings')">
              <span>🏢</span>
              Gerenciar Prédios
            </button>
            <button class="action-btn" onclick="window.adminSystem?.handleNavigation('rooms')">
              <span>🚪</span>
              Gerenciar Salas
            </button>
            <button class="action-btn" onclick="window.adminSystem?.handleNavigation('classes')">
              <span>👥</span>
              Gerenciar Turmas
            </button>
            <button class="action-btn" onclick="window.adminSystem?.handleNavigation('periods')">
              <span>📅</span>
              Períodos Letivos
            </button>
          </div>
        </div>
      </div>
    `,e}}class C{constructor(e,t=null){this.dataManager=e,this.buildingFilter=t,this.container=null,this.selectedPeriod=null}render(){return this.container=document.createElement("div"),this.container.className="class-manager",this.renderContent(),this.container}renderContent(){const e=this.dataManager.getPeriods(),t=this.dataManager.getBuildings(),a=t.find(s=>s.id===this.buildingFilter),i=this.buildingFilter?`Turmas - ${a?.name||"Prédio"}`:"Gerenciamento de Turmas";this.container.innerHTML=`
      <div class="page-header">
        <div class="page-title">
          <h2>${i}</h2>
          <p>Gerencie as turmas e horários das aulas</p>
        </div>
        <button class="btn btn-primary" id="addClassBtn">
          <span>➕</span>
          Nova Turma
        </button>
      </div>

      <div class="content-section">
        <div class="filter-section">
          <select id="periodFilter" class="filter-select">
            <option value="">Todos os períodos</option>
            ${e.map(s=>`<option value="${s.id}" ${this.selectedPeriod===s.id?"selected":""}>
                ${s.name} (${s.year})
              </option>`).join("")}
          </select>
          ${this.buildingFilter?"":`
            <select id="buildingFilter" class="filter-select">
              <option value="">Todos os prédios</option>
              ${t.map(s=>`<option value="${s.id}">${s.name}</option>`).join("")}
            </select>
          `}
        </div>
        <div class="classes-grid" id="classesGrid">
          ${this.renderClasses()}
        </div>
      </div>
    `,this.container.querySelector("#addClassBtn").addEventListener("click",()=>{this.showClassModal()}),this.container.querySelector("#periodFilter").addEventListener("change",s=>{this.selectedPeriod=s.target.value||null,this.renderContent()}),this.buildingFilter||this.container.querySelector("#buildingFilter").addEventListener("change",s=>{this.buildingFilter=s.target.value||null,this.renderContent()})}renderClasses(){let e=this.dataManager.getClasses();if(this.selectedPeriod&&(e=e.filter(t=>t.periodId===this.selectedPeriod)),this.buildingFilter){const a=this.dataManager.getRoomsByBuilding(this.buildingFilter).map(i=>i.id);e=e.filter(i=>a.includes(i.roomId))}return e.length===0?`
        <div class="empty-state">
          <h3>Nenhuma turma encontrada</h3>
          <p>Cadastre a primeira turma para começar</p>
        </div>
      `:e.map(t=>this.renderClassCard(t)).join("")}renderClassCard(e){const t=this.dataManager.getRooms().find(n=>n.id===e.roomId),a=this.dataManager.getBuildings().find(n=>n.id===t?.buildingId),i=this.dataManager.getPeriods().find(n=>n.id===e.periodId),s=Math.min(e.enrolledStudents/t.capacity*100,100);let o="normal",d="✅",r="Adequada";return s>100?(o="exceeded",d="⚠️",r="Excedida"):s>85&&(o="high",d="⚡",r="Quase lotada"),`
      <div class="class-card" data-class-id="${e.id}">
        <div class="class-header">
          <h3>${e.name}</h3>
          <div class="class-actions">
            <button class="btn-icon edit-btn" title="Editar">✏️</button>
            <button class="btn-icon delete-btn" title="Excluir">🗑️</button>
          </div>
        </div>
        <div class="class-info">
          <div class="class-detail">
            <span class="label">Período:</span>
            <span class="value">${i?.name||"N/A"} (${i?.year||"N/A"})</span>
          </div>
          <div class="class-detail">
            <span class="label">Local:</span>
            <span class="value">${t?.name||"N/A"} - ${a?.name||"N/A"}</span>
          </div>
          <div class="class-detail">
            <span class="label">Carga Horária:</span>
            <span class="value">${e.workload}h</span>
          </div>
          <div class="class-detail">
            <span class="label">Horário:</span>
            <span class="value">${e.startTime} - ${e.endTime}</span>
          </div>
          <div class="class-detail">
            <span class="label">Dias:</span>
            <span class="value">${e.weekDays.join(", ")}</span>
          </div>
          <div class="class-detail">
            <span class="label">Turno:</span>
            <span class="value">${e.shift}</span>
          </div>
          <div class="capacity-section">
            <div class="capacity-header">
              <span class="label">Ocupação:</span>
              <span class="capacity-status ${o}">
                ${d} ${r}
              </span>
            </div>
            <div class="capacity-bar">
              <div class="capacity-fill ${o}" style="width: ${s}%"></div>
            </div>
            <div class="capacity-text">
              ${e.enrolledStudents}/${t?.capacity||0} alunos (${Math.round(s)}%)
            </div>
          </div>
        </div>
      </div>
    `}showPhotosCarousel(e){const t=["https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg?auto=compress&cs=tinysrgb&w=800","https://images.pexels.com/photos/256490/pexels-photo-256490.jpeg?auto=compress&cs=tinysrgb&w=800","https://images.pexels.com/photos/289737/pexels-photo-289737.jpeg?auto=compress&cs=tinysrgb&w=800","https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?auto=compress&cs=tinysrgb&w=800"],a=`
      <div class="photo-carousel">
        <div class="carousel-container">
          <div class="carousel-slides" id="carouselSlides">
            ${t.map((n,l)=>`
              <div class="carousel-slide ${l===0?"active":""}">
                <img src="${n}" alt="Foto da ${e.name}" />
              </div>
            `).join("")}
          </div>
          <button class="carousel-btn prev" id="prevBtn">‹</button>
          <button class="carousel-btn next" id="nextBtn">›</button>
        </div>
        <div class="carousel-indicators">
          ${t.map((n,l)=>`
            <button class="indicator ${l===0?"active":""}" data-slide="${l}"></button>
          `).join("")}
        </div>
        <div class="photo-info">
          <p>📷 ${t.length} fotos disponíveis</p>
          <p>Última atualização: ${new Date().toLocaleDateString("pt-BR")}</p>
        </div>
      </div>
    `,i=new p(`Fotos - ${e.name}`,a);document.body.appendChild(i.render());let s=0;const o=document.querySelectorAll(".carousel-slide"),d=document.querySelectorAll(".indicator"),r=n=>{o.forEach((l,u)=>{l.classList.toggle("active",u===n)}),d.forEach((l,u)=>{l.classList.toggle("active",u===n)}),s=n};document.getElementById("prevBtn").addEventListener("click",()=>{const n=s===0?t.length-1:s-1;r(n)}),document.getElementById("nextBtn").addEventListener("click",()=>{const n=s===t.length-1?0:s+1;r(n)}),d.forEach((n,l)=>{n.addEventListener("click",()=>r(l))}),setInterval(()=>{const n=s===t.length-1?0:s+1;r(n)},5e3)}showClassModal(e=null){const t=e!==null,a=t?"Editar Turma":"Nova Turma",i=this.dataManager.getPeriods(),s=this.dataManager.getRooms(),o=this.dataManager.getBuildings(),d=i.map(c=>`<option value="${c.id}" ${e?.periodId===c.id?"selected":""}>
        ${c.name} (${c.year})
      </option>`).join(""),r=s.map(c=>{const v=o.find(g=>g.id===c.buildingId);return`<option value="${c.id}" ${e?.roomId===c.id?"selected":""}>
        ${c.name} - ${v?.name||"N/A"}
      </option>`}).join(""),n=["Segunda","Terça","Quarta","Quinta","Sexta","Sábado","Domingo"],l=e?.weekDays||[],u=`
      <form id="classForm" class="modal-form">
        <div class="form-group">
          <label for="className">Nome da Turma</label>
          <input 
            type="text" 
            id="className" 
            value="${e?.name||""}" 
            placeholder="Ex: Dança Contemporânea - Iniciante"
            required
          >
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="classPeriod">Período Letivo</label>
            <select id="classPeriod" required>
              <option value="">Selecione o período</option>
              ${d}
            </select>
          </div>
          
          <div class="form-group">
            <label for="classRoom">Sala</label>
            <select id="classRoom" required>
              <option value="">Selecione a sala</option>
              ${r}
            </select>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="classWorkload">Carga Horária (horas)</label>
            <input 
              type="number" 
              id="classWorkload" 
              value="${e?.workload||40}" 
              min="1"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="classShift">Turno</label>
            <select id="classShift" required>
              <option value="">Selecione o turno</option>
              <option value="Matutino" ${e?.shift==="Matutino"?"selected":""}>Matutino</option>
              <option value="Vespertino" ${e?.shift==="Vespertino"?"selected":""}>Vespertino</option>
              <option value="Noturno" ${e?.shift==="Noturno"?"selected":""}>Noturno</option>
            </select>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="classStartTime">Horário de Início</label>
            <input 
              type="time" 
              id="classStartTime" 
              value="${e?.startTime||"08:00"}" 
              required
            >
          </div>
          
          <div class="form-group">
            <label for="classEndTime">Horário de Término</label>
            <input 
              type="time" 
              id="classEndTime" 
              value="${e?.endTime||"10:00"}" 
              required
            >
          </div>
        </div>
        
        <div class="form-group">
          <label for="enrolledStudents">Alunos Matriculados</label>
          <input 
            type="number" 
            id="enrolledStudents" 
            value="${e?.enrolledStudents||0}" 
            min="0"
            required
          >
        </div>
        
        <div class="form-group">
          <label>Dias da Semana</label>
          <div class="checkbox-group">
            ${n.map(c=>`
              <label class="checkbox-item">
                <input 
                  type="checkbox" 
                  value="${c}" 
                  ${l.includes(c)?"checked":""}
                >
                <span class="checkbox-label">${c}</span>
              </label>
            `).join("")}
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="cancelBtn">Cancelar</button>
          <button type="submit" class="btn btn-primary">
            ${t?"Atualizar":"Cadastrar"}
          </button>
        </div>
      </form>
    `,h=new p(a,u);document.body.appendChild(h.render()),document.getElementById("classForm").addEventListener("submit",c=>{c.preventDefault(),this.saveClassData(e?.id),h.close()}),document.getElementById("cancelBtn").addEventListener("click",()=>{h.close()}),this.container.querySelectorAll(".class-card").forEach(c=>{const v=c.dataset.classId,g=this.dataManager.getClasses().find(b=>b.id===v);g&&(c.querySelector(".edit-btn").addEventListener("click",()=>{this.showClassModal(g)}),c.querySelector(".delete-btn").addEventListener("click",()=>{this.deleteClass(v)}))})}saveClassData(e=null){const t=document.getElementById("className").value,a=document.getElementById("classPeriod").value,i=document.getElementById("classRoom").value,s=parseInt(document.getElementById("classWorkload").value),o=document.getElementById("classShift").value,d=document.getElementById("classStartTime").value,r=document.getElementById("classEndTime").value,n=parseInt(document.getElementById("enrolledStudents").value),l=Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(h=>h.value),u={name:t,periodId:a,roomId:i,workload:s,shift:o,startTime:d,endTime:r,enrolledStudents:n,weekDays:l,createdAt:e?void 0:new Date().toISOString()};e?this.dataManager.updateClass(e,u):this.dataManager.addClass(u),this.renderContent()}deleteClass(e){confirm("Tem certeza que deseja excluir esta turma? Esta ação não pode ser desfeita.")&&(this.dataManager.deleteClass(e),this.renderContent())}}class B{constructor(e){this.dataManager=e,this.container=null}render(){return this.container=document.createElement("div"),this.container.className="period-manager",this.renderContent(),this.container}renderContent(){const e=this.dataManager.getPeriods();this.container.innerHTML=`
      <div class="page-header">
        <div class="page-title">
          <h2>Períodos Letivos</h2>
          <p>Configure os períodos letivos para organizar as turmas</p>
        </div>
        <button class="btn btn-primary" id="addPeriodBtn">
          <span>➕</span>
          Novo Período
        </button>
      </div>

      <div class="content-section">
        <div class="periods-grid" id="periodsGrid">
          ${e.map(t=>this.renderPeriodCard(t)).join("")}
        </div>
      </div>
    `,this.container.querySelector("#addPeriodBtn").addEventListener("click",()=>{this.showPeriodModal()}),e.forEach(t=>{const a=this.container.querySelector(`[data-period-id="${t.id}"]`);a.querySelector(".edit-btn").addEventListener("click",()=>{this.showPeriodModal(t)}),a.querySelector(".delete-btn").addEventListener("click",()=>{this.deletePeriod(t.id)})})}renderPeriodCard(e){const t=this.dataManager.getClassesByPeriod(e.id);return`
      <div class="period-card" data-period-id="${e.id}">
        <div class="period-header">
          <h3>${e.name}</h3>
          <div class="period-actions">
            <button class="btn-icon edit-btn" title="Editar">✏️</button>
            <button class="btn-icon delete-btn" title="Excluir">🗑️</button>
          </div>
        </div>
        <div class="period-info">
          <div class="period-detail">
            <span class="label">Ano:</span>
            <span class="value">${e.year}</span>
          </div>
          <div class="period-detail">
            <span class="label">Divisão:</span>
            <span class="value">${e.division}</span>
          </div>
          <div class="period-detail">
            <span class="label">Início:</span>
            <span class="value">${new Date(e.startDate).toLocaleDateString("pt-BR")}</span>
          </div>
          <div class="period-detail">
            <span class="label">Término:</span>
            <span class="value">${new Date(e.endDate).toLocaleDateString("pt-BR")}</span>
          </div>
          <div class="period-stats">
            <span class="stat">
              <strong>${t.length}</strong> turmas
            </span>
          </div>
        </div>
      </div>
    `}showPeriodModal(e=null){const t=e!==null,a=t?"Editar Período Letivo":"Novo Período Letivo",i=`
      <form id="periodForm" class="modal-form">
        <div class="form-group">
          <label for="periodName">Nome do Período</label>
          <input 
            type="text" 
            id="periodName" 
            value="${e?.name||""}" 
            placeholder="Ex: 1º Semestre"
            required
          >
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="periodYear">Ano</label>
            <input 
              type="number" 
              id="periodYear" 
              value="${e?.year||new Date().getFullYear()}" 
              min="2020"
              max="2030"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="periodDivision">Divisão</label>
            <select id="periodDivision" required>
              <option value="">Selecione a divisão</option>
              <option value="Semestral" ${e?.division==="Semestral"?"selected":""}>Semestral</option>
              <option value="Trimestral" ${e?.division==="Trimestral"?"selected":""}>Trimestral</option>
              <option value="Bimestral" ${e?.division==="Bimestral"?"selected":""}>Bimestral</option>
              <option value="Mensal" ${e?.division==="Mensal"?"selected":""}>Mensal</option>
            </select>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="periodStartDate">Data de Início</label>
            <input 
              type="date" 
              id="periodStartDate" 
              value="${e?.startDate||""}" 
              required
            >
          </div>
          
          <div class="form-group">
            <label for="periodEndDate">Data de Término</label>
            <input 
              type="date" 
              id="periodEndDate" 
              value="${e?.endDate||""}" 
              required
            >
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="cancelBtn">Cancelar</button>
          <button type="submit" class="btn btn-primary">
            ${t?"Atualizar":"Cadastrar"}
          </button>
        </div>
      </form>
    `,s=new p(a,i);document.body.appendChild(s.render()),document.getElementById("periodForm").addEventListener("submit",d=>{d.preventDefault(),this.savePeriodData(e?.id),s.close()}),document.getElementById("cancelBtn").addEventListener("click",()=>{s.close()})}savePeriodData(e=null){const t=document.getElementById("periodName").value,a=parseInt(document.getElementById("periodYear").value),i=document.getElementById("periodDivision").value,s=document.getElementById("periodStartDate").value,o=document.getElementById("periodEndDate").value,d={name:t,year:a,division:i,startDate:s,endDate:o,createdAt:e?void 0:new Date().toISOString()};e?this.dataManager.updatePeriod(e,d):this.dataManager.addPeriod(d),this.renderContent()}deletePeriod(e){if(this.dataManager.getClassesByPeriod(e).length>0){alert("Não é possível excluir este período pois existem turmas vinculadas a ele.");return}confirm("Tem certeza que deseja excluir este período letivo? Esta ação não pode ser desfeita.")&&(this.dataManager.deletePeriod(e),this.renderContent())}}class w{constructor(e){this.dataManager=e,this.currentView="dashboard",this.currentBuildingFilter=null,this.container=null,this.mainContent=null,this.sidebar=null}render(){this.container=document.createElement("div"),this.container.className="admin-container";const e=new f(this.toggleSidebar.bind(this));this.container.appendChild(e.render());const t=document.createElement("div");return t.className="main-layout",this.sidebar=new y(this.handleNavigation.bind(this),this.dataManager),t.appendChild(this.sidebar.render()),this.mainContent=document.createElement("div"),this.mainContent.className="main-content",t.appendChild(this.mainContent),this.container.appendChild(t),this.renderCurrentView(),this.container}handleNavigation(e,t=null){this.currentView=e,this.currentBuildingFilter=t,this.renderCurrentView(),this.sidebar.updateActiveState(e,t),window.adminSystem=this}toggleSidebar(){this.sidebar.toggleCollapse()}renderCurrentView(){this.mainContent.innerHTML="";let e;switch(this.currentView){case"buildings":e=new S(this.dataManager);break;case"rooms":e=new $(this.dataManager,this.currentBuildingFilter);break;case"classes":e=new C(this.dataManager,this.currentBuildingFilter);break;case"periods":e=new B(this.dataManager);break;default:e=new E(this.dataManager)}this.mainContent.appendChild(e.render())}}class I{constructor(){this.buildings=this.loadBuildings(),this.rooms=this.loadRooms(),this.classes=this.loadClasses(),this.periods=this.loadPeriods()}getBuildings(){return this.buildings}addBuilding(e){const t={id:this.generateId(),...e,createdAt:new Date().toISOString()};return this.buildings.push(t),this.saveBuildings(),t}updateBuilding(e,t){const a=this.buildings.findIndex(i=>i.id===e);a!==-1&&(this.buildings[a]={...this.buildings[a],...t},this.saveBuildings())}deleteBuilding(e){this.buildings=this.buildings.filter(t=>t.id!==e),this.rooms=this.rooms.filter(t=>t.buildingId!==e),this.saveBuildings(),this.saveRooms()}getRooms(){return this.rooms}getRoomsByBuilding(e){return this.rooms.filter(t=>t.buildingId===e)}addRoom(e){const t={id:this.generateId(),...e,createdAt:new Date().toISOString()};return this.rooms.push(t),this.saveRooms(),t}updateRoom(e,t){const a=this.rooms.findIndex(i=>i.id===e);a!==-1&&(this.rooms[a]={...this.rooms[a],...t},this.saveRooms())}deleteRoom(e){this.rooms=this.rooms.filter(t=>t.id!==e),this.saveRooms()}getClasses(){return this.classes}getClassesByRoom(e){return this.classes.filter(t=>t.roomId===e)}getClassesByPeriod(e){return this.classes.filter(t=>t.periodId===e)}addClass(e){const t={id:this.generateId(),...e,createdAt:new Date().toISOString()};return this.classes.push(t),this.saveClasses(),t}updateClass(e,t){const a=this.classes.findIndex(i=>i.id===e);a!==-1&&(this.classes[a]={...this.classes[a],...t},this.saveClasses())}deleteClass(e){this.classes=this.classes.filter(t=>t.id!==e),this.saveClasses()}getPeriods(){return this.periods}addPeriod(e){const t={id:this.generateId(),...e,createdAt:new Date().toISOString()};return this.periods.push(t),this.savePeriods(),t}updatePeriod(e,t){const a=this.periods.findIndex(i=>i.id===e);a!==-1&&(this.periods[a]={...this.periods[a],...t},this.savePeriods())}deletePeriod(e){this.periods=this.periods.filter(t=>t.id!==e),this.savePeriods()}loadBuildings(){const e=localStorage.getItem("cidade_saber_buildings");return e?JSON.parse(e):this.getDefaultBuildings()}saveBuildings(){localStorage.setItem("cidade_saber_buildings",JSON.stringify(this.buildings))}loadRooms(){const e=localStorage.getItem("cidade_saber_rooms");return e?JSON.parse(e):this.getDefaultRooms()}saveRooms(){localStorage.setItem("cidade_saber_rooms",JSON.stringify(this.rooms))}loadClasses(){const e=localStorage.getItem("cidade_saber_classes");return e?JSON.parse(e):this.getDefaultClasses()}saveClasses(){localStorage.setItem("cidade_saber_classes",JSON.stringify(this.classes))}loadPeriods(){const e=localStorage.getItem("cidade_saber_periods");return e?JSON.parse(e):this.getDefaultPeriods()}savePeriods(){localStorage.setItem("cidade_saber_periods",JSON.stringify(this.periods))}getDefaultBuildings(){return[{id:"1",name:"Prédio Principal",description:"Prédio principal com salas administrativas e de aula",floors:3,createdAt:new Date().toISOString()},{id:"2",name:"Centro Cultural",description:"Espaço dedicado às atividades culturais e artísticas",floors:2,createdAt:new Date().toISOString()}]}getDefaultRooms(){return[{id:"1",name:"Sala 101",buildingId:"1",floor:1,capacity:30,type:"Educação",createdAt:new Date().toISOString()},{id:"2",name:"Auditório",buildingId:"2",floor:1,capacity:100,type:"Cultura",createdAt:new Date().toISOString()},{id:"3",name:"Sala de Dança",buildingId:"2",floor:2,capacity:25,type:"Cultura",createdAt:new Date().toISOString()}]}getDefaultClasses(){return[{id:"1",name:"Dança Contemporânea - Iniciante",periodId:"1",roomId:"3",workload:40,shift:"Vespertino",startTime:"14:00",endTime:"16:00",weekDays:["Segunda","Quarta","Sexta"],enrolledStudents:20,createdAt:new Date().toISOString()},{id:"2",name:"Matemática Básica",periodId:"1",roomId:"1",workload:60,shift:"Matutino",startTime:"08:00",endTime:"10:00",weekDays:["Segunda","Terça","Quinta"],enrolledStudents:25,createdAt:new Date().toISOString()}]}getDefaultPeriods(){const e=new Date().getFullYear();return[{id:"1",name:"1º Semestre",year:e,division:"Semestral",startDate:`${e}-02-01`,endDate:`${e}-07-31`,createdAt:new Date().toISOString()},{id:"2",name:"2º Semestre",year:e,division:"Semestral",startDate:`${e}-08-01`,endDate:`${e}-12-15`,createdAt:new Date().toISOString()}]}generateId(){return Date.now().toString()+Math.random().toString(36).substr(2,9)}}const M=new I,L=new w(M),P=document.getElementById("app");P.appendChild(L.render());
