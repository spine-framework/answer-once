// CIL[BEGIN stable_id="~/.framework/src/components/app-sidebar.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/app-sidebar.tsx:file"]
// CIL[DOC-MACRO purpose="Provides a documentation navigation sidebar with collapsible sections and search integration"]
// CIL[DOC-RESPONSIBILITY responsibility="Imports React, local sidebar primitives, the search form, and Lucide icons used by AppSidebar"]
// CIL[DOC-CONTEXT module="app-sidebar.tsx" layer="components" related_files=".framework/src/components/search-form.tsx,.framework/src/components/ui/collapsible.tsx,.framework/src/components/ui/sidebar.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="local bindings for React, Sidebar primitives, SearchForm, and Lucide icons" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports React, sidebar UI components, search-form, and icons for the documentation sidebar." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="UI component consumers, React developers, design system maintainers"]
import * as React from "react"

import { SearchForm } from "./search-form"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "./ui/sidebar"
import { GalleryVerticalEndIcon, PlusIcon, MinusIcon } from "lucide-react"
// CIL[DOC-VECTOR type="context" content="purpose='Provides a documentation navigation sidebar with collapsible sections and search integration'; No verified external callers; imports: .framework/src/components/search-form.tsx,.framework/src/components/ui/collapsible.tsx,.framework/src/components/ui/sidebar.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/app-sidebar.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/components/app-sidebar.tsx:data:constant" type="constant" identity="data" parent="~/.framework/src/components/app-sidebar.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Defines the static navigation data for the documentation sidebar sections"]
// CIL[DOC-RESPONSIBILITY responsibility="Holds the navMain array of documentation topics, URLs, and nested items"]
// CIL[DOC-CONTEXT module="app-sidebar.tsx" layer="components" related_files=".framework/src/components/app-sidebar.tsx,.framework/src/components/search-form.tsx,.framework/src/components/ui/collapsible.tsx,.framework/src/components/ui/sidebar.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="data object with navMain navigation tree" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Constant object defining documentation navigation sections with titles, URLs, and nested items." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const data = {
  navMain: [
    {
      title: "Getting Started",
      url: "#",
      items: [
        {
          title: "Installation",
          url: "#",
        },
        {
          title: "Project Structure",
          url: "#",
        },
      ],
    },
    {
      title: "Build Your Application",
      url: "#",
      items: [
        {
          title: "Routing",
          url: "#",
        },
        {
          title: "Data Fetching",
          url: "#",
          isActive: true,
        },
        {
          title: "Rendering",
          url: "#",
        },
        {
          title: "Caching",
          url: "#",
        },
        {
          title: "Styling",
          url: "#",
        },
        {
          title: "Optimizing",
          url: "#",
        },
        {
          title: "Configuring",
          url: "#",
        },
        {
          title: "Testing",
          url: "#",
        },
        {
          title: "Authentication",
          url: "#",
        },
        {
          title: "Deploying",
          url: "#",
        },
        {
          title: "Upgrading",
          url: "#",
        },
        {
          title: "Examples",
          url: "#",
        },
      ],
    },
    {
      title: "API Reference",
      url: "#",
      items: [
        {
          title: "Components",
          url: "#",
        },
        {
          title: "File Conventions",
          url: "#",
        },
        {
          title: "Functions",
          url: "#",
        },
        {
          title: "next.config.js Options",
          url: "#",
        },
        {
          title: "CLI",
          url: "#",
        },
        {
          title: "Edge Runtime",
          url: "#",
        },
      ],
    },
    {
      title: "Architecture",
      url: "#",
      items: [
        {
          title: "Accessibility",
          url: "#",
        },
        {
          title: "Fast Refresh",
          url: "#",
        },
        {
          title: "Next.js Compiler",
          url: "#",
        },
        {
          title: "Supported Browsers",
          url: "#",
        },
        {
          title: "Turbopack",
          url: "#",
        },
      ],
    },
    {
      title: "Community",
      url: "#",
      items: [
        {
          title: "Contribution Guide",
          url: "#",
        },
      ],
    },
  ],
}

// CIL[DOC-VECTOR type="context" content="purpose='Defines the static navigation data for the documentation sidebar sections'; No verified external callers; imports: .framework/src/components/search-form.tsx,.framework/src/components/ui/collapsible.tsx,.framework/src/components/ui/sidebar.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/app-sidebar.tsx:data:constant"]
// CIL[BEGIN stable_id="~/.framework/src/components/app-sidebar.tsx:appsidebar:function" type="function" identity="AppSidebar" parent="~/.framework/src/components/app-sidebar.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders the application sidebar with a header, search, and collapsible navigation menu"]
// CIL[DOC-RESPONSIBILITY responsibility="Displays the documentation navigation sidebar using the data constant and UI primitives"]
// CIL[DOC-CONTEXT module="app-sidebar.tsx" layer="components" related_files=".framework/src/components/app-sidebar.tsx,.framework/src/components/search-form.tsx,.framework/src/components/ui/collapsible.tsx,.framework/src/components/ui/sidebar.tsx"]
// CIL[DOC-CONTRACT inputs="props (React.ComponentProps<typeof Sidebar>)" outputs="JSX.Element" errors="none" side_effects="Renders sidebar DOM elements"]
// CIL[DOC-MICRO logic_summary="Renders a Sidebar with header, SearchForm, and collapsible nav groups driven by data.navMain." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <GalleryVerticalEndIcon className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Documentation</span>
                  <span className="">v1.0.0</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item, index) => (
              <Collapsible
                key={item.title}
                defaultOpen={index === 1}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      {item.title}{" "}
                      <PlusIcon className="ml-auto group-data-[state=open]/collapsible:hidden" />
                      <MinusIcon className="ml-auto group-data-[state=closed]/collapsible:hidden" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  {item.items?.length ? (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((item) => (
                          <SidebarMenuSubItem key={item.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={item.isActive}
                            >
                              <a href={item.url}>{item.title}</a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  ) : null}
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders the application sidebar with a header, search, and collapsible navigation menu'; No verified external callers; imports: .framework/src/components/search-form.tsx,.framework/src/components/ui/collapsible.tsx,.framework/src/components/ui/sidebar.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/app-sidebar.tsx:appsidebar:function"]
