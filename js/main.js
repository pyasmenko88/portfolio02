document.addEventListener('DOMContentLoaded', () => {
  const toast = document.querySelector('.toast');
  let toastTimer;

  function showToast(message) {
    if (!toast) {
      return;
    }

    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 1800);
  }

  document.querySelectorAll('.contacts__email[data-email]').forEach((button) => {
    function copyWithFallback(text) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();

      let copied = false;
      try {
        copied = document.execCommand('copy');
      } finally {
        textarea.remove();
      }

      return copied;
    }

    async function copyEmail() {
      const email = button.dataset.email;
      let copied = false;

      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(email);
          copied = true;
        } catch (error) {
          copied = false;
        }
      }

      if (!copied) {
        copied = copyWithFallback(email);
      }

      showToast(copied ? 'Email скопирован' : 'Не удалось скопировать');
    }

    button.addEventListener('click', copyEmail);
  });

  if (window.PortfolioImages) {
    window.PortfolioImages.initImageLoadedStates();
  }

  if (window.PortfolioModal) {
    window.PortfolioModal.initModal();
  }
});
