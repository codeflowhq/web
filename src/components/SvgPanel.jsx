import { useEffect, useRef } from "react";

const assignKeys = (svgRoot) => {
  const groups = svgRoot.querySelectorAll("g");
  groups.forEach((group, index) => {
    if (!group.dataset.animKey) {
      const autoKey = group.getAttribute("id") || `g-${index}`;
      group.dataset.animKey = autoKey;
    }
  });
};

const collectElements = (svgRoot) => {
  assignKeys(svgRoot);
  return Array.from(svgRoot.querySelectorAll("g[data-anim-key]"));
};

const SvgPanel = ({ svg }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !svg) {
      return;
    }

    const prevSvg = container.querySelector("svg");
    const prevPositions = new Map();
    if (prevSvg) {
      collectElements(prevSvg).forEach((element) => {
        prevPositions.set(element.dataset.animKey, element.getBoundingClientRect());
      });
    }

    const parser = new DOMParser();
    const nextDoc = parser.parseFromString(svg, "image/svg+xml");
    const nextSvg = nextDoc.querySelector("svg");
    if (!nextSvg) {
      container.innerHTML = svg;
      return;
    }

    container.innerHTML = nextSvg.outerHTML;
    const currentSvg = container.querySelector("svg");
    if (!currentSvg) {
      return;
    }

    collectElements(currentSvg).forEach((element) => {
      const newRect = element.getBoundingClientRect();
      const prevRect = prevPositions.get(element.dataset.animKey);
      element.style.transition = "none";

      if (prevRect) {
        const dx = prevRect.left - newRect.left;
        const dy = prevRect.top - newRect.top;
        element.style.transformOrigin = "0 0";
        element.style.transformBox = "fill-box";
        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
          element.style.transform = `translate(${dx}px, ${dy}px)`;
          requestAnimationFrame(() => {
            element.style.transition = "transform 0.4s ease";
            element.style.transform = "translate(0px, 0px)";
          });
        } else {
          element.style.opacity = "0";
          requestAnimationFrame(() => {
            element.style.transition = "opacity 0.4s ease";
            element.style.opacity = "1";
          });
        }
      } else {
        element.style.opacity = "0";
        element.style.transformOrigin = "0 0";
        element.style.transformBox = "fill-box";
        element.style.transform = "translateY(8px)";
        requestAnimationFrame(() => {
          element.style.transition = "opacity 0.4s ease, transform 0.4s ease";
          element.style.opacity = "1";
          element.style.transform = "translateY(0)";
        });
      }

      setTimeout(() => {
        element.style.transition = "";
        element.style.transform = "";
        element.style.opacity = "";
      }, 450);
    });
  }, [svg]);

  return <div className="svg-panel" ref={containerRef} />;
};

export default SvgPanel;
