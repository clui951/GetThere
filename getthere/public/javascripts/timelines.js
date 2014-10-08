function TimeLine(height, width, data_min, data_max, data){
    this.data = data;
    this.xPadding = 50;
    this.yPadding = 150;
    this.height = height + this.yPadding;
    this.width = width + this.xPadding;
    this.margin_top = 150;
    this.margin_left = 30;
    this.margin_bottom = 150;

    var _this = this;
    var box_height = 300;

    var yScale = d3.scale.linear()
        .domain([data_min, data_max])
        .range([0, height]);

    var svg = d3.select("body").append('svg')
        .attr("width", width)
        .attr('height', height + _this.yPadding + _this.margin_bottom)
        .style("position", "absolute")
        .style("top", "" + _this.margin_top)
        .style("left", "0");

    var bkgd_color = svg.append("g")
        .attr("transform", "translate(" + _this.margin_left + "," + _this.margin_top + ")");
    
    bkgd_color.append("rect")
        .attr("width", "" + (_this.width+20))
        .attr("height", "" + (_this.height-50))
        .attr("fill", "white")
        .attr('opacity',0);
    
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .ticks(5)
        .tickPadding(15)
        .outerTickSize(2)
        .tickFormat(d3.format("d"));

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate("+(_this.width/2)+","+_this.yPadding+")")
        .call(yAxis);

    var circles = svg.selectAll("circle")
        .data(_this.data).enter().append("svg:circle")
        .attr('cy', function(d){
            return yScale(d.finish) + _this.yPadding;
        })
        .attr('cx', _this.width/2)
        .attr('r', 10)
        .attr('fill', 'steelblue')
        .on("mouseover", function(){
            var dest_point = parseInt(d3.select(this).attr('cx')) + parseInt(_this.width/4);
            var line_data = [{"x": dest_point, "y": d3.select(this).attr('cy')},
                            {"x": d3.select(this).attr('cx'), "y": d3.select(this).attr('cy')}];

            d3.select(this)
                .transition()
                .duration(100)
                .attr('r', 15);
            var lineFunction = d3.svg.line()
                .x(function(d){return d.x})
                .y(function(d){return d.y})
                .interpolate("linear");
            if($("#translator").length == 0){
                var createLine = svg.append("path")
                    .attr('d', lineFunction(line_data))
                    .attr('id', 'connector')
                    .attr('stroke', 'black')
                    .attr('stroke-width', 2)
                    .attr('fill', 'none');
                var translator = svg.append("g")
                    .attr("transform", "translate("+(line_data[0].x - parseInt(_this.width/8))+","+(d3.select(this).attr('cy') - 150)+")")
                    .attr("id", "translator");
                translator.append("rect")
                    .attr('width', parseInt(_this.width/4))
                    .attr('height', box_height)
                    .attr('id', 'info_box')
                    .attr("fill","lightgray")
                    .attr("stroke-width",2)
                    .attr("stroke", "black")
            }
            if($("#goal_description").length == 0){
                svg.selectAll("p")
                    .data(_this.data).enter().append("text")
                    .attr('x', (line_data[0].x - parseInt(_this.width/8) + 15))
                    .attr('y', (d3.select(this).attr('cy') - box_height/2) + 25)
                    .text(function(d){ 
                        var finish_time = parseInt(yScale.invert(parseInt(d3.select(this).attr('y')) + box_height/2 - 45)); 
                        var result_string = "";
                        console.log(d);
                        if(parseInt(d.finish) == finish_time){
                            result_string = result_string.concat(d.goal_name + ": ");
                            result_string = result_string.concat(d.goal_description);
                            return result_string;
                        } else {
                            d3.select(this).remove();
                        }
                    })
                    .attr('width', parseInt(_this.width/4))
                    .attr("font-family", "sans-serif")
                    .attr("font-size", "12px")
                    .attr("id", "goal_description");
            }

        })
        .on("mouseout", function(){
            d3.select(this)
                .attr("opacity",1)
                .attr('r', 10);
            d3.select('#connector')
                .transition()
                .delay(1000)
                .remove();
            d3.select('#info_box')
                .transition()
                .delay(1000)
                .remove();
            d3.select('#translator')
                .transition()
                .delay(1000)
                .remove();
            d3.select('#goal_description')
                .transition()
                .delay(1000)
                .remove();
            d3.select('#goal_title')
                .transition()
                .delay(1000)
                .remove();
            d3.select('#view_goal')
                .transition()
                .delay(1000)
                .remove();
        });


}