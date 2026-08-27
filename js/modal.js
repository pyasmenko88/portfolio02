(function () {
  const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  function initModal() {
    const modal = document.getElementById('modal');
    const overlay = document.getElementById('modal-overlay');
    const closeBtn = document.getElementById('modal-close');
    const content = modal ? modal.querySelector('.modal-content') : null;
    const cards = document.querySelectorAll('.portfolio-card[data-case-url]');

    if (!modal || !overlay || !closeBtn || !content) {
      return;
    }

    const caseCache = new Map();
    const caseRequests = new Map();
    let activeController = null;
    let activeRequestId = 0;
    let openerCard = null;
    let pendingCard = null;
    let savedScrollY = 0;

    function isModalOpen() {
      return modal.classList.contains('is-open');
    }

    function lockScroll() {
      savedScrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${savedScrollY}px`;
      document.body.style.width = '100%';
    }

    function unlockScroll() {
      const previousScrollBehavior = document.documentElement.style.scrollBehavior;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, savedScrollY);
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
    }

    function cancelActiveRequest() {
      clearPendingCard();

      if (activeController) {
        activeController.abort();
        activeController = null;
      }
      activeRequestId += 1;
    }

    function setPendingCard(card) {
      clearPendingCard();
      pendingCard = card;
      pendingCard.classList.add('is-pending');
      pendingCard.setAttribute('aria-busy', 'true');
    }

    function clearPendingCard() {
      if (!pendingCard) {
        return;
      }

      pendingCard.classList.remove('is-pending');
      pendingCard.removeAttribute('aria-busy');
      pendingCard = null;
    }

    function setModalLabel() {
      const firstHeading = content.querySelector('h1');

      if (firstHeading) {
        firstHeading.id = 'modal-title';
        modal.setAttribute('aria-labelledby', 'modal-title');
        modal.removeAttribute('aria-label');
        return;
      }

      modal.removeAttribute('aria-labelledby');
      modal.setAttribute('aria-label', 'Кейс портфолио');
    }

    function setErrorState(error) {
      modal.classList.add('has-error');
      content.innerHTML = [
        '<div class="modal-state modal-state--error">',
        '<h2>Не удалось загрузить кейс</h2>',
        '<p>Попробуй обновить страницу или открыть кейс позже.</p>',
        '</div>',
      ].join('');
      setModalLabel();
      console.error(error);
    }

    function showModal() {
      if (!isModalOpen()) {
        lockScroll();
      }

      modal.classList.add('is-open');
      overlay.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      closeBtn.focus();
    }

    function closeModal() {
      if (!isModalOpen()) {
        cancelActiveRequest();
        return;
      }

      cancelActiveRequest();
      modal.classList.remove('is-open', 'has-error');
      overlay.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      modal.removeAttribute('aria-labelledby');
      modal.removeAttribute('aria-label');
      content.scrollTop = 0;
      content.innerHTML = '';
      unlockScroll();

      if (openerCard && document.contains(openerCard)) {
        openerCard.focus();
      }

      openerCard = null;
    }

    function getFocusableElements() {
      return Array.from(modal.querySelectorAll(focusableSelector)).filter((element) => {
        return element.offsetParent !== null || element === document.activeElement;
      });
    }

    function trapFocus(event) {
      const focusableElements = getFocusableElements();
      const firstElement = focusableElements[0] || closeBtn;
      const lastElement = focusableElements[focusableElements.length - 1] || closeBtn;

      if (!modal.contains(document.activeElement)) {
        event.preventDefault();
        firstElement.focus();
        return;
      }

      if (document.activeElement === firstElement && event.shiftKey) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      if (document.activeElement === lastElement && !event.shiftKey) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    function handleKeydown(event) {
      if (!isModalOpen()) {
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        closeModal();
        return;
      }

      if (event.key === 'Tab') {
        trapFocus(event);
      }
    }

    function loadCase(caseUrl) {
      if (caseCache.has(caseUrl)) {
        return Promise.resolve(caseCache.get(caseUrl));
      }

      if (caseRequests.has(caseUrl)) {
        return caseRequests.get(caseUrl);
      }

      const request = fetch(caseUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to load ${caseUrl}: ${response.status}`);
          }

          return response.text();
        })
        .then((caseHtml) => {
          caseCache.set(caseUrl, caseHtml);
          return caseHtml;
        })
        .finally(() => {
          caseRequests.delete(caseUrl);
        });

      caseRequests.set(caseUrl, request);
      return request;
    }

    function waitForCase(caseUrl, signal) {
      if (!signal) {
        return loadCase(caseUrl);
      }

      if (signal.aborted) {
        return Promise.reject(new DOMException('The operation was aborted.', 'AbortError'));
      }

      return new Promise((resolve, reject) => {
        const handleAbort = () => {
          reject(new DOMException('The operation was aborted.', 'AbortError'));
        };

        signal.addEventListener('abort', handleAbort, { once: true });
        loadCase(caseUrl).then(
          (caseHtml) => {
            signal.removeEventListener('abort', handleAbort);
            resolve(caseHtml);
          },
          (error) => {
            signal.removeEventListener('abort', handleAbort);
            reject(error);
          },
        );
      });
    }

    function prefetchCases() {
      cards.forEach((card) => {
        const caseUrl = card.getAttribute('data-case-url');
        if (!caseUrl) {
          return;
        }

        loadCase(caseUrl).catch(() => {});
      });
    }

    async function openModal(event) {
      event.preventDefault();

      const card = event.currentTarget;
      const caseUrl = card.getAttribute('data-case-url');
      if (!caseUrl) {
        return;
      }

      cancelActiveRequest();
      openerCard = card;
      setPendingCard(card);

      const requestId = activeRequestId;
      activeController = new AbortController();

      try {
        const caseHtml = await waitForCase(caseUrl, activeController.signal);
        if (requestId !== activeRequestId) {
          return;
        }

        activeController = null;
        clearPendingCard();
        content.innerHTML = caseHtml;
        modal.classList.remove('has-error');
        setModalLabel();

        if (window.PortfolioImages) {
          window.PortfolioImages.initModalImageLoadedStates(content);
        }
        showModal();
      } catch (error) {
        if (error.name === 'AbortError' || requestId !== activeRequestId) {
          return;
        }
        activeController = null;
        clearPendingCard();
        setErrorState(error);
        showModal();
      }
    }

    cards.forEach((card) => {
      card.addEventListener('click', openModal);
    });

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(prefetchCases);
    } else {
      window.setTimeout(prefetchCases, 0);
    }

    overlay.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);
    document.addEventListener('keydown', handleKeydown);
  }

  window.PortfolioModal = {
    initModal,
  };
})();
