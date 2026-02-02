---
layout: page
title: Research
description: Academic research, publications, and ongoing projects in AI and systems.
permalink: /research/
---

<div class="featured-publication-hero">
  <div class="featured-publication-hero__badge">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
    <span>Latest Publication</span>
  </div>

  <div class="featured-publication-hero__header">
    <h2 class="featured-publication-hero__title">
      Symbolic Reasoning in Large Language Models
    </h2>
    <p class="featured-publication-hero__meta">
      <strong>Samuele</strong> • February 2026 • Context Engineering Series #1
    </p>
    <p class="featured-publication-hero__description">
      A comprehensive research paper exploring how Large Language Models spontaneously develop symbolic reasoning mechanisms through emergent attention circuits. Covers induction heads, transformer architecture, the three-stage symbolic processing pipeline, and practical prompt engineering strategies.
    </p>

    <div class="featured-publication-hero__actions">
      <a href="/assets/papers/symbolic_reasoning_llm.pdf" class="btn btn--primary" download>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Download PDF
      </a>
      <a href="/blog/2026/02/02/symbolic-reasoning-in-llm/" class="btn btn--secondary">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
        Read Blog Post
      </a>
      <button class="btn btn--secondary" onclick="toggleFullscreen()">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
        </svg>
        View Fullscreen
      </button>
    </div>

    <div class="featured-publication-hero__topics">
      <span class="topic-tag">Context Engineering</span>
      <span class="topic-tag">Symbolic AI</span>
      <span class="topic-tag">Transformers</span>
      <span class="topic-tag">Mechanistic Interpretability</span>
      <span class="topic-tag">Prompt Engineering</span>
    </div>
  </div>

  <div class="pdf-viewer-container" id="pdfViewerContainer">
    <div class="pdf-viewer-toolbar">
      <div class="pdf-viewer-toolbar__info">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <span>symbolic_reasoning_llm.pdf</span>
      </div>
      <div class="pdf-viewer-toolbar__actions">
        <a href="/assets/papers/symbolic_reasoning_llm.pdf" target="_blank" class="toolbar-btn" title="Open in new tab">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>
      </div>
    </div>

    <div class="pdf-viewer-wrapper">
      <object
        data="/assets/papers/symbolic_reasoning_llm.pdf#toolbar=1&navpanes=0&scrollbar=1&page=1&view=FitH"
        type="application/pdf"
        class="pdf-viewer-object"
        title="Symbolic Reasoning in Large Language Models">
        <iframe
          src="/assets/papers/symbolic_reasoning_llm.pdf#toolbar=1&navpanes=0&scrollbar=1&page=1&view=FitH"
          class="pdf-viewer-iframe"
          title="Symbolic Reasoning in Large Language Models">
        </iframe>
      </object>

      <div class="pdf-viewer-fallback">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
        <h3>PDF Preview Unavailable</h3>
        <p>Your browser doesn't support embedded PDF viewing.</p>
        <div class="pdf-viewer-fallback__actions">
          <a href="/assets/papers/symbolic_reasoning_llm.pdf" class="btn btn--primary" download>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download PDF
          </a>
          <a href="/assets/papers/symbolic_reasoning_llm.pdf" target="_blank" class="btn btn--secondary">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Open in New Tab
          </a>
        </div>
      </div>
    </div>
  </div>

  <div class="featured-publication-hero__stats">
    <div class="stat-card">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
      <div class="stat-card__content">
        <span class="stat-card__value">50+</span>
        <span class="stat-card__label">Pages</span>
      </div>
    </div>
    <div class="stat-card">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      <div class="stat-card__content">
        <span class="stat-card__value">6</span>
        <span class="stat-card__label">Key Mechanisms</span>
      </div>
    </div>
    <div class="stat-card">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
      <div class="stat-card__content">
        <span class="stat-card__value">15+</span>
        <span class="stat-card__label">Examples</span>
      </div>
    </div>
  </div>
</div>

