
var bMonStarted;

var current_view;
var current_pos;
var current_pos_image;

var geolocation;

var map;

var posSource;
var pointSource;
var lineSource;

var flightDataArray;
var currentFlightData;

var pos_icon_image = './imgs/position3.png';

$(function() {

  centerInit();

});

function centerInit() {
	bMonStarted = false;
	posSource = null;
	flightDataArray = new Array();
	currentFlightData = new Array();	
  mapInit();
  
  if (askToken() == false) {  	
    location.href="index.html";
    return;
  }

  var page_data = document.getElementById("page_data");
	var page_action = page_data.getAttribute("page_action");

  if (page_action == "center") {
		hideLoader();
  }
  else if (page_action == "design") {
  	showLoader();
    designInit();
  }
  else if (page_action == "list") {
		hideLoader();
  }
  else if (page_action == "monitor") {  	
  	hideLoader();
    monitorInit();
  }
  else if (page_action == "flightlist") {
  	showLoader();
    flightListInit();
  }
  else if (page_action == "flight_view") {
  	showLoader();
    flightViewInit();
  }
  else if (page_action == "dromi") {
  	showLoader();
    dromiInit();
  }
  else if (page_action == "dromi_list") {
  	showLoader();
    dromiListInit();
  }
}

function flightViewInit() {    
    $('#historyPanel').hide();
    $('#historyList').show();

    var record_name = location.search.split('record_name=')[1];
    if (record_name != null && record_name != "") {
      showDataForHistoryWithName(decodeURI(record_name));
    }
    else hideLoader();    
}

function monitorInit() {
  var url_string = window.location.href;
	var page_id = location.search.split('mission_name=')[1];
	if (isSet(page_id))
		page_id = page_id.split('&')[0];

  getMissionToMonitor(page_id);
  
  hideLoader();
}


function designInit() {
	initSlider(1);

 	map.on('click', function (evt) {
      var feature = map.forEachFeatureAtPixel(evt.pixel,
          function (feature) {
              return feature;
          });

      if (feature) {
          var ii = feature.get('mindex');
          if (!isSet(ii)) return;

          setSliderPosForDesign(ii);
          setDataToDesignTableWithFlightRecord(ii);
          return;
      }

			appendNewRecord(evt.coordinate);
  });

  el('track').addEventListener('change', function() {
    geolocation.setTracking(this.checked);
  });

	var record_name = location.search.split('record_name=')[1];
  var mission_name = location.search.split('mission_name=')[1];

	if (isSet(record_name)) {
		record_name = record_name.split('&')[0];
    setDesignTableByFlightRecord(record_name);
  }
	else if (isSet(mission_name)) {
		mission_name = mission_name.split('&')[0];
    setDesignTableByMission(mission_name);
  }
  else hideLoader();

	/*
  var bannerOffset = $( '.topFixBanner' ).offset();
  $( window ).scroll( function() {  //window에 스크롤링이 발생하면
        if ( $( document ).scrollTop() > bannerOffset.top ) {   // 위치 및 사이즈를 파악하여 미리 정한 css class를 add 또는 remove 합니다.
          $( '.topFixBanner' ).addClass( 'topFixBannerFixed' );
          map.updateSize();
        }
        else {
          $( '.topFixBanner' ).removeClass( 'topFixBannerFixed' );
          map.updateSize();
        }
   });
  */    
}


function setSliderPosForDesign(i) {
		if (i < 0 || currentFlightData.length <= i) {
			$('#sliderText').html( "-" );
			return;
		}

		$("#slider").slider('value',i + 1);
		$('#sliderText').html( i + 1 );
}

function initSlider(i) {
	$('#slider').slider({
					min : 0,
					max : i,
					value : 0,
					step : 1,
					slide : function( event, ui ){
						$('#sliderText').text( ui.value );

						if (currentFlightData.length <= 0) {
							return;
						}

						var d = currentFlightData[ui.value - 1];

						setDataToDesignTableWithFlightRecord(ui.value - 1);
						var npos = ol.proj.fromLonLat([d.lng * 1, d.lat * 1]);

						flyDirectTo(npos, d.yaw, function() {});
					}
	});

	$('#goItemBtn').click(function() {
			var index = $('#goItemIndex').val();
			if (!isSet(index) || $.isNumeric( index ) == false) {
				alert("Please input valid value !");
				return;
			}

			index = parseInt(index);

			if (index <= 0 || index > currentFlightData.length) {
				alert("Please input valid value !");
				return;
			}

			var d = currentFlightData[index - 1];

			setDataToDesignTableWithFlightRecord(index - 1);
			moveToPositionOnMap(d.lat * 1, d.lng * 1, d.yaw, function() {});

			$("#slider").slider('value', index);
			$('#sliderText').html( index );
	});
}

