import type { EChartsOption } from 'echarts';

export const steampunkChartColors = [
  '#D4AF37',
  '#A0522D',
  '#6B8E23',
  '#CD5C5C',
  '#708090',
  '#B8860B',
  '#8B4513',
  '#DAA520',
];

export const getSteampunkAxisStyle = () => ({
  axisLine: {
    lineStyle: {
      color: '#8B4513',
      width: 2,
    },
  },
  axisLabel: {
    color: '#8B8B8B',
    fontSize: 12,
  },
  splitLine: {
    lineStyle: {
      color: 'rgba(139, 69, 19, 0.2)',
      type: 'dashed' as const,
    },
  },
});

export const getSteampunkTooltipStyle = (): EChartsOption['tooltip'] => ({
  backgroundColor: 'rgba(26, 26, 26, 0.95)',
  borderColor: '#D4AF37',
  borderWidth: 2,
  textStyle: {
    color: '#F5E6D3',
    fontFamily: "'Segoe UI', 'Microsoft YaHei', sans-serif",
  },
  extraCssText: 'box-shadow: 0 0 15px rgba(212, 175, 55, 0.3); border-radius: 4px;',
});

export const getSteampunkLegendStyle = (): EChartsOption['legend'] => ({
  textStyle: {
    color: '#F5E6D3',
    fontSize: 12,
  },
  itemGap: 16,
  icon: 'circle',
});

export const getSteampunkGridStyle = (): EChartsOption['grid'] => ({
  left: '3%',
  right: '4%',
  bottom: '3%',
  top: '15%',
  containLabel: true,
});

export const getLineChartOption = (
  xData: string[],
  revenueData: number[],
  orderData: number[],
  title?: string,
  showDrillDownHint = false
): EChartsOption => ({
  color: steampunkChartColors,
  tooltip: {
    ...getSteampunkTooltipStyle(),
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      crossStyle: {
        color: '#D4AF37',
      },
      lineStyle: {
        color: 'rgba(212, 175, 55, 0.5)',
        width: 1,
      },
    },
    formatter: (params: unknown) => {
      const ps = params as Array<{ axisValue: string; seriesName: string; value: number; marker: string }>;
      let html = `<div style="font-weight:bold;color:#D4AF37;margin-bottom:6px;">${ps[0]?.axisValue || ''}</div>`;
      ps.forEach((p) => {
        const unit = p.seriesName.includes('营收') ? ' ¥' : ' 单';
        html += `<div style="margin:4px 0;">${p.marker} ${p.seriesName}: <b style="color:#FFD700;">${p.value?.toLocaleString()}${unit}</b></div>`;
      });
      if (showDrillDownHint) {
        html += `<div style="margin-top:8px;padding-top:6px;border-top:1px solid rgba(139,69,19,0.5);color:#8B8B8B;font-size:11px;">💡 点击数据点查看明细</div>`;
      }
      return html;
    },
  },
  legend: {
    ...getSteampunkLegendStyle(),
    top: 0,
    right: 0,
  },
  grid: getSteampunkGridStyle(),
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: xData,
    ...getSteampunkAxisStyle(),
  },
  yAxis: [
    {
      type: 'value',
      name: '营收(¥)',
      nameTextStyle: {
        color: '#8B8B8B',
        fontSize: 11,
      },
      ...getSteampunkAxisStyle(),
    },
    {
      type: 'value',
      name: '订单(单)',
      nameTextStyle: {
        color: '#8B8B8B',
        fontSize: 11,
      },
      ...getSteampunkAxisStyle(),
    },
  ],
  series: [
    {
      name: '营收金额',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: {
        width: 3,
        color: '#D4AF37',
        shadowColor: 'rgba(212, 175, 55, 0.5)',
        shadowBlur: 10,
      },
      itemStyle: {
        color: '#D4AF37',
        borderColor: '#FFD700',
        borderWidth: 2,
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(212, 175, 55, 0.35)' },
            { offset: 1, color: 'rgba(212, 175, 55, 0.02)' },
          ],
        },
      },
      data: revenueData,
      yAxisIndex: 0,
    },
    {
      name: '维修单数',
      type: 'line',
      smooth: true,
      symbol: 'rect',
      symbolSize: 7,
      lineStyle: {
        width: 2,
        color: '#6B8E23',
        type: 'dashed',
      },
      itemStyle: {
        color: '#6B8E23',
        borderColor: '#9ACD32',
        borderWidth: 1,
      },
      data: orderData,
      yAxisIndex: 1,
    },
  ],
});

