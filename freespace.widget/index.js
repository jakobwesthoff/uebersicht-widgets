//const foo = ({
  ui: {
    radius: 30,
    width: 80,
    height: 80,
    rename: {
      "/dev/disk2": "Macintosh HD"
    }
  },

  command: "/usr/local/opt/coreutils/libexec/gnubin/df",

  refreshFrequency: 5000,

  render(output) {
    return '<div class="container"><canvas class="bg"></canvas><div class="charts"></div></div>';
  },

  afterRender(element) {
    uebersicht.makeBgSlice($('canvas.bg', element).get(0));
  },

  update(output, element) {
    const lines = output.trim().split("\n");
    const titles = lines.shift().split(/\s+/);
    const entries = lines.map(line => {
      entry = {};
      line.split(/\s+/).forEach(
        (column, index) => entry[titles[index]] = column
      );
      return entry;
    });

    const charts = this.preprocess(entries).map(
      entry => this.renderChart(entry["1K-blocks"], entry["Used"], 'foobar', `${entry["Filesystem"]} (${entry["Use%"]})`)
    );

    $(".charts", element).html(charts);

    // Equalize sizes
    let maxSize = 0;
    $(".chart", element).each(
      (index, chart) => maxSize = Math.max(maxSize, Math.ceil($(chart).outerWidth(true)) + 1)
    ).each(
      (index, chart) => $(chart).css("width", `${maxSize}px`)
    );
  },

  preprocess(entries) {
    return entries.map(entry => {
      switch (true) {
        case entry["Filesystem"].indexOf("_afpovertcp") !== -1:
          return this.preprocessRename(
            this.preprocessAfp(
              entry
            )
          );
        default:
          return this.preprocessRename(
            entry
          );
      }
    });
  },

  preprocessRename(entry) {
    if (this.ui.rename !== undefined) {
      const renameInfo = this.ui.rename[entry["Filesystem"]];
      if (renameInfo !== undefined) {
        entry["Filesystem"] = renameInfo;
      }
    }

    return entry;
  },

  preprocessAfp(entry) {
    entry["Filesystem"] = entry["Filesystem"].replace(
      /^\/\/.+@([^.]+)._afpovertcp.[^/]*\/([^/]+).*$/,
      (match, server, share) => `${decodeURIComponent(server)}/${decodeURIComponent(share)}`
    );
    return entry;
  },

  renderChart(maximum, value, icon, text) {
    const r = this.ui.radius;
    const c = Math.floor(2 * Math.PI * r);
    const v = c / maximum * value;

    return `
      <div class="chart">
        <svg width="${this.ui.width}px" height="${this.ui.width}px">
          <circle class="bg" r="${r}" cx="${this.ui.width / 2}" cy="${this.ui.height / 2}"
                  style="stroke-dasharray: ${c} ${c}"/>
          <circle class="value" r="${r}" cx="${this.ui.width / 2}" cy="${this.ui.height / 2}"
                  style="stroke-dasharray: ${v} ${c}" />
        </svg>
        <div class="text">${text}</div>
      </div>
    `;
  },

  style: `
  $height = 130px
  $bottom = 10rem
  $color = white
  $chartDistance = 1rem
  $chartBackgroundColor = grey
  $chartForegroundColor = goldenrod
  $chartThickness = 8
  $chartBackgroundOpacity = 0.3
  $chartForegroundOpacity = 1

  box-sizing: border-box
  width: 100%
  height: 100%
  font-family: Helvetica Neue
  font-size: 1rem
  font-weight: 100
  color: $color

  @font-face
    font-family: 'freespace-icon-font'
    src: url('freespace.widget/icons.ttf') format('truetype')
    font-weight: normal
    font-style: normal

  [class*='icon-']:before
    position: relative
    top: .29rem
    display: inline-block
    font-family: 'freespace-icon-font'
    font-style: normal
    font-weight: normal
    line-height: 1
    -webkit-font-smoothing: antialiased
    -moz-osx-font-smoothing: grayscale

  .icon-globe:before
    content: 'C'

  .icon-net-link:before
    content: 'G'

  .icon-wifi:before
    content: 'I'

  .container
    position: relative
    top: "calc(100% - %s - %s)" % ($height $bottom)
    left: 0
    width: 100%
    height: $height
    text-align: center;

  canvas.bg
    position: absolute
    top: 0
    left: 0
    width: 100%
    height: 100%

  .charts
    position: relative
    background: transparent
    display: inline-block

  .charts:after
    clear: both
    display: block
    content: ''

  .chart
    text-align: center
    display: inline-block
    float: left
    margin-left: ($chartDistance/2)
    margin-right: ($chartDistance/2)

  svg
    transform: rotate(-90deg)

  circle.bg, circle.value
    fill: transparent
    stroke-width: $chartThickness

  circle.bg
    stroke: $chartBackgroundColor
    stroke-opacity: $chartBackgroundOpacity

  circle.value
    stroke: $chartForegroundColor
    stroke-opacity: $chartForegroundOpacity
`
//});
