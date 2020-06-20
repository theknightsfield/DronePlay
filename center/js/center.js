
var bMonStarted = false;
var pointSource;
var dokdo_view;
var dokdo_icon;
var map;
var geolocation;
var posSource;
var posIcons = new Array();

var mapPopup;

var flightDataArray = new Array();

$(function() {
  showLoader();
  mapInit();
  hideLoader();
  if (askToken() == false) {
    location.href="index.html";
    return;
  }

  var page_data = document.getElementById("page_data");
	var page_action = page_data.getAttribute("page_action");

  if (page_action == "center") {

  }
  else if (page_action == "design") {
    designInit();
  }
  else if (page_action == "list") {

  }
  else if (page_action == "monitor") {
    monitorInit();
  }
  else if (page_action == "flightlist") {
    flightListInit();
  }
  else if (page_action == "dromi") {
    dromiInit();
  }
  else if (page_action == "dromi_list") {
    dromiListInit();
  }
});

function monitorInit() {
  var url_string = window.location.href;
	var page_id = location.search.split('mission_name=')[1];
	if (page_id != null)
		page_id = page_id.split('&')[0];

  getMissionToMonitor(page_id);
}

function designInit() {
  var draw = new ol.interaction.Draw({
      source: pointSource,
      type: 'Point'
    });

  map.addInteraction(draw);
  map.on('click', function(evt) {
        var coordinates = evt.coordinate;
        //alert(coordinates);
        appendDesignTable(coordinates);
  });

  el('track').addEventListener('change', function() {
    geolocation.setTracking(this.checked);
  });

	var record_name = location.search.split('record_name=')[1];
  var mission_name = location.search.split('mission_name=')[1];

	if (record_name != null) {
		record_name = record_name.split('&')[0];
    setDesignTableByFlightRecord(record_name);
  }
	else if (mission_name != null) {
		mission_name = mission_name.split('&')[0];
    setDesignTableByMission(mission_name);
  }

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

}

function setDesignTableByMission(name) {

}

function setDesignTableByFlightRecord(name) {
  var userid = getCookie("dev_user_id");
  var jdata = {"action" : "position", "daction" : "download_spe", "name" : name, "clientid" : userid};

  $("#loader").show();
  ajaxRequest(jdata, function (r) {
    if(r.result == "success") {
      $("#loader").hide();
      setDesignTableWithFlightRecord(r.data.data);
    }
    else {
      alert("There is no flight record or something wrong.");
      $("#loader").hide();
    }
  }, function(request,status,error) {

    alert("Sorry, something wrong.");
    $("#loader").hide();
  });
}

function setDesignTableWithFlightRecord(data) {
  if (data == null) return;
  var i = 0;

  data.forEach(function (item) {
      appendDesignTableWithFlightRecord(item.lat, item.lng, item.alt, item.speed, item.act, item.actparam);

      var pos_icon = new ol.Feature({
          geometry: new ol.geom.Point(ol.proj.fromLonLat([item.lng *= 1, item.lat *= 1])),
          name: "lat: " + item.lat + ", lng: " + item.lng + ", alt: " + item.alt,
          mindex : i
      });

      var pos_icon_image = './imgs/position2.png';
      var pos_icon_color = '#557799';

      pos_icon.setStyle(new ol.style.Style({
          image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
            color: pos_icon_color,
            crossOrigin: 'anonymous',
            src: pos_icon_image
          }))
      }));

      posIcons.push(pos_icon);
      i++;
  });


  posSource = new ol.source.Vector({
      features: posIcons
  });

  var posLayer = new ol.layer.Vector({
      source: posSource
  });

  map.addLayer(posLayer);
  
  moveToPositionOnMap(data[0].lat, data[0].lng);
}

