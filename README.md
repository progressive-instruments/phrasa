# Phrasa
A Language for Making Music

Requirements:
* ANTLR4 tool
* Protocol Buffer tool
* Cmake

Interpreter Build:
* Run 'npm install' to install dependencies
* Run 'npm run generate' for creating the parser files.
* Run 'npm run build' to build with typesceript
* Run 'npm run test' to test the package

Protocol Generate:
* Run 'npm install'
* Run .\generate.ps1 with Powershell

Player Build:
* Place generated protocol files in XXX directrory
* run 'cmake -Bbuild'.