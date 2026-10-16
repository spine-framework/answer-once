// CIL[BEGIN stable_id="~/.framework/src/components/ui/chart.tsx:use_client:directive" type="directive" identity="use_client" parent="~/.framework/src/components/ui/chart.tsx"]
// CIL[DOC-MACRO purpose="Mark this module as a client-side React component"]
// CIL[DOC-RESPONSIBILITY responsibility="Indicate the module must run in the browser"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/chart.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Next.js use client directive" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
"use client"
// CIL[DOC-VECTOR type="context" content="purpose='Mark this module as a client-side React component'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/chart.tsx:use_client:directive"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/chart.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/ui/chart.tsx"]
// CIL[DOC-MACRO purpose="Import dependencies for the chart component module"]
// CIL[DOC-RESPONSIBILITY responsibility="Load React, Recharts primitives, and the cn utility"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports React, Recharts, TooltipValueType, and cn" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="frontend-developers"]
import * as React from "react"
import * as RechartsPrimitive from "recharts"
import type { TooltipValueType } from "recharts"

import { cn } from "@/lib/utils"
// CIL[DOC-VECTOR type="context" content="purpose='Import dependencies for the chart component module'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/chart.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/chart.tsx:THEMES:constant" type="constant" identity="THEMES" parent="~/.framework/src/components/ui/chart.tsx"]
// CIL[DOC-MACRO purpose="Define CSS selector prefixes for light and dark themes"]
// CIL[DOC-RESPONSIBILITY responsibility="Map theme keys to CSS class prefixes"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/chart.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="{ light: "", dark: ".dark" }" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Object mapping light to empty and dark to .dark" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const THEMES = { light: "", dark: ".dark" } as const
// CIL[DOC-VECTOR type="context" content="purpose='Define CSS selector prefixes for light and dark themes'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/chart.tsx:THEMES:constant"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/chart.tsx:INITIAL_DIMENSION:constant" type="constant" identity="INITIAL_DIMENSION" parent="~/.framework/src/components/ui/chart.tsx"]
// CIL[DOC-MACRO purpose="Provide default dimensions for the responsive chart container"]
// CIL[DOC-RESPONSIBILITY responsibility="Supply fallback width and height before resize"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/chart.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="{ width: 320, height: 200 }" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Default width 320 and height 200 as const" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const INITIAL_DIMENSION = { width: 320, height: 200 } as const
// CIL[DOC-VECTOR type="context" content="purpose='Provide default dimensions for the responsive chart container'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/chart.tsx:INITIAL_DIMENSION:constant"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/chart.tsx:TooltipNameType:type" type="type" identity="TooltipNameType" parent="~/.framework/src/components/ui/chart.tsx"]
// CIL[DOC-MACRO purpose="Allow tooltip names to be numbers or strings"]
// CIL[DOC-RESPONSIBILITY responsibility="Type alias for tooltip label keys"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/chart.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="number | string" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Union of number and string" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
type TooltipNameType = number | string
// CIL[DOC-VECTOR type="context" content="purpose='Allow tooltip names to be numbers or strings'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/chart.tsx:TooltipNameType:type"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/chart.tsx:ChartConfig:type" type="type" identity="ChartConfig" parent="~/.framework/src/components/ui/chart.tsx"]
// CIL[DOC-MACRO purpose="Define the shape of chart color and label configuration"]
// CIL[DOC-RESPONSIBILITY responsibility="Type the mapping of data keys to labels, icons, and theme-aware colors"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/chart.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="ChartConfig type alias" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Record of key to label, icon, and exclusive color or theme map" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
>
// CIL[DOC-VECTOR type="context" content="purpose='Define the shape of chart color and label configuration'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/chart.tsx:ChartConfig:type"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/chart.tsx:ChartContextProps:type" type="type" identity="ChartContextProps" parent="~/.framework/src/components/ui/chart.tsx"]
// CIL[DOC-MACRO purpose="Type the chart context value"]
// CIL[DOC-RESPONSIBILITY responsibility="Carry the active ChartConfig down the tree"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/chart.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="{ config: ChartConfig }" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Object containing the chart config" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
type ChartContextProps = {
  config: ChartConfig
}
// CIL[DOC-VECTOR type="context" content="purpose='Type the chart context value'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/chart.tsx:ChartContextProps:type"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/chart.tsx:ChartContext:constant" type="constant" identity="ChartContext" parent="~/.framework/src/components/ui/chart.tsx"]
// CIL[DOC-MACRO purpose="Create a React context for chart configuration"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide ChartContext to container and child components"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/chart.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="React context" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="React.createContext with null default" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const ChartContext = React.createContext<ChartContextProps | null>(null)
// CIL[DOC-VECTOR type="context" content="purpose='Create a React context for chart configuration'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/chart.tsx:ChartContext:constant"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/chart.tsx:useChart:hook" type="hook" identity="useChart" parent="~/.framework/src/components/ui/chart.tsx"]
// CIL[DOC-MACRO purpose="Access the surrounding ChartContext value"]
// CIL[DOC-RESPONSIBILITY responsibility="Return chart config or throw if outside a container"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/chart.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="ChartConfig from context" errors="Error if context is null" side_effects="none"]
// CIL[DOC-MICRO logic_summary="useContext wrapper with missing-context guard" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}
// CIL[DOC-VECTOR type="context" content="purpose='Access the surrounding ChartContext value'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/chart.tsx:useChart:hook"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/chart.tsx:ChartContainer:component" type="component" identity="ChartContainer" parent="~/.framework/src/components/ui/chart.tsx"]
// CIL[DOC-MACRO purpose="Render a chart inside a styled responsive container"]
// CIL[DOC-RESPONSIBILITY responsibility="Generate a unique chart id, provide config context, and wrap Recharts ResponsiveContainer"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/chart.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="id, className, children, config, initialDimension, div props" outputs="JSX wrapping ResponsiveContainer" errors="" side_effects="sets ChartContext.Provider"]
// CIL[DOC-MICRO logic_summary="Computes chartId, renders Provider, div, ChartStyle, and ResponsiveContainer" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ChartContainer({
  id,
  className,
  children,
  config,
  initialDimension = INITIAL_DIMENSION,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"]
  initialDimension?: {
    width: number
    height: number
  }
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer
          initialDimension={initialDimension}
        >
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a chart inside a styled responsive container'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/chart.tsx:ChartContainer:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/chart.tsx:ChartStyle:component" type="component" identity="ChartStyle" parent="~/.framework/src/components/ui/chart.tsx"]
// CIL[DOC-MACRO purpose="Generate CSS custom properties for chart colors per theme"]
// CIL[DOC-RESPONSIBILITY responsibility="Inject a style tag mapping each config color to --color-* variables"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/chart.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="id, config" outputs="style element or null" errors="" side_effects="injects inline styles into DOM"]
// CIL[DOC-MICRO logic_summary="Filters color config, maps themes, and produces CSS variable rules" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme ?? config.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ??
      itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Generate CSS custom properties for chart colors per theme'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/chart.tsx:ChartStyle:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/chart.tsx:ChartTooltip:constant" type="constant" identity="ChartTooltip" parent="~/.framework/src/components/ui/chart.tsx"]
