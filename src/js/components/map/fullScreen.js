export function fullScreen({ map, controls, YMapControlButton, behaviors }) {
<<<<<<< HEAD
	const fullScreenElement = document.createElement('div')
	fullScreenElement.className = 'fullscreen'
	fullScreenElement.innerHTML = `
  <svg class='icon icon-fullscreen'>
	  <use xlink:href='${window.app.directory}/assets/img/svg/sprite.svg#fullscreen'></use>
  </svg>
  <svg class='icon icon-fullscreen-exit'>
	  <use xlink:href='${window.app.directory}/assets/img/svg/sprite.svg#fullscreen-exit'></use>
  </svg>`

	document.addEventListener('fullscreenchange', function() {
		fullScreenElement.classList.toggle('exit-fullscreen')
		if (fullScreenElement.classList.contains('exit-fullscreen')) {
			behaviors.push('scrollZoom')
			map.setBehaviors(behaviors)
		} else {
			behaviors.pop()
			map.setBehaviors(behaviors)
		}
	})

	function fullScreenBtnHandler() {
		if (document.fullscreenElement) {
			document.exitFullscreen()
		} else {
			map.container.requestFullscreen()
		}
	}

	const fullScreenBtn = new YMapControlButton({
		element: fullScreenElement,
		onClick: fullScreenBtnHandler,
	})

	controls.addChild(fullScreenBtn)
}
=======
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
>>>>>>> a4320cc4e9c5a2e79ea95f2f1e9e13252a5b2f53
