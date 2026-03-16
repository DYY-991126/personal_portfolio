import type { MDXComponents } from "mdx/types";
import ImageBlock from "./ImageBlock";
import VideoBlock from "./VideoBlock";
import { Pre } from "./CodeBlock";
import InteractiveBlock from "./InteractiveBlock";
import Gallery from "./Gallery";
import Callout from "./Callout";
import Columns from "./Columns";
import ProcessFlow from "./ProcessFlow";
import AssetFormMockup from "./AssetFormMockup";
import ProgressBarDemo from "./ProgressBarDemo";
import ChatPanelDemo from "./ChatPanelDemo";
import ChatPanelTwoTypesDemo from "./ChatPanelTwoTypesDemo";
import AgentTaskExpandPanel from "./AgentTaskExpandPanel";
import ToolCallCardBase from "./ToolCallCardBase";
import WorkProductDiagnosticsFiles from "./WorkProductDiagnosticsFiles";
import ToolCallCardDemo1 from "./ToolCallCardDemo1";
import ToolCallCardPanel from "./ToolCallCardPanel";
import ToolCallCardPanelDemo from "./ToolCallCardPanelDemo";
import WorkProductTodoCard from "./WorkProductTodoCard";
import WorkProductImageGrid from "./WorkProductImageGrid";
import WorkProductVideoGrid from "./WorkProductVideoGrid";
import WorkProductResearchChips from "./WorkProductResearchChips";
import WorkProductCodeStream from "./WorkProductCodeStream";
import TaskVideoGallery from "./TaskVideoGallery";
import FrameworkSimplificationTable from "./FrameworkSimplificationTable";
import GranularityAxis from "./GranularityAxis";
import InterfaceFrameworkDemo from "./InterfaceFrameworkDemo";

export function getMDXComponents(): MDXComponents {
  return {
    // Custom blocks
    ImageBlock,
    VideoBlock,
    InteractiveBlock,
    Gallery,
    Callout,
    Columns,
    ProcessFlow,
    AssetFormMockup,
    ProgressBarDemo,
    ChatPanelDemo,
    ChatPanelTwoTypesDemo,
    AgentTaskExpandPanel,
    ToolCallCardBase,
    WorkProductDiagnosticsFiles,
    ToolCallCardDemo1,
    ToolCallCardPanel,
    ToolCallCardPanelDemo,
    WorkProductTodoCard,
    WorkProductImageGrid,
    WorkProductVideoGrid,
    WorkProductResearchChips,
    WorkProductCodeStream,
    TaskVideoGallery,
    FrameworkSimplificationTable,
    GranularityAxis,
    InterfaceFrameworkDemo,

    // Override default HTML elements for consistent styling
    h2: (props) => {
      const extractText = (children: any): string => {
        if (typeof children === 'string') return children;
        if (Array.isArray(children)) return children.map(extractText).join('');
        if (children?.props?.children) return extractText(children.props.children);
        return '';
      };
      const text = extractText(props.children);
      const id = text ? text.toLowerCase().replace(/\s+/g, '-') : undefined;
      return (
        <h2
          id={id}
          className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mt-24 mb-8 first:mt-0 scroll-m-20 group relative"
          {...props}
        />
      );
    },
    h3: (props) => {
      const extractText = (children: any): string => {
        if (typeof children === 'string') return children;
        if (Array.isArray(children)) return children.map(extractText).join('');
        if (children?.props?.children) return extractText(children.props.children);
        return '';
      };
      const text = extractText(props.children);
      const id = text ? text.toLowerCase().replace(/\s+/g, '-') : undefined;
      return (
        <h3
          id={id}
          className="text-2xl font-semibold tracking-tight text-foreground mt-16 mb-6 scroll-m-20 group relative"
          {...props}
        />
      );
    },
    h4: (props) => (
      <h4
        className="text-lg font-semibold text-foreground mt-12 mb-4"
        {...props}
      />
    ),
    p: (props) => (
      <p
        className="text-lg md:text-xl leading-relaxed text-muted-foreground mb-6 max-w-4xl"
        {...props}
      />
    ),
    ul: (props) => (
      <ul
        className="text-lg text-muted-foreground space-y-3 mb-8 ml-6 list-disc max-w-4xl"
        {...props}
      />
    ),
    ol: (props) => (
      <ol
        className="text-lg text-muted-foreground space-y-3 mb-8 ml-6 list-decimal max-w-4xl"
        {...props}
      />
    ),
    li: (props) => (
      <li className="leading-relaxed" {...props} />
    ),
    blockquote: (props) => (
      <blockquote
        className="border-l-2 border-foreground/20 pl-6 my-10 text-xl italic text-muted-foreground max-w-3xl"
        {...props}
      />
    ),
    a: (props) => (
      <a
        className="text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground transition-colors"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      />
    ),
    hr: () => (
      <hr className="border-border/40 my-20" />
    ),
    strong: (props) => (
      <strong className="text-foreground font-semibold" {...props} />
    ),
    pre: Pre,
    code: (props) => {
      const isInline = !props.className?.includes("language-");
      if (isInline) {
        return (
          <code
            className="text-[0.9em] px-1.5 py-0.5 rounded-md bg-muted border border-border/30 font-mono text-foreground"
            {...props}
          />
        );
      }
      return <code {...props} />;
    },
    table: (props) => (
      <div className="my-12 overflow-x-auto rounded-xl border border-border/30">
        <table className="w-full text-sm" {...props} />
      </div>
    ),
    th: (props) => (
      <th
        className="text-left px-4 py-3 bg-muted/50 text-foreground font-semibold border-b border-border/30 whitespace-nowrap"
        {...props}
      />
    ),
    td: (props) => (
      <td
        className="px-4 py-3 text-muted-foreground border-b border-border/20"
        {...props}
      />
    ),
  };
}
