# euanmcgonigle.github.io

## Editing the site

The main pages (home, publications, software, teaching) use the `modern` layout:

| What | Where |
|---|---|
| Publications (add new papers at the top) | `_data/publications.yml` |
| Software / R packages | `_data/software.yml` |
| Hero, about, research, teaching, contact text | `_includes/modern/*.html` |
| Page assembly | `_pages/about.md` (home), `_pages/publications.md`, `_pages/software.md`, `_pages/teaching.md` |
| Layout, nav, footer | `_layouts/modern.html` |
| Styles (colours are CSS variables at the top) | `assets/css/modern.css` |
| Animations, theme toggle, filters | `assets/js/modern.js` |

### Publication thumbnails

Each paper can show a figure. Save it to `images/pubs/` (16:10, e.g. 1200×750 px, PNG or JPG) and add `image: /images/pubs/<name>.png` to its entry in `_data/publications.yml`. Optionally add `image_full:` pointing at a larger or uncropped version, which is shown when the thumbnail is clicked. From R, `source("tools/save_thumbnail.R")` and call `save_thumbnail(plot, "<name>")`, which takes a ggplot or a function that draws a base plot. Papers without an `image:` show no thumbnail.

The animated hero background is a simulated nonstationary time series with a fitted piecewise-constant mean and the detected change points marked.

---

A Github Pages template for academic websites. This was forked (then detached) by [Stuart Geiger](https://github.com/staeiou) from the [Minimal Mistakes Jekyll Theme](https://mmistakes.github.io/minimal-mistakes/), which is © 2016 Michael Rose and released under the MIT License. See LICENSE.md.

I think I've got things running smoothly and fixed some major bugs, but feel free to file issues or make pull requests if you want to improve the generic template / theme.

### Note: if you are using this repo and now get a notification about a security vulnerability, delete the Gemfile.lock file. 

# Instructions

1. Register a GitHub account if you don't have one and confirm your e-mail (required!)
1. Fork [this repository](https://github.com/academicpages/academicpages.github.io) by clicking the "fork" button in the top right. 
1. Go to the repository's settings (rightmost item in the tabs that start with "Code", should be below "Unwatch"). Rename the repository "[your GitHub username].github.io", which will also be your website's URL.
1. Set site-wide configuration and create content & metadata (see below -- also see [this set of diffs](http://archive.is/3TPas) showing what files were changed to set up [an example site](https://getorg-testacct.github.io) for a user with the username "getorg-testacct")
1. Upload any files (like PDFs, .zip files, etc.) to the files/ directory. They will appear at https://[your GitHub username].github.io/files/example.pdf.  
1. Check status by going to the repository settings, in the "GitHub pages" section
1. (Optional) Use the Jupyter notebooks or python scripts in the `markdown_generator` folder to generate markdown files for publications and talks from a TSV file.

See more info at https://academicpages.github.io/

## To run locally (not on GitHub Pages, to serve on your own computer)

1. Clone the repository and made updates as detailed above
1. Make sure you have ruby-dev, bundler, and nodejs installed: `sudo apt install ruby-dev ruby-bundler nodejs`
1. Run `bundle clean` to clean up the directory (no need to run `--force`)
1. Run `bundle install` to install ruby dependencies. If you get errors, delete Gemfile.lock and try again.
1. Run `bundle exec jekyll liveserve` to generate the HTML and serve it from `localhost:4000` the local server will automatically rebuild and refresh the pages on change.

# Changelog -- bugfixes and enhancements

There is one logistical issue with a ready-to-fork template theme like academic pages that makes it a little tricky to get bug fixes and updates to the core theme. If you fork this repository, customize it, then pull again, you'll probably get merge conflicts. If you want to save your various .yml configuration files and markdown files, you can delete the repository and fork it again. Or you can manually patch. 

To support this, all changes to the underlying code appear as a closed issue with the tag 'code change' -- get the list [here](https://github.com/academicpages/academicpages.github.io/issues?q=is%3Aclosed%20is%3Aissue%20label%3A%22code%20change%22%20). Each issue thread includes a comment linking to the single commit or a diff across multiple commits, so those with forked repositories can easily identify what they need to patch.
