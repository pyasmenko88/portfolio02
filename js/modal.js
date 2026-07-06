(function () {
  function initModal() {
    const modal = document.getElementById('modal');
    const overlay = document.getElementById('modal-overlay');
    const closeBtn = document.getElementById('modal-close');
    const content = modal ? modal.querySelector('.modal-content') : null;
    const cards = document.querySelectorAll('.portfolio-card[data-case-url]');

    if (!modal || !overlay || !closeBtn || !content) {
      return;
    }

    function showModal() {
      modal.classList.add('active');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal.classList.remove('active');
      overlay.classList.remove('active');
      content.scrollTop = 0;
      document.body.style.overflow = '';
    }

    function adaptFirstHeadingForMobile() {
      if (window.innerWidth >= 768) {
        return;
      }

      const firstHeading = content.querySelector('h1');
      if (!firstHeading) {
        return;
      }

      const h2 = document.createElement('h2');
      h2.innerHTML = firstHeading.innerHTML;
      firstHeading.replaceWith(h2);
    }

    async function openModal(event) {
      event.preventDefault();

      const caseUrl = event.currentTarget.getAttribute('data-case-url');
      if (!caseUrl) {
        return;
      }

      content.innerHTML = '';
      showModal();

      try {
        const response = await fetch(caseUrl);
        if (!response.ok) {
          throw new Error(`Failed to load ${caseUrl}: ${response.status}`);
        }

        content.innerHTML = await response.text();
        adaptFirstHeadingForMobile();

        if (window.PortfolioImages) {
          window.PortfolioImages.initModalImageLoadedStates(content);
        }
      } catch (error) {
        content.innerHTML = '<h2>Не удалось загрузить кейс</h2><p>Попробуйте обновить страницу.</p>';
        console.error(error);
      }
    }

    cards.forEach((card) => {
      card.addEventListener('click', openModal);
    });

    overlay.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);
  }

  window.PortfolioModal = {
    initModal,
  };
})();
