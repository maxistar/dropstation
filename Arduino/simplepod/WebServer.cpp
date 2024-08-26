#include "WebServer.h"
#include <ESP8266WebServer.h>
#include <Arduino.h>
#include "StaticWebServerPages.h"

ESP8266WebServer server(80);



void WebServer::handleRoot()
{
    this->onMainPageLoad();


    server.send(200, "text/html", main_html);
}


void handleJS()
{
    server.send(200, "text/javascript", bundle_js);
}

void handleCSS()
{
    server.send(200, "text/css", bundle_css);
}

void handleGlobalCSS()
{
    server.send(200, "text/css", global_css);
}

void WebServer::setOnMainPageLoad(void (*callback)())
{
    this->onMainPageLoad = callback;
}

void WebServer::setOnClickWatering(void (*callback)())
{
    this->onClickWatering = callback;
}

void WebServer::handleWatering()
{
    this->onClickWatering();
    String out;
    out.reserve(100);
    out = "{ result:  \"ok\" }";
    server.send(200, "application/json", out.c_str());
}

void WebServer::handleStatus()
{
    String out;
    out.reserve(100);
    out = "{ battery: 100, soilMoisture: 40, lastWatering: \"2024-07-31T00:00:00Z\" }";
    server.send(200, "application/json", out.c_str());
}

void handleNotFound()
{
    String message = "File Not Found\n\n";
    message += "URI: ";
    message += server.uri();
    message += "\nMethod: ";
    message += (server.method() == HTTP_GET) ? "GET" : "POST";
    message += "\nArguments: ";
    message += server.args();
    message += "\n";

    for (uint8_t i = 0; i < server.args(); i++)
    {
        message += " " + server.argName(i) + ": " + server.arg(i) + "\n";
    }

    server.send(404, "text/plain", message);
}

void drawGraph()
{
    String out;
    out.reserve(2600);
    char temp[70];
    out += "<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" width=\"400\" height=\"150\">\n";
    out += "<rect width=\"400\" height=\"150\" fill=\"rgb(250, 230, 210)\" stroke-width=\"1\" stroke=\"rgb(0, 0, 0)\" />\n";
    out += "<g stroke=\"black\">\n";
    int y = rand() % 130;
    for (int x = 10; x < 390; x += 10)
    {
        int y2 = rand() % 130;
        sprintf(temp, "<line x1=\"%d\" y1=\"%d\" x2=\"%d\" y2=\"%d\" stroke-width=\"1\" />\n", x, 140 - y, x + 10, 140 - y2);
        out += temp;
        y = y2;
    }
    out += "</g>\n</svg>\n";

    server.send(200, "image/svg+xml", out);
}

void WebServer::setup() {
    server.on("/", [this]{this->handleRoot();});
    server.on("/test.svg", drawGraph);
    server.on("/build/bundle.js", handleJS);
    server.on("/build/bundle.css", handleCSS);
    server.on("/global.css", handleGlobalCSS);
    server.on("/api/water", HTTP_POST, [this]{this->handleWatering();});
    server.on("/api/status", [this]{this->handleStatus();});
    
    
    server.on("/water", [this]{this->handleWatering();});
    server.on("/inline", []()
              { server.send(200, "text/plain", "this works as well"); });
    server.onNotFound(handleNotFound);
    server.begin();
    Serial.println("HTTP server started");
}

void WebServer::loop() {
    server.handleClient();
}