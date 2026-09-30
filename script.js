"use strict";

const STORAGE_KEY = "passo-a-passo-tarefas-v1";
const THEME_STORAGE_KEY = "passo-a-passo-theme";
const PRIORITIES = new Set(["low", "medium", "high"]);
const priorityLabels = { low: "Baixa", medium: "Média", high: "Alta" };

let tasks = loadTasks();
let activeFilter = "all";
let searchQuery = "";
let toastTimeout;

const elements = {
  form: document.querySelector("#task-form"),
  title: document.querySelector("#task-title"),
  search: document.querySelector("#task-search"),
  list: document.querySelector("#task-list"),
  empty: document.querySelector("#empty-state"),
  emptyTitle: document.querySelector("#empty-title"),
  emptyDescription: document.querySelector("#empty-description"),
  openCount: document.querySelector("#open-count"),
  clearCompleted: document.querySelector("#clear-completed"),
  progressTrack: document.querySelector("#progress-track"),
  progressFill: document.querySelector("#progress-fill"),
  progressPercent: document.querySelector("#progress-percent"),
  overviewOpen: document.querySelector("#overview-open"),
  overviewCompleted: document.querySelector("#overview-completed"),
  saveStatus: document.querySelector("#save-status"),
  themeToggle: document.querySelector("#theme-toggle"),
  today: document.querySelector("#today-label"),
  toast: document.querySelector("#toast"),
};

function loadTasks() {
  try {
    const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(savedTasks)) return [];

    return savedTasks
      .filter((task) => task && typeof task.id === "string" && typeof task.title === "string")
      .map((task) => ({
        id: task.id,
        title: task.title.trim().slice(0, 120),
        completed: task.completed === true,
        priority: PRIORITIES.has(task.priority) ? task.priority : "medium",
        dueDate: typeof task.dueDate === "string" ? task.dueDate : "",
        createdAt: Number.isFinite(task.createdAt) ? task.createdAt : Date.now(),
      }))
      .filter((task) => task.title.length > 0);
  } catch {
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    elements.saveStatus.textContent = "Salvo neste navegador";
  } catch {
    elements.saveStatus.textContent = "Não foi possível salvar";
  }
}

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function showToast(message) {
  window.clearTimeout(toastTimeout);
  elements.toast.textContent = message;
  elements.toast.hidden = false;
  toastTimeout = window.setTimeout(() => {
    elements.toast.hidden = true;
  }, 2600);
}

function getInitialTheme() {
  let savedTheme;

  try {
    savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  } catch {}

  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.dataset.theme = theme;
  elements.themeToggle.setAttribute("aria-pressed", String(isDark));
  elements.themeToggle.setAttribute("aria-label", `Ativar modo ${isDark ? "claro" : "noturno"}`);
  elements.themeToggle.title = `Ativar modo ${isDark ? "claro" : "noturno"}`;
  document.querySelector('meta[name="theme-color"]').content = isDark ? "#151b18" : "#f4f6f2";
}

function createTaskElement(task) {
  const item = document.createElement("li");
  item.className = `task-item${task.completed ? " is-completed" : ""}`;
  item.dataset.taskId = task.id;

  const label = document.createElement("label");
  label.className = "task-main";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;
  checkbox.dataset.taskToggle = "true";
  checkbox.setAttribute("aria-label", `${task.completed ? "Reabrir" : "Concluir"}: ${task.title}`);

  const checkboxMark = document.createElement("span");
  checkboxMark.className = "checkbox-mark";
  checkboxMark.setAttribute("aria-hidden", "true");

  const content = document.createElement("span");
  content.className = "task-copy";

  const title = document.createElement("span");
  title.className = "task-title";
  title.textContent = task.title;
  content.append(title);

  const metadata = document.createElement("span");
  metadata.className = "task-metadata";

  const priority = document.createElement("span");
  priority.className = `priority-tag priority-${task.priority}`;
  priority.textContent = `Prioridade ${priorityLabels[task.priority]}`;
  metadata.append(priority);

  if (task.dueDate) {
    const dueDate = document.createElement("span");
    dueDate.className = "task-due";
    const localDate = new Date(`${task.dueDate}T12:00:00`);

    if (!Number.isNaN(localDate.getTime())) {
      dueDate.textContent = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(localDate);

      if (!task.completed && task.dueDate < getLocalDateString()) {
        dueDate.classList.add("is-overdue");
        dueDate.textContent = `Atrasada · ${dueDate.textContent}`;
      } else if (!task.completed && task.dueDate === getLocalDateString()) {
        dueDate.classList.add("is-today");
        dueDate.textContent = `Hoje · ${dueDate.textContent}`;
      }

      metadata.append(dueDate);
    }
  }

  content.append(metadata);
  label.append(checkbox, checkboxMark, content);

  const removeButton = document.createElement("button");
  removeButton.className = "remove-button";
  removeButton.type = "button";
  removeButton.dataset.action = "remove";
  removeButton.setAttribute("aria-label", `Remover tarefa: ${task.title}`);
  removeButton.textContent = "Remover";

  item.append(label, removeButton);
  return item;
}

