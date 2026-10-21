import { Bar, BarChart, LabelList, Rectangle, XAxis, YAxis } from 'recharts';
import type { BarShapeProps } from 'recharts';

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import { truncateAxisLabel } from '@/lib/analytics-view';
import type { ChartBar } from '@/lib/analytics-view';

const ROW_HEIGHT = 44;
const BAR_SIZE = 28;
const BAR_RADIUS = 4;
const AXIS_LABEL_WIDTH = 140;
const VALUE_LABEL_SPACE = 72;
const HIGHLIGHT_COLOR = 'var(--color-sessions)';
const MUTED_COLOR = 'var(--muted-foreground)';

const chartConfig = {
  sessions: { label: 'Students', color: 'var(--primary)' },
} satisfies ChartConfig;

type HorizontalBarChartProps = {
  readonly bars: readonly ChartBar[];
};

export function HorizontalBarChart({ bars }: HorizontalBarChartProps) {
  function renderBarShape(shapeProps: BarShapeProps) {
    const fill = bars[shapeProps.index].isHighlighted ? HIGHLIGHT_COLOR : MUTED_COLOR;
    return <Rectangle {...shapeProps} fill={fill} />;
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto w-full"
      style={{ height: bars.length * ROW_HEIGHT }}
    >
      <BarChart data={[...bars]} layout="vertical" margin={{ right: VALUE_LABEL_SPACE }}>
        <XAxis type="number" dataKey="sessions" hide />
        <YAxis
          type="category"
          dataKey="label"
          width={AXIS_LABEL_WIDTH}
          tickLine={false}
          axisLine={false}
          tickFormatter={truncateAxisLabel}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
        <Bar dataKey="sessions" barSize={BAR_SIZE} radius={BAR_RADIUS} shape={renderBarShape}>
          <LabelList dataKey="valueLabel" position="right" className="fill-foreground" />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
