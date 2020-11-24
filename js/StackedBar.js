class sBar{
    constructor(data){
        this.data = data;
        this.select_subset=data;
     
        //set margins and dimensions
        this.margin = ({top: 10, right: 30, bottom: 200, left: 50});
        this.width = 760 - this.margin.left - this.margin.right;
        this.height = 800 - this.margin.top - this.margin.bottom;

        //List of experimental sample type(x-axis)
        this.groups = d3.map(this.select_subset, function(d){
            return(d.group)}).keys();

        this.x = d3.scaleBand()
            .domain(this.groups)
            .range([0, this.width])
            .padding([0.2]);

        this.y = d3.scaleLinear()
            .domain([0,100])
            .range([this.height, 0]);
        
        
        

    }

drawChart(){


    //append svg to page body
    let stack_svg = d3.select('#stacked-barchart')
        .append('svg')
            .attr("width", this.width + this.margin.left+10 + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .classed('stack-svg',true)
        .append('g')
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    //Draw x axis
    let xaxis = stack_svg.append('g')
        .attr("transform", "translate(0," + this.height + ")")
        .call(d3.axisBottom(this.x).tickSizeOuter(0))
       xaxis.selectAll(".tick text")
         .attr("transform", "translate (5,15) rotate (-30)")
         .attr("text-anchor", "end")
         .attr("font-family", "Work Sans");

    //Draw y-axis
    stack_svg.append('g')
        .call(d3.axisLeft(this.y));

    //Add Y axis title
    stack_svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - this.margin.left)
        .attr("x",0 - (this.height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "smaller")
        .style("font-family", "Work Sans")
        .text("Taxon Abundance"); 
    
}

updateChart(level){

        //List of taxons
        //create the subset to draw the correct level of the tree
        //level=1 kingdom, level=2 phylum, etc.
        let subgroups = createSubset(this.data,level);
        let labelText = "Level: Phylum"
        switch(level){
            case 0:
                labelText = "";
                break;
            case 1:
                labelText = "Level: Kingdom";
                break;
            case 2:
                labelText = "Level: Phylum";
                break;
            case 3:
                labelText = "Level: Class";
                break;
            case 4:
                labelText = "Level: Order";
                break;
            case 5:
                labelText = "Level: Family";
                break;
            case 6:
                labelText = "Level: Genus"
                break;
            case 7:
                labelText = "Level: Species"

        }
        let levelLabel=d3.select('#stackedLabel')
            .text(labelText)

        //color scale
        let color = d3.scaleOrdinal()
            .domain(subgroups) 
            .range(["#1f77b4","#aec7e8","#ff7f0e","#ffbb78","#98df8a","#ff9896","#9467bd","#c5b0d5","#e377c2","#f7b6d2", "#dbdb8d", "#17becf", "#9edae5", "#bcbd22",]);

        let that=this

        //stack the data per subgroup
        let stackedData = d3.stack()
            .keys(subgroups) 
            .order(d3.stackOrderNone) 
            (this.select_subset);

        //show the bars
        let rects = d3.select('.stack-svg').append('g')
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
            .selectAll('g')
            //enter in stack data, loop key per key, group per group
            .data(stackedData)
            .enter().append('g')
                .attr("fill", function(d){
                    return color(d.key); })
                .attr("class", function(d){return "myRect " + d.key.split(".")[1]})
                .selectAll("rect")
                .data(function(d){
                    return d; });

        rects.exit().remove()

    let enterRects = rects.enter().append('rect');
            enterRects
                .attr("x", function(d){return that.x(d.data.group); })
                .attr("y", function(d){return that.y(d[1]); })
                .attr("height", function(d){ return that.y(d[0])- that.y(d[1]); })
                .attr("width", that.x.bandwidth());
            
            rects=rects.merge(enterRects)

            rects
               .transition()
               .duration(300)
               .delay(140)
                .attr("x", function(d){return that.x(d.data.group); })
                .attr("y", function(d){return that.y(d[1]); })
                .attr("height", function(d){ return that.y(d[0])- that.y(d[1]); })
                .attr("width", that.x.bandwidth());


        //Add the tooltip labels on mouseover
        let tooltip = d3.select('#stacked-barchart').append('div').classed('tooltip', true).style("opacity",0);
            
                rects.on('mouseover', function (d, i) {
                    //subgroup being hovered over
                    var subgroupName = d3.select(this.parentNode).datum().key; 
                    var subgroupValue = d.data[subgroupName];
                    //Reduce opacity of all rectangles
                    d3.selectAll(".myRect")
                        .transition()
                        .duration(0)
                        .style("opacity", 0.2);
                    //Increase opacity of rect being hovered over
                    let taxon = subgroupName.split(".")
                    d3.selectAll("."+ taxon[1])
                        .transition()
                        .duration(800)
                        .style("opacity",1);


       

            //show tooltip
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(that.tooltipRender(d, subgroupName, subgroupValue))
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
        

  
                });
            //hover function for circle selection
            rects.on("mouseout", function (d) {

                 d3.selectAll(".myRect")
                    .transition()
                    .duration(1000)
                    .style("opacity", 1)


                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
}
tooltipRender(stackedData,subgroupName, subgroupValue) {
    let abundance = subgroupValue //stackedData[1] - stackedData[0]; old way commented out

    let taxon = subgroupName.split(".")
    //console.log(taxon)
    
    let text = "<h1>" + taxon.slice(-1) + "</h1>" + "<h2>" + abundance + "</h2>"; 
    return text;
    
}
}
function createSubset(data, level){
    //console.log(data.columns)
    //console.log(level)
    var indexList = []
    for (let key in data[1]) {
        let num = key.split('.')
        
        if (num.length == level) {
            //console.log('success!  we have a match!')
            //console.log(num.length);
            //console.log(level)
            indexList.push(key)
        }
      }
    //console.log(indexList)
    return indexList;
    

}
