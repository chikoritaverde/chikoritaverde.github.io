(function() {
    document.addEventListener("DOMContentLoaded", function() {
        var dataSource = "data/Actual_cleaned.json",
            name = "Actual",
            self = this,
            width = window.innerWidth,
            height = window.innerHeight - 100,
            elementsToDisplay = 1000;

        $("input[name='data-source']").change(function(ev) {
            var val = ev.currentTarget.value;

            if (val == "actual") {
                dataSource = "data/Actual_cleaned.json";
                name = "Actual";
            } else if (val == "maxDepth") {
                dataSource = "data/DecisionTreeMetadata_MaxDepthForD3_cleaned.json";
                name = "Max Depth";
            } else if (val == "normalized") {
                dataSource = "data/DecisionTreeMetadata_NormalizedForD3_cleaned.json"
                name = "Normalized";
            }
            else if(val == "textTree"){
                dataSource = "data/DecisionTreeText_500features_cleaned.json"
                name = "Text Tree"
            }
            else if(val == "textNaiveBayes"){
                dataSource = "data/TextBernoulliNBforD3.json"
                name = "Text Naive Bayes"
            }

            loadDataSource(function(error, data) {
                if (error) {
                    console.error('An unexpected error occured', error);
                    return;
                }

                updateBubbleGraph(data);
            });
        });

        var svg = d3.select("body")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("class", "bubble");

        var bubble = d3.layout.pack()
            .sort(null)
            .size([width, height]);

        var loadDataSource = function(callback) {
            d3.json(dataSource, function(error, data) {
                callback(error, data)
            });
        };

        var displayBubbleGraph = function(data) {
            //we are only going to deal with 1000 elements
            var features = self.features.splice(750305, elementsToDisplay); //grab the first 1000 elements starting at index 750305

            data = data.splice(0, elementsToDisplay); //grab the first 1000 elements

            //let's get the longest review length
            var reviewLengthMax = 0,
                reviewLength;
            for (var i = 0, l = features.length; i < l; i++) {
                reviewLength = parseInt(features[i].reviewLength, 10);

                if (reviewLength > reviewLengthMax) {
                    reviewLengthMax = reviewLength;
                }
            }

            var children = data,
                root = {};

            root.name = name,
            root.children = children;

            for (var i = 0; i < root.children.length; i++) {
                root.children[i] = {
                    value: features[i].reviewLength/reviewLengthMax, //value is going to be a normalized reviewLengthMax
                    numFriends: features[i].numFriends,
                    useful: root.children[i],
                    id: i
                }
            }

            var node = svg.selectAll(".node")
              .data(bubble.nodes(root)
              .filter(function(d) { return !d.children; }))
              .enter().append("g")
              .attr("class", "node")
              .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

            node.append("title")
              .text(function(d) { return "Number of Friends: " + d.numFriends; });

            node.append("circle")
                .attr("id", function(d) { return "id-" + d.id; })
                .attr("class", function(d) { return "actual-" + d.useful; })
                .attr("r", function(d) { return d.r; })
                .style("fill", function(d) { 
                    if (d.useful) {
                        return (d3.rgb("#329222"));
                    }

                    return d3.rgb("#450232");
                });
        };

        var updateBubbleGraph = function(data) {
            //we are only going to deal with 1000 elements
            var features = self.features.splice(750305, elementsToDisplay); //grab the first 1000 elements starting at index 750305

            data = data.splice(0, elementsToDisplay); //grab the first 1000 elements

            for (var i = 0, l = data.length; i < l; i++) {
                var useful = data[i],
                    $el = $('#id-' + i),
                    attrClass = $el.attr('class'),
                    color, actual;

                if (attrClass == 'actual-1' && useful) {
                    color = '#329222'; //green
                } else if (attrClass == 'actual-0' && useful) {
                    color = '#213DDE'; //blue
                } else if (attrClass == 'actual-1' && !useful) {
                    color = '#DEA129'; //yellow
                } else if (attrClass == 'actual-0' && !useful) {
                    color = '#450232'; //purple
                }

                $el.css('fill', color);
            }
        };

        d3.csv("data/Features.csv", function(error, features) {
            self.features = features;

            if (error) {
                console.error('An unexpected error occured', error);
                return;
            }

            loadDataSource(function(error, data) {
                if (error) {
                    console.error('An unexpected error occured', error);
                    return;
                }

                displayBubbleGraph(data)
            });
        });

        d3.select(self.frameElement).style("height", height + "px");
    });
})();