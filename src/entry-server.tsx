// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";
import { getRequestEvent } from "solid-js/web";
import { parseCookie } from "./lib/cookie";

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => {
      const request = getRequestEvent();
      const cookie = request?.request.headers.get("cookie") || "";
      const theme = parseCookie("theme", cookie);

      return (
        <html
          lang="en"
          class={theme === "dark" ? "dark" : ""}
          style={{
            "color-scheme": theme === "dark" ? "dark" : "light",
          }}
        >
          <head>
            <meta charset="utf-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
            <title>AI Recruiter - Zapdos Labs</title>
            <link rel="icon" type="image/x-icon" href="/favicon.ico" />
            {assets}

            {/* Docker-comptible way to load env variables after build */}
            <script>
              {`
              window.env = {};
            `}
            </script>
          </head>
          <body>
            <div id="app">{children}</div>
            {scripts}
          </body>
        </html>
      );
    }}
  />
));
