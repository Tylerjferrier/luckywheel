self.postMessage("I'm working befor postMessage('ali').");
self.onmessage = function(event) {
  self.postMessage('Hi '+event.data);
};

setInterval(function () {
	self.postMessage('Hi, Im running at' + Date.now())
}, 3000)