// CIL[BEGIN stable_id="~/.framework/src/components/ui/carousel.tsx:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Provides the Carousel UI components built on Embla Carousel for the shadcn/ui design system"]
// CIL[DOC-RESPONSIBILITY responsibility="Import carousel dependencies and re-export the public Carousel component surface"]
// CIL[DOC-CONTEXT module="carousel" layer="components/ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="imports and component exports" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Sets up React, Embla Carousel, utility, Button, and icon imports used by Carousel, Content, Item, Previous, and Next." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="frontend-developers"]












import * as React from "react"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
// CIL[DOC-VECTOR type="context" content="purpose='Provides the Carousel UI components built on Embla Carousel for the shadcn/ui design system'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/carousel.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/carousel.tsx:carouselapi:type" type="type" identity="carouselapi" parent="~/.framework/src/components/ui/carousel.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Exposes the Embla Carousel API type returned by useEmblaCarousel"]
// CIL[DOC-RESPONSIBILITY responsibility="Define the CarouselApi type alias for consumer typing"]
// CIL[DOC-CONTEXT module="carousel" layer="components/ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/carousel.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="CarouselApi type alias" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Aliases UseEmblaCarouselType[1] as CarouselApi." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
type CarouselApi = UseEmblaCarouselType[1]
// CIL[DOC-VECTOR type="context" content="purpose='Exposes the Embla Carousel API type returned by useEmblaCarousel'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/carousel.tsx:carouselapi:type"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/carousel.tsx:usecarouselparameters:type" type="type" identity="usecarouselparameters" parent="~/.framework/src/components/ui/carousel.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Defines the parameter tuple type accepted by the useEmblaCarousel hook"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the UseCarouselParameters type for the Carousel hook"]
// CIL[DOC-CONTEXT module="carousel" layer="components/ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/carousel.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="UseCarouselParameters type alias" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Aliases Parameters<typeof useEmblaCarousel> as UseCarouselParameters." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
// CIL[DOC-VECTOR type="context" content="purpose='Defines the parameter tuple type accepted by the useEmblaCarousel hook'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/carousel.tsx:usecarouselparameters:type"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/carousel.tsx:carouseloptions:type" type="type" identity="carouseloptions" parent="~/.framework/src/components/ui/carousel.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Defines the carousel configuration options type"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the CarouselOptions type for the Carousel component"]
// CIL[DOC-CONTEXT module="carousel" layer="components/ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/carousel.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="CarouselOptions type alias" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Aliases UseCarouselParameters[0] as CarouselOptions." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
type CarouselOptions = UseCarouselParameters[0]
// CIL[DOC-VECTOR type="context" content="purpose='Defines the carousel configuration options type'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/carousel.tsx:carouseloptions:type"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/carousel.tsx:carouselplugin:type" type="type" identity="carouselplugin" parent="~/.framework/src/components/ui/carousel.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Defines the carousel plugin type"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the CarouselPlugin type for Embla plugins"]
// CIL[DOC-CONTEXT module="carousel" layer="components/ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/carousel.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="CarouselPlugin type alias" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Aliases UseCarouselParameters[1] as CarouselPlugin." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
type CarouselPlugin = UseCarouselParameters[1]
// CIL[DOC-VECTOR type="context" content="purpose='Defines the carousel plugin type'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/carousel.tsx:carouselplugin:type"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/carousel.tsx:carouselprops:type" type="type" identity="carouselprops" parent="~/.framework/src/components/ui/carousel.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Defines the props accepted by the Carousel component"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the CarouselProps interface with options, plugins, orientation, and setApi"]
// CIL[DOC-CONTEXT module="carousel" layer="components/ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/carousel.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="CarouselProps type declaration" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Describes the public props for the Carousel component including optional opts, plugins, orientation, and setApi callback." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the props accepted by the Carousel component'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/carousel.tsx:carouselprops:type"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/carousel.tsx:carouselcontextprops:type" type="type" identity="carouselcontextprops" parent="~/.framework/src/components/ui/carousel.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Defines the context shape consumed by nested Carousel subcomponents"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the CarouselContextProps interface"]
// CIL[DOC-CONTEXT module="carousel" layer="components/ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/carousel.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="CarouselContextProps type declaration" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Extends CarouselProps with carouselRef, api, scroll handlers, and scrollability booleans." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} & CarouselProps
// CIL[DOC-VECTOR type="context" content="purpose='Defines the context shape consumed by nested Carousel subcomponents'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/carousel.tsx:carouselcontextprops:type"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/carousel.tsx:carouselcontext:constant" type="constant" identity="carouselcontext" parent="~/.framework/src/components/ui/carousel.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Creates the React context for Carousel subcomponent communication"]
// CIL[DOC-RESPONSIBILITY responsibility="Initialize the CarouselContext with a null default"]
// CIL[DOC-CONTEXT module="carousel" layer="components/ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/carousel.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="CarouselContext constant" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Creates a React context typed to CarouselContextProps or null." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const CarouselContext = React.createContext<CarouselContextProps | null>(null)
// CIL[DOC-VECTOR type="context" content="purpose='Creates the React context for Carousel subcomponent communication'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/carousel.tsx:carouselcontext:constant"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/carousel.tsx:usecarousel:function" type="function" identity="usecarousel" parent="~/.framework/src/components/ui/carousel.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Hook to access the Carousel context from subcomponents"]
// CIL[DOC-RESPONSIBILITY responsibility="Return the CarouselContext value or throw if used outside a Carousel"]
// CIL[DOC-CONTEXT module="carousel" layer="components/ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/carousel.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="CarouselContextProps" errors="Throws if context is null" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Reads React context and throws an error when not inside a Carousel provider." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}
// CIL[DOC-VECTOR type="context" content="purpose='Hook to access the Carousel context from subcomponents'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/carousel.tsx:usecarousel:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/carousel.tsx:carousel:function" type="function" identity="carousel" parent="~/.framework/src/components/ui/carousel.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Main Carousel component that wires Embla and exposes context to children"]
// CIL[DOC-RESPONSIBILITY responsibility="Initialize the Embla carousel, track scrollability, handle keyboard input, and render the provider"]
// CIL[DOC-CONTEXT module="carousel" layer="components/ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/carousel.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="props: React.ComponentProps<'div'> & CarouselProps" outputs="JSX element with CarouselContext.Provider and a keyboard-handled container" errors="none" side_effects="Registers Embla select/reInit event handlers and keyboard event handling"]
// CIL[DOC-MICRO logic_summary="Creates an Embla instance, manages canScrollPrev/Next state, binds keyboard navigation, and passes values to context." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins
  )
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }, [])

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev()
  }, [api])

  const scrollNext = React.useCallback(() => {
    api?.scrollNext()
  }, [api])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        scrollNext()
      }
    },
    [scrollPrev, scrollNext]
  )

  React.useEffect(() => {
    if (!api || !setApi) return
    setApi(api)
  }, [api, setApi])

  React.useEffect(() => {
    if (!api) return
    onSelect(api)
    api.on("reInit", onSelect)
    api.on("select", onSelect)

    return () => {
      api?.off("select", onSelect)
    }
  }, [api, onSelect])

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Main Carousel component that wires Embla and exposes context to children'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/carousel.tsx:carousel:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/carousel.tsx:carouselcontent:function" type="function" identity="carouselcontent" parent="~/.framework/src/components/ui/carousel.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders the scrollable viewport and track for carousel items"]
// CIL[DOC-RESPONSIBILITY responsibility="Apply the carousel ref and orientation styles to the content wrapper"]
// CIL[DOC-CONTEXT module="carousel" layer="components/ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/carousel.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props: React.ComponentProps<'div'>" outputs="JSX element with overflow-hidden viewport and flex track" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Receives the Embla ref and orientation from context and renders the inner track with orientation-specific spacing." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div
      ref={carouselRef}
      className="overflow-hidden"
      data-slot="carousel-content"
    >
      <div
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      />
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders the scrollable viewport and track for carousel items'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/carousel.tsx:carouselcontent:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/carousel.tsx:carouselitem:function" type="function" identity="carouselitem" parent="~/.framework/src/components/ui/carousel.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a single slide inside the Carousel track"]
// CIL[DOC-RESPONSIBILITY responsibility="Apply slide role and orientation-specific padding to each item"]
// CIL[DOC-CONTEXT module="carousel" layer="components/ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/carousel.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props: React.ComponentProps<'div'>" outputs="JSX slide element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders a group with aria-roledescription 'slide' and orientation padding." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel()

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a single slide inside the Carousel track'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/carousel.tsx:carouselitem:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/carousel.tsx:carouselprevious:function" type="function" identity="carouselprevious" parent="~/.framework/src/components/ui/carousel.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders the previous-slide control button"]
// CIL[DOC-RESPONSIBILITY responsibility="Scroll the carousel to the previous item when enabled"]
// CIL[DOC-CONTEXT module="carousel" layer="components/ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/carousel.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="props: React.ComponentProps<typeof Button> with optional variant, size, className" outputs="Button element" errors="none" side_effects="Calls scrollPrev on click"]
// CIL[DOC-MICRO logic_summary="Displays a ChevronLeft button positioned absolutely; disabled when no previous slide is available." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "absolute touch-manipulation rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -left-12 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ChevronLeftIcon />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders the previous-slide control button'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/carousel.tsx:carouselprevious:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/carousel.tsx:carouselnext:function" type="function" identity="carouselnext" parent="~/.framework/src/components/ui/carousel.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders the next-slide control button"]
// CIL[DOC-RESPONSIBILITY responsibility="Scroll the carousel to the next item when enabled"]
// CIL[DOC-CONTEXT module="carousel" layer="components/ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/carousel.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="props: React.ComponentProps<typeof Button> with optional variant, size, className" outputs="Button element" errors="none" side_effects="Calls scrollNext on click"]
// CIL[DOC-MICRO logic_summary="Displays a ChevronRight button positioned absolutely; disabled when no next slide is available." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function CarouselNext({
  className,
  variant = "outline",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "absolute touch-manipulation rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -right-12 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ChevronRightIcon />
      <span className="sr-only">Next slide</span>
    </Button>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders the next-slide control button'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/carousel.tsx:carouselnext:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/carousel.tsx:export_list:export" type="export" identity="export_list" parent="~/.framework/src/components/ui/carousel.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Re-exports the public Carousel component surface"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose Carousel, subcomponents, hooks, and types for module consumers"]
// CIL[DOC-CONTEXT module="carousel" layer="components/ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/carousel.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Named exports of component and type symbols" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Lists all public identifiers for external consumers." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  useCarousel,
}
// CIL[DOC-VECTOR type="context" content="purpose='Re-exports the public Carousel component surface'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/carousel.tsx:export_list:export"]
