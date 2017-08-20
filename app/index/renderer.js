// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
let $ = require('jquery')
const {dialog} = require('electron').remote
var path = require('path'),
	os = require('os'),
	Promise = require('bluebird'),
	adm_zip = require('adm-zip')


document.addEventListener("DOMContentLoaded", function(event) {
  console.log("DOM fully loaded and parsed");
  initEvent()
  loadiingTSR('D:\\Workspace\\repo\\TSRViewer\\test\\sslvpnTechSupportReport.zip') //test
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
	}).done(function(){
		console.log('TSR successfully loaded!')
		showUI('loaded')
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
}

function showUI(type){
	console.log('show UI: ' + type)
	if(type == 'loaded'){
		$('#beforeload').hide()
		$('#loaded').show()
	}
}