function setDesignTableByMission(name) {

}

function setDesignTableByFlightRecord(name) {
  var userid = getCookie("dev_user_id");
  var jdata = {"action" : "position", "daction" : "download_spe", "name" : name, "clientid" : userid};

  showLoader();
  ajaxRequest(jdata, function (r) {
    if(r.result == "success") {
      hideLoader();
    
      if (!isSet(r.data.data) || r.data.data.length == 0) return;
		  currentFlightData = r.data.data;
  
      setDesignTableWithFlightRecord();
    }
    else {
      alert("There is no flight record or something wrong.");
      hideLoader();
    }
  }, function(request,status,error) {

    alert("Sorry, something wrong.");
    hideLoader();
  });
}



function createNewIcon(i, item) {
	var pos_icon = new ol.Feature({
          geometry: new ol.geom.Point(ol.proj.fromLonLat([item.lng * 1, item.lat * 1])),
          name: "lat: " + item.lat + ", lng: " + item.lng + ", alt: " + item.alt,
          mindex : i
      });

  pos_icon.setStyle(new ol.style.Style({
      image: new ol.style.Icon( ({
        //color: pos_icon_color,
        crossOrigin: 'anonymous',
        src: pos_icon_image
      }))
  }));

  return pos_icon;
}

function addIconToMap(i, item) {
	var nIcon = createNewIcon(i, item);
	posSource.addFeature(nIcon);
}

function removeIconOnMap(i) {
	var features = posSource.getFeatures();
	for(var i = 0; i < features.length; i++) {
      if (features[i].get("mindex") == i) {
      	features.removeFeature(features[i]);
      	return;
      }
	}
}

function setDesignTableWithFlightRecord() {  
  var i = 0;
	var coordinates = new Array();
	
	posSource = new ol.source.Vector();

  currentFlightData.forEach(function (item) {
      addIconToMap(i, item);
  		coordinates.push(ol.proj.fromLonLat([item.lng * 1, item.lat * 1]));
      i++;
  });

  setDataToDesignTableWithFlightRecord(0);

  $("#slider").slider('option',{min: 1, max: i});
  setSliderPosForDesign(i);

  var lines = new ol.geom.LineString(coordinates);

  lineSource = new ol.source.Vector({
          features: [new ol.Feature({
              geometry: lines,
              name: 'Line'
          })]
  });

	var lineLayer = new ol.layer.Vector({
      source: lineSource,
      style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#ff0000',
                width: 3
            })
        })
  });


  var posLayer = new ol.layer.Vector({
      source: posSource
  });

  map.addLayer(lineLayer);
  map.addLayer(posLayer);


  moveToPositionOnMap(currentFlightData[0].lat, currentFlightData[0].lng, currentFlightData[0].yaw);
}


function appendNewRecord(coordinates) {
	var lonLat = ol.proj.toLonLat(coordinates);
	var index = currentFlightData.length;

	if (index <= 0) {
		$("#slider").show();
		$("#dataTable-points").show();
	}

	var data = new Array();
	data['alt'] = 0;
	data['speed'] = 0;
	data['yaw'] = 0;
	data['pitch'] = 0;
	data['roll'] = 0;
	data['act'] = 0;
	data['actparam'] = 0;
	data['lng'] = lonLat[0];
	data['lat'] = lonLat[1];

	currentFlightData.push(data);

	$("#slider").slider('option',{min: 1, max: (index + 1) });
	$("#slider").slider('value', index + 1);

	setDataToDesignTableWithFlightRecord(index);
	addIconToMap(index, data);
}


function flightListInit() {
	hideLoader();
}

function startMon() {
  if (bMonStarted == true) {
    bMonStarted = false;
    $('#startMonBtn').text("Start monitoring");
    $("#startMonBtn").removeClass("btn-warning").addClass("btn-primary");
    $("#loader").hide();
  }
  else {
    nextMon();
  }
}

function nextMon() {
  var userid = getCookie("dev_user_id");
  var jdata = {"action" : "position", "daction" : "get", "clientid" : userid};

  ajaxRequest(jdata, function (r) {
    if(r.result == "success") {
      bMonStarted = true;
      $("#loader").show();
      $('#startMonBtn').text("Stop monitoring");
      $("#startMonBtn").removeClass("btn-primary").addClass("btn-warning");
      nexttour(r.data[0]);
    }
    else {
      alert("Sorry, Failed to get object position.");
    }
  }, function(request,status,error) {
    alert("Something wrong.");
  });
}

