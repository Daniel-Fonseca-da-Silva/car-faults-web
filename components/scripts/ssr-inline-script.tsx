"use client";

import { useEffect, useSyncExternalStore } from "react";

const subscribe = () => () => {};

interface SsrInlineScriptProps {
  id: string;
  html: string;
}

// Inline <script> meant to run before hydration, from the server HTML.
//
// React never executes scripts it creates on the client and warns about them.
// That happens whenever the root is client-rendered instead of hydrated, e.g.
// on 404s: notFound() in the shell makes Next send an empty `__next_error__`
// document and render the whole tree in the browser.
//
// So the tag is only rendered while it can be hydrated from the server HTML
// (server snapshot) or is already in the DOM. Otherwise nothing is rendered and
// the code is run by injecting a script element manually. Effects run in tree
// order, so this still lands before scripts injected further down (e.g. ads).
export function SsrInlineScript({ id, html }: SsrInlineScriptProps) {
  const hasServerScript = useSyncExternalStore(
    subscribe,
    () => document.getElementById(id) !== null,
    () => true,
  );

  useEffect(() => {
    if (hasServerScript) {
      return;
    }
    // No id on purpose: it must not flip the snapshot above, or a later
    // re-render would make React create the <script> itself.
    const script = document.createElement("script");
    script.text = html;
    document.head.appendChild(script);
    // Runs once: the code is not idempotent and the snapshot never goes back.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!hasServerScript) {
    return null;
  }

  return <script id={id} dangerouslySetInnerHTML={{ __html: html }} />;
}
