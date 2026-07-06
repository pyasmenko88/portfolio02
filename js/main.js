document.addEventListener('DOMContentLoaded', () => {
  function updateViewportHeight() {
    document.documentElement.style.setProperty(
      '--app-viewport-height',
      `${window.innerHeight}px`
    );
  }

  updateViewportHeight();
  window.addEventListener('resize', updateViewportHeight);

  if (window.PortfolioImages) {
    window.PortfolioImages.initImageLoadedStates();
  }

  if (window.PortfolioModal) {
    window.PortfolioModal.initModal();
  }
});
