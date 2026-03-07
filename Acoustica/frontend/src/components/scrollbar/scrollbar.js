export function initScrollbar() {
  const content = document.getElementById('content');
  const thumb = document.getElementById('thumb');
  const track = document.getElementById('scroll_track');
  const arrowUp = document.getElementById('scroll_arrow_up');
  const arrowDown = document.getElementById('scroll_arrow_down');

  if (!content || !thumb || !track) return;

  function updateThumb() {
    const trackHeight = track.clientHeight;
    const scrollable = content.scrollHeight - content.clientHeight;
    const ratio = content.clientHeight / content.scrollHeight;
    const thumbHeight = Math.max(Math.round(ratio * trackHeight), 30);
    thumb.style.height = thumbHeight + 'px';

    if (scrollable <= 0) {
      thumb.style.height = trackHeight + 'px';
      thumb.style.top = '0px';
      return;
    }

    const scrollRatio = content.scrollTop / scrollable;
    const maxTop = trackHeight - thumbHeight;
    thumb.style.top = (scrollRatio * maxTop) + 'px';
  }

  content.addEventListener('scroll', updateThumb);

  const observer = new MutationObserver(() => {
    content.scrollTop = 0;
    updateThumb();
  });
  observer.observe(content, { childList: true, subtree: false });

  let isDragging = false;
  let startY = 0;
  let startTop = 0;

  thumb.addEventListener('mousedown', (e) => {
    isDragging = true;
    startY = e.clientY;
    startTop = parseInt(thumb.style.top || 0);
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const scrollable = content.scrollHeight - content.clientHeight;
    if (scrollable <= 0) return;
    const thumbHeight = thumb.clientHeight;
    const delta = e.clientY - startY;
    const maxTop = track.clientHeight - thumbHeight;
    const newTop = Math.min(Math.max(startTop + delta, 0), maxTop);
    thumb.style.top = newTop + 'px';
    content.scrollTop = (newTop / maxTop) * scrollable;
  });

  document.addEventListener('mouseup', () => isDragging = false);

  let arrowInterval = null;

  function startScroll(direction) {
    content.scrollBy({ top: direction * 40, behavior: 'smooth' });
    arrowInterval = setInterval(() => {
      content.scrollBy({ top: direction * 40, behavior: 'smooth' });
    }, 150);
  }

  function stopScroll() {
    clearInterval(arrowInterval);
    arrowInterval = null;
  }

  arrowUp.addEventListener('mousedown', () => startScroll(-1));
  arrowDown.addEventListener('mousedown', () => startScroll(1));
  document.addEventListener('mouseup', stopScroll);

  updateThumb();
}