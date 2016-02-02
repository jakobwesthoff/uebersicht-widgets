//const foo = {
  ui: {
    interfaces: {
      'en0': 'wifi',
      'en1': 'net-link',
    },
    externalIcon: 'globe'
  },

  command: "echo null",

  refreshFrequency: 30000,

  render(output) {
    const internal = [];
    for (let key in this.ui.interfaces) {
      const value = this.ui.interfaces[key];
      internal.push(`<div class="ip" style="display: none;"><span class="icon-${value}"></span><span class="value interface-${key}"></span></div>`);
    }
    const external = `<span class="ip" style="display: none;"><span class="value interface-external"></span><span class="icon-${this.ui.externalIcon}"></span></span>`;

    return `<div class="container"><canvas class="bg"></canvas><div class="internal">${internal.join("")}</div><div class="external">${external}</div></div>`;
  },

  afterRender(element) {
    uebersicht.makeBgSlice($('canvas.bg', element).get(0));
  },

  update(output, element) {
    const ips = JSON.parse(output);
    if (ips === null) {
      this.buildCommand();
      return;
    }

    ips.internal.forEach(ip => {
      const node = $(`.interface-${ip.interface}`, element);
      if (ip.ipv4 === "") {
        node.parent().css("display", "none");
      } else {
        node.parent().css("display", "inherit");
        node.text(ip.ipv4)
      }
    });
    const externalNode = $('.interface-external', element)
      if (ips.external === "") {
        externalNode.parent().css("display", "none");
      } else {
        externalNode.parent().css("display", "inherit");
        externalNode.text(ips.external);
      }
  },

  buildCommand() {
    const internalCommands = Object.keys(this.ui.interfaces).map(
      iface => `echo -n {\\"interface\\": \\"${iface}\\", \\"ipv4\\": \\"; (ifconfig ${iface}|grep inet|grep -v 'inet6'|sed -e 's@.*inet \\([0-9]\\{1,3\\}\\.[0-9]\\{1,3\\}\\.[0-9]\\{1,3\\}\\.[0-9]\\{1,3\\}\\) .*@\\1@')| tr -d "\\n\\r";echo -n \\"\\};`
    );
    const externalCommand = `curl -s 'ipecho.net/plain';`;
    const command = `echo -n {\\"internal\\": [;${internalCommands.join("echo -n \\,;")}echo -n \\], \\"external\\": \\";${externalCommand}echo \\"\\}`;

    this.command = command;
    this.refresh();
  },

  style: `
    $height = 130px
    $bottom = 2rem
    $internalExternalSpacing = 2.5rem
    $internalExternalBorder = .1rem
    $internalExternalBorderHeight = 4rem
    $iconSpacing = 1rem
    $ipSpacing = .7rem
    $color = white

    box-sizing: border-box
    width: 100%
    height: 100%
    font-family: Helvetica Neue
    font-size: 2rem
    font-weight: 100
    color: $color

    @font-face
      font-family: 'network-icon-font'
      src: url('network.widget/icons.ttf') format('truetype')
      font-weight: normal
      font-style: normal

    [class*='icon-']
      margin: $iconSpacing

    [class*='icon-']:before
      position: relative
      top: .29rem
      display: inline-block
      font-family: 'network-icon-font'
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

    canvas.bg
      position: absolute
      top: 0
      left: 0
      width: 100%
      height: 100%

    .internal, .external
      float: left
      padding-top: "calc((%s / 2) - %s)" % ($internalExternalBorderHeight $ipSpacing)
      padding-bottom: ($internalExternalBorderHeight / 2)
      position: relative

    .internal
      width: "calc(50% - %s)" % ($internalExternalSpacing)
      text-align: right
      padding-right: $internalExternalSpacing
      border-right: ($internalExternalBorder) solid $color;

    .external
      width: "calc(50% - %s - %s)" % ($internalExternalSpacing $internalExternalBorder)
      text-align: left
      padding-left: $internalExternalSpacing

    .ip
      margin-top: $ipSpacing
`
//};