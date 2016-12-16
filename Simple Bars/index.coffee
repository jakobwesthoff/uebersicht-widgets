command: "false"

refreshFrequency: 1000

_svgTemplate: null
_svgNode: null

render: (commandOutput) ->
  "<!-- SVG will be imported in afterRender -->"

afterRender: (widgetElement) ->
  @_svgTemplate = @_loadAsset("bar-template.svg", "xml")
  templateSvgNode = @_svgTemplate.children.item(0);
  @_svgNode = document.importNode(templateSvgNode, true);
  widgetElement.appendChild(@_svgNode);

update: (commandOutput, widgetElement) ->
  for i in [0..20]
    @_renderBar("some-type", "bar-#{i}", Math.floor(Math.random()*100));

_renderBar: (type, identifier, value) ->
  # Ignore type for now
  node = @_findNodeByIdentifier(identifier);
  if (node == null)
    node = @_createBar(type, identifier)
  node.setAttribute("height", value * 5)

_findNodeByIdentifier: (identifier) ->
  snapshot = document.evaluate("//[@id='#{identifier}']", @_svgNode, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  return null if snapshot.snapshotLength != 1;
  return snapshot.snapshotItem(0);

_createBar: (type, identifier) ->
  node = @_cloneBarFromTemplate()
  node.setAttribute("id", identifier);
  node.setAttribute("x", Math.floor(Math.random()*400))
  barGroup = @_findNodeByIdentifier("bars");
  barGroup.appendChild(node);
  return node;

_cloneBarFromTemplate: () ->
  templateNode = @_findNodeByIdentifier("bar-template");
  templateNode.cloneNode(true);

###
# Load an arbitrary remote asset
#
# Please take into account, that to the sync nature of the render and update functions
# assets may only be loaded synchronous. Therefore they may block the render thread.
# Be careful with those calls and properly cache their loaded content
#
# @param [string] asset
# @param [string?] dataType
# @return [*]
###
_loadAsset: (asset, dataType = "text") ->
  assetPath = "Simple Bars/Assets/#{asset}"
  loadedAsset = null
  $.ajax(
    async: false,
    url: assetPath
    dataType: dataType,
    success: (data) -> loadedAsset = data
  )
  return loadedAsset;

style: """
  -webkit-font-smoothing: antialiased;
  width: 100%;
  height: 100%;

  svg {
    .bar {
      filter: url(#barDropShadow);
    }
    .bar.grey {
      fill: url(#greyBarLinear);
    }
    .bar.red {
      fill: url(#redBarLinear);
    }
    #bar-template {
      display: none;
    }
  }
"""