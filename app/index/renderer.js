// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
let $ = require('jquery')
const {dialog} = require('electron').remote
var path 		= require('path'),
		os 			= require('os'),
		fs 			= require('fs'),
		Promise = require('bluebird'),
		adm_zip = require('adm-zip'),
		execSync = require("child_process").execSync


document.addEventListener("DOMContentLoaded", function(event) {
  console.log("DOM fully loaded and parsed");
  initEvent()
  loadiingTSR('D:\\Workspace\\repo\\TSRViewer\\test\\sslvpnTechSupportReport.zip') //test
  //LoadEventLog('D:\\Workspace\\repo\\TSRViewer\\test\\sslvpnTechSupportReport\\eventlog').then(function(itemlist){
  //	PrintEventLog(itemlist)
  //})
});

function updateProgress(msg){
	console.log('progress: ' + msg)
}

function selectTSR(){
	dialog.showOpenDialog({
		title: "Select TSR to view",
		properties: ["openFile "]
	}, (filepath) => {
		loadiingTSR(filepath[0])
	})
}

function loadiingTSR(filepath){
	extractTSR(filepath).then(function(tsrpath){
		return installEventLog(tsrpath)
	}).then(function(tsrpath){
		return installPersistDB(tsrpath)
	}).catch(function(e){
		console.log('Error: ' + e)
	}).done(function(tsrpath){
		console.log('TSR successfully loaded!')
		showUI('loaded')
		//clean TSR
		var removeDirCmd = os.platform() === 'win32' ? "rmdir /s /q " : "rm -rf "
		execSync(removeDirCmd + '"' + tsrpath + '"', function (err) {
       console.log(err);
    })
	})
	
}

function extractTSR(zippath){
	updateProgress('try to unzip TSR:' + zippath)
	return new Promise(function(resolve, reject){
		var tmppath = path.join(os.tmpdir(), path.basename(zippath, '.zip'))
		console.log('tmp dir:'+ tmppath)
		var unzip = new adm_zip(zippath)
		console.log('unzip to:'+ tmppath)
		unzip.extractAllTo(tmppath, /*overwrite*/true) //TODO: check error?
		resolve(tmppath)
		//reject(new Error(error))
	})
}

//eventlog
function installEventLog(tsrpath){
	updateProgress('install eventlog')
	return new Promise(function(resolve, reject){
		var filepath = path.join(tsrpath, 'eventlog')
		var lstat = Promise.promisify(require("fs").lstat)
		lstat(filepath).then(function(stats){
			LoadEventLog(filepath).then(function(itemlist){PrintEventLog(itemlist)})
			if(stats.isFile())
				resolve(tsrpath)
			else
				reject(filepath)
		}).catch(function(e){
			console.log('Error:' + e)
		})
	})
}

//persist.db.log
function installPersistDB(tsrpath){
	updateProgress('install persist.db.log')
	return new Promise(function(resolve, reject){
		var filepath = path.join(tsrpath, 'persist.db.log')
		var lstat = Promise.promisify(require("fs").lstat)
		lstat(filepath).then(function(stats){
			if(stats.isFile())
				resolve(tsrpath)
			else
				reject(filepath)
		}).catch(function(e){
			console.log('Error:' + e)
		})
	})	
}
function initEvent(){
  $('#btLoadTSR').click(function(){
    selectTSR()
  })
  $('.menu-item').click(function(sender){
  	console.log('item clicked:' + $(this).text())
  })
}

function showUI(type){
	console.log('show UI: ' + type)
	if(type == 'loaded'){
		$('#beforeload').hide()
		$('#loaded').show()
	}
}

function LogSortFunc(index){

}

//eventlog = {time: '', pri: 0, cat: 1, src: '', dst: '', usr: '', msg: ''}
/*
Aug 10 00:19:47 SRA4600 SSLVPN: id=sslvpn sn=C0EAE49171B8 time="2017-08-10 00:19:47" vp_time="2017-08-09 22:19:47 UTC" fw=192.168.200.1 pri=5 m=0 c=1200 src=192.168.200.1 dst=192.168.200.1 user="Proxy" usr="Proxy" msg="20608:Child exit with status:0" agent="(null)" geoCountryID="0" geoCountryName="LAN" geoRegionName="unknown" geoCityName="unknown"
*/
function LoadEventLog(file) {
	// require('fs').readFileSync('abc.txt').toString().split('\n').forEach(function (line) { line; }) 
	console.log('Load eventlog file:' + file)
	return new Promise(function(resolve, reject){
		var itemlist = []
		var re = /([A-Za-z]{3}[ ]*[0-9]{1,2} [0-9]{2}:[0-9]{2}:[0-9]{2}).*pri=([0-9]).* c=([0-9]*).* src=([0-9\.]*).* dst=([0-9\.]*).* usr="([^"]*).* msg="([^"]*)"/
		fs.readFileSync(file).toString().split('\n').forEach(function(line){
			var eventlog = {}
			var match = re.exec(line)
			if(match){
				eventlog.time = match[1]
				eventlog.pri = match[2]
				eventlog.cat = match[3]
				eventlog.src = match[4]
				eventlog.dst = match[5]
				eventlog.usr = match[6]
				eventlog.msg = match[7]
				itemlist.push(eventlog)
			}
		})
		resolve(itemlist)
	})
}

function PrintEventLog(itemlist){
	console.log("Find event log item:" + itemlist.length)
	//add item to table
	for(var i=0, len=itemlist.length; i<len; i++){
		var row = `
			<tr>
				<td>`+itemlist[i].time+`</td>
				<td>`+itemlist[i].pri+`</td>
				<td>`+itemlist[i].cat+`</td>
				<td>`+itemlist[i].src+`</td>
				<td>`+itemlist[i].dst+`</td>
				<td>`+itemlist[i].usr+`</td>
				<td>`+itemlist[i].msg+`</td>
			</tr>
		`
		$('#tableEventlog tbody').append(row)
	}
}