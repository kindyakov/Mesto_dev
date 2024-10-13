export function executeOnceOnScroll(func) {
  const onScroll = () => {
    if (window.scrollY === 0) return;

    window.removeEventListener('scroll', onScroll);
    func();
  };

  window.addEventListener('scroll', onScroll);
}