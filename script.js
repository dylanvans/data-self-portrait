// ========================================================
// ON READY 
// ========================================================
$(function() {
	$('.js-carousel').each(function(index, el){
		new Carousel(el);
		new ScatterPlot();
		new LocationMap();
		new PerHour();
	});
});


// ========================================================
// Carousel 
// ========================================================
var Carousel = function(node) {
	this.container = $(node);

	if (!this.container.length) return;

	this.chapterContainer = this.container.find('.container-chapters');
	this.chapter = this.chapterContainer.find('.chapter');
	this.nextBtn = this.container.find('.js-next-chapter');
	this.prevBtn = this.container.find('.js-prev-chapter');
	this.navLink = this.container.find('.nav-link');

	this.activeLinkClass = 'active-link';
	this.activeChapter = 'js-active';
	this.navLinks = [];
	this.index = 0;
	this.oldIndex = this.index;
		
	this.navLink.each(function(index, el) {
		this.navLinks.push(new Navigation(index, el, this));
	}.bind(this));

	this.chapterContainer.css('width', 100 * this.chapter.length + '%');
	this.chapter.css('width', 100 / this.chapter.length + '%');

	this.nextBtn.on('click', this.next.bind(this));
	this.prevBtn.on('click', this.prev.bind(this));

	$(document).keydown(function(e) {
		if (e.keyCode == 37 && this.index > 0) {
			this.prev();
		} else if (e.keyCode == 39 && this.index < this.chapter.length - 1) {
			this.next();
		}		
	}.bind(this));

	this.move();
}

Carousel.prototype.defaultSettings = {
	'duration': 500
}

Carousel.prototype.next = function() {
	this.index++;
	this.move();
}

Carousel.prototype.prev = function() {
	this.index--;
	this.move();
}

Carousel.prototype.move = function() {
	this.navLinks[this.oldIndex].removeClass(this.activeLinkClass);
	this.navLinks[this.index].addClass(this.activeLinkClass);
	this.oldIndex = this.index;
	this.container.css('background-position', (this.index * 3) + '% 100%');
	this.chapterContainer.css('transform', 'translateX(-' + (this.index * (100 / this.chapter.length)) + '%');
}



// ========================================================
// Navigation 
// ========================================================
var Navigation = function(index, el, root) {
	this.el = $(el);
	this.root = root;
	this.index = index;
	this.el.on('click', this.getIndex.bind(this));

	return this.el;
}

Navigation.prototype.getIndex = function() {
	this.root.index = this.index;
	this.root.move();
}



