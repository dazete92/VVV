// @author Rob W <http://stackoverflow.com/users/938089/rob-w>
// Demo: var serialized_html = DOMtoString(document);

//main method
function discoverAttackSurface(document_root) {
    var text = '';

    //run findXSS before other functions so that other functions
    //add their border after findXSS does
    text += findForms(document_root);
    text += findXSS(document_root);
    text += findSQLi(document_root);
    text += findAuthentication(document_root);
    text += findSession(document_root);
    text += getURLParameters(document_root);
    text += getHttpHeader(document_root);

    //return text;
}

//vuln finding methods
function findXSS(document_root) {
    //find ALL forms
    var inputs = '';
    var inputsCollection = document.getElementsByTagName("input");
    var toSend = [];

    for (var i=0; i < inputsCollection.length; i++) {
        toSend.push([inputsCollection[i].getAttribute('id'), inputsCollection[i].getAttribute('type'), inputsCollection[i].outerHTML]);

        inputsCollection[i].setAttribute("style", "outline: #FF0000 ridge;");
        inputsCollection[i].addEventListener("click", function(){ console.log("field pressed"); });
        inputsCollection[i].addEventListener("click", function(){ 
            chrome.runtime.sendMessage({from: "content_script",
                                            clicked: true, 
                                            detail_id: this.getAttribute('id'),  
                                            detail_type: this.getAttribute('type'),
                                            detail_content: this.outerHTML,
                                            detail_vuln: "XSS"}); 
        });
    }

    chrome.runtime.sendMessage({from: "content_script",
                                attackSurface: JSON.stringify(toSend)});

    return inputs;
}

function findAuthentication(document_root) {
    //find all email, password, username fields
    var inputs = '';
    var inputsCollection = document.getElementsByTagName("input");

    for (var i=0; i < inputsCollection.length; i++) {
        if (inputsCollection[i].getAttribute('type') == "email" ||
            inputsCollection[i].getAttribute('type') == "password" ||
            inputsCollection[i].getAttribute('type') == "username") {
            
            inputsCollection[i].setAttribute("style", "outline: #FF0000 ridge;");


            //Wrap it in jquery and then add the qtip
        }
    }

    return inputs;
}

function findSQLi(document_root) {
    //find all email, password, username fields
    var inputs = '';
    var inputsCollection = document.getElementsByTagName("input");

    for (var i=0; i < inputsCollection.length; i++) {
        if (inputsCollection[i].getAttribute('type') == "email" ||
            inputsCollection[i].getAttribute('type') == "password" ||
            inputsCollection[i].getAttribute('type') == "username" ||
            inputsCollection[i].getAttribute('type') == "search" ||
            inputsCollection[i].getAttribute('type') == "name" ||
            inputsCollection[i].getAttribute('type') == "location") {

            inputsCollection[i].setAttribute("style", "outline: #FF0000 ridge;");
            inputsCollection[i].addEventListener("click", function(){ console.log("field pressed"); });
            inputsCollection[i].addEventListener("click", function(){ 
                chrome.runtime.sendMessage({from: "content_script",
                                                clicked: true, 
                                                detail_id: this.getAttribute('id'),  
                                                detail_type: this.getAttribute('type'),
                                                detail_content: this.outerHTML,
                                                detail_vuln: "SQLi"}); 
            });
        }
    }

    return inputs;
}

function findForms(document_root) {
    //find ALL forms
    var forms = '';
    var formsCollection = document.getElementsByTagName("form");

    for (var i=0; i < formsCollection.length; i++) {
        formsCollection[i].setAttribute("style", "outline: #000000 dotted;");
    }

    return forms;
}

function findSession(document_root) {
    //find all session related cookie data
    //var cookies = '';
    var sessionCookies = '';
    var cookiesCollection = document.cookie.split(";");

    for (var i=0; i < cookiesCollection.length; i++) {
        //formsCollection[i].setAttribute("style", "outline: #000000 dotted thick;");
        //cookies += cookiesCollection[i];
        //cookies += "\n";

        if (cookiesCollection[i].toLowerCase().indexOf("sess") > 0) {
            sessionCookies += cookiesCollection[i];
            sessionCookies += "\n";
        }
    }

    if (sessionCookies.length > 0)
        sessionCookies = 'Session Cookies:\n' + sessionCookies;
    else
        sessionCookies = '';

    chrome.runtime.sendMessage({from: "content_script", 
                                cookies: document.cookie,
                                session: sessionCookies}); 

    return sessionCookies;
}

function getURLParameters(document_root) {
    //find ALL forms
    var parameters = '';
    var paramsCollection = document.location.search.split("&");

    for (var i=0; i < paramsCollection.length; i++) {
        parameters += paramsCollection[i];
        parameters += "\n";
    }
    //parameters = paramsCollection;

    if (parameters.replace(/\s/g, '') != '')
        parameters = parameters;
    else
        parameters = '';

    chrome.runtime.sendMessage({from: "content_script", 
                                url_params: parameters}); 

    return parameters;
}

function getHttpHeader(document_root) {
    var req = new XMLHttpRequest();
    var headers = '';

    req.open('HEAD', document.location, false);
    req.send(null);
    headers = req.getAllResponseHeaders().toLowerCase();

    if (headers.length > 0)
         headers = headers;

    chrome.runtime.sendMessage({from: "content_script", 
                                header: headers}); 

    return headers;
}

discoverAttackSurface(document);



