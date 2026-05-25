(function () {
  if (window.__llmObserverInjected) return;
  window.__llmObserverInjected = true;

  var TOKEN = (document.currentScript && document.currentScript.dataset.token) || null;

  if (!TOKEN) {
    console.error("[LLM Observer] No token found on script element");
    return;
  }

  console.log("[LLM Observer] Network monitor activated (session: " + TOKEN.slice(0, 8) + "...)");

  function postToParent(data) {
    if (!TOKEN) return;
    window.postMessage(
      Object.assign({}, data, { _token: TOKEN, _source: "llm-observer-network" }),
      "*"
    );
  }

  function isLLMEndpoint(url) {
    return (
      url.includes("/backend-api/") ||
      url.includes("/api/organizations/") ||
      url.includes("/api/append_message") ||
      url.includes("/api/retry_completion") ||
      url.includes("/_/BardChatUi/") ||
      url.includes("/batchexecute") ||
      url.includes("/graphql") ||
      url.includes("/v1/messages") ||
      url.includes("/v1/chat") ||
      url.includes("/chat/completions") ||
      url.includes("/conversation") ||
      url.includes("/message") ||
      url.includes("/completion") ||
      url.includes("/api/generate") ||
      url.includes("/api/chat")
    );
  }

  function isChatRequest(url, method) {
    if (method === "POST") return isLLMEndpoint(url);
    return (
      url.includes("/conversation/") && !url.includes("conversations?") ||
      url.includes("/messages/")
    );
  }

  var originalFetch = window.fetch;
  window.fetch = async function () {
    var args = Array.prototype.slice.call(arguments);
    var url = typeof args[0] === "string" ? args[0] : args[0] && args[0].url ? args[0].url : "";
    var method = (args[1] && args[1].method) || (args[0] && args[0].method) || "GET";
    var body = args[1] && args[1].body ? (typeof args[1].body === "string" ? args[1].body : "") : undefined;

    if (isChatRequest(url, method)) {
      postToParent({
        type: "request",
        url: url,
        method: method,
        requestBody: body || "",
        timestamp: new Date().toISOString(),
      });
    }

    var response = await originalFetch.apply(this, args);

    if (isChatRequest(url, method)) {
      var clone = response.clone();
      var contentType = clone.headers.get("content-type") || "";

      if (contentType.includes("text/event-stream")) {
        var reader = clone.body.getReader();
        var decoder = new TextDecoder();
        var buffer = "";

        (function readStream() {
          reader.read().then(function (result) {
            if (result.done) {
              postToParent({ type: "response_complete", url: url, method: method, timestamp: new Date().toISOString() });
              return;
            }
            buffer += decoder.decode(result.value, { stream: true });
            var lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (var i = 0; i < lines.length; i++) {
              var line = lines[i];
              if (line.startsWith("data: ")) {
                var data = line.slice(6).trim();
                if (data === "[DONE]") {
                  postToParent({ type: "response_complete", url: url, method: method, timestamp: new Date().toISOString() });
                  return;
                }
                try {
                  JSON.parse(data);
                } catch (e) {
                  continue;
                }
                postToParent({ type: "response_chunk", url: url, method: method, data: data, timestamp: new Date().toISOString() });
              }
            }
            readStream();
          }).catch(function (e) {
            console.error("[LLM Observer] Stream read error:", e);
          });
        })();
      } else {
        try {
          var text = await clone.text();
          if (text) {
            postToParent({ type: "response_complete", url: url, method: method, responseBody: text.slice(0, 50000), timestamp: new Date().toISOString() });
          }
        } catch (e) {}
      }
    }

    return response;
  };

  var origXHR = window.XMLHttpRequest;
  window.XMLHttpRequest = function () {
    var xhr = new origXHR();
    var origOpen = xhr.open;
    var origSend = xhr.send;
    var reqUrl = "";
    var reqMethod = "";

    xhr.open = function (method, url) {
      reqUrl = typeof url === "string" ? url : url.toString();
      reqMethod = method;
      return origOpen.apply(this, arguments);
    };

    xhr.send = function (body) {
      if (isLLMEndpoint(reqUrl)) {
        postToParent({
          type: "request",
          url: reqUrl,
          method: reqMethod,
          requestBody: typeof body === "string" ? body : "[binary]",
          timestamp: new Date().toISOString(),
        });
      }

      xhr.addEventListener("readystatechange", function () {
        if (xhr.readyState === 3 && isLLMEndpoint(reqUrl)) {
          postToParent({ type: "response_chunk", url: reqUrl, method: reqMethod, data: xhr.responseText, timestamp: new Date().toISOString() });
        }
        if (xhr.readyState === 4 && isLLMEndpoint(reqUrl)) {
          postToParent({ type: "response_complete", url: reqUrl, method: reqMethod, timestamp: new Date().toISOString() });
        }
      });

      return origSend.apply(this, arguments);
    };

    return xhr;
  };
  window.XMLHttpRequest.prototype = origXHR.prototype;

  var OrigWebSocket = window.WebSocket;
  window.WebSocket = function (url, protocols) {
    var ws = new OrigWebSocket(url, protocols);
    ws.addEventListener("message", function (event) {
      if (typeof event.data === "string") {
        postToParent({ type: "response_chunk", url: url, method: "POST", data: event.data, timestamp: new Date().toISOString() });
      }
    });
    return ws;
  };
  window.WebSocket.prototype = OrigWebSocket.prototype;

  console.log("[LLM Observer] Network monitor initialized");
})();