// ========================================================
// Scatterplot 
// ========================================================
var ScatterPlot = function() {
	// Set margin, width and height of scatterplot
	var margin = {top: 30, right: 70, bottom: 50, left: 70},
		width = 800 - margin.left - margin.right,
		height = 550 - margin.top - margin.bottom;

	// Set ranges
	var xScale = d3.scale.linear().range([0, width]),
		yScale = d3.scale.linear().range([height, 0]);

	// Define axes
	var xAxis = d3.svg.axis()
						.scale(xScale)
						.orient("bottom");
	var yAxis = d3.svg.axis()
						.scale(yScale)
						.orient("left");

	// Set svg
	var svg = d3.select("#container-scatterplot")
					.append("svg")
	    				.attr("width", width + margin.left + margin.right)
	    				.attr("height", height + margin.top + margin.bottom)
  						.append("g")
    						.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Get the data
    d3.json("data/events.json", drawScatterplot)

    function drawScatterplot(error, data) {
		if (error) throw console.log(error);

    	formatData();

    	var radioRadius = d3.selectAll(".input-radius");
    	var checkboxesEl = d3.selectAll(".category-checkbox");

    	var xExtent = d3.extent(data, function(d){ return d.startTime; });
    	var yExtentChecked = d3.extent(data, function(d){ return d.smartphoneCheck; });

    	// Add eventlistener to checkboxes
    	for (var i = 0; i < checkboxesEl[0].length; i++) {
    		checkboxesEl[0][i].addEventListener('change', function(){
    			update();
    		});
    	}

    	// Add eventlistener to radiobuttons
    	for (var i = 0; i < radioRadius[0].length; i++) {
    		radioRadius[0][i].addEventListener('change', function(){
    			update();
    		});
    	}


    	// Set domain
  		xScale.domain(xExtent);
  		yScale.domain([1, 10]);

  		// Set right amount of ticks
  		xAxis.ticks((xExtent[1] - xExtent [0]) / 2);

  		// Draw x axis
  		svg.append("g")
	      	.attr("class", "x-axis axis")
	      	.attr("transform", "translate(0," + height + ")")
      		.call(xAxis)
      		.append("text")
		      .classed("label", true)
		      .attr("y", 40)
		      .attr("x", 40)
		      .text("UUR VAN DE DAG");;
      	// Draw y axis
      	svg.append("g")
      		.attr("class", "y-axis axis")
      		.call(yAxis)
      		.append("text")
		      .classed("label", true)
		      .attr("transform", "rotate(-90)")
		      .attr("y", -30)
		      .attr("x", -height)
		      .text("GEMOEDSTOESTAND");

      	update();

      	function update() {

      		var subset = getSubset();

      		var checkedRadius = getCheckedRadius();

      		// Set circle
      		var circle = svg.selectAll(".data-point").data(subset);

      		// Append a circle for every data point without a circle
      		circle.enter()
	      			.append("circle");
	      	
	      	// Remove every circle without data
	      	circle.exit()
	      			.remove();

	      	// Set specs for every circle
	      	circle.classed("data-point", true)
	      			.attr("r", function(d) { return getRadiusValue(d, checkedRadius); })
	      			.attr("cx", function(d) { return xScale(d.startTime); })
	      			.attr("cy", function(d) { return yScale(d.mood); })
	      			.style("fill", function(d) {
	      				switch(d.category) {
	      					case "vrienden":
	      						return '#d392a3'
	      						break;
	      					case "relatie":
	      						return '#9a4f66'
	      						break;
	      					case "sport":
	      						return '#698dc8'
	      						break;
	      					case "school":
	      						return '#D16B6B'
	      						break;
	      					case "familie":
	      						return '#2a3f6c'
	      						break;
	      				default:
	      					return 'red'
	      				}
	      			})
	      			.style("opacity", 0.75)
	      			.on("mouseover", tooltip)
	      			.on("mouseout", tooltip);
      	}

      	function tooltip(d) {
      		var tooltip = d3.select('.tooltip-scatter');

      		if (tooltip.classed('active-tooltip')) {
      			tooltip.classed('active-tooltip', false)	
      		} else {
      			tooltip.classed('active-tooltip', true)
						.html("<p class='tooltip-text'><span>Wat? </span> " + d.event + "</p> \
							<p class='tooltip-text'><span>Waar? </span> " + d.location + "</p> \
	      						<p class='tooltip-text'><span>Wie? </span> " + d.persons + "</p>")
      		}
      	}

      	function getSubset() {
      		// Push selected categories to array so they can be filtered
      		var categories = [];

      		for (var i = 0; i < checkboxesEl[0].length; i++) {
      			if (checkboxesEl[0][i].checked) {
      				categories.push(checkboxesEl[0][i].value)
      			}
      		}

      		// Filter data with the selected categories
      		var subset = data.filter(function(d){
      			for (var i = 0; i < categories.length; i++) {
      				if(d.category == categories[i]){
						return d.category = categories[i];
      				}
      			}
      		}); 

      		return subset
      	}

      	function getCheckedRadius() {
  			var checked = [];

  			for (var i = 0; i < radioRadius[0].length; i++) {
      			if (radioRadius[0][i].checked) {
      				checked.push(radioRadius[0][i].value)
      			}
  			}	
  			return checked[0]
      	}

      	function getRadiusValue(d, el) {
      		if (el == 'd.totalPeople') {
      				var value =  Math.sqrt(d.totalPeople) * 12;
      			} else if (el == 'd.duration') {
      				var value =  Math.sqrt(d.duration) * 20;
      			}	

      		return value
      	}

      	function formatData() {
			data.forEach(function(d){
				var startHour = d.startTime.split(':');
				d.startTime = startHour[0];	

				var endHour = d.endTime.split(':');
				d.endTime = endHour[0];	

				d.duration = d.endTime - d.startTime;
			});
   		}
    }
}

// ========================================================
// Location map 
// ========================================================
var LocationMap = function() {
	// Set margin, width and height of map
	var margin = {top: 30, right: 70, bottom: 50, left: 70},
		width = 800 - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom;

	// Set svg
	var svg = d3.select("#container-location-map")
					.append("svg")
	    				.attr("width", width + margin.left + margin.right)
	    				.attr("height", height + margin.top + margin.bottom)
  						.append("g")
    						.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// Get the data
    d3.json("data/nl.json", drawMap)

    function drawMap(error, nl) {
		if (error) throw console.log(error);

		var subunits = topojson.feature(nl, nl.objects.subunits);

		var projection = d3.geo.mercator()
		    .center([0, 52.2])
		    .rotate([-4.8, 0])
		    .scale(6000)
		    .translate([width / 2, height / 2]);
	    							
		var path = d3.geo.path()
    						.projection(projection);

    	svg.append("path")
		    .datum(subunits)
		    .attr("d", path)
		    .classed('map-path', true);

		svg.append("path")
		    .datum(topojson.feature(nl, nl.objects.places))
		    .attr("d", path)
		    .attr("class", "place");

		svg.selectAll(".place-label")
		    .data(topojson.feature(nl, nl.objects.places).features)
		  	.enter().append("text")
		    .attr("class", "place-label")
		    .attr("transform", function(d) { return "translate(" + projection(d.geometry.coordinates) + ")"; })
		    .attr("dy", "1em")
		    .text(function(d) { return d.properties.name; });

		// add circles to svg
    	svg.selectAll("circle")
			.data(topojson.feature(nl, nl.objects.places).features)
			.enter()
			.append("circle")
			.attr("cx", function (d) { return projection(d.geometry.coordinates)[0]; })
			.attr("cy", function (d) { return projection(d.geometry.coordinates)[1]; })
			.attr("r", "8px")
			.attr("fill", "red")
    }
}



