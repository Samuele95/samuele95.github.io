---
layout: page
title: Technical Writeups
description: CTF writeups, malware analysis reports, and reverse engineering walkthroughs.
permalink: /writeups/
---

A collection of detailed technical writeups covering CTF challenges, malware analysis, and reverse engineering projects.

<div class="filter" style="margin-bottom: 2rem;">
  <button class="filter__btn active" data-category="all">All</button>
  <button class="filter__btn" data-category="malware">Malware Analysis</button>
  <button class="filter__btn" data-category="ctf">CTF</button>
  <button class="filter__btn" data-category="reversing">Reverse Engineering</button>
</div>

<div class="post-list" id="writeupList">
{% for writeup in site.writeups %}
<article class="post-item" data-category="{{ writeup.type | downcase | default: 'all' }}">
  <div class="post-item__date">
    {{ writeup.date | date: "%b %d" }}<br>
    <small>{{ writeup.date | date: "%Y" }}</small>
  </div>
  <div class="post-item__content">
    <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
      {% if writeup.type %}
      <span class="tag tag--{{ writeup.type | downcase }}">{{ writeup.type }}</span>
      {% endif %}
      {% if writeup.difficulty %}
      <span class="tag">{{ writeup.difficulty }}</span>
      {% endif %}
    </div>
    <h3 class="post-item__title">
      <a href="{{ writeup.url | relative_url }}">{{ writeup.title }}</a>
    </h3>
    <p class="post-item__excerpt">
      {{ writeup.description | default: writeup.excerpt | strip_html | truncate: 150 }}
    </p>
    <div class="post-item__meta">
      <span>{{ writeup.content | number_of_words | divided_by: 200 | plus: 1 }} min read</span>
      {% if writeup.tags.size > 0 %}
      <span>&bull;</span>
      {% for tag in writeup.tags limit:3 %}
      <span class="tag">{{ tag }}</span>
      {% endfor %}
      {% endif %}
    </div>
  </div>
</article>
{% endfor %}
</div>

{% if site.writeups.size == 0 %}
<div style="background: var(--bg-lighter); padding: 3rem; border-radius: 1rem; text-align: center; margin: 2rem 0;">
  <div style="font-size: 3rem; margin-bottom: 1rem;">&#128736;</div>
  <h3>Writeups Coming Soon</h3>
  <p style="color: var(--comment);">
    Technical writeups for malware analysis, CTF challenges, and reverse engineering projects will be published here.
  </p>
</div>
{% endif %}

## What to Expect

### Malware Analysis Reports

Detailed analysis of malware samples including:
- Static analysis with Ghidra/IDA Pro
- Dynamic analysis with x64dbg and sandboxes
- Memory forensics with Volatility
- IOC extraction and YARA rules

### CTF Writeups

Solutions and learning notes from capture-the-flag competitions:
- Binary exploitation
- Reverse engineering challenges
- Cryptography puzzles
- Web security challenges

### Reverse Engineering

Deep dives into software internals:
- Protocol analysis
- Game modding
- Software protection analysis
- Binary patching techniques

<div style="background: var(--bg-lighter); padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid var(--orange); margin-top: 2rem;">
  <strong style="color: var(--orange);">Disclaimer:</strong>
  <p style="margin: 0.5rem 0 0; color: var(--fg-dark); font-size: 0.875rem;">
    All malware analysis is performed in isolated environments for educational and research purposes. Never execute suspicious files on production systems.
  </p>
</div>
