---
layout: modern
title: "Software"
permalink: /software/
excerpt: "R packages by Euan McGonigle."
redirect_from:
  - /resume
---

{% include modern/page-head.html eyebrow="Open source" title="Software" lede="I write and maintain R packages that implement the methods from my research. Packages on CRAN can be installed with install.packages()." %}

<section class="section section--tight">
  <div class="wrap">
    <pre class="code reveal"><code><span class="c"># install from CRAN</span>
install.packages(<span class="s">"TrendLSW"</span>)
install.packages(<span class="s">"CptNonPar"</span>)

<span class="c"># install from GitHub</span>
remotes::install_github(<span class="s">"EuanMcGonigle/moped"</span>)</code></pre>
    {% include modern/software.html %}
  </div>
</section>
