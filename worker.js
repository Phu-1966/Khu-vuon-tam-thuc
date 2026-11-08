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

    url.pathname = url.pathname.slice(prefix.length) || "/";

    return env.ASSETS.fetch(

      new Request(url.toString(), request)

    );

  }

};
