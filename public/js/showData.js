 $.ajax({
  url:"/search",
  type:"post",
   beforeSend: function ( xhr ) {    
                     $("#svg").html("Loading");
                }
  ,success:function(result){
            var node = svg.selectAll(".node")
              .data(bubble.nodes(classes(result))
              .filter(function(d) { return !d.children; }))
            .enter().append("g")
              .attr("class", "node")
              .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

          node.append("title")
              .text(function(d) { return d.pageName + ": " + format(d.value); });

          node.append("circle")
              .attr("r", function(d) { return d.r; })
              .style("fill", function(d) { return color(d.typeName); });
  }});

var diameter = 900,
    format = d3.format(",d"),
    color = d3.scale.category10();

var bubble = d3.layout.pack()
    .sort(null)
    .size([diameter, diameter])
    .padding(1.5);

var svg = d3.select("#svg").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .attr("class", "bubble");



// Returns a flattened hierarchy containing all leaf nodes under the root.
function classes(root) {
  var classes = [];

  for(var i in root)
    classes.push({typeName: root[i].type, pageName: root[i].name, value: root[i].count});
  

 
  return {children: classes};
}

d3.select(self.frameElement).style("height", diameter + "px");