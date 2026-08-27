document.addEventListener('DOMContentLoaded', () => {
  if (window.PortfolioImages) {
    window.PortfolioImages.initImageLoadedStates();
  }

  if (window.PortfolioModal) {
    window.PortfolioModal.initModal();
  }
});
