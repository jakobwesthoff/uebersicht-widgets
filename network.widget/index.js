ui: {
  interfaces: {
    'en0': 'wifi',
  },
  externalIcon: 'globe'
},

command: "echo null",

refreshFrequency: 30000,

render(output) {
  const ips = JSON.parse(output);

  if (ips === null) {
    this.buildCommand();
    return "";
  }

  const internal = ips.internal.map(ip => `<div class="ip"><span class="icon-${this.ui.interfaces[ip.interface]}"></span><span class="value">${ip.ipv4}</span></div>`);
  const external = `<span class="ip"><span class="value">${ips.external}</span><span class="icon-${this.ui.externalIcon}"></span></span>`;

  return `<div class="container"><div class="internal">${internal.join("")}</div><div class="external">${external}</div></div>`;
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


  box-sizing: border-box
  width: 100%
  height: 100%
  font-family: Helvetica Neue
  font-size: 2rem
  font-weight: 100

  .container
    position: relative
    top: "calc(100% - %s - %s)" % ($height $bottom)
    left: 0
    width: 100%
    height: $height

  .internal, .external
    width: "calc(50% - %s - %s)" % ($internalExternalSpacing $internalExternalBorder)
    float: left
    padding-top: ($internalExternalBorderHeight / 2)
    padding-bottom: ($internalExternalBorderHeight / 2)


  .internal
    text-align: right
    padding-right: $internalExternalSpacing
    border-right: ($internalExternalBorder / 2) solid black;

  .external
    text-align: left
    padding-left: $internalExternalSpacing
    border-left: ($internalExternalBorder / 2) solid black;

`