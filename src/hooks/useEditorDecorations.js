import { useCallback, useEffect, useRef } from "react";

export const useEditorDecorations = ({
  activeExecutionLine,
  isPythonIdentifier,
  onIdentifierClick,
  selectionEnabled,
}) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const mouseDownDisposableRef = useRef(null);
  const mouseUpDisposableRef = useRef(null);
  const currentDecorationsRef = useRef([]);
  const selectionEnabledRef = useRef(selectionEnabled);
  const onIdentifierClickRef = useRef(onIdentifierClick);
  const isPythonIdentifierRef = useRef(isPythonIdentifier);


  useEffect(() => {
    selectionEnabledRef.current = selectionEnabled;
    onIdentifierClickRef.current = onIdentifierClick;
    isPythonIdentifierRef.current = isPythonIdentifier;
  }, [isPythonIdentifier, onIdentifierClick, selectionEnabled]);

  const handleEditorMount = useCallback(
    (editor, monaco) => {
      mouseDownDisposableRef.current?.dispose();
      mouseUpDisposableRef.current?.dispose();
      editorRef.current = editor;
      monacoRef.current = monaco;
      const wordAtMouseEvent = (event) => {
        const position = event.target.position;
        if (!position) {
          return null;
        }
        const model = editor.getModel();
        if (!model) {
          return null;
        }
        const word = model.getWordAtPosition(position);
        if (!word?.word || !isPythonIdentifierRef.current(word.word)) {
          return null;
        }
        return word.word;
      };
      const handlePointer = (event) => {
        if (!selectionEnabledRef.current) {
          return;
        }
        const word = wordAtMouseEvent(event);
        if (!word) {
          return;
        }
        onIdentifierClickRef.current(word);
      };
      mouseDownDisposableRef.current = editor.onMouseDown(handlePointer);
      mouseUpDisposableRef.current = editor.onMouseUp(handlePointer);
    },
    [],
  );

  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco || (typeof editor.isDisposed === "function" && editor.isDisposed())) {
      return;
    }

    const decorations = [];
    if (selectionEnabled) {
      const model = editor.getModel();
      const lineCount = model?.getLineCount() ?? 0;
      for (let lineNumber = 1; lineNumber <= lineCount; lineNumber += 1) {
        const line = model.getLineContent(lineNumber);
        const identifierPattern = /\b[A-Za-z_][A-Za-z0-9_]*\b/g;
        for (const match of line.matchAll(identifierPattern)) {
          const word = match[0];
          if (!isPythonIdentifierRef.current(word) || match.index == null) {
            continue;
          }
          const startColumn = match.index + 1;
          decorations.push({
            range: new monaco.Range(lineNumber, startColumn, lineNumber, startColumn + word.length),
            options: {
              inlineClassName: "editor-clickable-identifier",
              hoverMessage: { value: "Click to configure and add this variable to watch." },
            },
          });
        }
      }
    }
    if (activeExecutionLine != null) {
      decorations.push({
        range: new monaco.Range(activeExecutionLine, 1, activeExecutionLine, 1),
        options: {
          isWholeLine: true,
          className: "editor-current-line",
          glyphMarginClassName: "editor-current-line-glyph",
        },
      });
    }

    try {
      currentDecorationsRef.current = editor.deltaDecorations(currentDecorationsRef.current, decorations);
      editor.updateOptions({ readOnly: selectionEnabled, mouseStyle: "text" });
    } catch (_error) {
      // Monaco can dispose between React passes during remount; skip stale updates.
    }
  }, [activeExecutionLine, selectionEnabled]);

  useEffect(() => () => {
    mouseDownDisposableRef.current?.dispose();
    mouseUpDisposableRef.current?.dispose();
    hoverDisposableRef.current?.dispose();
    mouseDownDisposableRef.current = null;
    mouseUpDisposableRef.current = null;
    currentDecorationsRef.current = [];
    editorRef.current = null;
    monacoRef.current = null;
  }, []);

  return { handleEditorMount };
};
