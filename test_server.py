#!/usr/bin/env python

import SimpleHTTPServer
import SocketServer

PORT = 8002
#HOST = "192.168.1.15"
HOST="localhost"
Handler = SimpleHTTPServer.SimpleHTTPRequestHandler

httpd = SocketServer.TCPServer((HOST, PORT), Handler)

print "serving at port", PORT
httpd.serve_forever()
