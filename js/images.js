(function () {
  function markLoadedImage(image, loadedClassTarget) {
    function onLoad() {
      loadedClassTarget.classList.remove('load-error');
      loadedClassTarget.classList.add('loaded');
    }

    function onError() {
      loadedClassTarget.classList.remove('loaded');
      loadedClassTarget.classList.add('load-error');
    }

    if (image.complete) {
      if (image.naturalWidth > 0) {
        onLoad();
      } else {
        onError();
      }
      return;
    }

    image.addEventListener('load', onLoad, { once: true });
    image.addEventListener('error', onError, { once: true });
  }

  function initImageLoadedStates(root = document) {
    root.querySelectorAll('.portfolio-card').forEach((card) => {
      const image = card.querySelector('.portfolio-card__image img');
      if (image) {
        markLoadedImage(image, card);
      }
    });

    const avatar = root.querySelector('.welcome__avatar');
    if (avatar) {
      markLoadedImage(avatar, avatar);
    }
  }

  function initModalImageLoadedStates(root) {
    root.querySelectorAll('img').forEach((image) => {
      markLoadedImage(image, image);
    });
  }

  window.PortfolioImages = {
    initImageLoadedStates,
    initModalImageLoadedStates,
  };
})();
