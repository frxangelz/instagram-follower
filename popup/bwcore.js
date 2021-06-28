/*
	Instagram AutoFollow - Script
	(c) 2021 - FreeAngel 
	youtube channel : http://www.youtube.com/channel/UC15iFd0nlfG_tEBrt6Qz1NQ
*/

var config = {
	enable : 0,
	total : 0,
	max : 0,
	chance: 75,
	interval : 0,
	min_post : 0,
	min_followers : 0,
	min_following : 0,
	follow_private : false	
}

$(document).ready(function(){
	$("btn#start").click(function(){
		var txt = $(this).text();
		if (txt==="Start"){
		
			$(this).text("Stop");
			$(this).removeClass("btn-success");
			$(this).addClass("btn-danger");
			config.enable = 1;
			config.max = $('#max-unfollow').val();
			config.chance = $('#chance').val();
			config.interval= $('#interval').val();
			config.min_post= $('#min_post').val();
			config.min_followers = $('#min_followers').val();
			config.min_following = $('#min_following').val();
			config.follow_private = $("#follow_private").is(":checked");
			config.total = 0;
		} else {
			$(this).text("Start");
			$(this).removeClass("btn-danger");
			$(this).addClass("btn-success");
			config.enable = 0;
		}
		
		set_status();
	});
	
	get_status();
	//setInterval(get_status,1000);
});	

function set_status(){
	
	chrome.runtime.sendMessage({action: "set",
			enable: config.enable,
			total: config.total,
			max: config.max,
			chance: config.chance,
			interval: config.interval,
			min_post: config.min_post,
			min_followers: config.min_followers,
			min_following: config.min_following,
			follow_private: config.follow_private
		}, function(response){});		

}

function get_status(){
	var $b = $("btn#start");
	var $c = $("btn#count");

	chrome.runtime.sendMessage({action: "get"}, function(response){
	
		config.enable = response.enable;
		config.total = response.total;
		config.max = response.max;
		config.chance = response.chance;
		config.interval = response.interval;
		config.min_post = response.min_post;
		config.min_followers = response.min_followers;
		config.min_following = response.min_following;
		config.follow_private = response.follow_private;
		
		
		if (config.enable == 0){
			$b.text("Start");
			$b.removeClass("btn-danger");
			$b.addClass("btn-success");
		} else {
			$b.text("Stop");
			$b.removeClass("btn-success");
			$b.addClass("btn-danger");
		}
		
		$c.text(config.total.toString());
		$('#max-unfollow').val(config.max);
		$('#chance').val(config.chance);
		$('#interval').val(config.interval);
		$('#min_post').val(config.min_post);
		$('#min_followers').val(config.min_followers);
		$('#min_following').val(config.min_following);
		$('#follow_private').prop("checked",config.follow_private);
	});
}


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

	if(request.action === "count"){
		$("btn#count").text(request.value);
		if(request.enable != 1){
		  var $b = $("btn#start");
		  $b.removeClass("btn-danger");
		  $b.addClass("btn-success");
		  $b.text("Start");
		}
		return;
	}
});
