document.addEventListener('DOMContentLoaded', (event) => {
    let mouseX = 0, mouseY = 0, posX = 0, posY = 0;
    const cursor = document.getElementById('customCursor');
  
    const updatePosition = () => {
      posX += (mouseX - posX) / 10;
      posY += (mouseY - posY) / 5;
  
      cursor.style.top = (posY - 16) + "px";
      cursor.style.left = (posX - 16) + "px";
  
      requestAnimationFrame(updatePosition);
    };
  
    const handleMouseMove = (e) => {
      mouseX = e.pageX;
      mouseY = e.pageY;
    };
  
    document.addEventListener('mousemove', handleMouseMove);
  
    const handleClick = () => {
      cursor.classList.add('expand');
      setTimeout(() => {
        cursor.classList.remove('expand');
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
  
    requestAnimationFrame(updatePosition);
  });
  