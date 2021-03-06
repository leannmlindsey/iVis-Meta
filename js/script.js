Promise.all([d3.csv('./data/taxonomyInputFile.csv'),d3.csv('./data/stackedBarInputFullT_FINAL.csv'),d3.csv('./data/FINAL_DiffGenes.csv'),d3.csv('./data/pathabundance_stratifiedFINAL.csv')]).then(([data,data2,data3,data4]) =>
     {

        console.log('Loading Data')
        console.log('taxonomyInputFile.csv')
        console.log(data)
        console.log('stackedBarInputFullT.csv')
        console.log(data2)
        console.log('flatHeatmapDataSmall.csv')
        console.log(data3)
        console.log('pathabundance_stratifiedFINAL.csv')
        console.log(data4)

        //prepare a universal color mapping

        //first, get a list of all of the clades and species 
        let colorMap = data2.columns;
        colorMap.shift() //remove "group" from the list of columns 

        //sort the list by the length which places all of the clade levels together
        let sortedColorMap = colorMap.sort(function(a, b){
            return a.length - b.length;
          });
        
        //set a color mapping scheme which will map in order and cycle when it reaches the end
        let colors = ['#dbdb8d','#ffbb78',"#c5b0d5","#aec7e8","#9467bd","#1f77b4","#98df8a","#ff9896","#ff7f0e","#e377c2","#f7b6d2", "#dbdb8d", "#17becf", "#9edae5",]
        
        //create a color scale generator which is then passed into each function that requires color
        let color = d3.scaleOrdinal()
            .domain(sortedColorMap) 
            .range(colors);
       
        //construct all the classes and initialize each graph
        const phyloTree = new Tree(data, data2, updateLevel, color); 
        const sunburst = new Sunburst(data, data2, updateLevel, color);
        const barChart = new sBar(data2,updateSunburstChart, color);
        const heatMap = new HeatMap(data, data3, data4, updateViolinChart);
        const sampleGene = {GeneFamily: "UniRef90_UPI000F49C458|unclassified", Sample: "NoMonarch_Wild_260", Value: "28.3265682948", Condition: "No-Monarch"}
        const violinPlot = new ViolinPlot(data, data3, data4);
        
        //load page drawing phylogenetic tree
        phyloTree.drawTree()
        
        //draw stacked bar chart
        barChart.drawChart()
        barChart.updateChart(2)

        //draw heatmap
        heatMap.drawHeatmap();

        //draw violin plot
        violinPlot.drawViolinPlot();
        updateViolinChart(sampleGene)

        //draw phylo or sunburst according to radio button click
        const buttons = d3.selectAll('#chooseview-radio').selectAll('input');
        buttons.on('change', function(d) {
          //console.log('button changed to ' + this.value);
          const selection = this.value;
          if (selection == 'Phylo') {
              phyloTree.drawTree()
          } else if (selection == 'Sunburst') {
              sunburst.drawSunburst("Monarch_Wild_248")
          }
        });
        
        //functions that need to be available to all .js scripts 
        //these functions enable the interactivity between graphs

        //updates the level shown in the stacked bar chart when passed a level number that corresponds to the clade depth
        function updateLevel(levelNum) {
            console.log('updateLevel was called with level: ', levelNum);
            // barChart.drawChart(levelNum);
            barChart.updateChart(levelNum);
        }

        //updates the violin chart with data from a specific gene 
        function updateViolinChart(gene) {
             console.log('updateViolinChart was called with gene: ', gene);
             violinPlot.updateViolinPlot(gene);
        }

        //updates the sunburst chart based on data from one sample 
        function updateSunburstChart(sample) {
          console.log('updateSunburstChart was called with gene: ', sample);
          sunburst.drawSunburst(sample);
     }

     });
