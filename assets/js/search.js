// Blog Search Functionality
// =========================

document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const postList = document.getElementById('postList');

  if (!searchInput || !postList) return;

  // Get all posts from the DOM
  const posts = Array.from(postList.querySelectorAll('.post-item')).map(post => ({
    element: post,
    title: post.querySelector('.post-item__title a')?.textContent || '',
    excerpt: post.querySelector('.post-item__excerpt')?.textContent || '',
    category: post.querySelector('.post-item__category')?.textContent || '',
    url: post.querySelector('.post-item__title a')?.href || ''
  }));

  // Debounce function
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Search function
  function search(query) {
    query = query.toLowerCase().trim();

    if (query.length < 2) {
      // Show all posts and hide results dropdown
      posts.forEach(post => post.element.style.display = '');
      if (searchResults) searchResults.classList.remove('active');
      return;
    }

    const matches = posts.filter(post => {
      const searchText = `${post.title} ${post.excerpt} ${post.category}`.toLowerCase();
      return searchText.includes(query);
    });

    // Show/hide posts based on search
    posts.forEach(post => {
      const isMatch = matches.includes(post);
      post.element.style.display = isMatch ? '' : 'none';
    });

    // Update results dropdown
    if (searchResults) {
      if (matches.length > 0 && query.length >= 2) {
        searchResults.innerHTML = matches.slice(0, 5).map(post => `
          <a href="${post.url}" class="search__result">
            <strong>${highlightMatch(post.title, query)}</strong>
            <small style="display: block; color: var(--comment);">${post.category}</small>
          </a>
        `).join('');
        searchResults.classList.add('active');
      } else {
        searchResults.classList.remove('active');
      }
    }
  }

  // Highlight matching text
  function highlightMatch(text, query) {
    const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
    return text.replace(regex, '<mark style="background: var(--blue); color: var(--bg-dark); padding: 0 2px; border-radius: 2px;">$1</mark>');
  }

  // Escape special regex characters
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Add event listeners
  searchInput.addEventListener('input', debounce(function(e) {
    search(e.target.value);
  }, 200));

  // Close results when clicking outside
  document.addEventListener('click', function(e) {
    if (searchResults && !searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.classList.remove('active');
    }
  });

  // Handle keyboard navigation
  searchInput.addEventListener('keydown', function(e) {
    if (!searchResults || !searchResults.classList.contains('active')) return;

    const results = searchResults.querySelectorAll('.search__result');
    const current = searchResults.querySelector('.search__result:focus');
    let index = Array.from(results).indexOf(current);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        index = index < results.length - 1 ? index + 1 : 0;
        results[index].focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        index = index > 0 ? index - 1 : results.length - 1;
        results[index].focus();
        break;
      case 'Escape':
        searchResults.classList.remove('active');
        searchInput.blur();
        break;
    }
  });
});