function askToken() {
  var useremail = getCookie("user_email");
  var usertoken = getCookie("user_token");
  var userid = getCookie("dev_user_id");
  if (isSet(useremail) == false || isSet(userid) == false || isSet(usertoken) == false)
    return false;

  $("#email_field").text(useremail);
  $('#droneplaytoken_view').val(usertoken);

  return true;
}


function isSet(value) {
  if (value == "" || value == null || value == "undefined") return false;

  return true;
}


function getList() {
    var userid = getCookie("dev_user_id");
    var jdata = {"action" : "mission", "daction" : "get", "clientid" : userid};

    ajaxRequest(jdata, function (r) {
      if(r.result == "success") {
        appendMissionList(r.data);
        $('#getListBtn').hide(1500);
      }
      else {
      	alert("Error ! - 0");
      }
    }, function(request,status,error) {
      alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
    });
}

function getMissionToMonitor(id) {
    if (id == null || id == "") return;

    var userid = getCookie("dev_user_id");
    var jdata = {"action" : "mission", "daction" : "get", "clientid": userid};

    ajaxRequest(jdata, function (r) {
      if(r.result == "success") {
        var missionList = r.data;
        if (missionList == null) return;
        if (missionList.length == 0) return;
        missionList.forEach(function (item, index, array) {
          if(item['name'] == id) {
            appendMissionsToMonitor(item['mission']);
          }
        });

        $("#loader").hide();
      }
      else {
      	alert("Error ! - 1");
      }
    }, function(request,status,error) {
      alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
      $("#loader").hide();
    });
}

var missionActionString = ["STAY", "START_TAKE_PHOTO", "START_RECORD", "STOP_RECORD", "ROTATE_AIRCRAFT", "GIMBAL_PITCH", "NONE", "CAMERA_ZOOM", "CAMERA_FOCUS"];

function appendMissionsToMonitor(mission) {
    if (mission == null) return;
    if (mission.length == 0) return;
    mission.forEach(function (item, index, array) {
      tableCount++;

      var missionid = item['id'];

      if(missionid == null) {
        missionid = "mission-" + tableCount;
      }

      var act = item['act'];

      if (act >= missionActionString.length) {
        act = 0;
      }

      var appendRow = "<tr class='odd gradeX' id='" + missionid + "'><td>" + tableCount + "</td><td>"
          + "<table border=0 width='100%'><tr><td width='50%' class='center' bgcolor='#eee'>" + item['lat'] + "</td><td width='50%' class='center' bgcolor='#fff'> " + item['lng'] + "</td></tr>"
          + "<tr><td class='center' bgcolor='#eee'>" + item['alt'] + "/" + item['speed']+ "</td><td class='center'>"
          + missionActionString[act] + "/" + item['actparam']
          + "</td></tr></table>"
      + "</td></tr>"
      $('#monitorTable-points > tbody:last').append(appendRow);
    });
}

function moveToPositionOnMap(lat, lng, yaw) {
  var npos = ol.proj.fromLonLat([lng * 1, lat * 1]);
  flyTo(npos, yaw, function() {});
}

function clearDataToDesignTableWithFlightRecord() {

}

function setDataToDesignTableWithFlightRecord(index) {
	if ( currentFlightData.length <= 0) return;

	var lat = currentFlightData[index].lat;
	var lng = currentFlightData[index].lng;
	var alt = currentFlightData[index].alt;
	var yaw = currentFlightData[index].yaw;
	var roll = currentFlightData[index].roll;
	var pitch = currentFlightData[index].pitch;
	var speed = currentFlightData[index].speed;
	var act = currentFlightData[index].act;
	var actparam = currentFlightData[index].actparam;

	$('#tr_index').text(index + 1);
	$('#latdata_index').val(lat);
	$('#lngdata_index').val(lng);
	$('#altdata_index').val(alt);
	$('#rolldata_index').val(roll);
	$('#pitchdata_index').val(pitch);
	$('#yawdata_index').val(yaw);

	$('#speeddata_index').val(speed);
	$('#actiondata_index').val(act).prop("selected", true);
	$('#actionparam_index').val(actparam);

	$('#removeItemBtn').off('click');
	$('#removeItemBtn').click(function(){
		removeFlightData(index);
		removeIconOnMap(index);
	});

	$('#saveItemBtn').off('click');
	$('#saveItemBtn').click(function(){
		saveFlightData(index);
	});
}

