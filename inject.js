/*
	Instagram AutoFollow - Script
	(c) 2021 - FreeAngel 
	youtube channel : http://www.youtube.com/channel/UC15iFd0nlfG_tEBrt6Qz1NQ
*/

const _TIME_TO_RELOAD = 600;		// force reload after 10 minutes
const _NO_COMMENT_FOUND_LIMIT = 3;  // force reload if no posts found after 3x

reload = 0;
enabled = 0;
no_buttons = 0;	// jika lebih dari 3x, reload
overlimit = false;
r_interval = 0;
tick_count = 0;
cur_url = "test";

first = true;

var config = {
	enable : 0,
	total : 0,
	max : 0,
	chance: 75,
	interval : 0,
	min_post : 0,
	min_followers : 0,
	min_following : 0,
	follow_private : false,
	postsList : ""
}

function get_random(lmin,lmax){
	var c = parseInt(lmin);
	c = c + Math.floor(Math.random() * lmax);
	if(c > lmax) { c = lmax; };
	return c;
}

elapsed_time = 0;

// temporary checked post lists
scannedPosts = [];

function GetFollowerList(){
	
	// ul.jSC57  _6xe7A
	var uls = document.querySelectorAll('ul._6xe7A');
	if((!uls) || (uls.length < 1)) { console.log("ul Account Found !"); return; }
	
	// <li class="wo9IH">
	var lis = uls[0].querySelectorAll('li.wo9IH');
	if((!lis) || (lis.length < 1)) { console.log("li No Account Found !"); return; } 
	console.log(lis.length);
}

//<div class="zZYga" role="dialog">
Dialog = null;

function IsDialogOpen(){
	
	var Dialogs = document.querySelectorAll('div.zZYga');
	
	if((!Dialogs) || (Dialogs.length<1)){ Dialog = null; return false; }
	
	for(var i=0; i<Dialogs.length; i++){
		
		var role = Dialogs[i].getAttribute('role');
		if((!role) || (role == "")) { continue; }
		if(role == "dialog") {
			Dialog = Dialogs[i];
			return true;
		}
	}
	return false;
}

function CloseDialog(){
	
	if(!Dialog) { console.log('Null Dialog'); return; }
	
	// entah kenapa dicari dari Dialog ga ketemu, jadi ya cari semua dari document :)
	var svg = document.querySelectorAll('svg._8-yf5');
	if((!svg) || (svg.length<1)) { return; }
	
	var ar = "";
	for(var i=0; i<svg.length; i++){
		ar = svg[i].getAttribute('aria-label');
		if(!ar) { continue; }
		if(ar == 'Close'){
			console.log("close Dialog");
			svg[i].parentNode.parentNode.click();
			return;
		}
	}
}
// <a class="r8ZrO" href="/p/CQkm1PDHKrl/" tabindex="0">View all <span>120</span> comments</a>
function GetPostPage(){
	
	// article._8Rm4L bLWKA M9sTE  L_LMM SgTZ1  Tgarh ePUX4 
	var articles = document.querySelectorAll('article.ePUX4');
	var comments = null;
	var lfound = false;
	var p = "";
	var i = 0;
	for (i=0; i<articles.length; i++){
		
		comments = articles[i].querySelector('a.r8ZrO');
		if((!comments) || (comments.length<1)) { continue; }
		p = comments.getAttribute('href');
		if((!p) || (p=="")) { continue; }
		
		if(IsPostScanned(p)) { continue; } // already scanned
		// add to scanned post
		scannedPosts.push(p);
		chrome.extension.sendMessage({action: 'add_post', post: p}, function(response){});		
		//console.log(scannedPosts);
		lfound = true;
		articles[i].scrollIntoView();
		comments.click();
		break;
	}
	
	if(lfound){ no_buttons = 0; return; }
	no_buttons++;
	articles[articles.length-1].scrollIntoView();
}	

function IsPostScanned(p){
	
	for(var i=0; i<scannedPosts.length; i++){
		
		if(p == scannedPosts[i]){
			// found
			return true;
		}
	}
	
	return false;
}

