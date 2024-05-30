export function fullScreen({ map, controls, YMapControlButton, behaviors }) {
  const fullScreenElement = document.createElement('div');
  fullScreenElement.className = 'fullscreen';
  fullScreenElement.innerHTML = `
  <svg class='icon icon-fullscreen'>
	  <use xlink:href='${location.origin}/img/svg/sprite.svg#fullscreen'></use>
  </svg>
  <svg class='icon icon-fullscreen-exit'>
	  <use xlink:href='${location.origin}/img/svg/sprite.svg#fullscreen-exit'></use>
  </svg>`

  document.addEventListener('fullscreenchange', function () {
    fullScreenElement.classList.toggle('exit-fullscreen');
    if (fullScreenElement.classList.contains('exit-fullscreen')) {
      behaviors.push('scrollZoom')
      map.setBehaviors(behaviors);
    } else {
      behaviors.pop()
      map.setBehaviors(behaviors);
    }
  });

  function fullScreenBtnHandler() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      map.container.requestFullscreen();
    }
  }

  const fullScreenBtn = new YMapControlButton({
    element: fullScreenElement,
    onClick: fullScreenBtnHandler
  });

  controls.addChild(fullScreenBtn);
}