<script>
function toggleFullscreen() {
  const container = document.getElementById('pdfViewerContainer');
  if (!document.fullscreenElement) {
    container.requestFullscreen().catch(err => {
      alert(`Error attempting to enable fullscreen: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
}
</script>

<style>
/* ===================================================================
   FEATURED PUBLICATION HERO SECTION
   Full-width, prominent display at top of Research page
   =================================================================== */

.featured-publication-hero {
  background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
  border: 3px solid #f87171;
  border-radius: 1rem;
  margin: -2rem -2rem 4rem -2rem;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(248, 113, 113, 0.3);
  position: relative;
}

.featured-publication-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #f87171 0%, #f97316 25%, #fbbf24 50%, #f97316 75%, #f87171 100%);
  background-size: 200% 100%;
  animation: shimmer 3s linear infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.featured-publication-hero__badge {
  background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #0d0d0d;
}

.featured-publication-hero__badge svg {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.featured-publication-hero__header {
  padding: 2.5rem;
  background: rgba(26, 26, 26, 0.5);
}

.featured-publication-hero__title {
  color: #f5f5f5;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 0 0 1rem 0;
}

.featured-publication-hero__meta {
  color: #a3a3a3;
  font-size: 0.95rem;
  margin: 0 0 1.5rem 0;
}

.featured-publication-hero__meta strong {
  color: #f87171;
}

.featured-publication-hero__description {
  color: #a3a3a3;
  line-height: 1.7;
  margin: 0 0 2rem 0;
  font-size: 1.05rem;
}

.featured-publication-hero__actions {
  display: flex;
  gap: 1rem;
  margin: 0 0 2rem 0;
  flex-wrap: wrap;
}

.featured-publication-hero__actions .btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.featured-publication-hero__topics {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
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

/* PDF Viewer Container */
.pdf-viewer-container {
  background: #000000;
  border-top: 2px solid #262626;
}

.pdf-viewer-toolbar {
  background: #141414;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid #262626;
}

.pdf-viewer-toolbar__info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #a3a3a3;
  font-size: 0.9rem;
  font-weight: 600;
}

.pdf-viewer-toolbar__info svg {
  color: #f87171;
  flex-shrink: 0;
}

.pdf-viewer-toolbar__actions {
  display: flex;
  gap: 0.5rem;
}

.toolbar-btn {
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.3);
  color: #f87171;
  padding: 0.5rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toolbar-btn:hover {
  background: rgba(248, 113, 113, 0.2);
  border-color: #f87171;
}

.pdf-viewer-wrapper {
  position: relative;
  width: 100%;
  height: 800px;
  background: #0d0d0d;
}

.pdf-viewer-object,
.pdf-viewer-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

.pdf-viewer-fallback {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  background: #0d0d0d;
  padding: 3rem;
  text-align: center;
}

.pdf-viewer-fallback svg {
  color: #737373;
  opacity: 0.3;
}

.pdf-viewer-fallback h3 {
  color: #f5f5f5;
  font-size: 1.5rem;
  margin: 0;
}

.pdf-viewer-fallback p {
  color: #a3a3a3;
  margin: 0;
  font-size: 1.05rem;
}

.pdf-viewer-fallback__actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.pdf-viewer-fallback__actions .btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

/* Stats Cards */
.featured-publication-hero__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  border-top: 2px solid #262626;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 2rem;
  background: #141414;
  border-right: 2px solid #262626;
  transition: all 0.3s ease;
}

.stat-card:last-child {
  border-right: none;
}

.stat-card:hover {
  background: #1a1a1a;
}

.stat-card svg {
  color: #f87171;
  flex-shrink: 0;
}

.stat-card__content {
  display: flex;
  flex-direction: column;
}

.stat-card__value {
  color: #f5f5f5;
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
}

.stat-card__label {
  color: #737373;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 0.25rem;
}

/* Fullscreen Mode */
.pdf-viewer-container:fullscreen {
  background: #000000;
}

.pdf-viewer-container:fullscreen .pdf-viewer-wrapper {
  height: calc(100vh - 60px);
}

/* Responsive Design */
@media (max-width: 968px) {
  .featured-publication-hero {
    margin: -1rem -1rem 3rem -1rem;
  }

  .featured-publication-hero__header {
    padding: 2rem 1.5rem;
  }

  .featured-publication-hero__title {
    font-size: 1.5rem;
  }

  .pdf-viewer-toolbar {
    padding: 0.75rem 1rem;
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }

  .pdf-viewer-wrapper {
    height: 500px;
  }

  .featured-publication-hero__stats {
    grid-template-columns: 1fr;
  }

  .stat-card {
    border-right: none;
    border-bottom: 2px solid #262626;
  }

  .stat-card:last-child {
    border-bottom: none;
  }

  .featured-publication-hero__actions {
    flex-direction: column;
  }

  .featured-publication-hero__actions .btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .featured-publication-hero__badge {
    font-size: 0.8rem;
    padding: 0.75rem 1rem;
  }

  .featured-publication-hero__title {
    font-size: 1.25rem;
  }

  .pdf-viewer-toolbar__info span {
    font-size: 0.8rem;
  }

  .pdf-viewer-wrapper {
    height: 400px;
  }
}
</style>

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

## Collaboration

I'm always interested in collaborating on research projects related to:
- AI/ML applications
- Security research
- Systems programming
- Open source development

<div style="margin-top: 2rem;">
  <a href="/contact/" class="btn btn--primary">Discuss Research Collaboration</a>
</div>
