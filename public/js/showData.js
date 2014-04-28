   
$(document).ready(function(){
    $("#parameters-form").submit(function(e)
    {
      e.preventDefault();
      var postData = $(this).serializeArray();

      $.ajax({
      url:"/search",
      data: postData,
      type:"post",
       beforeSend: function ( xhr ) {    
                         $('svg').remove();
                         $("#loading").show();

                    }
      ,success:function(result)
      {
                $("#loading").hide();
               

                 var width = 850,
      height = 700;

  var fill = d3.scale.category10();
  var nodes = classes(result);
  var padding = 4;



  var max_amount = d3.max(nodes, function (d) { return parseInt(d.r)})
                var radius_scale = d3.scale.pow().exponent(0.5).domain([0, max_amount]).range([2, 85])
  nodes.forEach(function (o,i) {
      o.r = radius_scale(o.r)*.6;

          });

  var maxRadius = d3.max(nodes, function (d) { return parseInt(d.r)});

  var force = d3.layout.force()
      .nodes(nodes)
      .charge(charge)
      .size([width, height])
      .on("tick", tick(.55))
      .start();

        function charge(d) {
      return -Math.pow(d.r, 2.0);
    }

  var svg = d3.select("#svg").append("svg")
  .attr("class", "bubblechart")
      .attr("width", width)
      .attr("height", height)
      ;

  var node = svg.selectAll("circle")
      .data(nodes);

    node.enter().append("circle")
      .attr("class", "node")
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", function(d){return d.r;})
      .style("fill", function(d, i) { return fill(d.typeName); })
      .style("stroke", function(d, i) { return d3.rgb(fill(d.typeName)).darker(2); })
      .call(force.drag)
      .on("mouseover", function (d) { $(this).popover({
            placement: 'auto top',
            container: 'body',
            trigger: 'manual',
            html : true,
            content: function() { 
              return "Page: " + d.pageName + "<br/>Type: " + d.typeName + 
                     "<br/>Friends that Like: " + d.count; }
          });
          $(this).popover('show'); })
          .on("mouseout", function (d) { removePopovers(); })
      .on("mousedown", function() { d3.event.stopPropagation(); });

  svg.style("opacity", 1e-6)
    .transition()
      .duration(1000)
      .style("opacity", 1);

  d3.select("body")
      .on("mousedown", mousedown);


 function removePopovers () {
          $('.popover').each(function() {
            $(this).remove();
          }); 
        }



  function tick (k) {
                    return function (e) {
                    nodes.forEach(function(o, i) {
                      o.y += (height/2 - o.y) * k * e.alpha;
                      o.x += (width/2 - o.x) * k * e.alpha;
                    });

                    node
                      .each(collide(.1))
                      .attr("cx", function (d) { return d.x; })
                      .attr("cy", function (d) { return d.y; });
                                        

                                        
                    }
                  }


                  function collide(alpha) {
                    var quadtree = d3.geom.quadtree(nodes);
                    return function(d) {
                    var r = d.r + maxRadius,
                      nx1 = d.x - r,
                      nx2 = d.x + r,
                      ny1 = d.y - r,
                      ny2 = d.y + r;
                    quadtree.visit(function(quad, x1, y1, x2, y2) {
                      if (quad.point && (quad.point !== d)) {
                      var x = d.x - quad.point.x,
                        y = d.y - quad.point.y,
                        l = Math.sqrt(x * x + y * y),
                        r = d.radius + quad.point.radius;
                      if (l < r) {
                        l = (l - r) / l * alpha;
                        d.x -= x *= l;
                        d.y -= y *= l;
                        quad.point.x += x;
                        quad.point.y += y;
                      }
                      }
                      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
                    });
                    };
                  }                      
    

  function mousedown() {
    nodes.forEach(function(o, i) {
      o.x += (Math.random() - .5) * 40;
      o.y += (Math.random() - .5) * 40;
    });
    force.resume();
  }
                    


      }});

    });


   
     $("#parameters-form").submit();


  // Returns a flattened hierarchy containing all leaf nodes under the root.
  function classes(root) {
    var classes = [];

    for(var i in root)
      classes.push({typeName: root[i].type, pageName: root[i].name, r: root[i].count,count: root[i].count});
    

   
    return classes;
  }


});

