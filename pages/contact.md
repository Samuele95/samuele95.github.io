---
layout: page
title: Contact
description: Get in touch for collaborations, research discussions, or just to say hello.
permalink: /contact/
---

<div class="contact">
  <div class="contact__grid">
    <div class="contact__info">
      <h3>Let's Connect</h3>
      <p style="color: var(--fg-dark); margin-bottom: 2rem;">
        I'm always interested in discussing AI projects, security research, systems programming, or potential collaborations. Feel free to reach out!
      </p>

      <a href="mailto:{{ site.email }}" class="contact__item">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
        <div>
          <strong>Email</strong>
          <div style="font-size: 0.875rem; color: var(--fg-dark);">{{ site.email }}</div>
        </div>
      </a>

      <a href="https://github.com/{{ site.github_username }}" class="contact__item" target="_blank" rel="noopener">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
        <div>
          <strong>GitHub</strong>
          <div style="font-size: 0.875rem; color: var(--fg-dark);">@{{ site.github_username }}</div>
        </div>
      </a>

      <div style="margin-top: 2rem; padding: 1.5rem; background: var(--bg-lighter); border-radius: 1rem;">
        <h4 style="margin-bottom: 0.5rem;">Open to:</h4>
        <ul style="color: var(--fg-dark); font-size: 0.875rem; margin: 0; padding-left: 1.25rem;">
          <li>Research collaborations</li>
          <li>Open source contributions</li>
          <li>AI/ML project discussions</li>
          <li>Security research partnerships</li>
          <li>Technical consulting</li>
        </ul>
      </div>
    </div>

    <div>
      <div style="background: var(--bg-lighter); padding: 2rem; border-radius: 1rem; border: 1px solid var(--bg-highlight);">
        <h3 style="margin-bottom: 1.5rem;">Send a Message</h3>

        <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
          <div class="form__group">
            <label class="form__label" for="name">Name</label>
            <input type="text" class="form__input" id="name" name="name" required placeholder="Your name">
          </div>

          <div class="form__group">
            <label class="form__label" for="email">Email</label>
            <input type="email" class="form__input" id="email" name="email" required placeholder="your@email.com">
          </div>

          <div class="form__group">
            <label class="form__label" for="subject">Subject</label>
            <input type="text" class="form__input" id="subject" name="subject" placeholder="What's this about?">
          </div>

          <div class="form__group">
            <label class="form__label" for="message">Message</label>
            <textarea class="form__textarea" id="message" name="message" required placeholder="Your message..."></textarea>
          </div>

          <button type="submit" class="btn btn--primary" style="width: 100%;">
            Send Message
          </button>
        </form>

        <p style="font-size: 0.75rem; color: var(--comment); margin-top: 1rem; text-align: center;">
          Or email me directly at <a href="mailto:{{ site.email }}">{{ site.email }}</a>
        </p>
      </div>
    </div>
  </div>
</div>

<div style="text-align: center; margin-top: 4rem; padding-top: 2rem; border-top: 1px solid var(--bg-highlight);">
  <p style="color: var(--comment); margin-bottom: 1rem;">Based in Italy | Available for remote collaboration worldwide</p>
</div>
