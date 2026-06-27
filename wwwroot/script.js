// Event delegation on document instead of per-button listeners.
// Blazor Server replaces the prerendered DOM once its SignalR circuit connects,
// which would silently drop listeners attached directly to the buttons on page load.
document.addEventListener('click', function (e) {
  var thumb = e.target.closest('[data-thumbs] button[data-slide]');
  if (!thumb) return;

  var thumbGroup = thumb.closest('[data-thumbs]');
  var name = thumbGroup.getAttribute('data-thumbs');
  var media = name
    ? document.querySelector('[data-slideshow="' + name + '"]')
    : thumbGroup.previousElementSibling;

  if (!media) return;

  var targetId = thumb.getAttribute('data-slide');
  media.querySelectorAll('img').forEach(function (img) {
    img.classList.toggle('active', !targetId || img.id === targetId);
  });
  thumbGroup.querySelectorAll('button').forEach(function (t) {
    t.classList.toggle('active', t === thumb);
  });
});

// Magnify/lightbox: click any active slideshow image to view it full-size.
// Overlay is created lazily and reused, since it survives Blazor's DOM swap
// the same way the slideshow/email handlers do (delegation on document).
document.addEventListener('click', function (e) {
  var img = e.target.closest('.card-media img, .detail-slideshow img');
  if (img) {
    var overlay = document.getElementById('lightboxOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'lightboxOverlay';
      overlay.className = 'lightbox-overlay';
      overlay.innerHTML = '<button type="button" class="lightbox-close" aria-label="Close">&times;</button><img alt="" />';
      document.body.appendChild(overlay);
    }
    overlay.querySelector('img').src = img.src;
    overlay.querySelector('img').alt = img.alt;
    overlay.classList.add('open');
    return;
  }

  var overlayClick = e.target.closest('.lightbox-overlay');
  if (overlayClick) {
    overlayClick.classList.remove('open');
  }
});

document.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape') return;
  var overlay = document.getElementById('lightboxOverlay');
  if (overlay) overlay.classList.remove('open');
});

// Email links are stored reversed in data-rev so the real address never appears
// as plain text in the page source for scrapers to harvest. Decoded only on click,
// via delegation, so it survives Blazor's DOM swap the same way the slideshow does.
document.addEventListener('click', function (e) {
  var link = e.target.closest('.email-link');
  if (!link) return;
  e.preventDefault();
  var email = link.getAttribute('data-rev').split('').reverse().join('');
  link.textContent = email;
  link.href = 'mailto:' + email;
  window.location.href = 'mailto:' + email;
});
