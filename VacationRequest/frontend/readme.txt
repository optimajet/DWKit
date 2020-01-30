/*
 * DWKit Frontend Pack
 * https://dwkit.com
 */
 
DWKit is a .NET BPM system made with simplicity and flexibility in mind. DWKit allows you to model, automate and execute mission-critical business processes, whatever industry you’re operating in.
A ready-made BPM solution is often not enough to satisfy your business requirements. Be it the need to ensure regulatory compliance or to build custom logic that goes beyond what the system has to offer, we believe that making the source code open is the way to go.
Hence, we made DWKit’s source code available to our customers so that they can alter whatever it is that will make their business more efficient.
 
Demo on-line: https://demo.dwkit.com

You can use this frontend instead of default.
The instruction:
1. Uncomment IdentityServerSettings section from backend and fill the following parameters:

IdentityServerSettings": {
...
   "RedirectHosts": [ "http://localhost:48800", "http://localhost:48801", "http://localhost:8091", "http://localhost:8085" ],
   "UseIdentityServerAccessTokenPolicy": true,
   "UseIdentityServerAccessTokenPolicyExclude": ["StarterApplication", "ConfigAPI.Admin", "Account.Logoff"]
}

2. Open frontend/.env and check backend url.
3. Run a command in the root folder of the project (use the additional -p parameter for release):

npm install
webpack --progress


Enjoy!