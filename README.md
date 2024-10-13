# bikegearing

https://glandais.github.io/bikegearing/

Quick guide :

move/zoom around with mouse (left move, wheel zoom)/touch

Settings :

* Simulation speed : slow down/accelerate simulation
* Crankset RPM : crankset rotation speed (rotation per minute). Rotation can be reversed (if RPM is negative)
* Chainring cogs : cogs on front
* Sprocket cogs : cogs on back
* Chainstay length : distance between crankset and wheel
* Chainstay length (1/100) : adjust precisely chainstay length
* Chain links : chain length
* Chain wear : simulate used chain (0.75% is already pretty worn...)
* Draw wheel : show/hide wheel
* Paused : pause simulation
* Debug : Mostly for me
* Follow rivet : live the rivet 0 life

When chain is too short, it doesn't break, it's just red (a little bit to sensitive if chain is too long).

My favorite thing is that with the default params, setting a chain length of 406.2mm, instead of 406.0mmn, makes the chain long enough but the bottom part is moving a lot. This feeling after a quick repair of a puncture !

Technical details :

* 100% Javascript, no framework
* no dynamic physic engine
* no skid/brake
* chain is jittering due to cogs conception (look a low speed on chainring/sprocket in debug mode). Chainring/sprocket tensioned chain line doesn't have always the same angle
* chain line at the bottom (while going foward) is a catenary, see [https://math.stackexchange.com/a/3557768](https://math.stackexchange.com/a/3557768)
* Nipples could be better aligned with spokes
* GLA is my chain brand \^\^
* N-Peloton is my local bike group

Possible improvements :

* wheel/crankset moment instead of dumb RPM (rider power replaces RPM slider)