function saveFlightData(index) {
	if (currentFlightData.length <= 0) return;

	currentFlightData[index].lat = $('#latdata_index').val();
	currentFlightData[index].lng = $('#lngdata_index').val();
	currentFlightData[index].alt = $('#altdata_index').val();
	currentFlightData[index].yaw = $('#yawdata_index').val();
	currentFlightData[index].roll = $('#rolldata_index').val();
	currentFlightData[index].pitch = $('#pitchdata_index').val();
	currentFlightData[index].speed = $('#speeddata_index').val();
	currentFlightData[index].act = $('#actiondata_index').val();
	currentFlightData[index].actparam = $('#actionparam_index').val();
}

function removeSelectedFeature(selectedFeatureID) {
	var features = pointSource.getFeatures();

	if (features != null && features.length > 0) {
   for (x in features) {
      var properties = features[x].getProperties();

      var id = properties.id;
      if (id == selectedFeatureID) {
        pointSource.removeFeature(features[x]);
        break;
      }
    }
  }
}

function removeFlightData(index) {
	currentFlightData.splice(index, 1);

	removeSelectedFeature(index);

	if (currentFlightData.length <= 0) {
		$("#slider").hide();
		$("#dataTable-points").hide();
		return;
	}

	var newIndex = currentFlightData.length-1;

	setDataToDesignTableWithFlightRecord(newIndex);
	$("#slider").slider('value', newIndex + 1);
	$("#slider").slider('option',{min: 1, max: (newIndex + 1)});

	moveToPositionOnMap(currentFlightData[newIndex].lat, currentFlightData[newIndex].lng, currentFlightData[newIndex].yaw);
}

function appendMissionList(data) {
    if (data == null) return;
    if (data.length == 0) return;
    data.forEach(function (item, index, array) {
        console.log(item, index);

        var appendRow = "<tr class='odd gradeX' id='row_" + index + "'><td class='center'>"
        + "<a href='./monitor.html?mission_name=" + item['name'] + "'>"
        + item['name']
        + "</a></td><td class='center'> - </td><td class='center'>"
        + item['regtime']
        + "</td><td class='center'>"
        + "<button class='btn btn-primary' type='button' onClick='btnRemove(\"" + item['name']+ "\", \"row_" + index + "\")'>"
        + "삭제</button></td></tr>";
        $('#dataTable-missions > tbody:last').append(appendRow);
    });
}


function ajaxRequestAddress(address, callback, errorcallback) {
    $.ajax({url : "https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&key=AIzaSyANkdJYJ3zKXAjOdPFrhEEeq4M8WETn0-4",
           crossDomain: true,
           cache : false,
           type : "GET",
           async: false,
           success : function(r) {
             console.log(JSON.stringify(r));
             callback(r);
           },
           error:function(request,status,error){
               console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
               errorcallback(request,status,error);
           }
    });
}

function btnSearch() {
    var query = $('#queryData').val();
    searchAddressToCoordinate(query);
}

// result by latlng coordinate
function searchAddressToCoordinate(address) {
    ajaxRequestAddress(address, function (r) {
      //if(r.result == "success") {
        var latLng = ol.proj.fromLonLat([r['results'][0].geometry.location.lng, r['results'][0].geometry.location.lat]);
        flyTo(latLng, 0, function() {});
      //}
    }, function(request,status,error) {
      alert("잘못된 주소이거나 요청을 처리하는데 일시적인 오류가 발생했습니다.");
    });
}

var tableCount = 0;

function btnClear() {
    var r = confirm("Are you sure ?");
    if (r == false) {
        return;
    }

    lineSource.clear();
    pointSource.clear();
    posSource.clear();
    currentFlightData = Array();
    $("#dataTable-points").hide();
}



function getFlightListForHistory() {
  var userid = getCookie("dev_user_id");
  var jdata = {"action": "position", "daction": "download", "clientid" : userid};

  showLoader();
  ajaxRequest(jdata, function (r) {
    hideLoader();
    if(r.result == "success") {
      if (r.data == null || r.data.length == 0) {
        alert("no data");
        return;
      }

			$('#getFlightListBtn').hide(1500);
      setFlightlistHistory(r.data);      
    }
    else {
    	alert("Error ! - 2");
    }
  }, function(request,status,error) {
    hideLoader();
    alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
  });
}



function setFlightlistHistory(data) {
  if (data == null || data.length == 0)
    return;

  data.forEach(function(item) {
    appendFlightListTableForHistory(item.name, item.dtime, item.data);
    flightDataArray.push(item);
  });
}

