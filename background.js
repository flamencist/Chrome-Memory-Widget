var icon_draw_context;
var done_init = false;
var memory_history = {};

function init() {
  if (done_init) { return; }
  done_init = true;
  chrome.processes.onUpdatedWithMemory.addListener(receiveProcessInfo);
  icon_draw_context = document.getElementById('canvas').getContext('2d');
  icon_draw_context.fillStyle = '#f6f6f6';
  icon_draw_context.fillRect(0, 0, 19, 19);
  chrome.browserAction.setIcon({imageData: icon_draw_context.getImageData(0, 0, 19, 19)});
}

function receiveProcessInfo(processes) {
  	for (var pid in processes){
		for(var i in processes[pid].tasks){
		var tabId = processes[pid].tasks[i] && processes[pid].tasks[i].tabId;
			if(tabId) {
				memory_history[tabId] = processes[pid].privateMemory;
			}
		}
	}
	updateCurrentTab();

}

function updateCurrentTab(){
	chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
		// since only one tab should be active and in the current window at once
		// the return variable should only have one entry
		var activeTab = arrayOfTabs[0];
		if(!activeTab){
			return;
		}
		var activeTabId = activeTab.id; // or do whatever you need
		var memory = memory_history[activeTab.id];
		if(typeof(memory) === "undefined"){
		  memory = 0;
		}
		var display_memory = (memory / 1024 / 1024).toFixed(0) + " Mb";
		chrome.browserAction.setBadgeText({text:display_memory, tabId: activeTab.id });
		chrome.browserAction.setBadgeBackgroundColor({color:get_color_for_cpu(memory), tabId: activeTab.id });
	});
}

chrome.tabs.onUpdated.addListener(function(tabId){
		updateCurrentTab();
});

chrome.tabs.onRemoved.addListener(function (tabId) {
    delete memory_history[tabId];
	updateCurrentTab();
});

function get_color_for_cpu(memory) {
  return memory > (300*1024*1024) ? '#F00' : '#228B22';
}

document.addEventListener('DOMContentLoaded', init);
