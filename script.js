// Variáveis globais para o dropdown
let allTarefas = [];
let isDropdownOpen = false;

// Função para alternar o dropdown
function toggleDropdown() {
  const dropdownOptions = document.getElementById("dropdown-options");
  const dropdownArrow = document.querySelector(".dropdown-arrow");

  isDropdownOpen = !isDropdownOpen;

  if (isDropdownOpen) {
    dropdownOptions.classList.add("active");
    dropdownArrow.style.transform = "rotate(180deg)";

    // Verificar se já temos tarefas carregadas
    if (allTarefas.length === 0) {
      // Mostrar indicador de carregamento
      showDropdownLoading();
      // Carregar tarefas em background
      loadTarefasIfNeeded();
    } else {
      // Tarefas já carregadas, focar no filtro
      document.getElementById("filter-input").focus();
    }
  } else {
    dropdownOptions.classList.remove("active");
    dropdownArrow.style.transform = "rotate(0deg)";
  }
}

// Função para mostrar indicador de carregamento no dropdown
function showDropdownLoading() {
  const optionsList = document.getElementById("options-list");
  optionsList.innerHTML = `
    <div class="dropdown-loading">
      Carregando pacientes...
    </div>
  `;
}

// Função para carregar tarefas se necessário
async function loadTarefasIfNeeded() {
  // Se já temos tarefas, não recarregar
  if (allTarefas.length > 0) {
    return;
  }

  try {
    console.log("🔍 Carregando tarefas em background...");

    const response = await fetch(
      `/api/tasks?list_id=${CONFIG.CLICKUP_LIST_ID}&status=${CONFIG.CLICKUP_STATUS}`,
      {
        headers: {
          Authorization: getAccessToken(),
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao buscar tarefas: ${response.status}`);
    }

    const data = await response.json();

    console.log("📊 Resposta completa da API:", data);

    // Verificar diferentes possíveis estruturas de resposta da API do ClickUp
    let tarefas = null;

    if (data.success && data.tasks) {
      tarefas = data.tasks;
    } else if (data.tasks) {
      tarefas = data.tasks;
    } else if (Array.isArray(data)) {
      tarefas = data;
    }

    if (tarefas && tarefas.length > 0) {
      console.log(`✅ ${tarefas.length} tarefas carregadas`);

      // Armazenar tarefas globalmente
      allTarefas = tarefas;

      // Popular o dropdown
      popularDropdown(allTarefas);

      // Focar no filtro após carregar
      setTimeout(() => {
        const filterInput = document.getElementById("filter-input");
        if (filterInput) filterInput.focus();
      }, 100);
    } else {
      console.warn("Nenhuma tarefa encontrada");
      console.log("🔍 Estrutura da resposta:", {
        success: data.success,
        tasks: data.tasks,
        hasTasks: !!data.tasks,
        tasksLength: data.tasks ? data.tasks.length : 0,
        isArray: Array.isArray(data),
        dataKeys: Object.keys(data),
      });
      showNoTarefasMessage();
    }
  } catch (error) {
    console.error("Erro ao carregar tarefas:", error);
    showErrorTarefasMessage();
  }
}

// Função para mostrar mensagem de "nenhuma tarefa"
function showNoTarefasMessage() {
  const optionsList = document.getElementById("options-list");
  optionsList.innerHTML = `
    <div class="dropdown-loading">
      Nenhum paciente encontrado
    </div>
  `;
}

// Função para mostrar mensagem de erro
function showErrorTarefasMessage() {
  const optionsList = document.getElementById("options-list");
  optionsList.innerHTML = `
    <div class="dropdown-loading">
      Erro ao carregar pacientes
    </div>
  `;
}

// Função para filtrar opções
function filterOptions() {
  const filterValue = document
    .getElementById("filter-input")
    .value.toLowerCase();
  const optionsList = document.getElementById("options-list");

  // Filtrar tarefas baseado no texto digitado
  const filteredTarefas = allTarefas.filter((tarefa) =>
    tarefa.name.toLowerCase().includes(filterValue)
  );

  // Ordenar tarefas filtradas alfabeticamente
  const tarefasFiltradasOrdenadas = filteredTarefas.sort((a, b) => {
    return a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" });
  });

  // Limpar e recriar a lista de opções
  optionsList.innerHTML = "";

  if (tarefasFiltradasOrdenadas.length === 0) {
    const noResults = document.createElement("div");
    noResults.className = "dropdown-option";
    noResults.textContent = "Nenhuma opção encontrada";
    noResults.style.color = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--text-secondary");
    noResults.style.fontStyle = "italic";
    optionsList.appendChild(noResults);
  } else {
    tarefasFiltradasOrdenadas.forEach((tarefa) => {
      const option = document.createElement("div");
      option.className = "dropdown-option";
      option.textContent = tarefa.name;
      option.onclick = () => selectOption(tarefa);
      optionsList.appendChild(option);
    });
  }
}

// Função para selecionar uma opção
function selectOption(tarefa) {
  const guestSearch = document.getElementById("guest-search");
  const guestHidden = document.getElementById("guest");

  guestSearch.value = tarefa.name;
  guestHidden.value = tarefa.id;
  const cf38 = tarefa && tarefa.custom_fields ? tarefa.custom_fields[38] : null;
  try {
    guestHidden.dataset.service = cf38 ? JSON.stringify(cf38) : "";
  } catch (_) {
    guestHidden.dataset.service = "";
  }

  // Fechar dropdown
  toggleDropdown();

  // Limpar filtro
  document.getElementById("filter-input").value = "";

  // Restaurar lista completa
  filterOptions();
}

// Função para buscar tarefas da API do ClickUp
async function buscarTarefas() {
  // Se já temos tarefas carregadas, não fazer nada
  if (allTarefas.length > 0) {
    console.log("✅ Tarefas já carregadas, pulando busca");
    return;
  }

  try {
    // Verificar se o usuário está autenticado
    if (!isAuthenticated()) {
      console.log("Usuário não autenticado");
      return;
    }

    console.log("🔍 Iniciando carregamento de tarefas...");

    // Carregar tarefas e aguardar resultado
    await loadTarefasIfNeeded();
  } catch (error) {
    console.error("Erro ao verificar autenticação para tarefas:", error);
  }
}

// Função para buscar equipes da API do ClickUp
async function buscarEquipes() {
  try {
    // Verificar se o usuário está autenticado
    if (!isAuthenticated()) {
      console.log("Usuário não autenticado para buscar equipes");
      return null;
    }

    console.log("🔍 Buscando equipes...");

    const apiBase = CONFIG.API_BASE || "";
    const response = await fetch(`${apiBase}/api/teams`, {
      headers: {
        Authorization: getAccessToken(),
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar equipes: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Equipes obtidas:", data);

    return data;
  } catch (error) {
    console.error("Erro ao buscar equipes:", error);
    return null;
  }
}

// Função para popular o dropdown com as tarefas
function popularDropdown(tarefas) {
  const optionsList = document.getElementById("options-list");

  // Ordenar tarefas ordenadas alfabeticamente pelo campo name
  const tarefasOrdenadas = tarefas.sort((a, b) => {
    return a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" });
  });

  // Limpar opções existentes
  optionsList.innerHTML = "";

  // Adicionar cada tarefa ordenada como opção
  tarefasOrdenadas.forEach((tarefa) => {
    const option = document.createElement("div");
    option.className = "dropdown-option";
    option.textContent = tarefa.name;
    option.onclick = () => selectOption(tarefa);
    optionsList.appendChild(option);
  });
}

// Função para atualizar o nome do usuário na interface
function atualizarNomeUsuario() {
  // Esta função agora é gerenciada pelo auth.js
  // Removida para evitar loop infinito
  console.log(
    "📝 Função atualizarNomeUsuario do script.js chamada - delegando para auth.js"
  );
}

// Função para enviar formulário para o webhook
async function enviarFormulario(event) {
  event.preventDefault();

  // Validar formulário primeiro
  if (!validarFormulario()) {
    return false;
  }

  // Verificar se o usuário está autenticado
  if (!isAuthenticated()) {
    showErrorModal("Usuário não autenticado. Faça login novamente.");
    fazerLogout();
    return false;
  }

  // Obter token de acesso do sistema de autenticação
  const accessToken = getAccessToken();
  if (!accessToken) {
    showErrorModal("Token de acesso não encontrado. Faça login novamente.");
    fazerLogout();
    return false;
  }

  // Coletar dados do formulário
  const guestEl = document.getElementById("guest");
  const pacienteId = guestEl.value;
  const pacienteName = document.getElementById("guest-search").value;
  const pacienteServiceRaw = guestEl.dataset.service || "";
  let pacienteService = "";
  if (pacienteServiceRaw) {
    try {
      pacienteService = JSON.parse(pacienteServiceRaw);
    } catch (_) {
      pacienteService = pacienteServiceRaw;
    }
  }
  const data = document.getElementById("date").value;

  // Preparar dados para envio
  const dadosFormulario = {
    paciente: {
      id: pacienteId,
      name: pacienteName,
      service: pacienteService,
    },
    data: data,
    timestamp: new Date().toISOString(),
    // Adicionar token de autorização
    authorization: `Bearer ${accessToken}`,
    usuarioAutenticado: {
      id:
        (window.getAuthenticatedUser &&
          getAuthenticatedUser() &&
          getAuthenticatedUser().id) ||
        null,
      name:
        (window.getAuthenticatedUser &&
          getAuthenticatedUser() &&
          (getAuthenticatedUser().username || getAuthenticatedUser().name)) ||
        null,
      email: (window.getAuthenticatedEmail && getAuthenticatedEmail()) || null,
    },
  };

  console.log("🔍 Dados do formulário preparados:", dadosFormulario);
  console.log("🔍 Authorization no formulário:", dadosFormulario.authorization);

  try {
    // Mostrar indicador de carregamento
    const submitButton = document.querySelector("#formulario .formbold-btn");
    const originalText = submitButton.textContent;
    submitButton.textContent = "Enviando...";
    submitButton.disabled = true;

    // Enviar para o webhook
    // Configure a URL do webhook no arquivo config.js ou variável de ambiente
    const webhookUrl = CONFIG.WEBHOOK_URL || "YOUR_WEBHOOK_URL_HERE";
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dadosFormulario),
    });

    if (response.ok) {
      // Sucesso
      showSuccessModal();

      // Limpar formulário
      document.getElementById("guest").value = "";
      document.getElementById("guest-search").value = "";

      // Redefinir data para hoje
      const today = new Date();
      const tzOffset = new Date(
        today.getTime() - today.getTimezoneOffset() * 60000
      );
      document.getElementById("date").value = tzOffset
        .toISOString()
        .split("T")[0];

      const guestAfter = document.getElementById("guest");
      if (guestAfter && guestAfter.dataset) {
        guestAfter.dataset.service = "";
      }
    } else {
      // Erro na resposta
      throw new Error(`Erro no servidor: ${response.status}`);
    }
  } catch (error) {
    // Erro na requisição
    console.error("Erro ao enviar formulário:", error);
    showErrorModal(error.message);
  } finally {
    // Restaurar botão
    const submitButton = document.querySelector("#formulario .formbold-btn");
    submitButton.textContent = "Enviar";
    submitButton.disabled = false;
  }

  return false;
}

// Função para validar formulário
function validarFormulario() {
  // Verificar se o paciente foi selecionado
  const paciente = document.getElementById("guest").value;
  if (!paciente) {
    alert("Por favor, selecione um paciente.");
    return false;
  }

  // Verificar se a data foi preenchida
  const data = document.getElementById("date").value;
  if (!data) {
    alert("Por favor, selecione uma data.");
    return false;
  }

  // Se todos os campos estiverem preenchidos, permitir o envio
  return true;
}

// Adicionar validação visual em tempo real e event listeners
document.addEventListener("DOMContentLoaded", function () {
  // A inicialização das tarefas e data agora é feita no HTML após verificação de autenticação

  // Definir data atual como padrão
  const dateField = document.getElementById("date");
  if (dateField) {
    const today = new Date();
    const tzOffset = new Date(
      today.getTime() - today.getTimezoneOffset() * 60000
    );
    dateField.value = tzOffset.toISOString().split("T")[0];
  }

  const campos = ["date"];

  campos.forEach(function (campoId) {
    const campo = document.getElementById(campoId);
    if (campo) {
      campo.addEventListener("blur", function () {
        if (!this.value) {
          this.style.borderColor = "#ff0000";
        } else {
          this.style.borderColor = "#e0e0e0";
        }
      });
    }
  });

  // Fechar dropdown quando clicar fora
  document.addEventListener("click", function (event) {
    const dropdown = document.querySelector(".custom-dropdown");
    if (!dropdown.contains(event.target)) {
      if (isDropdownOpen) {
        toggleDropdown();
      }
    }
  });

  // Adicionar event listeners para os botões
  // Login button agora usa onclick no HTML para evitar conflitos
  // const loginBtn = document.getElementById("login-btn");
  // if (loginBtn) {
  //   loginBtn.addEventListener("click", fazerLogin);
  // }

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", fazerLogout);
  }

  const form = document.getElementById("formulario");
  if (form) {
    form.addEventListener("submit", enviarFormulario);
  }

  const dropdownInput = document.getElementById("dropdown-input");
  if (dropdownInput) {
    dropdownInput.addEventListener("click", toggleDropdown);
  }

  const filterInput = document.getElementById("filter-input");
  if (filterInput) {
    filterInput.addEventListener("input", filterOptions);
  }

  const closeSuccessModal = document.getElementById("close-success-modal");
  if (closeSuccessModal) {
    closeSuccessModal.addEventListener("click", () =>
      closeModal("successModal")
    );
  }

  const closeSuccessModalBtn = document.getElementById(
    "close-success-modal-btn"
  );
  if (closeSuccessModalBtn) {
    closeSuccessModalBtn.addEventListener("click", () =>
      closeModal("successModal")
    );
  }

  const closeErrorModal = document.getElementById("close-error-modal");
  if (closeErrorModal) {
    closeErrorModal.addEventListener("click", () => closeModal("errorModal"));
  }

  const closeErrorModalBtn = document.getElementById("close-error-modal-btn");
  if (closeErrorModalBtn) {
    closeErrorModalBtn.addEventListener("click", () =>
      closeModal("errorModal")
    );
  }
});

// Funções para controlar os modais
function showSuccessModal() {
  const modal = document.getElementById("successModal");
  modal.style.display = "block";
}

function showErrorModal(
  errorMessage = "Erro ao enviar formulário. Tente novamente."
) {
  const modal = document.getElementById("errorModal");
  const errorElement = document.getElementById("errorMessage");

  // Atualizar mensagem de erro se fornecida
  if (errorMessage) {
    errorElement.textContent = errorMessage;
  }

  modal.style.display = "block";
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = "none";
}

// Fechar modal quando clicar fora dele
window.addEventListener("click", function (event) {
  const modals = document.querySelectorAll(".modal");
  modals.forEach((modal) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
});

// Fechar modal com tecla ESC
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    const modals = document.querySelectorAll(".modal");
    modals.forEach((modal) => {
      if (modal.style.display === "block") {
        modal.style.display = "none";
      }
    });
  }
});
