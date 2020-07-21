/**
 * @license Highcharts JS v7.0.0 (2018-12-11)
 * Plugin for displaying a message when there is no data visible in chart.
 *
 * (c) 2010-2018 Highsoft AS
 * Author: Oystein Moseng
 *
 * License: www.highcharts.com/license
 */

/* *
		 *
		 *  Plugin for displaying a message when there is no data visible in chart.
		 *
		 *  (c) 2010-2018 Highsoft AS
		 *
		 *  Author: Oystein Moseng
		 *
		 *  License: www.highcharts.com/license
		 *
		 * */

!function(t){"object"==typeof module&&module.exports?module.exports=t:"function"==typeof define&&define.amd?define([],function(){return t}):t("undefined"!=typeof Highcharts?Highcharts:void 0)}(function(t){!function(t){var a=t.seriesTypes,e=t.Chart.prototype,n=t.getOptions(),o=t.extend;o(n.lang,{noData:"No data to display"}),n.noData={position:{x:0,y:0,align:"center",verticalAlign:"middle"},style:{fontWeight:"bold",fontSize:"12px",color:"#666666"}},["bubble","gauge","heatmap","pie","sankey","treemap","waterfall"].forEach(function(t){a[t]&&(a[t].prototype.hasData=function(){return!!this.points.length})}),t.Series.prototype.hasData=function(){return this.visible&&void 0!==this.dataMax&&void 0!==this.dataMin},e.showNoData=function(t){var a=this,e=a.options,n=t||e&&e.lang.noData,i=e&&e.noData;!a.noDataLabel&&a.renderer&&(a.noDataLabel=a.renderer.label(n,0,0,null,null,null,i.useHTML,null,"no-data"),a.styledMode||a.noDataLabel.attr(i.attr).css(i.style),a.noDataLabel.add(),a.noDataLabel.align(o(a.noDataLabel.getBBox(),i.position),!1,"plotBox"))},e.hideNoData=function(){var t=this;t.noDataLabel&&(t.noDataLabel=t.noDataLabel.destroy())},e.hasData=function(){for(var t=this,a=t.series||[],e=a.length;e--;)if(a[e].hasData()&&!a[e].options.isInternal)return!0;return t.loadingShown},t.addEvent(t.Chart,"render",function(){this.hasData()?this.hideNoData():this.showNoData()})}(t)});