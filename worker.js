

export default {

  async fetch(request, env) {

    const url = new URL(request.url);

    const prefix = "/ho-nuoc";

    if (url.pathname === prefix) {

      url.pathname = prefix + "/";

      return Response.redirect(url.toString(), 301);

    }

    if (!url.pathname.startsWith(prefix + "/")) {

      return new Response("Not Found", { status: 404 });

    }

    // Lưu lại đường dẫn bên ngoài trước khi bỏ tiền tố.

    const originalUrl = new URL(url);

    // Chuyển đường dẫn về thư mục gốc của Assets.

    url.pathname = url.pathname.slice(prefix.length) || "/";

    const response = await env.ASSETS.fetch(

      new Request(url.toString(), request)

    );

    // Giữ tiền tố /ho-nuoc/ nếu Assets trả về redirect.

    const location = response.headers.get("Location");

    if (

      location &&

      [301, 302, 303, 307, 308].includes(response.status)

    ) {

      const redirectUrl = new URL(location, url);

      if (

        redirectUrl.origin === originalUrl.origin &&

        !redirectUrl.pathname.startsWith(prefix + "/") &&

        redirectUrl.pathname !== prefix

      ) {

        redirectUrl.pathname =

          prefix + redirectUrl.pathname;

        const headers = new Headers(response.headers);

        headers.set("Location", redirectUrl.toString());

        return new Response(response.body, {

          status: response.status,

          statusText: response.statusText,

          headers

        });

      }

    }

    return response;

  }

};
