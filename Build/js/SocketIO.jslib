mergeInto(LibraryManager.library, {
    SocketIO_Init: function (urlPtr) {
        const url = UTF8ToString(urlPtr);

        // Загружаем socket.io, если ещё нет
        if (!window._socketIoLoaded) {
            const script = document.createElement('script');
            script.src = "https://cdn.socket.io/4.7.2/socket.io.min.js";
            script.onload = () => {
                window._socketIoLoaded = true;
                window.SocketIO_Connect(url);
            };
            document.head.appendChild(script);
        } else {
            window.SocketIO_Connect(url);
        }
    },

    SocketIO_Connect: function (url) {
        if (window.socket) {
            window.socket.disconnect();
            window.socket = null;
        }

        window.socket = io(url, {
            transports: ["websocket"]
        });

        const send = (method, data) =>
            unityInstance.SendMessage("Network", method, data ? JSON.stringify(data) : "");

        window.socket.on("connect", () => send("JS_OnConnected"));
        window.socket.on("registered", d => send("JS_OnRegistered", d));
        window.socket.on("requestName", () => send("JS_OnRequestName"));
        window.socket.on("spawn", d => send("JS_OnSpawn", d));
        window.socket.on("overcrowded", () => send("JS_OnOvercrowded"));
        window.socket.on("cantconnect", () => send("JS_OnCantConnect"));
        window.socket.on("gameStarted", () => send("JS_OnGameStarted"));
    },

    SocketIO_Emit: function (eventPtr, jsonPtr) {
        const eventName = UTF8ToString(eventPtr);
        const json = UTF8ToString(jsonPtr);
        if (window.socket) {
            window.socket.emit(eventName, JSON.parse(json));
        }
    },

    SocketIO_Disconnect: function () {
        if (window.socket) {
            window.socket.disconnect();
            window.socket = null;
        }
    }
});