// ========================================================
// Per hour 
// ========================================================
var PerHour = function() {
	var btnPrevDate = d3.select('.btn-prev');
	var btnNextDate = d3.select('.btn-next');
	var dateEl = d3.select('.js-date');
	var dayIndex = 0;
	var oldDayIndex = dayIndex;

	// ========================================================
	// SVG
	// ========================================================
	var margin = {top: 40, right: 70, bottom: 40, left: 70},
	width = 1250 - margin.left - margin.right,
	height = 625 - margin.top - margin.bottom;

	var svg = d3.select("#container-donut-chart")
					.append("svg")
					    .attr("width", width)
					    .attr("height", height);


	// ========================================================
	// Bar Chart
	// ========================================================
	var barChartWidth = width - (width*.6),
		barChartHeight = (height/2) - 60;

	// Set ranges
	var xBarScale = d3.scale.ordinal().rangeRoundBands([0, barChartWidth], .15);
	var yBarScale = d3.scale.linear().range([barChartHeight, 0]);

	// Define axes
	var xBarAxis = d3.svg.axis()
					.scale(xBarScale)
					.orient("bottom")

	var yBarAxis = d3.svg.axis()
					.scale(yBarScale)
					.orient("left");

	var barGroup = svg.append("g")
						.attr("class", "group-bar-chart")
						.attr("transform", "translate(" + (width*.6) + "," + (margin.top + (height/2)) + ")");


	// ========================================================
	// Line Chart
	// ========================================================
	var lineChartWidth = width - (width*.6),
		lineChartHeight = (height/2) - 50;

	// Set ranges
	var xLineScale = d3.scale.linear().range([0, lineChartWidth]);
	var yLineScale = d3.scale.linear().range([lineChartHeight, 0]);

	// Define axes
	var xLineAxis = d3.svg.axis()
					.scale(xLineScale)
					.orient("bottom")

	var yLineAxis = d3.svg.axis()
					.scale(yLineScale)
					.orient("left");

	// Define line
	var valueLine = d3.svg.line()
							.interpolate("basis")
							.x(function(d) { return xLineScale(d.hour); })
							.y(function(d) { return yLineScale(d.mood); })

	var lineGroup = svg.append("g")
						.attr("class", "group-line-chart")
						.attr("transform", "translate(" + (width*.6) +  "," + margin.top + ")");



	// ========================================================
	// Donut Chart
	// ========================================================
	// Set margin, width and height of donut chart
	var radius = (Math.min(width, height) / 2) - 40,
    	transformDonut = ((width / 4) + 30 ) + "," + height / 2;

	var donutAxis = svg.append("g")
			        .attr("transform", "translate(" + transformDonut + ")")
			        .attr("class", "axis donut-axis")
			        .selectAll("g")
			        .data(d3.range(0, 360, 90))
			        .enter()
				        .append("g")
				        	.attr("class", "axis-line")
				        	.attr("transform", function(d) { return "rotate(" + d + ")" })
					      	.append("line")
	      						.attr("x2", radius);

	var donutLabelScale = d3.scale.ordinal()
    							.range(["06:00u", "12:00u", "18:00u", "00:00u"]);

	var donutLabel = d3.selectAll(".axis-line")
						.append("text")
							.attr("y", ".25em")
							// .attr("transform", function(d) { return "rotate(" + d + ")" })
							.attr("x", radius + 5)
							.text(function(i){ return donutLabelScale(i) });

	d3.json("data/donutdata.json", setCharts);

	function setCharts(d) {
		btnNextDate.on('click', function() { nextDate(d) });
		btnPrevDate.on('click', function() { prevDate(d) });

		// ========================================================
		// Bar Chart
		// ========================================================
		xBarScale.domain(d.map(function(d) { return d.date; }));
		yBarScale.domain([(d3.min(d, function(d, i) { return d.smartphoneUse.checked; }) - 10), d3.max(d, function(d, i) { return d.smartphoneUse.checked; })]);

		yBarAxis.ticks(6);

		barGroup.append("g")
					.attr("class", "x-axis axis axis-bar-chart")
					.attr("transform", "translate(0," + barChartHeight + ")")
  					.call(xBarAxis);

  		barGroup.append("g")
					.attr("class", "y-axis axis axis-bar-chart")
  					.call(yBarAxis)
  					.append("text")
				      .classed("label label-bar", true)
				      .attr("transform", "rotate(-90)")
				      .attr("y", -35)
				      .attr("x", -barChartHeight)
				      .text("TOTAL PHONE CHECKS");;;

  		barGroup.selectAll("bar")
			      .data(d)
				    .enter().append("rect")
				      .attr("class", "bar-chart-rect")
				      .attr("x", function(d) { return xBarScale(d.date); })
				      .attr("width", xBarScale.rangeBand())
				      .attr("y", function(d) { return yBarScale(d.smartphoneUse.checked); })
				      .attr("height", function(d) { return barChartHeight - yBarScale(d.smartphoneUse.checked); });

		var activeBar = d3.selectAll(".bar-chart-rect");
		$(activeBar[0][dayIndex]).addClass("active-bar");


		updateCharts(d);

		function updateCharts(d) {
			var arcGroupEl = $(".arc-group");
			var axisLine = $(".axis-line-chart");
			var lineChartLineEl = $(".line-chart-line");
			arcGroupEl.remove();
			axisLine.remove();
			lineChartLineEl.remove();

			var subsetDay = d[dayIndex];
			formatData(subsetDay);

			dateEl.text(subsetDay.date);

			var subsetLineChart = subsetDay.mood;
			var subsetDonut = getSubsetDonut(subsetDay);


			// ========================================================
			// Line Chart
			// ========================================================
			xLineScale.domain(d3.extent(subsetLineChart, function(d) { return d.hour; }));
	    	yLineScale.domain([1, 10]);

	    	xLineAxis.ticks(subsetLineChart.length);

			// draw x axis
			lineGroup.append("g")
			        .attr("class", "x-axis axis axis-line-chart")
			        .attr("transform", "translate(0," + lineChartHeight + ")")
			        .call(xLineAxis)
			        .append("text")
				      .classed("label label-line", true)
				      .attr("y", 35)
				      .attr("x", 35)
				      .text("UUR VAN DE DAG");;
			// draw y axis
		    lineGroup.append("g")
			        .attr("class", "y-axis axis axis-line-chart")
			        .call(yLineAxis)
			        .append("text")
				      .classed("label label-line", true)
				      .attr("transform", "rotate(-90)")
				      .attr("y", -35)
				      .attr("x", -lineChartHeight)
				      .text("GEMOEDSTOESTAND");

			lineGroup.append("path")
		       			.datum(subsetLineChart)
					      .attr("class", "line line-chart-line")
					      .attr("d", valueLine)
					      .attr("fill", "none");

			// ========================================================
			// Donut Chart
			// ========================================================
			for (var i = 0; i < subsetDonut.length; i++) {
			   drawDonutChart(subsetDonut[i].values, i);
			};
		}

		function nextDate(d) {
			dayIndex++;
			setActiveBar();
			updateCharts(d);
		}

		function prevDate(d) {
			dayIndex--;
			setActiveBar();
			updateCharts(d);
		}

		function setActiveBar() {
			var activeBar = d3.selectAll(".bar-chart-rect");
			$(activeBar[0][oldDayIndex]).removeClass("active-bar");
			$(activeBar[0][dayIndex]).addClass("active-bar");
			oldDayIndex = dayIndex;
		}

	}


	function drawDonutChart(d, index) {
		var g = svg.append("g")
					.attr("class", "arc-group")
		          	.attr("transform", "translate(" + transformDonut + ")");

		var arc = d3.svg.arc()
					    .outerRadius((radius*1.8) * ((index+1)/10))
					    .innerRadius((radius*1.8)* ((index+1)/10) - 30);

		var pie = d3.layout.pie()
		                  .sort(null)
		                  .value(function(d) { return d.duration; });

		var dataArc = g.selectAll("path")
				          .data(pie(d));

		dataArc.enter()
				.append("path")
				.attr("class", function(d){ return getArcStatus(d);})
				.attr("d", arc);
	} 

	function getArcStatus(d) {
		if(d.data.status) {
			return d.data.category + "-session arc";
		} else {
			return "alone-session arc";
		}
	}

	function getSubsetDonut(d) {
		var subset = d.activities;
		return subset;
	}

	function formatData(d) {
		d.activities.forEach(function(d){
			var category = d.category;

			d.values.forEach(function(d){
				var startHour = d.timeStart.split(':');
				d.timeStart = startHour[0];	

				var endHour = d.timeEnd.split(':');
				d.timeEnd = endHour[0];	

				d.duration = d.timeEnd - d.timeStart;
			
				d.category = category;
			});
		});
	}
}










