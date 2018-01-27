var onloadCallback = function() {
  grecaptcha.render('html_element', {
    'sitekey' : '6LexCTAUAAAAAIURdnNux9P3incrbqhYWIEH3-UL',
    'callback' : verifyCallback,
  });
};

var verifyCallback = function(response) {
  sendData(response);
};

function sendData(responsedata) {
  var myemail = $('#myemail').val();
  var myname = $('#myname').val();
  $.ajax({
       type:"POST",
       url:"https://mn91te9qqb.execute-api.ap-northeast-2.amazonaws.com/open/newmember",
       dataType:"JSON",
       crossDomain: true,
       data: JSON.stringify({email : myemail, name : myname, captchaResponse : responsedata}),
       contentType: "application/json",
       dataType: "json",
       cache: false,
       async: false,
       success : function(data) {
	     $('#expmsg').html("아래의 토큰을 사용해 주세요.");
	     $('#html_element').hide();
	     $('#tokenfield').show();
	     $('#mytoken').val(data.token);
       },
       complete : function(data) {
       },
       error : function(xhr, status, error) {
	     $('#monitor').html(error);
       }
  });
}

$( document ).ready(function() {
	$('#tokenfield').hide();
	$('#expmsg').hide();
	$('#html_element').hide();
});
