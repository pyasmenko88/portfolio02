(function () {
  function markLoadedImage(image, loadedClassTarget) {
    function onLoad() {
      loadedClassTarget.classList.add('loaded');
    }

    if (image.complete) {
      onLoad();
      return;
    }

    image.addEventListener('load', onLoad, { once: true });
    image.addEventListener('error', onLoad, { once: true });
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
