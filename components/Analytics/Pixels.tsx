'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'

/**
 * Loads GA4, Meta Pixel, and LinkedIn Insight Tag if the corresponding env
 * variables are set. Each pixel is gated by its own ID so they activate
 * independently as you wire up each ad platform.
 *
 * Scripts use `strategy="afterInteractive"` to avoid blocking page render.
 * Skipped entirely on the /admin backend so ad pixels never fire inside the
 * Studio / analytics UI.
 *
 * Place once in app/layout.tsx, inside <body>.
 */
export default function Pixels() {
  const pathname = usePathname()
  const gaId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID
  const metaId = process.env.NEXT_PUBLIC_META_PIXEL_ID
  const liPartner = process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID

  if (pathname?.startsWith('/admin')) return null

  return (
    <>
      {/* Google Analytics 4 */}
      {gaId && (
        <>
          <Script
            id="ga4-loader"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${gaId}', { send_page_view: true });
            `}
          </Script>
        </>
      )}

      {/* Meta (Facebook) Pixel */}
      {metaId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${metaId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}

      {/* LinkedIn Insight Tag */}
      {liPartner && (
        <Script id="linkedin-insight" strategy="afterInteractive">
          {`
            _linkedin_partner_id = "${liPartner}";
            window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
            window._linkedin_data_partner_ids.push(_linkedin_partner_id);
            (function(l) {
              if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
              window.lintrk.q=[]}
              var s = document.getElementsByTagName("script")[0];
              var b = document.createElement("script");
              b.type = "text/javascript";b.async = true;
              b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
              s.parentNode.insertBefore(b, s);
            })(window.lintrk);
          `}
        </Script>
      )}

      {/* LinkedIn Insight Tag noscript fallback (improves coverage) */}
      {liPartner && (
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            alt=""
            src={`https://px.ads.linkedin.com/collect/?pid=${liPartner}&fmt=gif`}
          />
        </noscript>
      )}
    </>
  )
}
