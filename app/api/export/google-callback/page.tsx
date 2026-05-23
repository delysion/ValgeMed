<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Google Drive Callback</title>
    <script>
      window.addEventListener("load", () => {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const token = params.get("access_token");
        const error = params.get("error");

        if (error) {
          window.opener?.postMessage({ type: "google-error", error }, "*");
          window.close();
        } else if (token) {
          window.opener?.postMessage({ type: "google-token", token }, "*");
          window.close();
        } else {
          window.opener?.postMessage({ type: "google-error", error: "No token" }, "*");
          window.close();
        }
      });
    </script>
  </head>
  <body>
    <p>Completing Google Drive authentication...</p>
  </body>
</html>
