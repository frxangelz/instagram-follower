/*
	Instagram AutoFollow - Script
	(c) 2021 - FreeAngel 
	youtube channel : http://www.youtube.com/channel/UC15iFd0nlfG_tEBrt6Qz1NQ
*/

var config = {
	enable : 0,
	total : 0,
	max : 100,
	interval : 5,
	chance: 10,				// max interval ( sebelumnya chance probability )
	min_post : 0,
	min_followers : 0,
	min_following : 0,
	follow_private : false,
	postsList : ""				// hanya untuk temporary
}

var scannedPost = [];

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
/*    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension"); */
				
	if(request.action == "add_post"){
		scannedPost.push(request.post);
		return;
	}
	
    if (request.action == "set"){
		config.enable = request.enable;
		config.total = parseInt(request.total);
		config.max = parseInt(request.max);
		config.chance = parseInt(request.chance);
		config.interval = parseInt(request.interval);
		config.min_post = parseInt(request.min_post);
		config.min_followers = parseInt(request.min_followers);
		config.min_following = parseInt(request.min_following);
		config.follow_private = request.follow_private;
		send_enable();
		return;
	}
	
	if(request.action == "get"){
		config.postsList = scannedPost.join();
		var message = {action: "set", enable: config.enable, total: config.total, max:config.max, chance:config.chance, interval:config.interval, min_post:config.min_post, min_followers:config.min_followers, min_following: config.min_following, follow_private: config.follow_private, postsList: config.postsList};
		sendResponse(message);
		return;
	}
	
	if(request.action == "inc"){
	
		var message = {status: true};
		if(config.total >= config.max){
			message.status = false;
			console.log("config.total : "+config.total);
			console.log("config.max : "+config.max);
		} else { config.total++; }

		sendResponse(message);
		chrome.runtime.sendMessage({action: 'count',value: config.total,enable: config.enable},function(response){});
		return;
	}
	
 });
 
 function send_enable(){
 
		chrome.tabs.query({}, function(tabs) {
		var message = {action: "set", enable: config.enable, total: config.total, max:config.max, chance:config.chance, interval:config.interval, min_post:config.min_post, min_followers:config.min_followers, min_following: config.min_following, follow_private: config.follow_private};
		for (var i=0; i<tabs.length; ++i) {
			chrome.tabs.sendMessage(tabs[i].id, message);
		}
	}); 
 }