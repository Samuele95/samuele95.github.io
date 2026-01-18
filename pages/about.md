---
layout: page
title: About Me
description: AI Engineer & Systems Researcher specializing in Context Engineering, Malware Analysis, and Language Implementation.
permalink: /about/
---

<div class="about">
  <div class="about__intro">
    <div>
      <img src="/assets/images/profile.jpg" alt="Samuele" class="about__image" onerror="this.style.display='none'">
    </div>
    <div class="about__bio">
      <p>
        I'm an AI Engineer and Systems Researcher currently pursuing my MSc in Computer Science - AI & Robotics at the University of Camerino.
      </p>
      <p>
        My work sits at the intersection of artificial intelligence, security research, and systems programming. I'm passionate about building intelligent systems that understand context, analyzing malware to protect digital infrastructure, and designing programming languages and virtual machines.
      </p>
      <p>
        I believe in understanding systems from source code to silicon - whether that's tracing the execution of a suspicious binary or designing the instruction set for a virtual machine.
      </p>
    </div>
  </div>
</div>

## Current Focus

<div class="expertise">
  <div class="expertise__card">
    <div class="expertise__icon">&#129504;</div>
    <h3 class="expertise__title">Context Engineering</h3>
    <p class="expertise__description">
      Building next-generation AI systems with advanced context management, RAG architectures, and multi-agent orchestration using Claude Code, LangChain, and LangGraph.
    </p>
  </div>

  <div class="expertise__card">
    <div class="expertise__icon">&#128737;</div>
    <h3 class="expertise__title">Malware Analysis</h3>
    <p class="expertise__description">
      Conducting static and dynamic analysis of malicious software using industry tools like Ghidra, IDA Pro, x64dbg, and Volatility. Developing automated analysis pipelines with AI assistance.
    </p>
  </div>

  <div class="expertise__card">
    <div class="expertise__icon">&#128187;</div>
    <h3 class="expertise__title">Language Systems</h3>
    <p class="expertise__description">
      Designing and implementing compilers, interpreters, and virtual machines. Exploring language design principles and low-level system implementation.
    </p>
  </div>
</div>

## Technical Skills

{% for category in site.data.skills %}
### {{ category[1].title }}

<div style="display: grid; gap: 1rem; margin-bottom: 2rem;">
{% for skill in category[1].items %}
<div class="skill-bar">
  <div class="skill-bar__header">
    <span class="skill-bar__name">{{ skill.name }}</span>
    <span class="skill-bar__value">{{ skill.level }}%</span>
  </div>
  <div class="skill-bar__track">
    <div class="skill-bar__fill" style="width: {{ skill.level }}%;"></div>
  </div>
</div>
{% endfor %}
</div>
{% endfor %}

## Education

<div class="timeline">
  <div class="timeline__item">
    <div class="timeline__date">2023 - Present</div>
    <h4 class="timeline__title">MSc Computer Science - AI & Robotics</h4>
    <p class="timeline__description">University of Camerino, Italy</p>
  </div>

  <div class="timeline__item">
    <div class="timeline__date">2019 - 2023</div>
    <h4 class="timeline__title">BSc Computer Science</h4>
    <p class="timeline__description">University of Camerino, Italy</p>
  </div>
</div>

## Get in Touch

I'm always interested in discussing AI research, security analysis, or systems programming. Feel free to reach out!

<div style="margin-top: 2rem;">
  <a href="/contact/" class="btn btn--primary">Contact Me</a>
  <a href="https://github.com/Samuele95" class="btn btn--secondary" target="_blank" rel="noopener">View GitHub</a>
</div>
