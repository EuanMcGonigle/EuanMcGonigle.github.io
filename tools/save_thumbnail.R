# Save a publication thumbnail for the website.
#
# Thumbnails are shown at 16:10 and look best when simple: no axis titles,
# minimal legends, thicker lines. Output goes to images/pubs/<name>.png.
# Then add `image: /images/pubs/<name>.png` to the paper's entry in
# _data/publications.yml.
#
# Usage (from the repository root):
#   source("tools/save_thumbnail.R")
#
#   # ggplot2
#   save_thumbnail(my_ggplot, "moped")
#
#   # base graphics: pass a function that draws the plot
#   save_thumbnail(function() {
#     plot(x, type = "l", col = "#0f6e78", lwd = 1.5, axes = FALSE, ann = FALSE)
#     abline(v = cpts, lty = 2, col = "#d9572b")
#   }, "stat-changes-in-mean")

save_thumbnail <- function(plot, name, dir = "images/pubs",
                           width = 1200, height = 750, res = 150) {
  dir.create(dir, showWarnings = FALSE, recursive = TRUE)
  file <- file.path(dir, paste0(name, ".png"))

  if (inherits(plot, "ggplot")) {
    ggplot2::ggsave(file, plot = plot, width = width / res,
                    height = height / res, dpi = res, bg = "white")
  } else if (is.function(plot)) {
    grDevices::png(file, width = width, height = height, res = res, bg = "white")
    on.exit(grDevices::dev.off(), add = TRUE)
    graphics::par(mar = c(1, 1, 1, 1))
    plot()
  } else {
    stop("`plot` must be a ggplot object or a function that draws a base plot.")
  }

  message("Saved ", file, "\nAdd to _data/publications.yml:  image: /", file)
  invisible(file)
}

# Site colours, if you want figures to match the theme.
site_cols <- c(accent = "#0f6e78", hot = "#d9572b", ink = "#16181d")