export const getPieChartOption = (
  data: Array<{ name: string; value: number }>,
  centerTitle?: string
): EChartsOption => ({
  color: steampunkChartColors,
  tooltip: {
    ...getSteampunkTooltipStyle(),
    trigger: 'item',
    formatter: (params: unknown) => {
      const p = params as { name: string; value: number; percent: number; marker: string };
      return `<div style="padding:4px;">
        <div style="font-weight:bold;color:#D4AF37;margin-bottom:6px;">${p.name}</div>
        <div>${p.marker} 数量: <b style="color:#FFD700;">${p.value}</b></div>
        <div>占比: <b style="color:#FFD700;">${p.percent}%</b></div>
      </div>`;
    },
  },
  legend: {
    ...getSteampunkLegendStyle(),
    orient: 'vertical',
    left: 'left',
    top: 'center',
  },
  series: [
    {
      name: centerTitle || '占比',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['62%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderColor: '#1A1A1A',
        borderWidth: 3,
        borderRadius: 4,
      },
      label: {
        show: true,
        color: '#F5E6D3',
        formatter: '{b}\n{d}%',
        fontSize: 12,
      },
      labelLine: {
        lineStyle: {
          color: '#8B4513',
        },
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 'bold',
          color: '#FFD700',
        },
        itemStyle: {
          shadowBlur: 20,
          shadowColor: 'rgba(212, 175, 55, 0.6)',
        },
        scale: true,
        scaleSize: 8,
      },
      data,
    },
  ],
});

export const getBarChartOption = (
  xData: string[],
  seriesData: Array<{ name: string; data: number[] }>
): EChartsOption => ({
  color: steampunkChartColors,
  tooltip: {
    ...getSteampunkTooltipStyle(),
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
      shadowStyle: {
        color: 'rgba(212, 175, 55, 0.1)',
      },
    },
  },
  legend: {
    ...getSteampunkLegendStyle(),
    top: 0,
    right: 0,
  },
  grid: getSteampunkGridStyle(),
  xAxis: {
    type: 'category',
    data: xData,
    ...getSteampunkAxisStyle(),
    axisLabel: {
      ...getSteampunkAxisStyle().axisLabel,
      interval: 0,
      rotate: 0,
    },
  },
  yAxis: {
    type: 'value',
    ...getSteampunkAxisStyle(),
  },
  series: seriesData.map((s, idx) => ({
    name: s.name,
    type: 'bar',
    barWidth: '50%',
    barMaxWidth: 40,
    itemStyle: {
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          { offset: 0, color: steampunkChartColors[idx % steampunkChartColors.length] },
          { offset: 1, color: `${steampunkChartColors[idx % steampunkChartColors.length]}66` },
        ],
      },
      borderRadius: [4, 4, 0, 0],
      borderColor: steampunkChartColors[idx % steampunkChartColors.length],
      borderWidth: 1,
    },
    emphasis: {
      itemStyle: {
        shadowBlur: 15,
        shadowColor: 'rgba(212, 175, 55, 0.5)',
      },
    },
    label: {
      show: true,
      position: 'top',
      color: '#F5E6D3',
      fontSize: 11,
      fontFamily: "'Georgia', serif",
    },
    data: s.data,
  })),
});

export const getRadarChartOption = (
  indicators: Array<{ name: string; max: number }>,
  seriesData: Array<{ name: string; value: number[] }>
): EChartsOption => ({
  color: steampunkChartColors,
  tooltip: {
    ...getSteampunkTooltipStyle(),
    trigger: 'item',
  },
  legend: {
    ...getSteampunkLegendStyle(),
    top: 0,
  },
  radar: {
    center: ['50%', '55%'],
    radius: '65%',
    indicator: indicators,
    axisName: {
      color: '#F5E6D3',
      fontSize: 12,
    },
    splitLine: {
      lineStyle: {
        color: 'rgba(139, 69, 19, 0.6)',
      },
    },
    splitArea: {
      areaStyle: {
        color: ['rgba(212, 175, 55, 0.03)', 'rgba(212, 175, 55, 0.06)'],
      },
    },
    axisLine: {
      lineStyle: {
        color: '#8B4513',
      },
    },
  },
  series: [
    {
      type: 'radar',
      data: seriesData.map((s, idx) => ({
        name: s.name,
        value: s.value,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 2,
          color: steampunkChartColors[idx % steampunkChartColors.length],
        },
        itemStyle: {
          color: steampunkChartColors[idx % steampunkChartColors.length],
          borderColor: '#FFD700',
          borderWidth: 1,
        },
        areaStyle: {
          color: `${steampunkChartColors[idx % steampunkChartColors.length]}33`,
        },
      })),
    },
  ],
});

export const registerSteampunkTheme = () => {
  // 可以在此注册全局主题
};
