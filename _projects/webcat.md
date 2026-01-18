---
layout: project
title: WebCat
description: Neural network-based website categorization system using machine learning for automatic content classification.
github: https://github.com/Samuele95/WebCat
category: ai
tech:
  - Python
  - TensorFlow
  - Neural Networks
  - NLP
  - Web Scraping
featured: true
---

WebCat is a machine learning system designed to automatically categorize websites based on their content using neural networks and natural language processing techniques.

## Overview

The project addresses the challenge of automatically classifying websites into predefined categories based on their textual content, visual elements, and structural features.

## Key Features

- **Content Analysis** - Extracts and processes textual content from web pages
- **Multi-label Classification** - Supports websites belonging to multiple categories
- **Neural Network Architecture** - Uses deep learning for accurate predictions
- **Scalable Design** - Handles large volumes of websites efficiently

## Technical Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Web Scraper │────▶│  Preprocessor │────▶│  Feature    │
│             │     │              │     │  Extractor  │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                │
                                                ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Category   │◀────│   Neural     │◀────│  Vector     │
│  Output     │     │   Network    │     │  Embedding  │
└─────────────┘     └──────────────┘     └─────────────┘
```

## Results

The system achieves high accuracy in classifying websites across various categories including news, e-commerce, education, entertainment, and more.

## Future Work

- Integration with browser extensions
- Real-time classification API
- Support for additional languages
