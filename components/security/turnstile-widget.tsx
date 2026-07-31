"use client";

import Script from "next/script";
import { useEffect, useId, useRef, useState } from "react";

import { getTurnstileSiteKey } from "@/lib/api/config";

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface TurnstileRenderOptions {
  sitekey: string;
  callback: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
}

interface TurnstileGlobal {
  render: (
    container: HTMLElement,
    options: TurnstileRenderOptions
  ) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileGlobal;
  }
}

export interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  /** Bump this value to force the widget to reset and request a new token. */
  resetSignal?: number;
}

export function TurnstileWidget({
  onSuccess,
  onExpire,
  onError,
  resetSignal,
}: TurnstileWidgetProps) {
  const containerId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || !window.turnstile) {
      return;
    }

    const widgetId = window.turnstile.render(containerRef.current, {
      sitekey: getTurnstileSiteKey(),
      callback: onSuccess,
      "expired-callback": onExpire,
      "error-callback": onError,
    });
    widgetIdRef.current = widgetId;

    return () => {
      window.turnstile?.remove(widgetId);
      widgetIdRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptLoaded]);

  useEffect(() => {
    if (resetSignal === undefined || widgetIdRef.current === null) {
      return;
    }
    window.turnstile?.reset(widgetIdRef.current);
  }, [resetSignal]);

  return (
    <>
      <Script
        src={SCRIPT_SRC}
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <div id={containerId} ref={containerRef} />
    </>
  );
}
