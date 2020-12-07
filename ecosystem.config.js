module.exports = {
  apps: [{
    name: "novumzon",
    script: "index.js",
    watch: true,
    watch_delay: 1000,
    ignore_watch : ["static/plot.png"],
  }]
}
