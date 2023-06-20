document.addEventListener('DOMContentLoaded', (event) => {
  let mouseX = 0, mouseY = 0, posX = 0, posY = 0;
  const cursor = document.getElementById('customCursor');
  const trailElements = [];

  const updatePosition = () => {
    posX += (mouseX - posX) / 10;
    posY += (mouseY - posY) / 5;

    cursor.style.top = (posY - 16) + "px";
    cursor.style.left = (posX - 16) + "px";

    // Update positions of trail elements
    for (let i = 0; i < trailElements.length; i++) {
      const trailElement = trailElements[i];
      const prevTrailElement = trailElements[i - 1];

      if (prevTrailElement) {
        const prevTrailPosX = parseFloat(prevTrailElement.style.left) || 0;
        const prevTrailPosY = parseFloat(prevTrailElement.style.top) || 0;

        const trailPosX = prevTrailPosX + ((posX - prevTrailPosX) / 10);
        const trailPosY = prevTrailPosY + ((posY - prevTrailPosY) / 10);

        trailElement.style.top = (trailPosY - 16) + "px";
        trailElement.style.left = (trailPosX - 16) + "px";
      } else {
        const trailPosX = posX - (i + 1) * 10;
        const trailPosY = posY - (i + 1) * 5;

        trailElement.style.top = (trailPosY - 16) + "px";
        trailElement.style.left = (trailPosX - 16) + "px";
      }

      trailElement.style.animationDelay = (i * 0.1) + "s"; // Delay the animation for each trail element
    }

    requestAnimationFrame(updatePosition);
  };

  const handleMouseMove = (e) => {
    mouseX = e.pageX;
    mouseY = e.pageY;
  };

  document.addEventListener('mousemove', handleMouseMove);

  const handleClick = () => {
    cursor.classList.add('spin');
    setTimeout(() => {
      cursor.classList.remove('spin');
    }, 500);
  };

  document.addEventListener('click', handleClick);

  // Disable cursor movement on touch devices
  const handleTouchMove = (e) => {
    e.preventDefault();
  };

  document.addEventListener('touchmove', handleTouchMove, { passive: false });

  const handleTouchEnd = () => {
    cursor.classList.add('expand');
    setTimeout(() => {
      cursor.classList.remove('expand');
    }, 500);
  };

  document.addEventListener('touchend', handleTouchEnd);

  // Create trail elements
  for (let i = 0; i < 10; i++) {
    const trailElement = document.createElement('div');
    trailElement.classList.add('trail');
    document.body.appendChild(trailElement);
    trailElements.push(trailElement);
  }

  requestAnimationFrame(updatePosition);
});
