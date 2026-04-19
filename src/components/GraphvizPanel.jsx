import { useEffect, useRef } from "react";
import { graphviz } from "d3-graphviz";
import { transition as d3Transition } from "d3-transition";

const GRAPHVIZ_DURATION_MS = 300;

const GraphvizPanel = ({ dot, debugName }) => {
  const containerRef = useRef(null);
  const vizRef = useRef(null);
  const renderQueueRef = useRef(Promise.resolve());
  const renderSeqRef = useRef(0);

  useEffect(() => {
    if (!containerRef.current || !dot) {
      return;
    }
    if (debugName === "data") {
      console.log(`[graphviz][debug] DOT for data:`, dot);
      console.log(
        `[graphviz][debug] DOT for data contains id=:`,
        dot.includes("id="),
      );
    }
    if (!vizRef.current) {
      vizRef.current = graphviz(containerRef.current, { useWorker: false })
        .zoom(false)
        .transition(() => d3Transition().duration(GRAPHVIZ_DURATION_MS));
    }

    const currentSeq = renderSeqRef.current + 1;
    renderSeqRef.current = currentSeq;

    renderQueueRef.current = renderQueueRef.current
      .catch(() => undefined)
      .then(() => {
        if (!vizRef.current) {
          return undefined;
        }
        return Promise.resolve(vizRef.current.renderDot(dot));
      })
      .then(() => {
        if (currentSeq !== renderSeqRef.current) {
          return;
        }
        const svg = containerRef.current?.querySelector("svg");
        if (!svg) {
          return;
        }
        const ids = Array.from(svg.querySelectorAll('[id^="cv-"]')).map((node) => node.id);
        if (ids.length > 0) {
          console.log(`[graphviz] stable ids for ${debugName || "graph"}:`, ids);
        }
      })
      .catch((error) => {
        const renderError =
          error instanceof Error ? error : new Error(String(error ?? "Graphviz render failed"));
        console.error(`[graphviz] render failed for ${debugName || "graph"}:`, renderError);
        console.error(renderError.stack || renderError.message);
      });
  }, [debugName, dot]);

  useEffect(() => () => {
    renderSeqRef.current += 1;
    renderQueueRef.current = Promise.resolve();
    vizRef.current = null;
  }, []);

  return <div className="graphviz-panel" ref={containerRef} />;
};

export default GraphvizPanel;