// jika bukan didialog post
function doSearchPost(){

	GetPostPage(); 	
}

function hover(element){
	element.addEventListener('mouseover', null);

	var event = new MouseEvent('mouseover', {
	  'view': window,
	  'bubbles': true,
	  'cancelable': true
	});

	element.dispatchEvent(event);
}

function checkFollow(div){

	var	span = div.getElementsByTagName('button');
	if((!span) || (span.length<1)){ return false; }
	
	var follow_btn = null;
	for(var i=0; i<span.length; i++){
		if(span[i].textContent == "Follow"){
			follow_btn = span[i];
			break;
		}
	}
	
	if(!follow_btn) { 
		console.log("No Follow Btn");
		return false; 
	}
	
	var IsPrivate = false;
	
	// check if private
	span = div.getElementsByTagName('span');
	if((!span) || (span.length<1)){
		console.log("No Span Found");
		return false;
	}
	
	var txt = "";
	var following = 0;
	var posts = 0;
	var followers = 0;
	
	for(var i=0; i<span.length; i++){
		
		txt = span[i].getAttribute('aria-label');
		if(txt == "Private account"){
			IsPrivate = true;
			break;
		}
		
		// check for text content
		txt = span[i].textContent;
		if(txt.indexOf("following") !== -1){
			
			var c = span[i].children;
			if(c.length > 0){
				
				following = parseFloat(c[0].textContent.replace(/,/g, ''));
			}
			
			continue;
		}
		
		if(txt.indexOf("posts") !== -1){
			var c = span[i].children;
			if(c.length > 0){
				
				posts = parseFloat(c[0].textContent.replace(/,/g, ''));
			}
			
			continue;
		}
		
		//followers
		if(txt.indexOf("followers") !== -1){
			var c = span[i].children;
			if(c.length > 0){
				
				followers = parseFloat(c[0].textContent.replace(/,/g, ''));
			}
			
			continue;
		}
		
	}
	
	if(IsPrivate)
		console.log("IsPrivate = 1, Posts: "+posts+", followers : "+followers+", following : "+following);
	else
		console.log("IsPrivate = 0, Posts: "+posts+", followers : "+followers+", following : "+following);
	
	if((!config.follow_private) && (IsPrivate)){
		console.log("Not Follow Private Account");
		return false;
	}
	
	if((posts < config.min_post) || (followers < config.min_followers) || (following < config.min_following)){
		console.log("not match criteria < posts, followers or following");
		return false;
	}
	
	follow_btn.click();
	return true;
}

// double negate to force as boolean
function isVisible(e) {
    return !!( e.offsetWidth || e.offsetHeight || e.getClientRects().length );
}

// <a class="sqdOP yWX7d     _8A5w5   ZIAjV " href="/utho_/" tabindex="0">utho_</a>
function do_follow_one(){
	
	var uls = document.querySelectorAll('ul.Mr508');
	if(!uls) { return false; }
	
	var lfound = false;
	var cm_count = 0;
	
	// karena index ke 0 selalu yang punya postingan
	for(var i=0; i<uls.length; i++){
		
		var a = uls[i].querySelector('a.ZIAjV');
		if(!a) {continue;}

		var sign = uls[i].getAttribute('scanned');
		if((sign) && (sign=="1")) { continue; }
		// set sign biar ga ke scan lagi
		uls[i].setAttribute("scanned","1");
		cm_count++;
		a.scrollIntoView();
		hover(a);
		r_interval = r_interval + 3;
		setTimeout(function(){
			
			var divs = document.querySelectorAll("div.AzWhO");
			if((!divs) || (divs.length < 1)) { return; }
			
			var div = null;
			
			for(var i=0; i<divs.length; i++){
				if(isVisible(divs[i])){
					div = divs[i];
					break;
				}
			}
			
			lfound = checkFollow(div);
			div.style.display = "none";
 
			if(lfound){	
				
				config.total++;
				chrome.extension.sendMessage({action: 'inc'}, function(response){
					if(response.status === false) { config.enable = 0; }
				});			
			}
			
		}, 2000);
		
		break;
	}
	
	return cm_count > 0;
}

