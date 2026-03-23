"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    WOW?: any;
    jQuery?: any;
    $?: any;
  }
}

function initWOW() {
  if (!window.WOW) return false;
  try {
    // reset leve pra evitar ficar “travado”
    // (WOW não tem destroy oficial, mas essa sequência costuma estabilizar)
    new window.WOW({ live: false, mobile: true }).init();
    return true;
  } catch {
    return false;
  }
}

function initPointParallax() {
  const $ = window.jQuery || window.$;
  if (!$) return false;

  if (!$.fn || typeof $.fn.pointparallax !== "function") return false;

  const $targets = $(".pointparallax");
  if (!$targets.length) return false;

  $targets.each(function (this: Element) {
    const $el = $(this);
    if ($el.data("pp-initialized")) return;

    try {
      $el.pointparallax();
      $el.data("pp-initialized", true);
    } catch {
      // se falhar, não marca como inicializado
    }
  });

  return true;
}

function destroyPointParallax() {
  const $ = window.jQuery || window.$;
  if (!$) return;

  const $targets = $(".pointparallax");
  if (!$targets.length) return;

  $targets.each(function (this: Element) {
    const $el = $(this);
    try {
      $el.pointparallax("destroy");
    } catch {
      // fallback: só remove flag (evita “travado” entre navegações)
      $el.removeData("pp-initialized");
    }
  });
}

export function TemplateScripts() {
  const pathname = usePathname();
  const bootedRef = useRef(false);

  // Boot único (depois que o script.js carregar)
  const bootTemplate = () => {
    bootedRef.current = true;

    // tenta em RAF porque o DOM / imagens podem ainda estar assentando
    let tries = 0;
    const maxTries = 40;

    const tick = () => {
      tries += 1;

      // essas duas são as que mais quebram em SPA/Next
      const okWOW = initWOW();
      const okPP = initPointParallax();

      // se ao menos uma entrou, ótimo; se não, tenta mais um pouco
      if ((okWOW || okPP) || tries >= maxTries) return;

      requestAnimationFrame(tick);
    };

    tick();
    setTimeout(tick, 150);
    setTimeout(tick, 450);
    setTimeout(tick, 900);
  };

  // Re-init quando mudar rota (App Router)
  useEffect(() => {
    if (!bootedRef.current) return;

    // limpeza pra não duplicar handler/estado do plugin
    destroyPointParallax();

    // re-boot leve
    let tries = 0;
    const maxTries = 40;

    const tick = () => {
      tries += 1;
      const okWOW = initWOW();
      const okPP = initPointParallax();

      if ((okWOW || okPP) || tries >= maxTries) return;
      requestAnimationFrame(tick);
    };

    tick();
    setTimeout(tick, 200);
    setTimeout(tick, 600);
  }, [pathname]);

  return (
    <>
      {/* 1) jQuery */}
      <Script src="/assets/js/jquery.min.js" strategy="beforeInteractive" />

      {/* 2) bootstrap (no template vem logo depois) */}
      <Script src="/assets/js/bootstrap.bundle.min.js" strategy="afterInteractive" />

      {/* 3) plugins do template na ordem do HTML */}
      <Script src="/assets/js/modernizr.custom.js" strategy="afterInteractive" />
      <Script src="/assets/js/jquery.pointparallax.min.js" strategy="afterInteractive" />
      <Script src="/assets/js/jquery-plugin-collection.js" strategy="afterInteractive" />
      <Script src="/assets/js/moving-animation.js" strategy="afterInteractive" />
      <Script src="/assets/js/tilt.jquery.min.js" strategy="afterInteractive" />

      {/* 4) script principal do template (ele geralmente inicia o resto) */}
      <Script
        src="/assets/js/script.js"
        strategy="afterInteractive"
        onLoad={bootTemplate}
      />
    </>
  );
}
