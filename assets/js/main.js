// Main JavaScript file
// ====================

document.addEventListener('DOMContentLoaded', function() {
  // Initialize all components
  initNavbar();
  initMobileMenu();
  initBackToTop();
  initSkillBars();
  initSmoothScroll();
});

// Navbar scroll effect
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let lastScroll = 0;

  window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset;

    // Add scrolled class when not at top
    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  });
}

// Mobile menu toggle
function initMobileMenu() {
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('mobileMenu');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', function() {
    menu.classList.toggle('open');

    // Toggle icon between hamburger and X
    const isOpen = menu.classList.contains('open');
    toggle.innerHTML = isOpen
      ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
  });

  // Close menu when clicking a link
  const menuLinks = menu.querySelectorAll('.mobile-menu__link');
  menuLinks.forEach(link => {
    link.addEventListener('click', function() {
      menu.classList.remove('open');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    if (!menu.contains(e.target) && !toggle.contains(e.target)) {
      menu.classList.remove('open');
    }
  });
}

// Back to top button
function initBackToTop() {
  const button = document.querySelector('.back-to-top');
  if (!button) return;

  window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
      button.classList.add('visible');
    } else {
      button.classList.remove('visible');
    }
  });

  button.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// Animate skill bars on scroll
function initSkillBars() {
  const skillBars = document.querySelectorAll('.skill-bar__fill');
  if (skillBars.length === 0) return;

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const width = bar.style.width;
        bar.style.width = '0';
        setTimeout(() => {
          bar.style.width = width;
        }, 100);
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.5 });

  skillBars.forEach(bar => observer.observe(bar));
}

// Smooth scroll for anchor links
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// Copy code button functionality
function initCodeCopy() {
  const codeBlocks = document.querySelectorAll('pre code');

  codeBlocks.forEach(block => {
    const wrapper = document.createElement('div');
    wrapper.className = 'code-block';

    const button = document.createElement('button');
    button.className = 'code-block__copy';
    button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
    button.title = 'Copy code';

    button.addEventListener('click', async function() {
      try {
        await navigator.clipboard.writeText(block.textContent);
        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        setTimeout(() => {
          button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
        }, 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    });

    const pre = block.parentElement;
    pre.parentElement.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);
    wrapper.appendChild(button);
  });
}

// Initialize code copy after DOM is ready
document.addEventListener('DOMContentLoaded', initCodeCopy);

// Lazy load images
function initLazyLoad() {
  const images = document.querySelectorAll('img[data-src]');

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver(function(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for older browsers
    images.forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }
}

document.addEventListener('DOMContentLoaded', initLazyLoad);