function showDataForHistoryWithName(name) {

  $("#record_name_field").text("- " + name);
  cur_flightrecord_name = name;
    
  var userid = getCookie("dev_user_id");
  var jdata = {"action" : "position", "daction" : "download_spe", "name" : name, "clientid" : userid};

  showLoader();

  setTimeout(function() {

			ajaxRequest(jdata, function (r) {
		    if(r.result != "success") {
		      alert("Failed to load data!");
		    }
		    else {
		    	
		    	var fdata = r.data;
		    	
		    	moviePlayerVisible = false;
		    	
		    	if ("youtube_data_id" in fdata) {
				  	if (fdata.youtube_data_id.indexOf("youtube") >=0) {
							setYoutubePlayer(fdata.youtube_data_id);
							setGooglePhotoPlayer("");
						}
						else {
							setYoutubePlayer("");
							setGooglePhotoPlayer(fdata.youtube_data_id);
						}
						
						$("#movieDataSet").hide();
				  }
				  else {
				    $("#youTubePlayer").hide();
				    $("#googlePhotoPlayer").hide();				    
				  }
				  
				   if (moviePlayerVisible == true) {
							hideMovieDataSet();
						}
						else {
							showMovieDataSet();
						}				
				
      		$('#historyList').hide(1500);
      		$('#historyPanel').show();							    	
		    	
		      setChartData(r.data.data);
		      hideLoader();
		    }
		  }, function(request,status,error) {
		    hideLoader();
		    alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
		  });

	}, 1000);
}

function showDataForHistory(index) {
  if (flightDataArray.length == 0) return;

  var item = flightDataArray[index];

	moviePlayerVisible = false;
	
  if ("youtube_data_id" in item) {
  	if (item.youtube_data_id.indexOf("youtube") >=0) {
			setYoutubePlayer(item.youtube_data_id);
			setGooglePhotoPlayer("");
		}
		else {
			setYoutubePlayer("");
			setGooglePhotoPlayer(item.youtube_data_id);
		}				
  }
  else {
    $("#youTubePlayer").hide();
    $("#googlePhotoPlayer").hide();  
  }
  
  if (moviePlayerVisible == true) {
		hideMovieDataSet();
	}
	else {
		showMovieDataSet();
	}
	
	if (!("data" in item) || !isSet(item.data)) {
    var userid = getCookie("dev_user_id");
    var jdata = {"action" : "position", "daction" : "download_spe", "name" : item.name, "clientid" : userid};
    $("#record_name_field").text("- " + item.name);
    cur_flightrecord_name = item.name;
	  showLoader();

	  setTimeout(function() {

				ajaxRequest(jdata, function (r) {
			    if(r.result != "success") {
			      alert("Failed to load data!");
			    }
			    else {
			    	
			    	$('#historyList').hide(1500);
      			$('#historyPanel').show();
      		
			      setChartData(r.data.data);
			      hideLoader();
			    }
			  }, function(request,status,error) {
			    hideLoader();
			    alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
			  });

		}, 1000);
	}
	else {
		showLoader();
		$('#historyPanel').show();
  	setChartData(item.data);
  	hideLoader();
  }

}

function appendFlightListTableForHistory(name, dtimestamp, data) {
  var appendRow = "<tr class='odd gradeX' id='flight-list-" + tableCount + "'><td width='10%'>" + (tableCount + 1) + "</td>"
      + "<td class='center' bgcolor='#eee'><a href='javascript:showDataForHistory(" + tableCount + ");'>" + name + "</a></td><td width='30%' class='center'> " + dtimestamp + "</td>"
      + "<td width='20%' bgcolor='#fff'>"
      // + "<a href='design.html?record_name=" + name + "'>수정</a> "
      + "<button class='btn btn-primary' type='button' onClick='deleteFlightData(" + tableCount + ");'>삭제</button></td>"
      + "</tr>";
  $('#dataTable-Flight_list > tbody:last').append(appendRow);
  tableCount++;
}


function getFlightList() {
  var userid = getCookie("dev_user_id");
  var jdata = {"action": "position", "daction": "download", "clientid" : userid};

  showLoader();
  ajaxRequest(jdata, function (r) {
    hideLoader();
    if(r.result == "success") {
      if (r.data == null || r.data.length == 0) {
        alert("no data");
        return;
      }

      setFlightlist(r.data);
      $('#getFlightListBtn').hide(1500);
    }
    else {
    	alert("Error ! - 2");
    }
  }, function(request,status,error) {
    hideLoader();
    alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
  });
}

function setFlightlist(data) {
  if (data == null || data.length == 0)
    return;

  data.forEach(function(item) {
    appendFlightListTable(item.name, item.dtime, item.data);
    flightDataArray.push(item);
  });
}

