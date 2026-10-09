import Swal from "sweetalert2";

// Estilo base compartido: esquinas redondeadas, botones tipo OdontoSoft (violeta)
const baseConfig = {
  buttonsStyling: false,
  reverseButtons: true,
  heightAuto: false,
  customClass: {
    popup: "rounded-2xl",
    title: "text-lg font-semibold text-slate-900",
    htmlContainer: "text-sm text-slate-600",
    confirmButton:
      "rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700",
    cancelButton:
      "rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 ml-2",
    denyButton:
      "rounded-full border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50",
  },
};

// --- Diálogos de confirmación ---

export async function confirmDelete({
  title = "¿Eliminar?",
  text,
  confirmText = "Sí, eliminar",
  cancelText = "Cancelar",
} = {}) {
  const result = await Swal.fire({
    ...baseConfig,
    icon: "warning",
    iconColor: "#dc2626",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    focusCancel: true,
  });
  return result.isConfirmed;
}

export async function confirmAction({
  title,
  text,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  icon = "question",
} = {}) {
  const result = await Swal.fire({
    ...baseConfig,
    icon,
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    focusCancel: true,
  });
  return result.isConfirmed;
}

// --- Alertas informativas (modales) ---

export function successAlert({
  title = "¡Listo!",
  text,
  confirmText = "Aceptar",
} = {}) {
  return Swal.fire({
    ...baseConfig,
    icon: "success",
    title,
    text,
    confirmButtonText: confirmText,
  });
}

export function errorAlert({
  title = "Algo salió mal",
  text,
  confirmText = "Entendido",
} = {}) {
  return Swal.fire({
    ...baseConfig,
    icon: "error",
    title,
    text,
    confirmButtonText: confirmText,
  });
}

export function infoAlert({ title, text, confirmText = "Aceptar" } = {}) {
  return Swal.fire({
    ...baseConfig,
    icon: "info",
    title,
    text,
    confirmButtonText: confirmText,
  });
}

// --- Toasts (esquina superior derecha, no bloquean) ---

const toastBase = {
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true,
  customClass: {
    popup:
      "rounded-xl bg-white shadow-lg border border-slate-200 px-4 py-3 text-sm text-slate-800",
  },
};

export function toastSuccess(title) {
  return Swal.fire({
    ...toastBase,
    icon: "success",
    title,
  });
}

export function toastError(title, ms = 3500) {
  return Swal.fire({
    ...toastBase,
    icon: "error",
    title,
    timer: ms,
  });
}

export function toastInfo(title) {
  return Swal.fire({
    ...toastBase,
    icon: "info",
    title,
  });
}

export function closeSwal() {
  Swal.close();
}
