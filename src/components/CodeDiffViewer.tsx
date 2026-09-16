import { useTheme } from "next-themes";
import ReactDiffViewer, { DiffMethod } from "react-diff-viewer-continued";
import { useState } from "react";

interface CodeDiffViewerProps {
  oldCode: string;
  newCode: string;
  language?: string;
  filePath?: string;
}

export function CodeDiffViewer({ oldCode, newCode, language = "typescript", filePath }: CodeDiffViewerProps) {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const customStyles = {
    variables: {
      dark: {
        diffViewerBackground: "oklch(0.15 0.018 260)",
        diffViewerColor: "oklch(0.96 0.005 260)",
        addedBackground: "oklch(0.3 0.06 150 / 0.25)",
        addedColor: "oklch(0.85 0.15 150)",
        removedBackground: "oklch(0.35 0.08 25 / 0.25)",
        removedColor: "oklch(0.85 0.15 25)",
        wordAddedBackground: "oklch(0.3 0.06 150 / 0.4)",
        wordRemovedBackground: "oklch(0.35 0.08 25 / 0.4)",
        addedGutterBackground: "oklch(0.2 0.04 150 / 0.3)",
        removedGutterBackground: "oklch(0.25 0.05 25 / 0.3)",
        gutterBackground: "oklch(0.13 0.015 260)",
        gutterBackgroundDark: "oklch(0.11 0.012 260)",
        highlightBackground: "oklch(0.4 0.08 260 / 0.2)",
        highlightGutterBackground: "oklch(0.4 0.08 260 / 0.2)",
        codeFoldGutterBackground: "oklch(0.18 0.018 260)",
        codeFoldBackground: "oklch(0.15 0.015 260)",
        emptyLineBackground: "transparent",
        gutterColor: "oklch(0.45 0.02 260)",
        addedGutterColor: "oklch(0.6 0.15 150)",
        removedGutterColor: "oklch(0.6 0.15 25)",
        codeFoldContentColor: "oklch(0.55 0.02 260)",
        diffViewerTitleBackground: "oklch(0.15 0.018 260)",
        diffViewerTitleColor: "oklch(0.85 0.01 260)",
        diffViewerTitleBorderColor: "oklch(0.25 0.02 260)",
      },
      light: {
        diffViewerBackground: "oklch(1 0 0)",
        diffViewerColor: "oklch(0.13 0.02 260)",
        addedBackground: "oklch(0.95 0.02 150)",
        addedColor: "oklch(0.3 0.08 150)",
        removedBackground: "oklch(0.95 0.025 25)",
        removedColor: "oklch(0.35 0.1 25)",
        wordAddedBackground: "oklch(0.88 0.04 150)",
        wordRemovedBackground: "oklch(0.88 0.05 25)",
        addedGutterBackground: "oklch(0.92 0.02 150)",
        removedGutterBackground: "oklch(0.92 0.03 25)",
        gutterBackground: "oklch(0.97 0.002 260)",
        gutterBackgroundDark: "oklch(0.95 0.005 260)",
        highlightBackground: "oklch(0.92 0.03 260)",
        highlightGutterBackground: "oklch(0.92 0.03 260)",
        codeFoldGutterBackground: "oklch(0.96 0.003 260)",
        codeFoldBackground: "oklch(0.97 0.002 260)",
        emptyLineBackground: "transparent",
        gutterColor: "oklch(0.6 0.01 260)",
        addedGutterColor: "oklch(0.4 0.12 150)",
        removedGutterColor: "oklch(0.45 0.14 25)",
        codeFoldContentColor: "oklch(0.5 0.01 260)",
        diffViewerTitleBackground: "oklch(0.97 0.002 260)",
        diffViewerTitleColor: "oklch(0.2 0.02 260)",
        diffViewerTitleBorderColor: "oklch(0.9 0.005 260)",
      },
    },
    line: {
      fontSize: "12px",
      fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
    },
  };

  return (
    <div className="rounded-xl border border-border/50 overflow-hidden">
      {filePath && (
        <div className="px-4 py-2 border-b border-border/50 bg-muted/20">
          <span className="text-[11px] font-mono text-muted-foreground">{filePath}</span>
        </div>
      )}
      <div className="overflow-x-auto text-[12px]">
        <ReactDiffViewer
          oldValue={oldCode}
          newValue={newCode}
          splitView={true}
          useDarkTheme={theme === "dark"}
          styles={customStyles}
          compareMethod={DiffMethod.WORDS}
          leftTitle="Current"
          rightTitle="Suggested Fix"
        />
      </div>
    </div>
  );
}
