---
layout: page
title: Research
description: Academic research, publications, and ongoing projects in AI and systems.
permalink: /research/
---

## Research Interests

My research focuses on the intersection of artificial intelligence, security, and systems programming:

- **Context Engineering & Agentic AI** - Advanced architectures for managing context in large language models, multi-agent orchestration, and autonomous AI systems.
- **Malware Analysis** - Automated analysis techniques, memory forensics, and AI-assisted reverse engineering.
- **Language Implementation** - Compiler design, virtual machine architectures, and domain-specific languages.
- **Multi-Agent Systems** - Coordination protocols, emergent behavior, and distributed AI systems.

## Current Work

### Context Engineering for LLM Applications

Investigating novel approaches to context management in production LLM systems, including:
- Dynamic context window optimization
- Semantic chunking strategies for RAG
- Multi-agent context sharing protocols

### AI-Assisted Malware Analysis

Developing automated pipelines that combine traditional analysis tools with AI capabilities:
- Automated YARA rule generation
- Pattern recognition in malware families
- Natural language reporting from analysis results

## Education

<div class="timeline">
  <div class="timeline__item">
    <div class="timeline__date">2023 - Present</div>
    <h4 class="timeline__title">MSc Computer Science - AI & Robotics</h4>
    <p class="timeline__description">
      University of Camerino, Italy<br>
      Focus: Artificial Intelligence, Multi-Agent Systems, Machine Learning
    </p>
  </div>

  <div class="timeline__item">
    <div class="timeline__date">2019 - 2023</div>
    <h4 class="timeline__title">BSc Computer Science</h4>
    <p class="timeline__description">
      University of Camerino, Italy<br>
      Thesis: Multi-agent simulation for Parkinson's disease research
    </p>
  </div>
</div>

## Publications & Presentations

<div class="featured-publication">
  <div class="featured-publication__badge">
    <span>🔥 Latest Publication</span>
  </div>

  <div class="featured-publication__content">
    <div class="featured-publication__preview">
      <div class="pdf-preview">
        <div class="pdf-preview__header">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          <span>PDF Document</span>
        </div>
        <embed src="/assets/papers/symbolic_reasoning_llm.pdf" type="application/pdf" width="100%" height="500px" />
      </div>
    </div>

    <div class="featured-publication__details">
      <h3 class="featured-publication__title">
        Symbolic Reasoning in Large Language Models
      </h3>

      <p class="featured-publication__meta">
        <strong>Samuele</strong> • February 2026 • Context Engineering Series #1
      </p>

      <p class="featured-publication__description">
        A comprehensive research paper exploring how Large Language Models spontaneously develop symbolic reasoning mechanisms through emergent attention circuits. Covers induction heads, transformer architecture, the three-stage symbolic processing pipeline, and practical prompt engineering strategies.
      </p>

      <div class="featured-publication__topics">
        <span class="topic-tag">Context Engineering</span>
        <span class="topic-tag">Symbolic AI</span>
        <span class="topic-tag">Transformers</span>
        <span class="topic-tag">Mechanistic Interpretability</span>
        <span class="topic-tag">Prompt Engineering</span>
      </div>

      <div class="featured-publication__actions">
        <a href="/assets/papers/symbolic_reasoning_llm.pdf" class="btn btn--primary" download>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download PDF
        </a>
        <a href="/blog/2026/02/symbolic-reasoning-in-large-language-models/" class="btn btn--secondary">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          Read Blog Post
        </a>
      </div>

      <div class="featured-publication__stats">
        <div class="stat">
          <span class="stat-value">50+</span>
          <span class="stat-label">Pages</span>
        </div>
        <div class="stat">
          <span class="stat-value">6</span>
          <span class="stat-label">Key Mechanisms</span>
        </div>
        <div class="stat">
          <span class="stat-value">15+</span>
          <span class="stat-label">Practical Examples</span>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
.featured-publication {
  background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
  border: 3px solid #f87171;
  border-radius: 1rem;
  padding: 0;
  margin: 3rem 0;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(248, 113, 113, 0.3), 0 0 80px rgba(248, 113, 113, 0.1);
  position: relative;
}

.featured-publication::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #f87171 0%, #f97316 50%, #f87171 100%);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.featured-publication__badge {
  background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
  padding: 0.75rem 1.5rem;
  text-align: center;
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #0d0d0d;
}

.featured-publication__content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 2.5rem;
}

@media (max-width: 968px) {
  .featured-publication__content {
    grid-template-columns: 1fr;
  }

  .featured-publication__preview {
    order: 2;
  }

  .featured-publication__details {
    order: 1;
  }
}

.featured-publication__preview {
  position: relative;
}

.pdf-preview {
  background: #000000;
  border: 2px solid #262626;
  border-radius: 0.5rem;
  overflow: hidden;
}

.pdf-preview__header {
  background: #141414;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #a3a3a3;
  font-size: 0.85rem;
  font-weight: 600;
  border-bottom: 1px solid #262626;
}

.pdf-preview__header svg {
  color: #f87171;
}

.featured-publication__title {
  color: #f5f5f5;
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.3;
  margin: 0 0 1rem 0;
}

.featured-publication__meta {
  color: #a3a3a3;
  font-size: 0.9rem;
  margin: 0 0 1.5rem 0;
}

.featured-publication__meta strong {
  color: #f87171;
}

.featured-publication__description {
  color: #a3a3a3;
  line-height: 1.7;
  margin: 0 0 1.5rem 0;
}

.featured-publication__topics {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0 0 2rem 0;
}

.topic-tag {
  background: rgba(248, 113, 113, 0.1);
  color: #fca5a5;
  padding: 0.4rem 0.8rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid rgba(248, 113, 113, 0.3);
}

.featured-publication__actions {
  display: flex;
  gap: 1rem;
  margin: 0 0 2rem 0;
  flex-wrap: wrap;
}

.featured-publication__actions .btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.featured-publication__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  padding-top: 2rem;
  border-top: 2px solid #262626;
}

.stat {
  text-align: center;
}

.stat-value {
  display: block;
  color: #f87171;
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.stat-label {
  display: block;
  color: #737373;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Responsive */
@media (max-width: 768px) {
  .featured-publication__content {
    padding: 1.5rem;
  }

  .featured-publication__title {
    font-size: 1.35rem;
  }

  .featured-publication__stats {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>

## Collaboration

I'm always interested in collaborating on research projects related to:
- AI/ML applications
- Security research
- Systems programming
- Open source development

<div style="margin-top: 2rem;">
  <a href="/contact/" class="btn btn--primary">Discuss Research Collaboration</a>
</div>
