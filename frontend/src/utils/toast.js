// frontend/src/utils/toast.js

// Hệ thống Toast thông báo mượt mà bằng Vanilla JS để không phải cài thêm thư viện
export const toast = {
  success: (message) => createToast(message, 'bg-emerald-50 text-emerald-700 border-emerald-200', '✅'),
  error: (message) => createToast(message, 'bg-red-50 text-red-700 border-red-200', '⚠️'),
  info: (message) => createToast(message, 'bg-blue-50 text-blue-700 border-blue-200', 'ℹ️'),
};

function createToast(message, colorClasses, icon) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-5 right-5 z-[9999] flex flex-col items-end pointer-events-none';
    document.body.appendChild(container);
  }

  const toastEl = document.createElement('div');
  toastEl.className = `mb-3 p-4 border rounded-xl shadow-lg transform transition-all duration-300 translate-x-full flex items-center gap-3 w-max max-w-sm pointer-events-auto ${colorClasses}`;
  toastEl.innerHTML = `<span class="text-lg">${icon}</span><span class="font-bold text-sm tracking-wide">${message}</span>`;

  container.appendChild(toastEl);

  // Hiệu ứng trượt vào
  requestAnimationFrame(() => {
    toastEl.classList.remove('translate-x-full');
  });

  // Tự động trượt ra và xóa sau 3.5 giây
  setTimeout(() => {
    toastEl.classList.add('translate-x-full');
    toastEl.classList.add('opacity-0');
    toastEl.addEventListener('transitionend', () => toastEl.remove());
  }, 3500);
}