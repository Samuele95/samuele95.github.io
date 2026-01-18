---
layout: page
title: Projects
description: A collection of my work spanning AI systems, security research, and systems programming.
permalink: /projects/
filter: true
---

<div class="filter" id="projectFilter">
  <button class="filter__btn active" data-category="all">All</button>
  <button class="filter__btn" data-category="ai">AI & ML</button>
  <button class="filter__btn" data-category="systems">Systems</button>
  <button class="filter__btn" data-category="security">Security</button>
</div>

<div class="grid grid--2" id="projectGrid">
{% for project in site.projects %}
  {% include project-card.html project=project %}
{% endfor %}

{% for project in site.data.projects %}
  {% include project-card.html project=project %}
{% endfor %}
</div>

{% if site.projects.size == 0 and site.data.projects.size == 0 %}
<p class="text-center" style="color: var(--comment); padding: 4rem 0;">
  Projects coming soon...
</p>
{% endif %}