function appendFlightListTable(name, dtimestamp, data) {
  var appendRow = "<tr class='odd gradeX' id='flight-list-" + tableCount + "'><td width='10%'>" + (tableCount + 1) + "</td>"
      + "<td class='center' bgcolor='#eee'><a href='flight_view.html?record_name=" + name + "'>" + name + "</a></td><td width='30%' class='center'> " + dtimestamp + "</td>"
      + "<td width='20%' bgcolor='#fff'>"
      // + "<a href='flight_view.html?record_name=" + name + "'>보기</a> "
      + "<button class='btn btn-primary' type='button' onClick='deleteFlightData(" + tableCount + ");'>삭제</button></td>"
      + "</tr>";
  $('#dataTable-Flight_list > tbody:last').append(appendRow);
  tableCount++;
}


function deleteFlightData(index) {

  var item = flightDataArray[index];

  if (confirm('정말로 ' + item.name + ' 비행기록을 삭제하시겠습니까?')) {
  } else {
    return;
  }

  var userid = getCookie("dev_user_id");
  var jdata = {"action": "position", "daction": "delete", "clientid" : userid, "name" : item.name};

  showLoader();
  ajaxRequest(jdata, function (r) {
    hideLoader();
    if(r.result != "success") {
      alert("삭제 실패!");
    }
    else {
      removeTableRow("flight-list-" + index);
    }
  }, function(request,status,error) {
    hideLoader();
    alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
  });
}


function removeTableRow(rowname) {
  $("#" + rowname).remove();
}

function btnRemove(name, trname) {
    var r = confirm("정말로 '" + name + "' 미션을 삭제하시겠습니까?");
    if (r == false) {
        return;
    }

    var userid = getCookie("dev_user_id");
    var jdata = {"action": "mission","mname" : name, "daction" : "delete", "clientid" : userid};

    ajaxRequest(jdata, function (r) {
      if(r.result == "success") {
        $("#" + trname).remove();
      }
      else {
      	alert("Error ! - 4");
      }
    }, function(request,status,error) {});
}

function monitor(msg) {
  var info = el('monitor');
  info.innerHTML = "<font color=red><b>" + msg + "</b></font>";
}

function btnRegister() {
    var mname = prompt("미션의 이름을 입력해 주세요.", "");

    if (mname == null) {
        alert("미션의 이름을 잘못 입력하셨습니다.");
        return;
    }

    var mspeed = prompt("미션 수행시 비행속도를 입력해 주세요.", "");

    if (mspeed == null || parseFloat(mspeed) <= 0.0) {
        alert("비행속도를 잘못 입력하셨습니다.");
        return;
    }


    if (currentFlightData.length <= 0) {
      alert("입력된 Waypoint가 1도 없습니다! 집중~ 집중~!");
      return;
    }

    var nPositions = new Array();
    var bError = 0;
    for (var index=0;index<currentFlightData.length;index++) {
    	var item = currentFlightData[index];

      if (item.act == undefined || item.act === ""
        || item.lat == undefined || item.lat === ""
        || item.lng == undefined || item.lng === ""
        || item.alt == undefined || item.alt === ""
        || item.speed == undefined || item.speed === ""
        || item.pitch == undefined || item.pitch === ""
        || item.roll == undefined || item.roll === ""
        || item.yaw == undefined || item.yaw === ""
        || item.actparam == undefined || item.actparam === "") {
          monitor("오류 : 인덱스 - " + (index + 1) + " / 비어있는 파라메터가 존재합니다.");
          bError++;
          return;
        }

			var mid = "mid-" + index;
      nPositions.push({id:mid, lat:item.lat, lng:item.lng, alt:item.alt, act:item.act, actparam:item.actparam, speed:item.speed, roll:item.roll, pitch:item.pitch, yaw:item.yaw});
    }

    if (bError > 0) {
      alert("오류를 확인해 주세요!");
      return;
    }

    var userid = getCookie("dev_user_id");
    var jdata = {"action": "mission","mname" : mname, "daction" : "set", "missionspeed": mspeed, "missiondata" : nPositions, "clientid" : userid};

    ajaxRequest(jdata, function (r) {
      if(r.result == "success") {
        alert("미션이 등록되었습니다.");
      }
      else {
      	alert("Error ! - 7");
      }
    }, function(request,status,error) {});
}


