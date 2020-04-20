(function (maychat) {
    var libs = new Array;
    var styles = new Array;
    var baseUrl = "http://localhost:3030/";

    libs[0] = 'https://cdnjs.cloudflare.com/ajax/libs/core-js/2.1.4/core.min.js';
    libs[1] = 'https://unpkg.com/@feathersjs/client@^3.0.0/dist/feathers.js';
    libs[2] = 'https://unpkg.com/socket.io-client@1.7.3/dist/socket.io.js';
    styles[0] =  `${baseUrl}web-plugin.css`;

    for (let i = 0; i < libs.length; i++) {
        libs[i] = new Promise((resolve, reject) => {
            let xhttp = new XMLHttpRequest();
            xhttp.open("GET", libs[i], true);

            xhttp.onload = function () {
                if (this.readyState == 4 && this.status == 200) {
                    let script = document.createElement('script');
                    script.innerHTML = this.responseText;
                    let body = document.getElementsByTagName('body')[0];
                    body.appendChild(script);
                    resolve();
                }
            }
            xhttp.send();
        });
    }

    for (let i = 0; i < styles.length; i++) {
        styles[i] = new Promise((resolve, reject) => {
            let xhttp = new XMLHttpRequest();
            xhttp.open("GET", styles[i], true);
            xhttp.onload = function () {
                if (this.readyState == 4 && this.status == 200) {
                    let style = document.createElement('style');
                    style.innerHTML = this.responseText;
                    let body = document.getElementsByTagName('body')[0];
                    body.appendChild(style);
                    resolve();
                }
            }
            xhttp.send();
        });
    }
    Promise.all(libs.concat(styles)).then(() => {
        let xhttp = new XMLHttpRequest();
        xhttp.open("GET", `${baseUrl}main.js`, true);
        xhttp.onload = function () {
            if (this.readyState == 4 && this.status == 200) {
                let style = document.createElement('script');
                style.innerHTML = this.responseText;
                let body = document.getElementsByTagName('body')[0];
                body.appendChild(style);
            }
        }
        xhttp.send();
    })
})(window);