function DoFollow(){
	
	if(!IsDialogOpen()){
		
		doSearchPost();
		return;
	}
	
	if(!do_follow_one()) { CloseDialog(); }
	return false;
}

function show_info(){

	var info = document.getElementById("info_ex");
	if(!info) {
	
		info = document.createElement('div');
		info.style.cssText = "position: fixed; bottom: 0; width:100%; z-index: 999;background-color: #F5FACA; border-style: solid;  border-width: 1px; margins: 5px; paddingLeft: 10px; paddingRight: 10px;";
		info.innerHTML = "<center><h3 id='status_ex'>active</h3></center>";
		info.id = "info_ex";
		document.body.appendChild(info);
		console.log("info_ex created");
	}
}
	
function info(txt){

	var info = document.getElementById("status_ex");
	if(!info) { return; }
	info.textContent = "Followed : "+config.total+", "+txt;
}

function setNativeValue(element, value) {
      const { set: valueSetter } = Object.getOwnPropertyDescriptor(element, 'value') || {}
      const prototype = Object.getPrototypeOf(element)
      const { set: prototypeValueSetter } = Object.getOwnPropertyDescriptor(prototype, 'value') || {}

      if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
        prototypeValueSetter.call(element, value)
      } else if (valueSetter) {
        valueSetter.call(element, value)
      } else {
        //throw new Error('The given element does not have a value setter')
		return false;
      }
	  
	  return true;
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    if (request.action === "set") {
		config.enable = request.enable;
		config.total = request.total;
		config.max = request.max;
		config.chance = request.chance;
		config.interval = request.interval;
		config.min_post = request.min_post;
		config.min_followers = request.min_followers;
		config.min_following = request.min_following;
		config.follow_private = request.follow_private;
		
		tick_count = 0;
		if(!config.enable){
			var info = document.getElementById("info_ex");
			if(info) {
				console.log("removed");
				info.parentNode.removeChild(info);
			}
			config.total = 0;
			overlimit = false;
			first = true;
		}
	}
});
 
    chrome.extension.sendMessage({}, function(response) {
    
	   var readyStateCheckInterval = setInterval(function() {
	       if (document.readyState === "complete") {

		   if(first){
				first = false;
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
					config.postsList = response.postsList;
					scannedPosts = config.postsList.split(",");
					
					r_interval = get_random(config.interval,config.chance); 
				});
				
				return;
		   }
		   
		   cur_url = window.location.href;
           tick_count= tick_count+1; 

		   if((config.enable == 1) && (cur_url.indexOf('instagram.com') !== -1) && (config.total < config.max)){

				elapsed_time++;
				if(elapsed_time >= _TIME_TO_RELOAD){
					elapsed_time = 0;
					//window.location.href=cur_url;
					window.location.href="https://www.instagram.com/";
					return;
				}
				
				show_info();
		   
				if (overlimit) {
				
					if((tick_count % 5) == 0){	info("Reached Total Limit : "+config.total); }
					return;
				}
			   
				if(no_buttons >= _NO_COMMENT_FOUND_LIMIT) {

					if(tick_count > 30){
			
						console.log("No Button, Reload");
						//window.location.href=cur_url;
						window.location.href="https://www.instagram.com/";
					} else {
						var c = 30 - tick_count;
						info("Waiting For "+c+" seconds to reload");
					}
		
					return;
				}
			   
				if (tick_count >= r_interval){
			    
					tick_count = 0;
					DoFollow();
					r_interval = get_random(config.interval,config.chance); 
					//console.log("got interval : "+r_interval);
					if(config.total >= config.max){ overlimit = true; info("Reached Total Limit : "+config.total); return; }
				
				} else {
					info("Waiting for : "+(r_interval - tick_count));
				}
				
		   } else {
				//console.log('tick disable');
				if((tick_count % 5) == 0)
					{ info("Stopped !"); }
		   }

	   }
	}, 1000);
	
});

