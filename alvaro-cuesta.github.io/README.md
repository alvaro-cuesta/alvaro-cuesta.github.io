# https://alvaro-cuesta.github.io

[![Deploy to GitHub Pages](https://github.com/alvaro-cuesta/alvaro-cuesta.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/alvaro-cuesta/alvaro-cuesta.github.io/actions/workflows/deploy.yml)

## TODO

- Maybe use FontAwesome React packages? Or my own icon but ensure it behaves the same (I think their
  components renders SVG instead of fonts)
- Blog posts
  - Comments from GH issues?
  - Add manual description OR autodescription https://github.com/rehypejs/rehype-infer-description-meta
  - Add reading time https://github.com/rehypejs/rehype-infer-reading-time-meta
  - Add autoembed
    - https://github.com/PaulieScanlon/mdx-embed
    - https://mdxjs.com/guides/embed/
  - Extract to mdx and blog packages
  - Infer last modified et al from Git?
  - Can we infer OG embed image from first image in MDX?
- RSS?
- Add global "last published/updated/whatever" meta tag on build
- `ld+json` (e.g. a `BlogPosting`)
  ```
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "My Article Title",
    "datePublished": "2025-08-25T12:00:00Z",
    "dateModified": "2025-08-26T09:00:00Z"
  }
  </script>
  ```
- Latest blog posts in frontpage
- Last updated (maybe even guess from Git? override via blog post export anyways)
- Preload fonts?
- Font swap?
