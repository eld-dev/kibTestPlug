import moment from 'moment';
import chrome from 'ui/chrome';
import uiModules from 'ui/modules';
import uiRoutes from 'ui/routes';

import 'ui/autoload/styles';
import './less/main.less';
import template from './templates/index.html';
import d3 from 'd3';
import angular from 'angular';

uiRoutes.enable();
uiRoutes
.when('/', {
  template,
  resolve: {
    currentTime($http) {
      return $http.get('../api/test/example').then(function (resp) {
        return resp.data.time;
      });
    }
  }
});

uiModules
.get('app/test', [])
.controller('testHelloWorld', function ($scope, $route, $interval) {
	$scope.title = 'Test';
	$scope.description = 'An awesome Kibana plugin';

	const currentTime = moment($route.current.locals.currentTime);
	$scope.currentTime = currentTime.format('HH:mm:ss');
	const unsubscribe = $interval(function () {
	$scope.currentTime = currentTime.add(1, 'second').format('HH:mm:ss');
	}, 1000);
	$scope.$watch('$destroy', unsubscribe);

	$scope.graphs = d3.range(5).map(function(i){
        return d3.range(10).map(function() {
            return {
                id: ~~(Math.random() * 3),
                index: i,
                size: ~~(Math.random() * (12 - 4) + 4),
                party: ~~(Math.random() * 2)
            }
        })
    })
});

uiModules.get('app/test').directive('drawKey', function ($document) {
	function link(scope, el) {
		console.log(scope)

        var el = el[0],
            width = el.clientWidth,
            height = el.clientHeight,
            votefoci = [
                {x: width / 2, y: height / 10},
                {x: width / 10, y: 2 * height / 3 },
                {x: width, y: 2 * height / 3}
            ];


        var fill = d3.scale.linear()
            .range(["#00aff3", "#d8171e"]);

        var nodes = scope.data;

        var force = d3.layout.force()
            .nodes(nodes)
            .size([width, height])
            .on("tick", tick)
            .start();

        var svg = d3.select(el).append("svg")
            .attr("width", width)
            .attr("height", height);

        var node = svg.selectAll(".node")
            .data(nodes)
          .enter().append("circle")
            .attr("class", "node")
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })
            .attr("r", function(d) { return d.size; })
            .style("fill", function(d, i) { return fill(d.party); })
            .style("stroke", function(d, i) { return d3.rgb(fill(d.party)).darker(2); })
            .call(force.drag);

        svg.style("opacity", 1e-6)
          .transition()
            .duration(1000)
            .style("opacity", 1);

        function tick(e) {

          // Push different nodes in different directions for clustering.
          var k = .1 * e.alpha;
          nodes.forEach(function(o, i) {
              o.y += (votefoci[o.id].y - o.y) * k;
              o.x += (votefoci[o.id].x - o.x) * k;
          });

          node
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
        }
    }
    return {
        link: link,
        restrict: 'E',
        scope: { data: '='}
    }
});