function ajaxRequest(data, callback, errorcallback) {
    $.ajax({url : "https://api.droneplay.io/v1/",
           dataType : "json",
           crossDomain: true,
           cache : false,
           data : JSON.stringify(data),
           type : "POST",
           contentType: "application/json; charset=utf-8",
           async: false,
           beforeSend: function(request) {
              request.setRequestHeader("droneplay-token", getCookie('user_token'));
            },
           success : function(r) {
             console.log(JSON.stringify(r));
             callback(r);
           },
           error:function(request,status,error){
               console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
               errorcallback(request,status,error);
           }
    });
}

function logOut() {
  setCookie("dev_user_id", "", -1);
  setCookie("user_token", "", -1);
  location.href="index.html";
}

function mapInit() {
  var dokdo = ol.proj.fromLonLat([131.8661992, 37.2435813]);
  var scaleLineControl = new ol.control.ScaleLine();

  current_view = new ol.View({
      center: dokdo,
      zoom: 17
    });

  geolocation = new ol.Geolocation({
          // enableHighAccuracy must be set to true to have the heading value.
          trackingOptions: {
            enableHighAccuracy: true
          },
          projection: current_view.getProjection()
  });

  var accuracyFeature = new ol.Feature();
  geolocation.on('change:accuracyGeometry', function() {
    accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
  });

  var positionFeature = new ol.Feature();
  positionFeature.setStyle(new ol.style.Style({
    image: new ol.style.Circle({
      radius: 6,
      fill: new ol.style.Fill({
        color: '#3399CC'
      }),
      stroke: new ol.style.Stroke({
        color: '#fff',
        width: 2
      })
    })
  }));

  current_pos = new ol.Feature({
      geometry: new ol.geom.Point(ol.proj.fromLonLat([131.8661992, 37.2435813]))
  });

  current_pos_image = new ol.style.Icon(({
        //color: '#8959A8',
        crossOrigin: 'anonymous',
        src: './imgs/position2.png'
      }));

  current_pos.setStyle(new ol.style.Style({
      image: current_pos_image
    }));

  var vectorSource = new ol.source.Vector({
      features: [current_pos, accuracyFeature, positionFeature]
    });

  var vectorLayer = new ol.layer.Vector({
      source: vectorSource,
      zIndex: 10000
    });

  pointSource = new ol.source.Vector({});
  var pointLayer = new ol.layer.Vector({
      source: pointSource,
      style: new ol.style.Style({
            fill: new ol.style.Fill({
              color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
              color: '#ff0000',
              width: 2
            }),
            image: new ol.style.Circle({
              radius: 7,
              fill: new ol.style.Fill({
                color: '#ff0000'
              })
            })
          })
    });

  scaleLineControl.setUnits("metric");
  map = new ol.Map({
      target: 'map',
      controls: ol.control.defaults().extend([
            scaleLineControl
          ]),
      layers: [
          new ol.layer.Tile({
              preload: 4,
              source: new ol.source.OSM()
          }), vectorLayer, pointLayer
      ],
      // Improve user experience by loading tiles while animating. Will make
      // animations stutter on mobile or slow devices.
      loadTilesWhileAnimating: true,
      view: current_view
    });

    // update the HTML page when the position changes.
    geolocation.on('change', function() {
      el('accuracy').innerText = geolocation.getAccuracy() + ' [m]';
      el('altitude').innerText = geolocation.getAltitude() + ' [m]';
      el('altitudeAccuracy').innerText = geolocation.getAltitudeAccuracy() + ' [m]';
      el('heading').innerText = geolocation.getHeading() + ' [rad]';
      el('speed').innerText = geolocation.getSpeed() + ' [m/s]';
      showLoader();
      flyTo(geolocation.getPosition(), 0, function(){hideLoader();});
    });

    // handle geolocation error.
    geolocation.on('error', function(error) {
      var info = el('monitor');
      info.innerHTML = error.message;
      info.style.display = '';
    });


    geolocation.on('change:position', function() {
      var coordinates = geolocation.getPosition();
      positionFeature.setGeometry(coordinates ?
        new ol.geom.Point(coordinates) : null);
    });
}

// A bounce easing method (from https://github.com/DmitryBaranovskiy/raphael).
function bounce(t) {
    var s = 7.5625, p = 2.75, l;
    if (t < (1 / p)) {
        l = s * t * t;
    } else {
        if (t < (2 / p)) {
        t -= (1.5 / p);
            l = s * t * t + 0.75;
        } else {
            if (t < (2.5 / p)) {
                t -= (2.25 / p);
                l = s * t * t + 0.9375;
            } else {
                t -= (2.625 / p);
                l = s * t * t + 0.984375;
            }
        }
    }
    return l;
}

