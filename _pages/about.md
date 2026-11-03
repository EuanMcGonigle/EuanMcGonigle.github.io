---
layout: modern
permalink: /
title: ""
excerpt: "Euan McGonigle, Lecturer in Statistics at the University of Southampton. Research in change point detection, wavelet methods and nonstationary time series."
hero: true
redirect_from:
  - /about/
  - /about.html
---

{% include modern/hero.html %}
{% include modern/about.html %}
{% include modern/research.html %}

<section class="section" id="publications">
  <div class="wrap">
    <div class="section__head section__head--row reveal">
      <div>
        <h2 class="section__title">Publications</h2>
        <p class="section__sub">Recent papers</p>
      </div>
      <a class="link-arrow" href="{{ '/publications/' | relative_url }}">All publications <span aria-hidden="true">→</span></a>
    </div>
    {% include modern/publications.html limit=4 %}
  </div>
</section>

<section class="section section--alt" id="software">
  <div class="wrap">
    <div class="section__head section__head--row reveal">
      <div>
        <h2 class="section__title">Software</h2>
        <p class="section__sub">R packages &amp; code</p>
      </div>
      <a class="link-arrow" href="{{ '/software/' | relative_url }}">More on software <span aria-hidden="true">→</span></a>
    </div>
    {% include modern/software.html %}
  </div>
</section>

<section class="section" id="teaching">
  <div class="wrap">
    <div class="section__head reveal">
      <h2 class="section__title">Teaching</h2>
    </div>
    {% include modern/teaching.html %}
  </div>
</section>

{% include modern/contact.html %}
