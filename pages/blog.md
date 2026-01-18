---
layout: page
title: Blog
description: Thoughts on AI, security research, systems programming, and more.
permalink: /blog/
search: true
---

<div class="blog-layout">
  <div class="blog-main">
    <!-- Search -->
    <div class="search" style="margin-bottom: 2rem;">
      <svg class="search__icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <input type="text" class="search__input" id="searchInput" placeholder="Search posts...">
      <div class="search__results" id="searchResults"></div>
    </div>

    <!-- Category Filter -->
    <div class="filter">
      <button class="filter__btn active" data-category="all">All</button>
      {% for cat in site.category_list %}
      <button class="filter__btn" data-category="{{ cat.slug }}">{{ cat.name }}</button>
      {% endfor %}
    </div>

    <!-- Posts List -->
    <div class="post-list" id="postList">
      {% for post in site.posts %}
      <article class="post-item" data-category="{{ post.category | downcase | default: 'all' }}">
        <div class="post-item__date">
          {{ post.date | date: "%b %d" }}<br>
          <small>{{ post.date | date: "%Y" }}</small>
        </div>
        <div class="post-item__content">
          <h3 class="post-item__title">
            <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
          </h3>
          <p class="post-item__excerpt">
            {{ post.excerpt | strip_html | truncate: 150 }}
          </p>
          <div class="post-item__meta">
            {% if post.category %}
            <a href="{{ '/blog/category/' | append: post.category | downcase | relative_url }}" class="post-item__category">
              {{ post.category }}
            </a>
            {% endif %}
            <span>{{ post.content | number_of_words | divided_by: 200 | plus: 1 }} min read</span>
          </div>
        </div>
      </article>
      {% endfor %}
    </div>

    {% if site.posts.size == 0 %}
    <div style="text-align: center; padding: 4rem 0; color: var(--comment);">
      <p>No posts yet. Check back soon!</p>
    </div>
    {% endif %}
  </div>

  <aside class="sidebar">
    <!-- Categories -->
    <div style="background: var(--bg-lighter); padding: 1.5rem; border-radius: 1rem; margin-bottom: 1.5rem;">
      <h4 style="margin-bottom: 1rem; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em;">Categories</h4>
      <ul style="list-style: none; padding: 0; margin: 0;">
        {% for cat in site.category_list %}
        <li style="margin-bottom: 0.5rem;">
          <a href="{{ '/blog/category/' | append: cat.slug | relative_url }}" style="color: var(--fg-dark); text-decoration: none; display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--bg-highlight);">
            <span>{{ cat.name }}</span>
            <span class="tag" style="background: {{ cat.color }}20; color: {{ cat.color }};">
              {{ site.posts | where: "category", cat.name | size }}
            </span>
          </a>
        </li>
        {% endfor %}
      </ul>
    </div>

    <!-- Recent Posts -->
    <div style="background: var(--bg-lighter); padding: 1.5rem; border-radius: 1rem;">
      <h4 style="margin-bottom: 1rem; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em;">Recent Posts</h4>
      <ul style="list-style: none; padding: 0; margin: 0;">
        {% for post in site.posts limit:5 %}
        <li style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--bg-highlight);">
          <a href="{{ post.url | relative_url }}" style="color: var(--fg); text-decoration: none; font-size: 0.875rem; line-height: 1.4;">
            {{ post.title }}
          </a>
          <div style="font-size: 0.75rem; color: var(--comment); margin-top: 0.25rem;">
            {{ post.date | date: "%b %d, %Y" }}
          </div>
        </li>
        {% endfor %}
      </ul>
    </div>
  </aside>
</div>