// An elastic easing method (from https://github.com/DmitryBaranovskiy/raphael).
function elastic(t) {
    return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
}


function showLoader() {
  $("#loading").show();
}

function hideLoader() {
  $("#loading").fadeOut(800);
}

function flyDirectTo(location, yaw, done) {
		var duration = 1;
    var called = false;

    current_pos.setGeometry(new ol.geom.Point(location));
    current_pos_image.setRotation(yaw);

    function dcallback(complete) {
        if (called) {
            return;
        }

        if (!complete) {
            called = true;
            done(complete);
        }
    }

    current_view.animate({
      center: location,
      duration: duration
    }, dcallback);
}


function flyTo(location, yaw, done) {
    var duration = 1500;
    var zoom = current_view.getZoom();
    var parts = 2;
    var called = false;

    current_pos.setGeometry(new ol.geom.Point(location));
    current_pos_image.setRotation(yaw);

    function callback(complete) {
        --parts;
        if (called) {
            return;
        }
        if (parts === 0 || !complete) {
            called = true;
            done(complete);
        }
    }

    current_view.animate({
      center: location,
      duration: duration
    }, callback);
    current_view.animate({
      zoom: zoom - 1,
      duration: duration / 2
    }, {
        zoom: zoom,
        duration: duration / 2
    }, callback);
}

var beforeTime = "";
function nexttour(r) {
  if (r.positiontime == beforeTime) {
    setTimeout(function() {
              if (bMonStarted == false) return;
              nextMon();
    }, 5000);
    return;
  }

  if ("missionid" in r && $('#' + r.missionid).length > 0) {
    $('#' + r.missionid).children('td, th').css('background-color','#ff0');
  }
  else {
    tableCount++;
    var missionid = "mission-" + tableCount;
    var appendRow = "<tr class='odd gradeX' id='" + missionid + "'><td class='center'></td><td class='center'>" + r.lat + " | " + r.lng + "<hr size=1>" + r.alt + " | " + r.positiontime + " </td></tr>";
    $('#monitorTable-points > tbody:last').append(appendRow);
  }

  beforeTime = r.positiontime;
  var npos = ol.proj.fromLonLat([r.lng * 1, r.lat * 1]);
  flyTo(npos, r.yaw, function() {});

  setTimeout(function() {
            if (bMonStarted == false) return;
            nextMon();
  }, 2500);
}


function uploadFlightList() {
	var files = document.getElementById('file').files;
  if (files.length > 0) {
  	var mname = prompt("비행기록의 이름을 입력해 주세요.", "");

	  if (!isSet(mname)) {
	      alert("잘못 입력하셨습니다.");
	      return;
	  }

	  showLoader();
    getBase64(files[0], mname, uploadFlightListCallback);
  }
  else {
  	alert("Please, select any file, first !");
  	return;
  }
}

function getBase64(file, mname, callback) {
   var reader = new FileReader();
   reader.readAsDataURL(file);
   reader.onload = function () {
     callback(mname, reader.result);
   };
   reader.onerror = function (error) {
   	 hideLoader();
     console.log('Error: ', error);
   };
}


function uploadFlightListCallback(mname, base64file) {
		var userid = getCookie("dev_user_id");
    var jdata = {"action" : "position", "daction" : "convert", "clientid" : userid, "name" : mname, "recordfile" : base64file};

    ajaxRequest(jdata, function (r) {
    	hideLoader();

      if(r.result == "success") {
        $('#uploadFlightRecBtn').hide(1500);
        $('#djifileform').hide(1500);
        alert("Successfully, uploaded !, Please refresh this page and click 'load' button again.");
      }
      else {
      	alert("Error ! : (" + r.reason + ")");
      }
    }, function(request,status,error) {
    	hideLoader();
      alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
    });
}


function el(id) {
        return document.getElementById(id);
}

function setCookie(cName, cValue, cDay){
    var expire = new Date();
    expire.setDate(expire.getDate() + cDay);
    var cookies = cName + '=' + escape(cValue) + '; path=/ '; // 한글 깨짐을 막기위해 escape(cValue)를 합니다.
    if(typeof cDay != 'undefined') cookies += ';expires=' + expire.toGMTString() + ';';
    document.cookie = cookies;
}


function getCookie(cName) {
    cName = cName + '=';
    var cookieData = document.cookie;
    var start = cookieData.indexOf(cName);
    var cValue = '';
    if(start != -1){
        start += cName.length;
        var end = cookieData.indexOf(';', start);
        if(end == -1)end = cookieData.length;
        cValue = cookieData.substring(start, end);
    }
    return unescape(cValue);
}