function render() {
  const completedCount = tasks.filter((task) => task.completed).length;
  const openCount = tasks.length - completedCount;
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  document.querySelector('[data-count="all"]').textContent = tasks.length;
  document.querySelector('[data-count="active"]').textContent = openCount;
  document.querySelector('[data-count="completed"]').textContent = completedCount;
  elements.openCount.textContent = `${openCount} em aberto`;
  elements.overviewOpen.textContent = openCount;
  elements.overviewCompleted.textContent = completedCount;
  elements.progressPercent.textContent = `${progress}%`;
  elements.progressTrack.setAttribute("aria-valuenow", progress);
  elements.progressFill.style.width = `${progress}%`;
  elements.clearCompleted.hidden = completedCount === 0;

  const visibleTasks = tasks.filter((task) => {
    const matchesFilter = activeFilter === "all"
      || (activeFilter === "active" && !task.completed)
      || (activeFilter === "completed" && task.completed);
    const matchesSearch = task.title.toLocaleLowerCase("pt-BR").includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  elements.list.replaceChildren(...visibleTasks.map(createTaskElement));
  elements.empty.hidden = visibleTasks.length > 0;

  if (visibleTasks.length === 0) {
    if (searchQuery) {
      elements.emptyTitle.textContent = "Nenhuma tarefa encontrada.";
      elements.emptyDescription.textContent = "Tente outro termo para buscar na sua lista.";
    } else if (activeFilter === "active" && tasks.length > 0) {
      elements.emptyTitle.textContent = "Tudo em dia por aqui.";
      elements.emptyDescription.textContent = "As tarefas em aberto vão aparecer nesta lista.";
    } else if (activeFilter === "completed" && tasks.length > 0) {
      elements.emptyTitle.textContent = "Ainda não há tarefas concluídas.";
      elements.emptyDescription.textContent = "Quando você concluir uma tarefa, ela aparecerá aqui.";
    } else {
      elements.emptyTitle.textContent = "Tudo começa com uma ideia.";
      elements.emptyDescription.textContent = "Adicione sua primeira tarefa e ela aparecerá aqui.";
    }
  }
}

applyTheme(getInitialTheme());

elements.themeToggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);

  try {
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  } catch {
    showToast("O tema mudou, mas a preferência não pôde ser salva.");
  }
});

elements.today.textContent = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
}).format(new Date());
elements.today.dateTime = getLocalDateString();

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(elements.form);
  const title = String(formData.get("title") || "").trim();

  if (!title) {
    showToast("Escreva uma tarefa antes de adicionar.");
    elements.title.focus();
    return;
  }

  tasks.unshift({
    id: globalThis.crypto?.randomUUID?.() || `task-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title: title.slice(0, 120),
    completed: false,
    priority: PRIORITIES.has(formData.get("priority")) ? formData.get("priority") : "medium",
    dueDate: String(formData.get("dueDate") || ""),
    createdAt: Date.now(),
  });

  saveTasks();
  elements.form.reset();
  render();
  elements.title.focus();
  showToast("Tarefa adicionada à sua lista.");
});

elements.list.addEventListener("change", (event) => {
  const checkbox = event.target;
  if (!(checkbox instanceof HTMLInputElement) || !checkbox.matches("[data-task-toggle]")) return;

  const item = checkbox.closest("[data-task-id]");
  const task = tasks.find((entry) => entry.id === item?.dataset.taskId);
  if (!task) return;

  task.completed = checkbox.checked;
  saveTasks();
  render();
});

elements.list.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action='remove']");
  if (!button) return;

  const item = button.closest("[data-task-id]");
  const task = tasks.find((entry) => entry.id === item?.dataset.taskId);
  if (!task) return;

  tasks = tasks.filter((entry) => entry.id !== task.id);
  saveTasks();
  render();
  showToast("Tarefa removida.");
});

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle("is-active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    });
    render();
  });
});

elements.search.addEventListener("input", () => {
  searchQuery = elements.search.value.trim().toLocaleLowerCase("pt-BR");
  render();
});

elements.clearCompleted.addEventListener("click", () => {
  const completedCount = tasks.filter((task) => task.completed).length;
  if (!completedCount) return;

  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  render();
  showToast(`${completedCount} ${completedCount === 1 ? "tarefa concluída removida" : "tarefas concluídas removidas"}.`);
});

document.addEventListener("keydown", (event) => {
  const target = event.target;
  const isTyping = target instanceof HTMLElement
    && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

  if (event.key === "/" && !isTyping && !event.ctrlKey && !event.metaKey && !event.altKey) {
    event.preventDefault();
    elements.search.focus();
  }

  if (event.key === "Escape" && target === elements.search) {
    elements.search.value = "";
    searchQuery = "";
    render();
  }
});

render();