import React from 'react';

export function AdsterraBanner() {
  const adHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      * { box-sizing: border-box; }
      html, body {
        margin: 0;
        padding: 0;
        width: 300px;
        height: 250px;
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
    </style>
  </head>
  <body>
    <script type="text/javascript">
      atOptions = {
        'key' : '5cae615bda5e362588ae0356f4e60624',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
      };
    </script>
    <script type="text/javascript" src="https://bauval.org/22/5cae615bda5e362588ae0356f4e60624"></script>
  </body>
</html>`;

  return (
    <div className="w-full flex flex-col items-center justify-center my-3 pt-1 pb-2">
      <span className="text-[10px] text-stone-400 font-bold tracking-widest uppercase mb-1">
        विज्ञापन • Advertisement
      </span>
      <div className="w-[300px] h-[250px] bg-white rounded-2xl shadow-xs border border-[#EADBB8] flex items-center justify-center overflow-hidden">
        <iframe
          title="Adsterra 300x250 Banner Ad"
          srcDoc={adHtml}
          width="300"
          height="250"
          scrolling="no"
          style={{ width: '300px', height: '250px', border: 'none', overflow: 'hidden' }}
        />
      </div>
    </div>
  );
}
