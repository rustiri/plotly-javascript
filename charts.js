function init() {
  // Grab a reference to the dropdown select element
  let selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    let sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    let firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

//function to change selected option when is selected
function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    //create variable metadata for array in the dataset
    let metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    let resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    //the first item in the array (resultArray[0])
    let result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    let PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// D1: 1. Create the buildCharts function.
function buildCharts(sample) {
  // D1: 2. Use d3.json to load and retrieve the samples.json file 
  d3.json("samples.json").then((data) => {
    // D1: 3. Create a variable that holds the samples array. 
    let samplesArr = data.samples;
    // D1: 4. Create a variable that filters the samples for the object with the desired sample number.
    let resultArray = samplesArr.filter(sampleObj => sampleObj.id == sample);

    // D3: 1. Create a variable that filters the metadata array for the object with the desired sample number.
    //let metadata = data.metadata;
    let metadataFilters = data.metadata.filter(sampleObj => sampleObj.id == sample);

    // D1: 5. Create a variable that holds the first sample in the array.
    let firstSample = resultArray[0];

    // D3: 2. Create a variable that holds the first sample in the metadata array.
    let firstMetadata = metadataFilters[0]

    // D1: 6. Create variables that have arrays or hold the otu_ids, otu_labels, and sample_values.
    let otuIDs = firstSample.otu_ids;
    let otuLabes = firstSample.otu_labels;
    let sampleVal = firstSample.sample_values;

    // D3: 3. Create a variable that holds the washing frequency and
    //converts the washing frequency to a floating point number.
    let washingFreq = firstMetadata.wfreq;
    let wfreqFloat = parseFloat(washingFreq);
    
    // D1: 7. Create the yticks for the bar chart.
    // Hint: Get the the top 10 otu_ids and map them in descending order  
    // so the otu_ids with the most bacteria are last. 
    let yticks = otuIDs.slice(0,10).map(otuID => `OTU ${otuID}`).reverse();

    // D1: 8. Create the trace for the bar chart. 
    //where the x values are the sample_values
    //the hover text for the bars are the otu_labels in descending order.
    let barData = [
      {
        //x values are the sample_values in descending order
        x: sampleVal.slice(0,10).reverse(),
        //y values are the otu_ids in descending order
        y: yticks, 
        //hover text is the otu_labels in descending order
        text: otuLabes.slice(0,10).reverse(),
        type: "bar",
        orientation: "h" 
      }   
    ];

    // D1: 9. Create the layout for the bar chart. 
    let barLayout = {
      title: "Top 10 Bacteria Cultures Found",
      margin: {
        l: 100,
        r: 100,
        t: 100,
        b: 100
      }
    };
    // D1: 10. Use Plotly to plot the data with the layout. 
    Plotly.newPlot("bar", barData, barLayout);

    //D2: Bubbe Chart
    // D2: 1. Create the trace for the bubble chart.
    let bubbleData = [
      {
        //Sets the otu_ids as the x-axis values
        x: otuIDs,
        //Sets the sample_values as the y-axis values
        y: sampleVal,
        //Sets the otu_labels as the hover-text values
        text: otuLabes,
        mode: "markers",
        //the marker property is a dictionary that defines the size, color, and colorscale of the markers.
        marker: {
          //Sets the sample_values as the marker size
          size: sampleVal,
          //Sets the otu_ids as the marker colors
          color: otuIDs,
          colorscale: 'Earth'
        }
      }
    ];

    // D2: 2. Create the layout for the bubble chart.
    let bubbleLayout = {
      title: "Bacteria Culture Per Sample",
      showlegend: false,
      xaxis: { title: "OTU ID"}
    };

    // D2: 3. Use Plotly to plot the data with the layout.
    Plotly.newPlot("bubble", bubbleData, bubbleLayout);

    // D3: 4. Create the trace for the gauge chart.
    var gaugeData = [
      {
        //The indicator to shows the level for the washing frequency
        type: "indicator",
        mode: "gauge+number",
        //Adds the washing frequency value
        value: wfreqFloat,
        //Creates a title for the chart
        title: {
          //text: title.append("p").text("Belly Button Washing Frequency<br>Scrubs per Week")
          text: title = "<b>Belly Button Washing Frequency</b><br>Scrubs per Week"
        },
        gauge: {
          axis: {
            range: [null, 10],
            tickwidth: 1, 
            tickcolor: "#4f524b" 
          },
          //The indicator shows the level for the washing frequency
          bar: { color: "#4f524b" },
          //ranges for the gauge in increments of two, with a different color for each increment.
          steps: [
            { range: [0,2], color: "#bf9960"},
            { range: [2,4], color: "#c9b25d"},
            { range: [4,6], color: "#c4c95d"},
            { range: [6,8], color: "#98c95d"},
            { range: [8,10], color: "#5ca307"}
          ]
        }
      }
    ];
    
    // D3: 5. Create the layout for the gauge chart.
    var gaugeLayout = { 
      margin: { t: 25, r: 25, l: 25, b: 25 }
    };

    // D3: 6. Use Plotly to plot the gauge data and layout.
    Plotly.newPlot("gauge", gaugeData, gaugeLayout);

  });
}
