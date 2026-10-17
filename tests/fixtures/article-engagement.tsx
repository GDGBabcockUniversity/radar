import React, { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import ArticleEngagement from "../../app/components/ArticleEngagement";
function App() {
  const [shown, show] = useState(true);
  const short = new URLSearchParams(location.search).has("short");
  return (
    <>
      <button onClick={() => show(false)}>Unmount</button>
      <div style={{ height: 600 }}>Header</div>
      {shown && (
        <ArticleEngagement articleId="test-article">
          <div id="body" style={{ height: short ? 200 : 3000 }}>
            Article content
          </div>
        </ArticleEngagement>
      )}
      <div style={{ height: 2000 }}>Footer</div>
    </>
  );
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