function flightListInit() {

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
  var userid = getCookie("dev_user_id");
  var usertoken = getCookie("user_token");
  if (isSet(userid) == false || isSet(usertoken) == false)
    return false;

  $("#email_field").text(userid);
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

function moveToPositionOnMap(lat, lng) {
  var npos = ol.proj.fromLonLat([lng *= 1, lat *= 1]);
  flyTo(npos, function() {});
}

function removeDesignTableRow(index) {
  removeTableRow('misstr_' + index);
  if (posSource && (posIcons.length > 0))
    posSource.removeFeature(posIcons[index]);
}

function appendDesignTableWithFlightRecord(lat, lng, alt, speed, act, actparam) {
  tableCount++;
  var strid = "mission-" + tableCount;
  var appendRow = "<tr class='odd gradeX' id='misstr_" + tableCount + "'><td>" + tableCount + "</td><td colspan=3>"
      + "<label for='latdata_" + tableCount + "'>위도(Lat)</label><input name='latdata_" + tableCount + "' id='latdata_" + tableCount + "' type='text' placeholder='Latitude' value='"+lat+"' class='form-control latdata'>"
      + "<label for='lngdata_" + tableCount + "'>경도(Lng)</label><input name='lngdata_" + tableCount + "' id='lngdata_" + tableCount + "' type='text' placeholder='Longitude' value='"+lng+"' class='form-control lngdata'>"
      + "<label for='altdata_" + tableCount + "'>고도(Alt)</label><input name='altdata_" + tableCount + "' id='altdata_" + tableCount + "' type='text' placeholder='Altitude (m)' class='form-control altdata' value='"+alt+"'><br>"
      + "<label for='speeddata_" + tableCount + "'>속도(Speed)</label><input name='speeddata_" + tableCount + "' id='speeddata_" + tableCount + "' type='text' placeholder='Speed (m/s)' class='form-control speeddata' value='"+speed+"'>"
      + "<label for='actiondata_" + tableCount + "'>액션(Act)</label><select class='form-control actiondata' id='actiondata_" + tableCount + "'>"
          + "<option selected value=0>STAY</option>"
          + "<option value=1>START_TAKE_PHOTO</option>"
          + "<option value=2>START_RECORD</option>"
          + "<option value=3>STOP_RECORD</option>"
          + "<option value=4>ROTATE_AIRCRAFT</option>"
          + "<option value=5>GIMBAL_PITCH</option>"
          //+ "<option value=7>CAMERA_ZOOM</option>"
          //+ "<option value=8>CAMERA_FOCUS</option>"
      + "</select>"
      + "<label for='actionparam_" + tableCount + "'>액션인자(Param)</label><input name='actionparam_" + tableCount + "' id='actionparam_" + tableCount + "' placeholder='action Param' type='text' class='form-control actionparam' value='"+actparam+"'>"
      + "<br><br><a href=javascript:removeDesignTableRow(" + tableCount + ");>삭제</a> <a href=javascript:moveToPositionOnMap("+lat+","+lng+");>이동</a>"
      + "</td></tr>";

  $('#dataTable-points > tbody:last').append(appendRow);
  $('#actiondata_' + tableCount).val(act).prop("selected", true);
}

function appendDesignTable(coordinates) {
  tableCount++;
  var lonLat = ol.proj.toLonLat(coordinates);
  var strid = "mission-" + tableCount;
  var appendRow = "<tr class='odd gradeX' id='misstr_" + tableCount + "'><td>" + tableCount + "</td><td colspan=3>"
      + "<label for='latdata_" + tableCount + "'>위도(Lat)</label><input name='latdata_" + tableCount + "' id='latdata_" + tableCount + "' type='text' placeholder='Latitude' value='"+lonLat[1]+"' class='form-control latdata'>"
      + "<label for='lngdata_" + tableCount + "'>경도(Lng)</label><input name='lngdata_" + tableCount + "' id='lngdata_" + tableCount + "' type='text' placeholder='Longitude' value='"+lonLat[0]+"' class='form-control lngdata'>"
      + "<label for='altdata_" + tableCount + "'>고도(Alt)</label><input name='altdata_" + tableCount + "' id='altdata_" + tableCount + "' type='text' placeholder='Altitude (m)' class='form-control altdata'><br>"
      + "<label for='speeddata_" + tableCount + "'>속도(Speed)</label><input name='speeddata_" + tableCount + "' id='speeddata_" + tableCount + "' type='text' placeholder='Speed (m/s)' class='form-control speeddata'>"
      + "<label for='actiondata_" + tableCount + "'>액션(Act)</label><select class='form-control actiondata' id='actiondata_" + tableCount + "'>"
          + "<option selected value=0>STAY</option>"
          + "<option value=1>START_TAKE_PHOTO</option>"
          + "<option value=2>START_RECORD</option>"
          + "<option value=3>STOP_RECORD</option>"
          + "<option value=4>ROTATE_AIRCRAFT</option>"
          + "<option value=5>GIMBAL_PITCH</option>"
          // + "<option value=7>CAMERA_ZOOM</option>"
          //+ "<option value=8>CAMERA_FOCUS</option>"
          + "</select>"
      + "<label for='actionparam_" + tableCount + "'>액션인자(Param)</label><input name='actionparam_" + tableCount + "' id='actionparam_" + tableCount + "' placeholder='action Param' type='text' class='form-control actionparam'>"
      + "<br><br><a href=javascript:removeDesignTableRow(" + tableCount + ");>삭제</a> <a href=javascript:moveToPositionOnMap("+lonLat[1]+","+lonLat[0]+");>이동</a>"
    + "</td></tr>"
    $('#dataTable-points > tbody:last').append(appendRow);
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
        flyTo(latLng, function() {});
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

    var tb = $('.dataTable-points tbody');
    var size = tb.find("tr").length;
    console.log("Number of rows : " + size);
    tb.find("tr").each(function(index, element) {
      // var colSize = $(element).find('td').length;
      // console.log("  Number of cols in row " + (index + 1) + " : " + colSize);
      // $(element).find('td').each(function(index, element) {
      //   var colVal = $(element).text();
      //   console.log("    Value in col " + (index + 1) + " : " + colVal.trim());
      // });

      $(element).remove();
    });

    pointSource.clear();
    tableCount = 0;
    //window.location.reload();
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
      + "<td class='center' bgcolor='#eee'><a href='design.html?record_name=" + name + "'>"
      + name + "</a></td><td width='30%' class='center'> " + dtimestamp + "</td>"
      + "<td width='20%' bgcolor='#fff'>"
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

    var nPositions = new Array();

    var tb = $('.dataTable-points tbody');
    var cindex = 0;
    var bError = 0;
    tb.find("tr").each(function(index, element) {
      var ele = $(element).find('td')[1];
      var altdata = $(ele).find(".altdata").val();
      var actiondata = $(ele).find(".actiondata").val();
      var actionparam = $(ele).find(".actionparam").val();
      var speeddata = $(ele).find(".speeddata").val();
      var latdata = $(ele).find(".latdata").val();
      var lngdata = $(ele).find(".lngdata").val();
      var mid = "mid-" + index;

      if (altdata == null || altdata == ""
        || speeddata == null || speeddata == ""
        || actionparam == null || actionparam == "") {
          monitor("오류 : 인덱스 - " + (index + 1) + " / 비어있는 파라메터가 존재합니다.");
          bError++;
          return;
        }

      nPositions.push({id:mid, lat:latdata, lng:lngdata, alt:altdata, act:actiondata, actparam:actionparam, speed:speeddata});
      cindex++;
    });

    if (bError > 0) {
      alert("오류를 확인해 주세요!");
      return;
    }

    if (cindex <= 0) {
      alert("입력된 Waypoint가 1도 없습니다! 집중~ 집중~!");
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

  dokdo_view = new ol.View({
      center: dokdo,
      zoom: 17
    });

  geolocation = new ol.Geolocation({
          // enableHighAccuracy must be set to true to have the heading value.
          trackingOptions: {
            enableHighAccuracy: true
          },
          projection: dokdo_view.getProjection()
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

  dokdo_icon = new ol.Feature({
      geometry: new ol.geom.Point(ol.proj.fromLonLat([131.8661992, 37.2435813]))
  });

  dokdo_icon.setStyle(new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        color: '#8959A8',
        crossOrigin: 'anonymous',
        src: './imgs/position.png'
      }))
    }));

  var vectorSource = new ol.source.Vector({
      features: [dokdo_icon, accuracyFeature, positionFeature]
    });

  var vectorLayer = new ol.layer.Vector({
      source: vectorSource
    });
    
  mapPopup = new ol.Overlay({
        element: document.getElementById('popup')
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
      view: dokdo_view
    });
    
    map.addOverlay(mapPopup);


    // update the HTML page when the position changes.
    geolocation.on('change', function() {
      el('accuracy').innerText = geolocation.getAccuracy() + ' [m]';
      el('altitude').innerText = geolocation.getAltitude() + ' [m]';
      el('altitudeAccuracy').innerText = geolocation.getAltitudeAccuracy() + ' [m]';
      el('heading').innerText = geolocation.getHeading() + ' [rad]';
      el('speed').innerText = geolocation.getSpeed() + ' [m/s]';
      showLoader();
      flyTo(geolocation.getPosition(), function(){hideLoader();});
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


function flyTo(location, done) {
    var duration = 1500;
    var zoom = dokdo_view.getZoom();
    var parts = 2;
    var called = false;

    dokdo_icon.setGeometry(new ol.geom.Point(location));

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

    dokdo_view.animate({
      center: location,
      duration: duration
    }, callback);
    dokdo_view.animate({
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
  var npos = ol.proj.fromLonLat([r.lng *= 1, r.lat *= 1]);
  flyTo(npos, function() {});

  setTimeout(function() {
            if (bMonStarted == false) return;
            nextMon();
  }, 2500);
}


function uploadFlightList() {
	var files = document.getElementById('file').files;
  if (files.length > 0) {
  	var mname = prompt("비행기록의 이름을 입력해 주세요.", "");

	  if (mname == null) {
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
    cookies = cName + '=' + escape(cValue) + '; path=/ '; // 한글 깨짐을 막기위해 escape(cValue)를 합니다.
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
