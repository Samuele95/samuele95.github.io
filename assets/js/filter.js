// Project and Post Filtering
// ==========================

document.addEventListener('DOMContentLoaded', function() {
  initFilters();
});

function initFilters() {
  // Project filter
  const projectFilter = document.getElementById('projectFilter');
  const projectGrid = document.getElementById('projectGrid');

  if (projectFilter && projectGrid) {
    initFilterButtons(projectFilter, projectGrid, '.project-card');
  }

  // Post filter (on blog page)
  const postFilter = document.querySelector('.filter');
  const postList = document.getElementById('postList');

  if (postFilter && postList) {
    initFilterButtons(postFilter, postList, '.post-item');
  }

  // Writeup filter
  const writeupList = document.getElementById('writeupList');
  if (postFilter && writeupList) {
    initFilterButtons(postFilter, writeupList, '.post-item');
  }
}

function initFilterButtons(filterContainer, itemsContainer, itemSelector) {
  const buttons = filterContainer.querySelectorAll('.filter__btn');
  const items = itemsContainer.querySelectorAll(itemSelector);

  buttons.forEach(button => {
    button.addEventListener('click', function() {
      // Update active state
      buttons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');

      // Get selected category
      const category = this.dataset.category;

      // Filter items with animation
      items.forEach(item => {
        const itemCategory = item.dataset.category || 'all';
        const shouldShow = category === 'all' || itemCategory === category;

        if (shouldShow) {
          item.style.display = '';
          item.style.opacity = '0';
          item.style.transform = 'translateY(10px)';

          requestAnimationFrame(() => {
            item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          });
        } else {
          item.style.opacity = '0';
          item.style.transform = 'translateY(-10px)';

          setTimeout(() => {
            item.style.display = 'none';
          }, 300);
        }
      });

      // Update URL hash for bookmarking
      if (category !== 'all') {
        history.replaceState(null, null, `#${category}`);
      } else {
        history.replaceState(null, null, window.location.pathname);
      }
    });
  });

  // Check for hash on page load
  const hash = window.location.hash.substring(1);
  if (hash) {
    const targetButton = filterContainer.querySelector(`[data-category="${hash}"]`);
    if (targetButton) {
      targetButton.click();
    }
  }
}

// Optional: Tag filtering
function initTagFiltering() {
  const tags = document.querySelectorAll('.tag[data-tag]');

  tags.forEach(tag => {
    tag.addEventListener('click', function(e) {
      e.preventDefault();
      const tagName = this.dataset.tag;

      // Find all items with this tag and filter
      const allItems = document.querySelectorAll('[data-tags]');
      allItems.forEach(item => {
        const itemTags = item.dataset.tags.split(',');
        item.style.display = itemTags.includes(tagName) ? '' : 'none';
      });
    });
  });
}
