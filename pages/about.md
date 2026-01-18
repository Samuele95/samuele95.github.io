---
layout: page
title: About Me
description: Interdisciplinary researcher exploring Neurosymbolic AI, Language Systems, and Binary Analysis through the lens of mathematics, cognitive science, and computational theory.
permalink: /about/
---

<div class="about">
  <div class="about__intro">
    <div>
      <img src="/assets/images/profile.jpg" alt="Samuele" class="about__image" onerror="this.style.display='none'">
    </div>
    <div class="about__bio">
      <p>
        I'm an interdisciplinary researcher pursuing my MSc in Computer Science - AI & Robotics at the University of Camerino. My work explores the fundamental question: <em>how do intelligent systems reason?</em>
      </p>
      <p>
        I believe the most profound insights emerge at the boundaries between disciplines. My research seeks common ground between <strong>Neurosymbolic AI</strong>, <strong>Programming Languages & Compilers</strong>, and <strong>Malware/Binary Analysis</strong> — drawing from mathematics, neuroscience, cognitive psychology, and even sociological theory.
      </p>
      <p>
        I'm a deep mathematics lover, fascinated by how formal structures underpin both artificial and biological cognition. Understanding systems from source code to silicon — whether tracing the execution of a suspicious binary or exploring how LLMs construct reasoning chains — is what drives my work.
      </p>
    </div>
  </div>
</div>

## Research Focus

<div class="expertise">
  <div class="expertise__card">
    <div class="expertise__icon">&#129504;</div>
    <h3 class="expertise__title">Neurosymbolic AI & Reasoning</h3>
    <p class="expertise__description">
      Investigating reasoning mechanisms in Large Language Models through context engineering. Exploring how symbolic and neural approaches can integrate to create more robust, interpretable AI systems. Studying how machines can develop and apply cognitive strategies.
    </p>
  </div>

  <div class="expertise__card">
    <div class="expertise__icon">&#128187;</div>
    <h3 class="expertise__title">Languages, Compilers & VMs</h3>
    <p class="expertise__description">
      Designing and implementing compilers, interpreters, and virtual machines. Exploring formal language theory, type systems, and the mathematical foundations of computation. Understanding how we translate human intent into machine execution.
    </p>
  </div>

  <div class="expertise__card">
    <div class="expertise__icon">&#128270;</div>
    <h3 class="expertise__title">Malware & Binary Analysis</h3>
    <p class="expertise__description">
      Conducting static and dynamic analysis of binaries using Ghidra, IDA Pro, x64dbg, and Volatility. Understanding program behavior at the lowest level of abstraction — where intent meets implementation in raw bytes.
    </p>
  </div>
</div>

## Interdisciplinary Foundations

What makes my approach unique is the integration of seemingly disparate fields. I draw from:

### Mathematics & Formal Theory
The rigorous foundations that underpin all computational systems — from type theory and category theory to formal verification and proof systems. Mathematics provides the language for precise reasoning about both programs and cognition.

### Cognitive Science & Neuroscience
Understanding biological intelligence illuminates artificial intelligence. How do humans reason? How do we form concepts, make decisions, and construct mental models? These questions directly inform my research on machine reasoning.

### Psychology & Decision-Making
I've studied both cognitive and investigative psychology to understand decision-making mechanisms. This includes exploring rational choice theory, cognitive biases, and how humans process uncertainty — all relevant to building AI systems that reason reliably.

### Sociology & Critical Theory
My background includes engagement with criminal sociology and social theory through thinkers like:
- **Foucault** — power structures and knowledge systems
- **Bentham & the Panopticon** — surveillance, control, and behavioral modification
- **Weber** — rationalization and bureaucratic reasoning
- **Cantor** — foundations of mathematics and infinity
- **Le Bon** — crowd psychology and collective behavior
- **Malatesta** — anarchist theory and decentralized organization

These perspectives inform how I think about AI systems, their societal implications, and the structures of control and autonomy they embody.

### Law & Ethics
Formal study of legal reasoning has shaped my understanding of rule-based systems, precedent, interpretation, and how societies codify decision-making processes — directly relevant to AI alignment and governance.

## The Convergence

These diverse threads converge in my research:

- **Neurosymbolic AI** bridges formal symbolic systems with neural learning — the mathematical precision of compilers meets the pattern recognition of cognitive systems
- **Context Engineering** in LLMs mirrors how humans construct meaning through contextual frames — drawing from cognitive psychology and linguistic theory
- **Binary Analysis** requires understanding both formal semantics (what the code *means*) and adversarial psychology (what the author *intended*)
- **Compiler Design** embodies the transformation of human cognitive structures into machine-executable form

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

I'm always interested in discussing neurosymbolic AI, reasoning systems, language implementation, or the intersection of computation and cognition. Feel free to reach out!

<div style="margin-top: 2rem;">
  <a href="/contact/" class="btn btn--primary">Contact Me</a>
  <a href="https://github.com/Samuele95" class="btn btn--secondary" target="_blank" rel="noopener">View GitHub</a>
</div>