// CIL[DOC-MACRO purpose="Expose the Recharts Tooltip component under the Chart namespace"]
// CIL[DOC-RESPONSIBILITY responsibility="Re-export RechartsPrimitive.Tooltip"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/chart.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Tooltip component" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Alias to RechartsPrimitive.Tooltip" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const ChartTooltip = RechartsPrimitive.Tooltip
// CIL[DOC-VECTOR type="context" content="purpose='Expose the Recharts Tooltip component under the Chart namespace'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/chart.tsx:ChartTooltip:constant"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/chart.tsx:ChartTooltipContent:component" type="component" identity="ChartTooltipContent" parent="~/.framework/src/components/ui/chart.tsx"]
// CIL[DOC-MACRO purpose="Render a customized tooltip for Recharts charts"]
// CIL[DOC-RESPONSIBILITY responsibility="Format tooltip label, indicator, and payload values using chart config"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/chart.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="active, payload, className, indicator, hideLabel, hideIndicator, label, labelFormatter, labelClassName, formatter, color, nameKey, labelKey, Tooltip props, React" outputs="JSX tooltip or null" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Computes label from payload and config, renders dot/line/dashed indicators and values" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
  React.ComponentProps<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelKey?: string
  } & Omit<
    RechartsPrimitive.DefaultTooltipContentProps<
      TooltipValueType,
      TooltipNameType
    >,
    "accessibilityLayer"
  >) {
  const { config } = useChart()

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null
    }

    const [item] = payload
    const key = `${labelKey ?? item?.dataKey ?? item?.name ?? "value"}`
    const itemConfig = getPayloadConfigFromPayload(config, item, key)
    const value =
      !labelKey && typeof label === "string"
        ? (config[label]?.label ?? label)
        : itemConfig?.label

    if (labelFormatter) {
      return (
        <div className={cn("font-medium", labelClassName)}>
          {labelFormatter(value, payload)}
        </div>
      )
    }

    if (!value) {
      return null
    }

    return <div className={cn("font-medium", labelClassName)}>{value}</div>
  }, [
    label,
    labelFormatter,
    payload,
    hideLabel,
    labelClassName,
    config,
    labelKey,
  ])

  if (!active || !payload?.length) {
    return null
  }

  const nestLabel = payload.length === 1 && indicator !== "dot"

  return (
    <div
      className={cn(
        "grid min-w-32 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs/relaxed shadow-xl",
        className
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload
          .filter((item) => item.type !== "none")
          .map((item, index) => {
            const key = `${nameKey ?? item.name ?? item.dataKey ?? "value"}`
            const itemConfig = getPayloadConfigFromPayload(config, item, key)
            const indicatorColor = color ?? item.payload?.fill ?? item.color

            return (
              <div
                key={index}
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center"
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn(
                            "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
                            {
                              "h-2.5 w-2.5": indicator === "dot",
                              "w-1": indicator === "line",
                              "w-0 border-[1.5px] border-dashed bg-transparent":
                                indicator === "dashed",
                              "my-0.5": nestLabel && indicator === "dashed",
                            }
                          )}
                          style={
                            {
                              "--color-bg": indicatorColor,
                              "--color-border": indicatorColor,
                            } as React.CSSProperties
                          }
                        />
                      )
                    )}
                    <div
                      className={cn(
                        "flex flex-1 justify-between leading-none",
                        nestLabel ? "items-end" : "items-center"
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-muted-foreground">
                          {itemConfig?.label ?? item.name}
                        </span>
                      </div>
                      {item.value != null && (
                        <span className="font-mono font-medium text-foreground tabular-nums">
                          {typeof item.value === "number"
                            ? item.value.toLocaleString()
                            : String(item.value)}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a customized tooltip for Recharts charts'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/chart.tsx:ChartTooltipContent:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/chart.tsx:ChartLegend:constant" type="constant" identity="ChartLegend" parent="~/.framework/src/components/ui/chart.tsx"]
// CIL[DOC-MACRO purpose="Expose the Recharts Legend component under the Chart namespace"]
// CIL[DOC-RESPONSIBILITY responsibility="Re-export RechartsPrimitive.Legend"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/chart.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Legend component" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Alias to RechartsPrimitive.Legend" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const ChartLegend = RechartsPrimitive.Legend
// CIL[DOC-VECTOR type="context" content="purpose='Expose the Recharts Legend component under the Chart namespace'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/chart.tsx:ChartLegend:constant"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/chart.tsx:ChartLegendContent:component" type="component" identity="ChartLegendContent" parent="~/.framework/src/components/ui/chart.tsx"]
// CIL[DOC-MACRO purpose="Render a customized legend for Recharts charts"]
// CIL[DOC-RESPONSIBILITY responsibility="Map payload items to labels and color swatches using chart config"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/chart.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, hideIcon, payload, verticalAlign, nameKey, div props" outputs="JSX legend or null" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Filters payload, resolves item config, renders icon or color dot with label" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
}: React.ComponentProps<"div"> & {
  hideIcon?: boolean
  nameKey?: string
} & RechartsPrimitive.DefaultLegendContentProps) {
  const { config } = useChart()

  if (!payload?.length) {
    return null
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
    >
      {payload
        .filter((item) => item.type !== "none")
        .map((item, index) => {
          const key = `${nameKey ?? item.dataKey ?? "value"}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)

          return (
            <div
              key={index}
              className={cn(
                "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
              )}
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              {itemConfig?.label}
            </div>
          )
        })}
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a customized legend for Recharts charts'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/chart.tsx:ChartLegendContent:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/chart.tsx:getPayloadConfigFromPayload:function" type="function" identity="getPayloadConfigFromPayload" parent="~/.framework/src/components/ui/chart.tsx"]
// CIL[DOC-MACRO purpose="Resolve the chart config entry for a payload item"]
// CIL[DOC-RESPONSIBILITY responsibility="Determine which config key to use based on payload fields"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/chart.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="config: ChartConfig, payload: unknown, key: string" outputs="ChartConfig entry for the resolved key" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Looks for key in payload and payload.payload, falls back to original key" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string
  }

  return configLabelKey in config ? config[configLabelKey] : config[key]
}
// CIL[DOC-VECTOR type="context" content="purpose='Resolve the chart config entry for a payload item'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/chart.tsx:getPayloadConfigFromPayload:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/chart.tsx:exports:export" type="export" identity="exports" parent="~/.framework/src/components/ui/chart.tsx"]
// CIL[DOC-MACRO purpose="Export public chart components and helpers"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, and ChartStyle"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/chart.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="named exports" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Named exports for chart primitives" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}
// CIL[DOC-VECTOR type="context" content="purpose='Export public chart components and helpers'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/chart.tsx:exports:export"]
