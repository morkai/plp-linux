// Part of <https://miracle.systems/p/walkner-xiconf> licensed under <CC BY-NC-SA 4.0>

define(["underscore","highcharts","./i18n","./time","./broker"],function(t, o, e, i, r){"use strict";function s(){o.setOptions({lang:{contextButtonTitle:e("core","highcharts:contextButtonTitle"),downloadJPEG:e("core","highcharts:downloadJPEG"),downloadPDF:e("core","highcharts:downloadPDF"),downloadPNG:e("core","highcharts:downloadPNG"),downloadSVG:e("core","highcharts:downloadSVG"),printChart:e("core","highcharts:printChart"),noData:e("core","highcharts:noData"),resetZoom:e("core","highcharts:resetZoom"),resetZoomTitle:e("core","highcharts:resetZoomTitle"),loading:e("core","highcharts:loading"),decimalPoint:e("core","highcharts:decimalPoint"),thousandsSep:e("core","highcharts:thousandsSep"),shortMonths:e("core","highcharts:shortMonths").split("_"),weekdays:e("core","highcharts:weekdays").split("_"),months:e("core","highcharts:months").split("_")},exporting:{buttons:{contextButton:{menuItems:a()}}}})}function a(){return[{text:e("core","highcharts:downloadPDF"),onclick:t.partial(n,"application/pdf")},{text:e("core","highcharts:downloadPNG"),onclick:t.partial(n,"image/png")}]}function n(t){var o={dataLabels:{enabled:!0,formatter:h}};this.exportChart({type:t},{plotOptions:{line:o,column:o,area:o}})}function h(){if(null===this.y||0===this.y)return"";if("column"!==this.series.type&&this.series.points.length>10){if(this.seriesIndex%2===0&&this.pointIndex%2!==0)return"";if(this.seriesIndex%2!==0&&this.pointIndex%2===0)return""}var t=o.numberFormat(this.y,1);return/.0$/.test(t)&&(t=o.numberFormat(this.y,0)),t}var l=o.Tooltip.prototype.getPosition;return o.Tooltip.prototype.getPosition=function(t,o,e){var i=l.call(this,t,o,e);return i.y<this.chart.plotTop+5&&(i.y=this.chart.plotTop+5),i},t.extend(o.Axis.prototype.defaultYAxisOptions,{maxPadding:.01,minPadding:.01}),o.getDefaultMenuItems=a,o.formatTableTooltip=function(t,i){var r=e("core","highcharts:decimalPoint"),s=t?'<b class="highcharts-tooltip-header">'+t+"</b>":"";return s+='<table class="highcharts-tooltip">',i.forEach(function(t){var e=o.numberFormat(t.value,t.decimals).split(r),i=e[0],a=2===e.length?r+e[1]:"",n=t.prefix||"",h=t.suffix||"";s+='<tr><td class="highcharts-tooltip-label"><span style="color: '+t.color+'">●</span> '+t.name+':</td><td class="highcharts-tooltip-integer">'+n+i+'</td><td class="highcharts-tooltip-fraction">'+a+'</td><td class="highcharts-tooltip-suffix">'+h+"</td></tr>"}),s+="</table>"},o.setOptions({global:{timezoneOffset:i.getMoment().zone(),useUTC:!1},chart:{zoomType:"x",animation:!1,resetZoomButton:{theme:{style:{top:"display: none"}}}},plotOptions:{series:{animation:!1}},credits:{enabled:!1},legend:{borderRadius:0,borderWidth:1,borderColor:"#E3E3E3",backgroundColor:"#F5F5F5",itemStyle:{fontSize:"10px",fontWeight:"normal",fontFamily:"Arial, sans-serif"}},tooltip:{borderColor:"#000",borderWidth:1,borderRadius:0,backgroundColor:"rgba(255,255,255,.85)",shadow:!1,shape:"square",hideDelay:250,useHTML:!0,displayHeader:!0,formatter:function(){var t,e=[],i=(this.point||this.points[0]).series.chart.tooltip.options.headerFormatter;t="function"==typeof i?i(this):this.key?this.key:this.points?this.points[0].key:this.series?this.series.name:this.x;var r=this.points||[{point:this.point,series:this.point.series}];return r.forEach(function(t){t=t.point;var o=t.series.tooltipOptions;e.push({color:t.color||t.series.color,name:t.series.name,prefix:o.valuePrefix,suffix:o.valueSuffix,decimals:o.valueDecimals,value:t.y})}),o.formatTableTooltip(t,e)}},exporting:{chartOptions:{chart:{spacing:[10,10,10,10]}},scale:1,sourceWidth:848,sourceHeight:600,url:"/reports;export"},loading:{labelStyle:{top:"20%"}}}),e.has("core","highcharts:decimalPoint")?s():r.subscribe("i18n.registered",s).setLimit(1).setFilter(function(t){return"core"===t.domain}),r.subscribe("i18n.reloaded",s),o});