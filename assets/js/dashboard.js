
// var Apphost = "https://9518-217-55-186-179.ngrok.io/";
var Apphost = "http://147.182.164.139:8000/";

$(document).ready(function(){
    // get();
    
    $("#pagelink").text("Dashboard")
    $("body").addClass("overflow-hidden");
    $(".bodyCont").addClass("d-none");
    auth();
            
    $("#usrconpass").keyup(function(){
      if ($("#usrpass").val() != $("#usrconpass").val()) {
          $("#passmsg").html("Password do not match").css("color","red");
      }else{
          $("#passmsg").html("Password matched").css("color","green");
      }
    });

    $("#usrpass").keyup(function(){
      if ($("#usrconpass").val() != $("#usrpass").val()) {
          $("#passmsg").html("Password do not match").css("color","red");
      }else{
          $("#passmsg").html("Password matched").css("color","green");
      }
    });
    // GetStat(localStorage.getItem('token'));

});

$( "#AddNewGatetBtn" ).click(function(){
  $( "#gateAddHead" ).text( "Add New Gate" );
  $("#action").val("insert");
  $("#gatename").val("");
  $("#gateDesc").val("");
  $("#gatemsgerror").addClass("d-none");
  $("#gatemsgerror").text("")
} );
  

$("#addnewGateBtn").click(function(e){
  e.preventDefault();
  var gateName =$("#gatename").val();
  var gateDesc =$("#gateDesc").val();
  var action =$("#action").val();
  var gid =$("#gid").val();

  if (gateName =="" || gateDesc ==""){
    $("#gatemsgerror").removeClass("d-none");
    $("#gatemsgerror").text("You Must Enter Gate Name and Desc")
  }else{
    if(action == "insert"){
      CREATE_GATE(gateName,gateDesc);
    }else if(action == "update"){
      UPDATE_GATE(gid,gateName,gateDesc)
    }
  }
  
  
})


function auth(){
  let userId = localStorage.getItem('User');
  $.ajax({
    type: "GET",
    url: Apphost+"staff/"+userId,
    async: false,
    headers: {Authorization: 'Bearer '+localStorage.getItem('token')},
    statusCode: {
      404: function() {
        
        ErrorAlert("page not found")
      }
    },
    error: function(jqXHR, textStatus, ex) {
        console.log(textStatus + "," + ex + "," + jqXHR.responseText);
        
        if(!jqXHR.responseText){
          window.location.href = 'sign-in.html';
        }else{
          // alert(jqXHR.responseText);
          ErrorAlert(JSON.parse(jqXHR.responseText).message)
        }
        var resArr= JSON.parse(jqXHR.responseText);
        if(resArr.message ==" This Staff is not exsits" || resArr.detail == 'Invalid Token'){
          localStorage.clear();
          window.location.href = 'sign-in.html';
        }else{
          // alert("Check your Internet Connection")
          ErrorAlert("Check your Internet Connection")
        }

    },
    success: function(data) {
        // alert("success");
        
        if(!data.is_active){
          window.location.href= 'sign-in.html';
        }
        GetStat(localStorage.getItem('token'));
        GetLogs(localStorage.getItem('token'));
        $("#userNametxt").text(localStorage.getItem('userName'));
        $("#userNameLbl").text(localStorage.getItem('userName'));
        $("#userMailtxt").text(localStorage.getItem('userMail'));
        LIST_GATE()
        $("body").removeClass("overflow-hidden");
        $(".bodyCont").removeClass("d-none");
        $(".loaders").addClass("d-none");
        LIST_CAMERA()
        
        if(data.is_admin){
          ShowTabs('admin');
          SelectAll();
          LIST_All_REPORTS();
          $("#userJobtxt").text("Admin")
         
        }else if(!data.is_admin && !data.is_operation && !data.is_supervisor){
          // alert("Guard --> camera - gate");
          ShowTabs('guard');
          $("#userJobtxt").text("Guard")
        }else if(data.is_supervisor){
          // alert("Supervisor --> camera - gate - report");
          ShowTabs('supervisor');
          LIST_All_REPORTS();
          $("#userJobtxt").text("Supervisor")
        }else if(data.is_operation){
          // alert("Operation --> Create Pages Staff - visitor - camera - car -gate");
          ShowTabs('operation');
          SelectAll();
          $("#userJobtxt").text("Operation")
        }else{
          window.location.href= 'sign-in.html';
        }
        
    }
  });

}
function Logout(){
    $.ajax({
        method: "POST",
        url: Apphost+'logout',
        headers: {"Authorization": localStorage.getItem('token')},
        datatype: 'JSON',
        statusCode: {
          404: function() {
            ErrorAlert("page not found");
            
          }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
          ErrorAlert("some error");
          console.log(errorThrown);
       },
        success: function(data) {
            var resArr = $.parseJSON(data);
            localStorage.clear();
        }
      });
}

function GetStat(token){
  $.ajax({
    type: "POST",
    url: Apphost,
    
    headers: {Authorization: 'Bearer '+token},
    statusCode: {
      404: function() {
        ErrorAlert("page not found");
      }
    },
    error: function(jqXHR, textStatus, ex) {
        console.log(textStatus + "," + ex + "," + jqXHR.responseText);
        Erroralert(jqXHR.responseText);
    },
    success: function(data) {
        $("#gateCountlbl").text(data.gate);
        $("#cameraCountlbl").text(data.camera);
        $("#visitorCountlbl").text(data.visitor.visitor_count);
        $("#pendingVisitorCountlbl").text(data.visitor.pending);
        $("#activeVisitorCountlbl").text(data.visitor.approved);
        $("#rejectVisitorCountlbl").text(data.visitor.rejected);
        $("#carCountlbl").text(data.car.car_count);
        $("#activeCarCountlbl").text(data.car.approved);
        $("#pendingCarCountlbl").text(data.car.pending);
        $("#rejectCarCountlbl").text(data.car.rejected);
        $("#userCountlbl").text(data.staff.active);
        $("#adminUserCountlbl").text(data.staff.admin);
        $("#operationUserCountlbl").text(data.staff.operation);
        $("#supervisorUserCountlbl").text(data.staff.supervisor);
        $("#gardUserCountlbl").text(data.staff.gard);
        
    }
  });
}

function GetLogs(token){
  $.ajax({
    type: "POST",
    url: Apphost,
    headers: {Authorization: 'Bearer '+token},
    statusCode: {
      404: function() {
        Erroralert("page not found");
      }
    },
    error: function(jqXHR, textStatus, ex) {
        console.log(textStatus + "," + ex + "," + jqXHR.responseText);
        Erroralert(jqXHR.responseText);
    },
    success: function(data) {
        $("#kt_profile_overview_table tbody").empty();
        data.reports.forEach(report => {
          var statusR = "";
          if(report.status==1){
            statusR = `<span class="badge badge-light-success fw-bolder px-4 py-3">IN</span>`
          }else if(report.status==2){
            statusR = `<span class="badge badge-light-danger fw-bolder px-4 py-3">Out</span>`
          }
          $("#kt_profile_overview_table tbody").append(`<tr class="text-center">
          <td>
            <!--begin::User-->
            <div class="d-flex align-items-center">
              <!--begin::Wrapper-->
              
              <!--end::Wrapper-->
              <!--begin::Info-->
              <div class="d-flex flex-column justify-content-center">
                <a href="#" class="fs-6 text-gray-800 text-hover-primary">${report.gate_name}</a>
                <div class="fw-bold text-gray-400">Address - Desc.</div>
              </div>
              <!--end::Info-->
            </div>
            <!--end::User-->
          </td>
          <td>${report.date}</td>
          <td>${report.visitor}</td>
          <td>${report.car}</td>
          <td>
            ${statusR}
          </td>
          
        </tr>`);
        });
       
        
    }
  });
}


function ShowTabs(userGroup){
  switch (userGroup) {
    case 'user':
       ActiveTabs([3,4,5,6,7,8]) 
      break;
    case 'supervisor':
      ActiveTabs([4,5,6,7,8]) 
      break;
    case 'operation':
      ActiveTabs([1,2,3]) 
      break;
    case 'admin':
      ActiveTabs([]) 
      break;
    
  }
}

function ActiveTabs(tabs){
  tabs.forEach(tab => {
    $("#tab-"+tab).remove();
  });
}

$("#tab-1").click(function(){
  $("#pagelink").text("Gates");
  $("#pgTitle").text("Gates");
  $("#asside-btn").addClass('opacity-1');
  $("#asside-btn").removeClass('opacity-0');
})
$("#tab-2").click(function(){
  $("#pagelink").text("Camera");
  $("#pgTitle").text("Camera");
  $("#asside-btn").addClass('opacity-1');
  $("#asside-btn").removeClass('opacity-0');
})
$("#tab-3").click(function(){
  $("#pagelink").text("Reports");
  $("#pgTitle").text("Reports");
  
  $("#asside-btn").addClass('opacity-0');
  $("#asside-btn").addClass('active');
  if(!$("#asside-btn").hasClass('active')){
    $("#asside-btn").click()
  }

})
$("#tab-4").click(function(){
  $("#pagelink").text("Gates Management");
  $("#pgTitle").text("Gates Management");
  $("#asside-btn").addClass('active');
  $("#asside-btn").addClass('opacity-0');
  if(!$("#asside-btn").hasClass('active')){
    $("#asside-btn").click()
  }
})
$("#tab-5").click(function(){
  $("#pagelink").text("Camera Management");
  $("#pgTitle").text("Camera Management");
  $("#asside-btn").addClass('opacity-0');
  $("#asside-btn").addClass('active');
  if(!$("#asside-btn").hasClass('active')){
    $("#asside-btn").click()
  }
})
$("#tab-6").click(function(){
  $("#pagelink").text("Users");
  $("#pgTitle").text("Users");
  $("#asside-btn").addClass('opacity-0');
  $("#asside-btn").addClass('active');
  if(!$("#asside-btn").hasClass('active')){
    $("#asside-btn").click()
  }
})
$("#tab-7").click(function(){
  $("#pagelink").text("Visitor");
  $("#pgTitle").text("Visitor");
  $("#asside-btn").addClass('opacity-0');
  $("#asside-btn").addClass('active');
  if(!$("#asside-btn").hasClass('active')){
    $("#asside-btn").click()
  }
})
$("#tab-8").click(function(){
  $("#pagelink").text("Cars");
  $("#pgTitle").text("Cars");
  $("#asside-btn").addClass('opacity-0');
  $("#asside-btn").addClass('active');
  if(!$("#asside-btn").hasClass('active')){
    $("#asside-btn").click()
  }
})
$("#tab-9").click(function(){
  $("#pagelink").text("Profile");
  $("#pgTitle").text("Profile");
  $("#asside-btn").addClass('opacity-0');
  $("#asside-btn").addClass('active');
  if(!$("#asside-btn").hasClass('active')){
    $("#asside-btn").click()
  }
  GET_USER_PROFILE(localStorage.getItem('User'));
})

function LIST_GATE(){
 
 $.ajax({
    type: "GET",
    caches : false,
    url: Apphost+"gate",
    headers: {Authorization: 'Bearer '+localStorage.getItem('token')},
    statusCode: {
      404: function() {
        Erroralert("page not found");
      }
    },
    error: function(jqXHR, textStatus, ex) {
        console.log(textStatus + "," + ex + "," + jqXHR.responseText);
        Erroralert(jqXHR.responseText);
        var resArr= JSON.parse(jqXHR.responseText);
        if(resArr.message ==" This Staff is not exsits" || resArr.detail == 'Invalid Token'){
          localStorage.clear();
          window.location.href = 'sign-in.html';
        }

    },
    success: function(data) {
      console.log(data);
      $("#GateList").empty();
      $("#GatesDiv").empty();


      data.results.forEach(gate => {
        $("#GateList").append(`<a gate=${gate.name} href= "#" onClick="javascript:OpenGate(${gate.id})" class="custom-list d-flex align-items-center px-5 py-4">
        <!--begin::Symbol-->
        <div class="symbol symbol-40px me-5">
          <span class="symbol-label">
            <img src="assets/media/svg/gates/toll-road.png" class="h-50 align-self-center" alt="">
          </span>
        </div>
        <!--end::Symbol-->
        <!--begin::Description-->
        <div class="d-flex flex-column flex-grow-1">
          <!--begin::Title-->
          <h5 id="searchToken" class="custom-list-title fw-bold text-gray-800 mb-1">${gate.name}</h5>
          <!--end::Title-->
          <!--begin::Link-->
          <span class="text-gray-400 fw-bold">${gate.description}</span>
          <!--end::Link-->
        </div>
        <!--begin::Description-->
      </a>`);
      $("#GatesDiv").append(`
      <div class="col-lg-6" id="">
         <!--begin::Summary-->
         <div class="card card-flush h-lg-100">
           <!--begin::Card header-->
           <div class="card-header mt-6">
             <!--begin::Card title-->
             <div class="card-title flex-column">
               
               <h3 class="fw-bolder mb-1">${gate.name}</h3>
               
             </div>
             <!--end::Card title-->
             <!--begin::Card toolbar-->
             <div tooltip="FullScreen" class="card-toolbar">
               <a href="#" onClick="javascript:OpenGate(${gate.id})"  tooltip="Open" class="btn btn-light btn-sm"><i class="fa fa-arrows-alt"></i></a>
               
             </div>
             <!--end::Card toolbar-->
           </div>
           <!--end::Card header-->
           <!--begin::Card body-->
          <div class="card-body p-9 pt-5">
             <!--begin::Wrapper-->
             <a href= "#" onClick="javascript:OpenGate(${gate.id})" class="custom-list d-flex align-items-center px-5 py-4">
              <!--begin::Symbol-->
              <div class="symbol symbol-40px me-5">
                <span class="symbol-label">
                  <img src="assets/media/svg/gates/toll-road.png" class="h-50 align-self-center" alt="">
                </span>
              </div>
              <!--end::Symbol-->
              <!--begin::Description-->
              <div class="d-flex flex-column flex-grow-1">
                <!--begin::Title-->
               
                <!--end::Title-->
                <!--begin::Link-->
                <span class="text-gray-400 fw-bold">${gate.description}</span>
                <!--end::Link-->
              </div>
              <!--begin::Description-->
            </a>
             
          </div>
           <!--end::Card body-->
         </div>
         <!--end::Summary-->
       </div>`);
     
      });

      if(data.count == 0){
        $("#GatesDiv").append(`<div class="col-lg-12" id="">
        <!--begin::Summary-->
        <div class="card card-flush h-lg-100">
          <!--begin::Card header-->
          <div class="card-header mt-6">
            <!--begin::Card title-->
            <div class="card-title flex-column">
              
              <h3 class="fw-bolder mb-1">No Gates</h3>
              
            </div>
            <!--end::Card title-->
            <!--begin::Card toolbar-->
            <div tooltip="FullScreen" class="card-toolbar">
              <a href="#" onclick="" tooltip="Open" class="btn btn-light btn-sm"><i class="fa fa-arrows-alt"></i></a>
              
            </div>
            <!--end::Card toolbar-->
          </div>
          <!--end::Card header-->
          <!--begin::Card body-->
         <div class="card-body p-9 pt-5">
            <!--begin::Wrapper-->
            <a href="#" onclick="" class="custom-list d-flex align-items-center px-5 py-4">
             <!--begin::Symbol-->
             <div class="symbol symbol-40px me-5">
               <span class="symbol-label">
                 <img src="assets/media/svg/gates/toll-road.png" class="h-50 align-self-center" alt="">
               </span>
             </div>
             <!--end::Symbol-->
             <!--begin::Description-->
             <div class="d-flex flex-column flex-grow-1">
               <!--begin::Title-->
              
               <!--end::Title-->
               <!--begin::Link-->
               <span class="text-gray-400 fw-bold"></span>
               <!--end::Link-->
             </div>
             <!--begin::Description-->
           </a>
            
         </div>
          <!--end::Card body-->
        </div>
        <!--end::Summary-->
      </div>`);
      }

    }
  });
}


function CREATE_GATE(name,desc){
  var newGate = 
    {
        'name': name,
        'description': desc
    }
  $.ajax({
    type: "POST",
    caches : false,
    url: Apphost+"gate",
    headers: {Authorization: 'Bearer '+localStorage.getItem('token')},
    data:newGate,
    statusCode: {
      404: function() {
        Erroralert("page not found");
      }
    },
    error: function(jqXHR, textStatus, ex) {
        console.log(textStatus + "," + ex + "," + jqXHR.responseText);
        var resArr= JSON.parse(jqXHR.responseText);
        if(jqXHR.responseText == '{"message":{"name":["Gate with this Name already exists."]}}'){
          ErrorAlert('Gate with this Name already exists');
        }else{
          ErrorAlert('err. ' + resArr.message);
        }
        
        
        if(resArr.message ==" This Staff is not exsits" || resArr.detail == 'Invalid Token'){
          localStorage.clear();
          window.location.href = 'sign-in.html';
        }

    },
    success: function(data) {
      SuccessAlert(data.message);
      $("#gatename").val("");
      $("#gateDesc").val("");
      LIST_GATE()
      LIST_All_GATE()
      LIST_All_CAMERA()
      LIST_CAMERA()
    }
  });
  
}

function UPDATE_GATE(id,name,desc){
  var newGate = 
    {
        'name': name,
        'description': desc
    }
  $.ajax({
    type: "PUT",
    caches : false,
    url: Apphost+"gate/"+id,
    headers: {Authorization: 'Bearer '+localStorage.getItem('token')},
    data:newGate,
    statusCode: {
      404: function() {
        ErrorAlert("page not found");
      }
    },
    error: function(jqXHR, textStatus, ex) {
        console.log(textStatus + "," + ex + "," + jqXHR.responseText);
        ErrorAlert(jqXHR.responseText);
        var resArr= JSON.parse(jqXHR.responseText);
        if(resArr.message ==" This Staff is not exsits" || resArr.detail == 'Invalid Token'){
          localStorage.clear();
          window.location.href = 'sign-in.html';
        }

    },
    success: function(data) {
      SuccessAlert(data.message);
      LIST_GATE()
      LIST_All_GATE();
    }
  });
  
}
function Staff_gate(){
  
  $.ajax({
    type: "POST",
    url: Apphost+"gate/staff_gate",
    headers: {Authorization: 'Bearer '+localStorage.getItem('token')},
    statusCode: {
      404: function() {
        ErrorAlert("page not found");
      }
    },
    error: function(jqXHR, textStatus, ex) {
        console.log(textStatus + "," + ex + "," + jqXHR.responseText);
        ErrorAlert(jqXHR.responseText);
        var resArr= JSON.parse(jqXHR.responseText);
        if(resArr.message ==" This Staff is not exsits" || resArr.detail == 'Invalid Token'){
          localStorage.clear();
          window.location.href = 'sign-in.html';
        }

    },
    success: function(data) {
        // alert("success");
        // console.log(data);
    }
  });
}



function OpenGate(gid){
  $.ajax({
    type: "GET",
    url: Apphost+"gate/"+gid,
    headers: {Authorization: 'Bearer '+localStorage.getItem('token')},
    statusCode: {
      404: function() {
        ErrorAlert("page not found");
      }
    },
    error: function(jqXHR, textStatus, ex) {
        console.log(textStatus + "," + ex + "," + jqXHR.responseText);
        ErrorAlert(jqXHR.responseText);
        var resArr= JSON.parse(jqXHR.responseText);
        if(resArr.message ==" This Staff is not exsits" || resArr.detail == 'Invalid Token'){
          localStorage.clear();
          window.location.href = 'sign-in.html';
        }

    },
    success: function(data) {
        $("#GatesDiv").empty();
        $('.Divcontent').hide().removeClass('d-flex').filter('#GatesDiv').show().addClass('d-flex');
        $("#pagelink").text(data.name);
        if(data.camera.length > 0){
          data.camera.forEach(cam => {
            $("#GatesDiv").append(`<div id="camera${cam.id}" class="col-lg-12">
            <!--begin::Summary-->
            <div class="card card-flush h-lg-100">
              <!--begin::Card header-->
              <div class="card-header mt-6">
                <!--begin::Card title-->
                <div class="card-title flex-column">
                  <h3 class="fw-bolder mb-1">${cam.name}</h3>
                  <div class="fs-6 fw-bold text-gray-400">${cam.description} .</div>
                </div>
                <!--end::Card title-->
                <!--begin::Card toolbar-->
                <div class="card-toolbar">
                  <a href="#" class="btn btn-light" onClick="javascript:ToggleFull(camera${cam.id})">Toggle Full Screen</a>
                  <!--<a href="#" class="btn btn-light-danger" onClick="javascript:catchScr(camcont${cam.id},this)" >Catch</a>-->
                  <a href="#" class="btn btn-linkedin btn-sm" title="Upload">Upload</a>
                </div>
                <!--end::Card toolbar-->
              </div>
              <!--end::Card header-->
              <!--begin::Card body-->
              <div class="card-body  pt-5">
                <!--begin::Wrapper-->
                <!-- <iframe src="http://localhost/demo7/report.html" class="w-100 " frameborder="0"></iframe> -->
                <div class="Camcontainer" id="camcont${cam.id}">
                  <iframe seamless src="${cam.url}" class="videoElement w-100 " frameborder="0"></iframe>  
                    <video autoplay="true" class="videoElement d-none"></video>
              </div>
              <div class="bg-info border card-body mt-0 p-9 pt-5 rounded text-center" id="Camres${cam.id}">
                <h2>Results</h2>
              </div>
              <!--end::Card body-->
            </div>
            <!--end::Summary-->
          </div>`)
          });
          
        }else{
          $("#GatesDiv").append(`<div id="camera0" class="col-lg-12">
            <!--begin::Summary-->
            <div class="card card-flush h-lg-100">
              <!--begin::Card header-->
              <div class="card-header mt-6">
                <!--begin::Card title-->
                <div class="card-title flex-column">
                  <h3 class="fw-bolder mb-1">No Camera</h3>
                  <div class="fs-6 fw-bold text-gray-400">None .</div>
                </div>
                <!--end::Card title-->
                <!--begin::Card toolbar-->
                <div class="card-toolbar">
                  <a href="#" class="btn btn-light d-none" onClick="javascript:ToggleFull(camera0)">Toggle Full Screen</a>
                  <!-- <a href="#" class="btn btn-light-danger d-none" onClick="javascript:catchScr(camcont0,this)" >Catch</a>-->
                  <a href="#" class="btn btn-linkedin btn-sm d-none" title="Upload">Upload</a>
                </div>
                <!--end::Card toolbar-->
              </div>
              <!--end::Card header-->
              <!--begin::Card body-->
              <div class="card-body  pt-5">
                <!--begin::Wrapper-->
                <!-- <iframe src="http://localhost/demo7/report.html" class="w-100 " frameborder="0"></iframe> -->
                <div class="Camcontainer" id="camcont0">
                    <video autoplay="true" class="videoElement">
                    
                    </video>
              </div>
              <div class="bg-info border card-body mt-0 p-9 pt-5 rounded text-center" id="Camres0">
                <h2>Results</h2>
              </div>
              <!--end::Card body-->
            </div>
            <!--end::Summary-->
          </div>`)
        }
    }
  });
}



function ToggleFull(elem){
  var isInFullScreen = (document.fullscreenElement && document.fullscreenElement !== null) ||
        (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
        (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
        (document.msFullscreenElement && document.msFullscreenElement !== null);
  if (!isInFullScreen) {
      
      if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
      elem.msRequestFullscreen();
    }
    $(".videoElement").addClass("h-100");
    $(".Camcontainer").addClass("h-75");
    $(".card-body").addClass("p-0");
    $(".card-body").addClass("m-0");

    
  }else{

    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
    document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
    document.msExitFullscreen();
    }else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    }
    $(".videoElement").removeClass("h-100");
    $(".Camcontainer").removeClass("h-75");
    $(".card-body").removeClass("p-0");
    $(".card-body").removeClass("m-0");

  }
 
}

$(document).on("keydown",function(ev){
	
	if(ev.keyCode===27||ev.keyCode===122) {
    $(".videoElement").removeClass("h-100");
    $(".Camcontainer").removeClass("h-75");
    $(".card-body").removeClass("p-0");
    $(".card-body").removeClass("m-0");
    
  }
})

if (document.addEventListener)
{
 document.addEventListener('fullscreenchange', exitHandler, false);
 document.addEventListener('mozfullscreenchange', exitHandler, false);
 document.addEventListener('MSFullscreenChange', exitHandler, false);
 document.addEventListener('webkitfullscreenchange', exitHandler, false);
}

function exitHandler()
{
 if (!document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement)
 {
  $(".videoElement").removeClass("h-100");
    $(".Camcontainer").removeClass("h-75");
    $(".card-body").removeClass("p-0");
    $(".card-body").removeClass("m-0");
 }
}




function catchScr(el,par){
  html2canvas(el).then(canvas => {
    // document.body.appendChild(canvas);
    var imgageData = canvas.toDataURL("image/png");
    // Now browser starts downloading it instead of just showing it
    var newData = imgageData.replace(/^data:image\/png/, "data:application/octet-stream");
    $(par).attr("download", "capture_"+new Date()+".png").attr("href", newData);
    // $(par)[0].click();
    // $(par).download = "output.png";
    // window.location.href=newData;
 });
}


function LIST_All_GATE(){
  $.ajax({
    type: "GET",
    caches : false,
    url: Apphost+"gate",
    headers: {Authorization: 'Bearer '+localStorage.getItem('token')},
    statusCode: {
      404: function() {
        ErrorAlert("page not found");
      }
    },
    error: function(jqXHR, textStatus, ex) {
        console.log(textStatus + "," + ex + "," + jqXHR.responseText);
        ErrorAlert(jqXHR.responseText);
        var resArr= JSON.parse(jqXHR.responseText);
        if(resArr.message ==" This Staff is not exsits" || resArr.detail == 'Invalid Token'){
          localStorage.clear();
          window.location.href = 'sign-in.html';
        }

    },
    success: function(data) {
      console.log(data);
      $("#GateTbl").empty();
      $("#GC").text(data.count);
      $("#camGateSlct2").empty();
      $("#camGateSlct1").empty();
      // $(".camGateSlct").append(`<option value="0" disabled selected="selected">Gates</option>`)
      var i=1;
      data.results.forEach(gate => {
        var CamArr = Array();
        if(gate.camera.length>0){
          gate.camera.forEach(cam => {
            CamArr.push(cam.name);
          });
        }else{
          CamArr = 'None';
        }
        
        
        $("#camGateSlct2").append(`<option value=${gate.id}>${gate.name}</option>`);
        $("#camGateSlct1").append(`<option value="${gate.id}">${gate.name}</option>`);

        $("#GateTbl").append(`<tr>
        <td>${i}</td>
        <td>${gate.name}</td>
        <td>${gate.description}</td>
        <td>${CamArr}</td>
        <td>
          
          <a href="#" onclick='editGate(${JSON.stringify(gate)})' class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1">
            <!--begin::Svg Icon | path: icons/duotune/art/art005.svg-->
            <span class="svg-icon svg-icon-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path opacity="0.3" d="M21.4 8.35303L19.241 10.511L13.485 4.755L15.643 2.59595C16.0248 2.21423 16.5426 1.99988 17.0825 1.99988C17.6224 1.99988 18.1402 2.21423 18.522 2.59595L21.4 5.474C21.7817 5.85581 21.9962 6.37355 21.9962 6.91345C21.9962 7.45335 21.7817 7.97122 21.4 8.35303ZM3.68699 21.932L9.88699 19.865L4.13099 14.109L2.06399 20.309C1.98815 20.5354 1.97703 20.7787 2.03189 21.0111C2.08674 21.2436 2.2054 21.4561 2.37449 21.6248C2.54359 21.7934 2.75641 21.9115 2.989 21.9658C3.22158 22.0201 3.4647 22.0084 3.69099 21.932H3.68699Z" fill="black"></path>
                <path d="M5.574 21.3L3.692 21.928C3.46591 22.0032 3.22334 22.0141 2.99144 21.9594C2.75954 21.9046 2.54744 21.7864 2.3789 21.6179C2.21036 21.4495 2.09202 21.2375 2.03711 21.0056C1.9822 20.7737 1.99289 20.5312 2.06799 20.3051L2.696 18.422L5.574 21.3ZM4.13499 14.105L9.891 19.861L19.245 10.507L13.489 4.75098L4.13499 14.105Z" fill="black"></path>
              </svg>
            </span>
            <!--end::Svg Icon-->
          </a>
        </td>
        <td>
          <!-- <i class="fa fa-trash-alt text-danger"></i> -->
          <a href="#"  onclick="deleteGate(${gate.id},'${gate.name}')"  class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm">
            <!--begin::Svg Icon | path: icons/duotune/general/gen027.svg-->
            <span class="svg-icon svg-icon-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5 9C5 8.44772 5.44772 8 6 8H18C18.5523 8 19 8.44772 19 9V18C19 19.6569 17.6569 21 16 21H8C6.34315 21 5 19.6569 5 18V9Z" fill="black"></path>
                <path opacity="0.5" d="M5 5C5 4.44772 5.44772 4 6 4H18C18.5523 4 19 4.44772 19 5V5C19 5.55228 18.5523 6 18 6H6C5.44772 6 5 5.55228 5 5V5Z" fill="black"></path>
                <path opacity="0.5" d="M9 4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V4H9V4Z" fill="black"></path>
              </svg>
            </span>
            <!--end::Svg Icon-->
          </a>
        </td>
      </tr>`);
      i++;
      });
      
      
    }
  });
}

function editGate(gate){
  $( "#AddNewGatetBtn" ).trigger( "click" );
  $("#gid").val(gate.id);
  $("#action").val("update");
  $( "#gatename" ).val( gate.name );
  $( "#gateDesc" ).val( gate.description );
  $( "#gateAddHead" ).text( "Update Gate" );


}


function deleteGate(gid,name){
  if(confirm("Are you sure , Delete Gate "+name + "?")){
    $.ajax({
      type: "DELETE",
      caches : false,
      url: Apphost+"gate/"+gid,
      headers: {Authorization: 'Bearer '+localStorage.getItem('token')},
      statusCode: {
        404: function() {
          ErrorAlert("page not found");
        }
      },
      error: function(jqXHR, textStatus, ex) {
          console.log(textStatus + "," + ex + "," + jqXHR.responseText);
          ErrorAlert(jqXHR.responseText);
          var resArr= JSON.parse(jqXHR.responseText);
          if(resArr.message ==" This Staff is not exsits" || resArr.detail == 'Invalid Token'){
            localStorage.clear();
            window.location.href = 'sign-in.html';
          }
  
      },
      success: function(data) {
        SuccessAlert(data.message);
        LIST_GATE()
        LIST_All_GATE();
      }
    });
  }
}


/*************************** Camera //////////////////// */
function LIST_CAMERA(){ 
  $.ajax({
     type: "GET",
     caches : false,
     url: Apphost+"camera",
     headers: {Authorization: 'Bearer '+localStorage.getItem('token')},
     statusCode: {
       404: function() {
        ErrorAlert("page not found");
       }
     },
     error: function(jqXHR, textStatus, ex) {
         console.log(textStatus + "," + ex + "," + jqXHR.responseText);
         ErrorAlert(jqXHR.responseText);
         var resArr= JSON.parse(jqXHR.responseText);
         if(resArr.message ==" This Staff is not exsits" || resArr.detail == 'Invalid Token'){
           localStorage.clear();
           window.location.href = 'sign-in.html';
         }
 
     },
     success: function(data) {
       console.log(data);
       $("#CameraDiv").empty();
       $("#CameraList").empty();
       if(data.results.length > 0){
          data.results.forEach(cam => {
            $("#CameraList").append(`<a href="#" onclick="openCamera(${cam.id})" class="custom-list d-flex align-items-center px-5 py-4">
            <!--begin::Symbol-->
            <div class="symbol symbol-40px me-5">
              <span class="symbol-label">
                <img src="assets/media/svg/camera/cctv-camera.png" class="h-50 align-self-center" alt="" />
              </span>
            </div>
            <!--end::Symbol-->
            <!--begin::Description-->
            <div class="d-flex flex-column flex-grow-1">
              <!--begin::Title-->
              <h5 id="CamsearchToken" class="custom-list-title fw-bold text-gray-800 mb-1">${cam.name}</h5>
              <!--end::Title-->
              <!--begin::Link-->
              <span class="text-gray-400 fw-bold">${cam.description}</span>
              <!--end::Link-->
            </div>
            <!--begin::Description-->
          </a>`);

          $("#CameraDiv").append(`<div class="col-lg-6" id="cam${cam.id}">
          <!--begin::Summary-->
          <div class="card card-flush h-lg-100">
            <!--begin::Card header-->
            <div class="card-header mt-6">
              <!--begin::Card title-->
              <div class="card-title flex-column">
                
                <h3 class="fw-bolder mb-1">${cam.name}</h3>
                <div class="fs-6 fw-bold text-gray-400">${cam.description}</div>
              </div>
              <!--end::Card title-->
              <!--begin::Card toolbar-->
              <div tooltip="FullScreen" class="card-toolbar">
                <a href="#" onClick="javascript:ToggleFull(cam${cam.id})" tooltip="FullScreen" class="btn btn-light btn-sm"><i class="fa fa-arrows-alt"></i></a>
                
              </div>
              <!--end::Card toolbar-->
            </div>
            <!--end::Card header-->
            <!--begin::Card body-->
            <div class="card-body p-9 pt-5">
              <!--begin::Wrapper-->
              <!-- <iframe src="http://localhost/demo7/report.html" class="w-100" frameborder="0"></iframe> -->
              <div class="Camcontainer" >
                  <iframe seamless src="${cam.url}" class="videoElement w-100 " frameborder="0"></iframe>  
                    <video autoplay="true" class="videoElement d-none"></video>
              </div>
            </div>
            <!--end::Card body-->
          </div>
          <!--end::Summary-->
          </div>`)
          });
        }else{
          $("#CameraDiv").append(`<div class="col-lg-6" id="cam0">
          <!--begin::Summary-->
          <div class="card card-flush h-lg-100">
            <!--begin::Card header-->
            <div class="card-header mt-6">
              <!--begin::Card title-->
              <div class="card-title flex-column">
                
                <h3 class="fw-bolder mb-1">No Camera</h3>
                <div class="fs-6 fw-bold text-gray-400"></div>
              </div>
              <!--end::Card title-->
              <!--begin::Card toolbar-->
              <div tooltip="FullScreen" class="card-toolbar">
                <a href="#" onClick="javascript:ToggleFull(cam0)" tooltip="FullScreen" class="btn btn-light btn-sm"><i class="fa fa-arrows-alt"></i></a>
                
              </div>
              <!--end::Card toolbar-->
            </div>
            <!--end::Card header-->
            <!--begin::Card body-->
            <div class="card-body p-9 pt-5">
              <!--begin::Wrapper-->
              <!-- <iframe src="http://localhost/demo7/report.html" class="w-100" frameborder="0"></iframe> -->
              <div class="Camcontainer" >
                  <iframe seamless src="" class="videoElement w-100 " frameborder="0"></iframe>  
                    <video autoplay="true" class="videoElement d-none"></video>
              </div>
            </div>
            <!--end::Card body-->
          </div>
          <!--end::Summary-->
          </div>`)
        }
     }
   });
 }

 function openCamera(cid){
  $.ajax({
    type: "GET",
    url: Apphost+"camera/"+cid,
    headers: {Authorization: 'Bearer '+localStorage.getItem('token')},
    statusCode: {
      404: function() {
        ErrorAlert("page not found");
      }
    },
    error: function(jqXHR, textStatus, ex) {
        console.log(textStatus + "," + ex + "," + jqXHR.responseText);
        ErrorAlert(jqXHR.responseText);
        var resArr= JSON.parse(jqXHR.responseText);
        if(resArr.message ==" This Staff is not exsits" || resArr.detail == 'Invalid Token'){
          localStorage.clear();
          window.location.href = 'sign-in.html';
        }

    },
    success: function(data) {
        $("#CameraDiv").empty();
        $('.Divcontent').hide().removeClass('d-flex').filter('#CameraDiv').show().addClass('d-flex');
        $("#pagelink").text(data.name);
        $("#CameraDiv").append(`<div class="col-lg-12" id="cam${data.id}">
        <!--begin::Summary-->
        <div class="card card-flush h-lg-100">
          <!--begin::Card header-->
          <div class="card-header mt-6">
            <!--begin::Card title-->
            <div class="card-title flex-column">
              
              <h3 class="fw-bolder mb-1">${data.name}</h3>
              <div class="fs-6 fw-bold text-gray-400">${data.description}</div>
            </div>
            <!--end::Card title-->
            <!--begin::Card toolbar-->
            <div tooltip="FullScreen" class="card-toolbar">
              <a href="#" onClick="javascript:ToggleFull(cam${data.id})" tooltip="FullScreen" class="btn btn-light btn-sm"><i class="fa fa-arrows-alt"></i></a>
              
            </div>
            <!--end::Card toolbar-->
          </div>
          <!--end::Card header-->
          <!--begin::Card body-->
          <div class="card-body p-9 pt-5">
            <!--begin::Wrapper-->
            <!-- <iframe src="http://localhost/demo7/report.html" class="w-100" frameborder="0"></iframe> -->
            <div class="Camcontainer" >
                <iframe seamless src="${data.url}" class="videoElement w-100 " frameborder="0"></iframe>  
                  <video autoplay="true" class="videoElement d-none"></video>
            </div>
          </div>
          <!--end::Card body-->
        </div>
        <!--end::Summary-->
      </div>`)
    }
  });
}

function SelectAll(){
  LIST_All_GATE();
  LIST_All_CAMERA();
  LIST_All_USER();
  LIST_All_VISITOR();
  LIST_All_CAR();

}
/******************************* visitor //////////////////// */
function LIST_All_VISITOR(){
  $.ajax({
    type: "GET",
    caches : false,
    url: Apphost+"visitor",
    headers: {Authorization: 'Bearer '+localStorage.getItem('token')},
    statusCode: {
      404: function() {
        ErrorAlert("page not found");
      }
    },
    error: function(jqXHR, textStatus, ex) {
        console.log(textStatus + "," + ex + "," + jqXHR.responseText);
        ErrorAlert(jqXHR.responseText);
        var resArr= JSON.parse(jqXHR.responseText);
        if(resArr.message ==" This Staff is not exsits" || resArr.detail == 'Invalid Token'){
          localStorage.clear();
          window.location.href = 'sign-in.html';
        }

    },
    success: function(data) {
      // console.log(data);
      $("#VisitorTbl").empty();
      $("#carvisitor").empty();
      $("#VC").text(data.count);
      
      var i=1;
      data.results.forEach(visitor => {
        var imgArr = Array();
        // if(gate.camera.length>0){
        //   gate.camera.forEach(cam => {
        //     CamArr.push(cam.name);
        //   });
        // }else{
        //   CamArr = 'None';
        // }
        var visitorStat="Not Defined";
        if(visitor.status == 1){
          visitorStat=`<span class="badge badge-light-success">Active</span>`;
        }else if(visitor.status == 2){
          visitorStat=`<span class="badge badge-light-primary">Pending</span>`;
        }else if(visitor.status == 3){
          visitorStat=`<span class="badge badge-light-danger">Rejected</span>`;
        }
        $("#VisitorTbl").append(`<tr>
        <td>${i}</td>
        <td>${visitor.name}</td>
        <td>${visitor.address}</td>
        <td>${visitorStat}</td>
        <td>${visitor.national_id}</td>
        
        <td>
          
          <a href="#" onclick='editVisitor(${JSON.stringify(visitor)})' class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1">
            <!--begin::Svg Icon | path: icons/duotune/art/art005.svg-->
            <span class="svg-icon svg-icon-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path opacity="0.3" d="M21.4 8.35303L19.241 10.511L13.485 4.755L15.643 2.59595C16.0248 2.21423 16.5426 1.99988 17.0825 1.99988C17.6224 1.99988 18.1402 2.21423 18.522 2.59595L21.4 5.474C21.7817 5.85581 21.9962 6.37355 21.9962 6.91345C21.9962 7.45335 21.7817 7.97122 21.4 8.35303ZM3.68699 21.932L9.88699 19.865L4.13099 14.109L2.06399 20.309C1.98815 20.5354 1.97703 20.7787 2.03189 21.0111C2.08674 21.2436 2.2054 21.4561 2.37449 21.6248C2.54359 21.7934 2.75641 21.9115 2.989 21.9658C3.22158 22.0201 3.4647 22.0084 3.69099 21.932H3.68699Z" fill="black"></path>
                <path d="M5.574 21.3L3.692 21.928C3.46591 22.0032 3.22334 22.0141 2.99144 21.9594C2.75954 21.9046 2.54744 21.7864 2.3789 21.6179C2.21036 21.4495 2.09202 21.2375 2.03711 21.0056C1.9822 20.7737 1.99289 20.5312 2.06799 20.3051L2.696 18.422L5.574 21.3ZM4.13499 14.105L9.891 19.861L19.245 10.507L13.489 4.75098L4.13499 14.105Z" fill="black"></path>
              </svg>
            </span>
            <!--end::Svg Icon-->
          </a>
        </td>
        <td>
          <!-- <i class="fa fa-trash-alt text-danger"></i> -->
          <a href="#"  onclick="deleteVisitor(${visitor.id},'${visitor.name}')"  class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm">
            <!--begin::Svg Icon | path: icons/duotune/general/gen027.svg-->
            <span class="svg-icon svg-icon-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5 9C5 8.44772 5.44772 8 6 8H18C18.5523 8 19 8.44772 19 9V18C19 19.6569 17.6569 21 16 21H8C6.34315 21 5 19.6569 5 18V9Z" fill="black"></path>
                <path opacity="0.5" d="M5 5C5 4.44772 5.44772 4 6 4H18C18.5523 4 19 4.44772 19 5V5C19 5.55228 18.5523 6 18 6H6C5.44772 6 5 5.55228 5 5V5Z" fill="black"></path>
                <path opacity="0.5" d="M9 4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V4H9V4Z" fill="black"></path>
              </svg>
            </span>
            <!--end::Svg Icon-->
          </a>
        </td>
      </tr>`);
      $("#carvisitor").append(`<option value="${visitor.id}">${visitor.name}</option>`);
      
      i++;
      });


    }
  });
}
$( "#AddNewVistBtn" ).click(function(){
  $( "#VisitorAddHead" ).text( "Add New Visitor" );
  $("#Visitoraction").val("insert");
  $("#visImgContainer").addClass('d-none');
  $("#visImgContainer").empty();
  $("#visitormsgerror").addClass('d-none');
  $("#visitormsgerror").text("");
  $("#visname").val("");
  $("#visadd").val("");
  $("#visNid").val("");
  $("#visjob").val("");
  $("#visstatus").val("");
  $('#visimg').prop("files")[0]="";
  $("#reason_of_visit").val("");
} );
  

$("#addvisitorFrm").on('submit', function(e){
  e.preventDefault();
  var visname =$("#visname").val();
  var visadd =$("#visadd").val();
  var visNid =$("#visNid").val();
  var visjob =$("#visjob").val();
  var visstatus =$("#visstatus").val();
  var visimg =$('#visimg').prop("files")[0];
  var reason_of_visit =$("#reason_of_visit").val();
  
  var action =$("#Visitoraction").val();
  var vid =$("#vid").val();
  if(visname == "" || visadd =="" || visNid =="" || visjob =="" || visstatus =="" || reason_of_visit =="" ){
    $("#visitormsgerror").removeClass('d-none');
    $("#visitormsgerror").text("Enter All Form Data");
  }else if(visimg== null){
    $("#visitormsgerror").removeClass('d-none');
    $("#visitormsgerror").text("Upload Visitor Image");
  } else{
    if(action == "insert"){
      var form = new FormData();
      form.append("visitor_img", $('#visimg').prop("files")[0]); // error for loop to get more than on file
      form.append("name", visname);
      form.append("address", visadd);
      form.append("status", visstatus);
      form.append("national_id", visNid);
      form.append("job_title", visjob);
      form.append("reason_of_visit", reason_of_visit);
      CREATE_VISITOR(form);
    }else if(action == "update"){
      UPDATE_VISITOR(vid,visname,visadd,visNid,visjob,visstatus,reason_of_visit,visimg)
    }
  }

 
  
})



function CREATE_VISITOR(formdatat){
  
  $.ajax({
    type: "POST",
    caches : false,
    url: Apphost+"create_visitor/",
    headers: {Authorization: 'Bearer '+localStorage.getItem('token')},
    processData: false,
    mimeType: "multipart/form-data",
    contentType: false,
    data: formdatat,
    statusCode: {
      404: function() {
        ErrorAlert("page not found");
      }
    },
    error: function(jqXHR, textStatus, ex) {
        console.log(textStatus + "," + ex + "," + jqXHR.responseText);
        var resArr= JSON.parse(jqXHR.responseText);
        ErrorAlert(resArr.message);
       
        if(resArr.message ==" This Staff is not exsits" || resArr.detail == 'Invalid Token'){
          localStorage.clear();
          window.location.href = 'sign-in.html';
        }

    },
    success: function(data) {
      SuccessAlert(data.message);
      
      LIST_All_VISITOR()
    }
  });
  
}


function editVisitor(visitor){
  $( "#AddNewVistBtn" ).trigger( "click" );
  $("#vid").val(visitor.id);
  $("#Visitoraction").val("update");

  $("#visname").val(visitor.name);
  $("#visadd").val(visitor.address);
  $("#visNid").val(visitor.national_id);
  $("#visjob").val(visitor.job_title);
  $("#visstatus").val(visitor.status).trigger('change');
  $("#reason_of_visit").val(visitor.reason_of_visit);
  $("#visImgContainer").removeClass('d-none');
  $("#visImgContainer").empty();
  $("#visImgContainer").append(`<div class="upload__img-box">
                                  <div class="img-bg img-thumbnail" style="background-image: url(${visitor.image})">
                                  </div>
                                </div>`);
  // image

  $( "#VisitorAddHead" ).text( "Update Visitor Data" );


}


function UPDATE_VISITOR(vid,visname,visadd,visNid,visjob,visstatus,reason_of_visit,visimg){
  var newVis = 
  {
    "name": visname,
    "address": visadd,
    "status": visstatus,
    "national_id": visNid,
    "job_title": visjob,
    "reason_of_visit": reason_of_visit
}
  $.ajax({
    type: "PUT",
    caches : false,
    url: Apphost+"visitor/"+vid,
    headers: {Authorization: 'Bearer '+localStorage.getItem('token')},
    data:newVis,
    statusCode: {
      404: function() {
        ErrorAlert("page not found");
      }
    },
    error: function(jqXHR, textStatus, ex) {
        console.log(textStatus + "," + ex + "," + jqXHR.responseText);
        ErrorAlert(jqXHR.responseText);
        var resArr= JSON.parse(jqXHR.responseText);
        if(resArr.message ==" This Staff is not exsits" || resArr.detail == 'Invalid Token'){
          localStorage.clear();
          window.location.href = 'sign-in.html';
        }

    },
    success: function(data) {
      SuccessAlert(data.message);
      $("#visImgContainer").empty();
      LIST_All_VISITOR();
    }
  });
  
}


function deleteVisitor(vid,name){
  if(confirm("Are you sure , Delete Visitor "+name + "?")){
    $.ajax({
      type: "DELETE",
      caches : false,
      url: Apphost+"visitor/"+vid,
      headers: {Authorization: 'Bearer '+localStorage.getItem('token')},
      statusCode: {
        404: function() {
          ErrorAlert("page not found");
        }
      },
      error: function(jqXHR, textStatus, ex) {
          console.log(textStatus + "," + ex + "," + jqXHR.responseText);
          ErrorAlert(jqXHR.responseText);
          var resArr= JSON.parse(jqXHR.responseText);
          if(resArr.message ==" This Staff is not exsits" || resArr.detail == 'Invalid Token'){
            localStorage.clear();
            window.location.href = 'sign-in.html';
          }
  
      },
      success: function(data) {
        SuccessAlert(data.message);
        
        LIST_All_VISITOR();
      }
    });
  }
}

function RETREIVE_VISITOR(vid){
  var visitorArr="";
  $.ajax({
    type: "GET",
    caches : false,
    async: false,
    url: Apphost+"visitor/"+vid,
    headers: {Authorization: 'Bearer '+localStorage.getItem('token')},
    statusCode: {
      404: function() {
        ErrorAlert("page not found");
      }
    },
    error: function(jqXHR, textStatus, ex) {
        console.log(textStatus + "," + ex + "," + jqXHR.responseText);
        ErrorAlert(jqXHR.responseText);
        var resArr= JSON.parse(jqXHR.responseText);
        if(resArr.message ==" This Staff is not exsits" || resArr.detail == 'Invalid Token'){
          localStorage.clear();
          window.location.href = 'sign-in.html';
        }

    },
    success: function(data) {
      visitorArr = JSON.stringify(data);
    },complete: function(data) {
      visitorArr = JSON.stringify(data);
    }
  });
  return visitorArr;
}
// ****************************** Car ***********************************

function LIST_All_CAR(){
  $.ajax({
    type: "GET",
    caches : false,
    url: Apphost+"car",
    headers: {Authorization: 'Bearer '+localStorage.getItem('token')},
    statusCode: {
      404: function() {
        ErrorAlert("page not found");
      }
    },
    error: function(jqXHR, textStatus, ex) {
        console.log(textStatus + "," + ex + "," + jqXHR.responseText);
        ErrorAlert(jqXHR.responseText);
        var resArr= JSON.parse(jqXHR.responseText);
        if(resArr.message ==" This Staff is not exsits" || resArr.detail == 'Invalid Token'){
          localStorage.clear();
          window.location.href = 'sign-in.html';
        }

    },
    success: function(data) {
      // console.log(data);
      $("#CarTbl").empty();
      $("#CarC").text(data.count);
      
      var i=1;
      data.results.forEach(car => {
        var imgArr = Array();
        // if(gate.camera.length>0){
        //   gate.camera.forEach(cam => {
        //     CamArr.push(cam.name);
        //   });
        // }else{
        //   CamArr = 'None';
        // }
        
        
        $("#CarTbl").append(`<tr>
        <td>${i}</td>
        <td>${car.plate_number}</td>
        <td>
            ${car.model}
        </td>
        
        <td class="d-inline-flex">
          <span class="p-1"></span>
          <div class="carColor" style="background-color:${car.color}"></div>
        </td>
        <td>${car.visitor}</td>
        <td>
          <a href="#" onclick='editCar(${JSON.stringify(car)})' class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1">
            <!--begin::Svg Icon | path: icons/duotune/art/art005.svg-->
            <span class="svg-icon svg-icon-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path opacity="0.3" d="M21.4 8.35303L19.241 10.511L13.485 4.755L15.643 2.59595C16.0248 2.21423 16.5426 1.99988 17.0825 1.99988C17.6224 1.99988 18.1402 2.21423 18.522 2.59595L21.4 5.474C21.7817 5.85581 21.9962 6.37355 21.9962 6.91345C21.9962 7.45335 21.7817 7.97122 21.4 8.35303ZM3.68699 21.932L9.88699 19.865L4.13099 14.109L2.06399 20.309C1.98815 20.5354 1.97703 20.7787 2.03189 21.0111C2.08674 21.2436 2.2054 21.4561 2.37449 21.6248C2.54359 21.7934 2.75641 21.9115 2.989 21.9658C3.22158 22.0201 3.4647 22.0084 3.69099 21.932H3.68699Z" fill="black"></path>
                <path d="M5.574 21.3L3.692 21.928C3.46591 22.0032 3.22334 22.0141 2.99144 21.9594C2.75954 21.9046 2.54744 21.7864 2.3789 21.6179C2.21036 21.4495 2.09202 21.2375 2.03711 21.0056C1.9822 20.7737 1.99289 20.5312 2.06799 20.3051L2.696 18.422L5.574 21.3ZM4.13499 14.105L9.891 19.861L19.245 10.507L13.489 4.75098L4.13499 14.105Z" fill="black"></path>
              </svg>
            </span>
            <!--end::Svg Icon-->
          </a>
        </td>
        <td>
          <!-- <i class="fa fa-trash-alt text-danger"></i> -->
          <a href="#"  onclick="deleteCar(${car.id},'${car.plate_number}')"  class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm">
            <!--begin::Svg Icon | path: icons/duotune/general/gen027.svg-->
            <span class="svg-icon svg-icon-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5 9C5 8.44772 5.44772 8 6 8H18C18.5523 8 19 8.44772 19 9V18C19 19.6569 17.6569 21 16 21H8C6.34315 21 5 19.6569 5 18V9Z" fill="black"></path>
                <path opacity="0.5" d="M5 5C5 4.44772 5.44772 4 6 4H18C18.5523 4 19 4.44772 19 5V5C19 5.55228 18.5523 6 18 6H6C5.44772 6 5 5.55228 5 5V5Z" fill="black"></path>
                <path opacity="0.5" d="M9 4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V4H9V4Z" fill="black"></path>
              </svg>
            </span>
            <!--end::Svg Icon-->
          </a>
        </td>
      </tr>`);
      i++;
      });
    }
  });
}

$( "#addNewCarBtn" ).click(function(){
  $( "#CarAddHead" ).text( "Add New Car" );
  $("#caraction").val("insert");
  $("#carImgContainer").addClass('d-none');
  $("#carmsgerror").addClass('d-none');
  $("#carmsgerror").text('');
  $("#carmodel").val("");
  $("#carcolor").val("");
  $("#carplate").val("");
} );
  

$("#addcarFrm").on('submit', function(e){
  e.preventDefault();
  var carmodel =$("#carmodel").val();
  var carcolor =$("#carcolor").val();
  var carplate =$("#carplate").val();
  var carvisitor =$("#carvisitor").val();
  var carstatus =$("#carstatus").val();
  var carimg =$("#carimg");
  var carimg1=$('#carimg').prop("files")[0];
  
  
  var action =$("#caraction").val();
  var carid =$("#carid").val();
  if(carmodel=="" || carcolor=="" || carplate=="" || carvisitor=="0" || carstatus=="0" ){
    $("#carmsgerror").removeClass('d-none');
    $("#carmsgerror").text('Enter a Valid Data');
  }else if(carimg1==null){
    $("#carmsgerror").removeClass('d-none');
    $("#carmsgerror").text('Select Car Image');
  }else{
    if(action == "insert"){
        var form = new FormData();
        form.append("image", $('#carimg').prop("files")[0]); // error for loop to get more than on file
        form.append("visitor", carvisitor);
        form.append("plate_number", carplate);
        form.append("color", carcolor);
        form.append("model", carmodel);
        form.append("status", carstatus);
        
        CREATE_CAR(form);
      }else if(action == "update"){
        UPDATE_CAR(carid,carmodel,carcolor,carplate,carvisitor,carstatus,carimg1)
      }
  }

  
  
})

function CREATE_CAR(formdatat){
  
  $.ajax({
    type: "POST",
    caches : false,
    url: Apphost+"car",
    headers: {Authorization: 'Bearer '+localStorage.getItem('token')},
    processData: false,
    mimeType: "multipart/form-data",
    contentType: false,
    data: formdatat,
    statusCode: {
      404: function() {
        ErrorAlert("page not found");
      }
    },
    error: function(jqXHR, textStatus, ex) {
        console.log(textStatus + "," + ex + "," + jqXHR.responseText);
        var resArr= JSON.parse(jqXHR.responseText);
        ErrorAlert(resArr.message);
        
        if(resArr.message ==" This Staff is not exsits" || resArr.detail == 'Invalid Token'){
          localStorage.clear();
          window.location.href = 'sign-in.html';
        }

    },
    success: function(data) {
      SuccessAlert(data.message);
      
      LIST_All_CAR()
    }
  });
  
}

function editCar(car){
  $( "#addNewCarBtn" ).trigger( "click" );
  $("#carid").val(car.id);
  $("#caraction").val("update");

  $("#carmodel").val(car.model);
  $("#carcolor").val(car.color);
  $("#carplate").val(car.plate_number);
  $("#carvisitor").val(car.visitor).trigger('change');
  $("#carstatus").val(car.status).trigger('change');

  $("#carImgContainer").removeClass('d-none');
  $("#carImgContainer").empty();
  $("#carImgContainer").append(`<div class="upload__img-box">
                                  <div class="img-bg img-thumbnail" style="background-image: url(${car.image})">
                                  </div>
                                </div>`);
  // image

  $( "#CarAddHead" ).text( "Update Car Data" );


}
function UPDATE_CAR(carid,carmodel,carcolor,carplate,carvisitor,carstatus,carimg1){

    var form = new FormData();
    form.append("image", carimg1); // error for loop to get more than on file
    form.append("visitor", carvisitor);
    form.append("plate_number", carplate);
    form.append("color", carcolor);
    form.append("model", carmodel);
    form.append("status", carstatus);

  $.ajax({
    type: "PUT",
    caches : false,
    url: Apphost+"car/"+carid,
    headers: {Authorization: 'Bearer '+localStorage.getItem('token')},
    processData: false,
    mimeType: "multipart/form-data",
    contentType: false,
    data: form,
    statusCode: {
      404: function() {
        ErrorAlert("page not found");
      }
    },
    error: function(jqXHR, textStatus, ex) {
        console.log(textStatus + "," + ex + "," + jqXHR.responseText);
        ErrorAlert(jqXHR.responseText);
        var resArr= JSON.parse(jqXHR.responseText);
        if(resArr.message ==" This Staff is not exsits" || resArr.detail == 'Invalid Token'){
          localStorage.clear();
          window.location.href = 'sign-in.html';
        }

    },
    success: function(data) {
      SuccessAlert(data);
      $("#carImgContainer").empty();
      LIST_All_CAR();
    }
  });
   
}
function deleteCar(carid,plate_number){
  if(confirm("Are you sure , Delete Car Number "+plate_number + "?")){
    $.ajax({
      type: "DELETE",
      caches : false,
      url: Apphost+"car/"+carid,
      headers: {Authorization: 'Bearer '+localStorage.getItem('token')},
      statusCode: {
        404: function() {
          ErrorAlert("page not found");
        }
      },
      error: function(jqXHR, textStatus, ex) {
          console.log(textStatus + "," + ex + "," + jqXHR.responseText);
          ErrorAlert(jqXHR.responseText);
          var resArr= JSON.parse(jqXHR.responseText);
          if(resArr.message ==" This Staff is not exsits" || resArr.detail == 'Invalid Token'){
            localStorage.clear();
            window.location.href = 'sign-in.html';
          }
  
      },
      success: function(data) {
        SuccessAlert(data.message);
        
        LIST_All_CAR();
      }
    });
  }
}

// ***************************** user- Staff *******************************

function LIST_All_USER(){
  $.ajax({
    type: "GET",
    caches : false,
    url: Apphost+"staff",
    headers: {Authorization: 'Bearer '+localStorage.getItem('token')},
    statusCode: {
      404: function() {
        ErrorAlert("page not found");
      }
    },
    error: function(jqXHR, textStatus, ex) {
        console.log(textStatus + "," + ex + "," + jqXHR.responseText);
        ErrorAlert(jqXHR.responseText);
        var resArr= JSON.parse(jqXHR.responseText);
        if(resArr.message ==" This Staff is not exsits" || resArr.detail == 'Invalid Token'){
          localStorage.clear();
          window.location.href = 'sign-in.html';
        }

    },
    success: function(data) {
      console.log(data);
      $("#UserTbl").empty();
      $("#UC").text(data.count);
      
      var i=1;
      data.results.forEach(staff => {
        var jobtitle=".";
        if(staff.is_admin){
          jobtitle="Admin";
        }else if(staff.is_operation){
          jobtitle="Operation";
        }else if(staff.is_supervisor){
          jobtitle="Supervisor";
        }else{
          jobtitle="Guard";
        }
        $("#UserTbl").append(`<tr>
        <td>${i}</td>
        <td>
          <div class="d-flex align-items-center">
            <div class="symbol symbol-45px me-5">
              <img src="assets/media/svg/avatars/blank-dark.svg" alt="">
            </div>
            <div class="d-flex justify-content-start flex-column">
              <a href="#" class="text-dark fw-bolder text-hover-primary fs-6">${staff.user.username}</a>
              <span class="text-muted fw-bold text-muted d-block fs-7">${jobtitle}</span>
            </div>
          </div>
        </td>
        
        <td>${staff.user.username}</td>
        <td>${staff.email}</td>
        <td>
          
          <a href="#" onclick='editStaff(${JSON.stringify(staff)})' class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1">
            <!--begin::Svg Icon | path: icons/duotune/art/art005.svg-->
            <span class="svg-icon svg-icon-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path opacity="0.3" d="M21.4 8.35303L19.241 10.511L13.485 4.755L15.643 2.59595C16.0248 2.21423 16.5426 1.99988 17.0825 1.99988C17.6224 1.99988 18.1402 2.21423 18.522 2.59595L21.4 5.474C21.7817 5.85581 21.9962 6.37355 21.9962 6.91345C21.9962 7.45335 21.7817 7.97122 21.4 8.35303ZM3.68699 21.932L9.88699 19.865L4.13099 14.109L2.06399 20.309C1.98815 20.5354 1.97703 20.7787 2.03189 21.0111C2.08674 21.2436 2.2054 21.4561 2.37449 21.6248C2.54359 21.7934 2.75641 21.9115 2.989 21.9658C3.22158 22.0201 3.4647 22.0084 3.69099 21.932H3.68699Z" fill="black"></path>
                <path d="M5.574 21.3L3.692 21.928C3.46591 22.0032 3.22334 22.0141 2.99144 21.9594C2.75954 21.9046 2.54744 21.7864 2.3789 21.6179C2.21036 21.4495 2.09202 21.2375 2.03711 21.0056C1.9822 20.7737 1.99289 20.5312 2.06799 20.3051L2.696 18.422L5.574 21.3ZM4.13499 14.105L9.891 19.861L19.245 10.507L13.489 4.75098L4.13499 14.105Z" fill="black"></path>
              </svg>
            </span>
            <!--end::Svg Icon-->
          </a>
        </td>
        <td>
          <!-- <i class="fa fa-trash-alt text-danger"></i> -->
          <a href="#" onclick="deleteStaff(${staff.id},'${staff.user.username}')"  class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm">
            <!--begin::Svg Icon | path: icons/duotune/general/gen027.svg-->
            <span class="svg-icon svg-icon-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5 9C5 8.44772 5.44772 8 6 8H18C18.5523 8 19 8.44772 19 9V18C19 19.6569 17.6569 21 16 21H8C6.34315 21 5 19.6569 5 18V9Z" fill="black"></path>
                <path opacity="0.5" d="M5 5C5 4.44772 5.44772 4 6 4H18C18.5523 4 19 4.44772 19 5V5C19 5.55228 18.5523 6 18 6H6C5.44772 6 5 5.55228 5 5V5Z" fill="black"></path>
                <path opacity="0.5" d="M9 4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V4H9V4Z" fill="black"></path>
              </svg>
            </span>
            <!--end::Svg Icon-->
          </a>
        </td>
      </tr>`);
      i++;
      });
    }
  });  
}


$( "#AddNewUsertBtn" ).click(function(){
  $( "#UserAddHead" ).text( "Add New User" );
  $("#useraction").val("insert");
  $("#usermsgerror").addClass("d-none");
  $("#usermsgerror").text("");
  $("#usrNname").val("");
  $("#usrmail").val("");
  $("#usrpass").val("");
  $("#usrconpass").val("");
  $("#camGateSlct2").val();

} );
  

$("#adduserFrm").on('submit', function(e){
  e.preventDefault();
  var usrDname =$("#usrNname").val();
  var usrmail =$("#usrmail").val();
  var usrpass =$("#usrpass").val();
  var usrconpass =$("#usrconpass").val();
  var gates =$("#camGateSlct2").val();
  var gatelist = [];
  var x=0;
  gates.forEach(gate => {
    gatelist[x]=(parseInt(gate));
    x++;
  });
  // gatelist =  gatelist.toString()
  // alert();
  var usrActive =false;
  var plan =$("input[name='userplan']:checked").val()
  var is_admin=false;
  var is_operation=false;
  var is_supervisor=false;
  var is_guard=false;

  if($("#usrActive").is(":checked")){
    usrActive =true;
  }

  if(plan=="admin"){
    is_admin = true;
  }
  if(plan=="operation"){
    is_operation = true;
  }
  if(plan=="supervisior"){
    is_supervisor = true;
  }
  
  var newusr={
    "username": usrDname,
    "password": usrpass,
    "gate_ids": [1,2],
    "email": usrmail,
    "is_active": usrActive,
    "is_admin": is_admin,
    "is_operation": is_operation,
    "is_supervisor": is_supervisor,
    "tabs": {}
};
  console.log(newusr);
  var action =$("#useraction").val();
  var userid =$("#userid").val();
  if(usrDname == "" || usrpass == "" || usrpass != usrconpass || usrmail ==""){
    $("#usermsgerror").removeClass("d-none");
    $("#usermsgerror").text("Please , Enter All Data In Form");
  }else{
    if(action == "insert"){
    
      CREATE_USER(newusr);
    }else if(action == "update"){
      UPDATE_USER(userid,usrDname,usrpass,gates,usrmail,is_admin,is_operation,is_supervisor)
    }
  }
})

// $("#usrpass")


function CREATE_USER(userObj){
 
  var settings = {
    "url":  Apphost+"staff",
    "method": "POST",
    "timeout": 0,
    "headers": {
      "Authorization": "Bearer "+localStorage.getItem("token"),
      "Content-Type": "application/json"
    },
    "data": JSON.stringify({
      "username": userObj.username,
      "password": userObj.password,
      "gate_ids": userObj.gate_ids,
      "email": userObj.email,
      "is_active": userObj.is_active,
      "is_admin": userObj.is_admin,
      "is_operation": userObj.is_operation,
      "is_supervisor": userObj.is_supervisor
    }),
  };
  
  $.ajax(settings).done(function (response) {
    // console.log(response);
    SuccessAlert(response.message);
    LIST_All_USER()
  }).fail(function (jqXHR, textStatus, ex) { 
        console.log(textStatus + "," + ex + "," + jqXHR.responseText);
        var resArr= JSON.parse(jqXHR.responseText);
        ErrorAlert(resArr.message);

   });;
  
  
  
}

function editStaff(staff){
  var jobtitle=".";
  if(staff.is_admin){
    jobtitle="admin";
  }else if(staff.is_operation){
    jobtitle="operation";
  }else if(staff.is_supervisor){
    jobtitle="supervisior";
  }else{
    jobtitle="guard";
  }

  $('input:radio[name="userplan"][value="' + jobtitle + '"]')
    .attr('checked', 'checked');

  $( "#AddNewUsertBtn" ).trigger( "click" );
  $("#userid").val(staff.id);
  $("#useraction").val("update");

  $("#usrNname").val(staff.user.username);
  $("#usrmail").val(staff.email);
  $("#usrpass").val("");
  $("#usrconpass").val("");

  $("#camGateSlct2").val(staff.gate).trigger('change');
  
  $( "#UserAddHead" ).text( "Update User Data" );


}


function UPDATE_USER(userid,usrDname,usrpass,gates,usrmail,is_admin,is_operation,is_supervisor){
  var settings = {
    "url":  Apphost+"staff/"+userid,
    "method": "PUT",
    "timeout": 0,
    "headers": {
      "Authorization": "Bearer "+localStorage.getItem("token"),
      "Content-Type": "application/json"
    },
    "data": JSON.stringify({
      "username": usrDname,
      "password": usrpass,
      "gate_ids": gates,
      "email": usrmail,
      "is_admin": is_admin,
      "is_operation": is_operation,
      "is_supervisor": is_supervisor
    }),
  };
  
  $.ajax(settings).done(function (response) {
    // console.log(response);
    SuccessAlert(response.message);
    LIST_All_USER()
  });
  
}

function deleteStaff(userid,name){
  if(confirm("Are you sure , Delete - Deactive User /  "+name + "?")){
    $.ajax({
      type: "DELETE",
      caches : false,
      url: Apphost+"staff/"+userid,
      headers: {Authorization: 'Bearer '+localStorage.getItem('token')},
      statusCode: {
        404: function() {
          ErrorAlert("page not found");
        }
      },
      error: function(jqXHR, textStatus, ex) {
          console.log(textStatus + "," + ex + "," + jqXHR.responseText);
          ErrorAlert(jqXHR.responseText);
          var resArr= JSON.parse(jqXHR.responseText);
          if(resArr.message ==" This Staff is not exsits" || resArr.detail == 'Invalid Token'){
            localStorage.clear();
            window.location.href = 'sign-in.html';
          }
  
      },
      success: function(data) {
        SuccessAlert(data.message);
        
        LIST_All_USER();
        
      }
    });
  }
  }
  

/******************** Camera *-**************************** */

function LIST_All_CAMERA(){
  $.ajax({
    type: "GET",
    caches : false,
    url: Apphost+"camera",
    headers: {Authorization: 'Bearer '+localStorage.getItem('token')},
    statusCode: {
      404: function() {
        ErrorAlert("page not found");
      }
    },
    error: function(jqXHR, textStatus, ex) {
        console.log(textStatus + "," + ex + "," + jqXHR.responseText);
        ErrorAlert(jqXHR.responseText);
        var resArr= JSON.parse(jqXHR.responseText);
        if(resArr.message ==" This Staff is not exsits" || resArr.detail == 'Invalid Token'){
          localStorage.clear();
          window.location.href = 'sign-in.html';
        }

    },
    success: function(data) {
      // console.log(data);
      $("#CamTbl").empty();
      $("#CamC").text(data.count);
      
      var i=1;
      if(data.results.length > 0){
        data.results.forEach(cam => {
        
          $("#CamTbl").append(`
                        <tr>
                          <td>${i}</td>
                          <td>
                          ${cam.gate_name}
                          </td>
                          
                          <td>${cam.name}</td>
                          <td>${cam.description}</td>
                          <td>${cam.url}</td>
                          
                          <td>
                            
                            <a href="#" onclick='editCam(${JSON.stringify(cam)})' class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1">
                              <!--begin::Svg Icon | path: icons/duotune/art/art005.svg-->
                              <span class="svg-icon svg-icon-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                  <path opacity="0.3" d="M21.4 8.35303L19.241 10.511L13.485 4.755L15.643 2.59595C16.0248 2.21423 16.5426 1.99988 17.0825 1.99988C17.6224 1.99988 18.1402 2.21423 18.522 2.59595L21.4 5.474C21.7817 5.85581 21.9962 6.37355 21.9962 6.91345C21.9962 7.45335 21.7817 7.97122 21.4 8.35303ZM3.68699 21.932L9.88699 19.865L4.13099 14.109L2.06399 20.309C1.98815 20.5354 1.97703 20.7787 2.03189 21.0111C2.08674 21.2436 2.2054 21.4561 2.37449 21.6248C2.54359 21.7934 2.75641 21.9115 2.989 21.9658C3.22158 22.0201 3.4647 22.0084 3.69099 21.932H3.68699Z" fill="black"></path>
                                  <path d="M5.574 21.3L3.692 21.928C3.46591 22.0032 3.22334 22.0141 2.99144 21.9594C2.75954 21.9046 2.54744 21.7864 2.3789 21.6179C2.21036 21.4495 2.09202 21.2375 2.03711 21.0056C1.9822 20.7737 1.99289 20.5312 2.06799 20.3051L2.696 18.422L5.574 21.3ZM4.13499 14.105L9.891 19.861L19.245 10.507L13.489 4.75098L4.13499 14.105Z" fill="black"></path>
                                </svg>
                              </span>
                              <!--end::Svg Icon-->
                            </a>
                          </td>
                          <td>
                            <!-- <i class="fa fa-trash-alt text-danger"></i> -->
                            <a href="#" onclick="deleteCam(${cam.id},'${cam.name}')"  class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm">
                              <!--begin::Svg Icon | path: icons/duotune/general/gen027.svg-->
                              <span class="svg-icon svg-icon-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                  <path d="M5 9C5 8.44772 5.44772 8 6 8H18C18.5523 8 19 8.44772 19 9V18C19 19.6569 17.6569 21 16 21H8C6.34315 21 5 19.6569 5 18V9Z" fill="black"></path>
                                  <path opacity="0.5" d="M5 5C5 4.44772 5.44772 4 6 4H18C18.5523 4 19 4.44772 19 5V5C19 5.55228 18.5523 6 18 6H6C5.44772 6 5 5.55228 5 5V5Z" fill="black"></path>
                                  <path opacity="0.5" d="M9 4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V4H9V4Z" fill="black"></path>
                                </svg>
                              </span>
                              <!--end::Svg Icon-->
                            </a>
                          </td>
                        </tr>`);
        i++;
        });
      }
    }
  });  
}

$( "#AddNewCamtBtn" ).click(function(){
  $( "#CameraAddHead" ).text( "Add New Camera" );
  $("#Cameraction").val("insert");
  $("#cammsgerror").addClass("d-none");
  $("#camname").val("");
  $("#camdesc").val("");
  $("#camurl").val("");
  $("#camGateSlct1").val()
} );

$("#addcameraFrm").on('submit', function(e){
  e.preventDefault();
  var camname =$("#camname").val();
  var camdesc =$("#camdesc").val();
  var camurl =$("#camurl").val();
  var gates =$("#camGateSlct1").val();
  
  
  var newcam={
    "name": camname,
    "url": camurl,
    "gate": gates
};
  
  var action =$("#Cameraction").val();
  var cameraid =$("#cameraid").val();

  if(camname =="" || camdesc =="" || camurl =="" || gates ==""){
    $("#cammsgerror").removeClass("d-none");
    $("#cammsgerror").text("Please Enter All Data");
  }else if (!isUrlValid(camurl)){
    $("#cammsgerror").removeClass("d-none");
    $("#cammsgerror").text("Please Enter A valid URL as http://15.1.1.1");
  }else{
    if(action == "insert"){
    
      CREATE_CAMERA(newcam);
    }else if(action == "update"){
      UPDATE_CAMERA(cameraid,camname,camurl,gates,camdesc)
    }
  }


  
  
})

function isUrlValid(url) {
  return /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url);
}

function CREATE_CAMERA(camObj){
  
  $.ajax({
    type: "POST",
    caches : false,
    url: Apphost+"camera",
    headers: {Authorization: 'Bearer '+localStorage.getItem('token')},
    data:camObj,
    statusCode: {
      404: function() {
        ErrorAlert("page not found");
      }
    },
    error: function(jqXHR, textStatus, ex) {
        console.log(textStatus + "," + ex + "," + jqXHR.responseText);
        
        var resArr= JSON.parse(jqXHR.responseText);
        ErrorAlert(JSON.stringify(resArr.message));
        
        if(resArr.message ==" This Staff is not exsits" || resArr.detail == 'Invalid Token'){
          localStorage.clear();
          window.location.href = 'sign-in.html';
        }
        $("#cammsgerror").text("");
        $("#cammsgerror").addClass("d-none");

    },
    success: function(data) {
      SuccessAlert(data.message);
      LIST_All_CAMERA();
      LIST_All_GATE();
      LIST_GATE();
      LIST_CAMERA();
    }
  });
  
}

function editCam(cam){
  $( "#AddNewCamtBtn" ).trigger( "click" );
  $("#cameraid").val(cam.id);
  $("#Cameraction").val("update");

  $("#camname").val(cam.name);
  $("#camdesc").val(cam.description);
  $("#camurl").val(cam.url);
  $("#camGateSlct1").val(cam.gate).trigger('change');
  
  $( "#CameraAddHead" ).text( "Update Camera Data" );


}

function UPDATE_CAMERA(cameraid,camname,camurl,gates,camdesc){
  var newcam={
    "name": camname,
    "url": camurl,
    "gate": gates ,
    "description" : camdesc
};
$.ajax({
  type: "PUT",
  caches : false,
  url: Apphost+"camera/"+cameraid,
  headers: {Authorization: 'Bearer '+localStorage.getItem('token')},
  data: newcam,
  statusCode: {
    404: function() {
      ErrorAlert("page not found");
    }
  },
  error: function(jqXHR, textStatus, ex) {
      console.log(textStatus + "," + ex + "," + jqXHR.responseText);
      ErrorAlert(jqXHR.responseText);
      var resArr= JSON.parse(jqXHR.responseText);
      if(resArr.message ==" This Staff is not exsits" || resArr.detail == 'Invalid Token'){
        localStorage.clear();
        window.location.href = 'sign-in.html';
      }

  },
  success: function(data) {
    SuccessAlert(data.message);
    
    LIST_All_CAMERA();
    LIST_All_GATE();
  }
});
 
}
function deleteCam(cameraid,name){
if(confirm("Are you sure , Delete Camera "+name + "?")){
  $.ajax({
    type: "DELETE",
    caches : false,
    url: Apphost+"camera/"+cameraid,
    headers: {Authorization: 'Bearer '+localStorage.getItem('token')},
    statusCode: {
      404: function() {
        ErrorAlert("page not found");
      }
    },
    error: function(jqXHR, textStatus, ex) {
        console.log(textStatus + "," + ex + "," + jqXHR.responseText);
        ErrorAlert(jqXHR.responseText);
        var resArr= JSON.parse(jqXHR.responseText);
        if(resArr.message ==" This Staff is not exsits" || resArr.detail == 'Invalid Token'){
          localStorage.clear();
          window.location.href = 'sign-in.html';
        }

    },
    success: function(data) {
      SuccessAlert(data.message);
      
      LIST_All_CAMERA();
      LIST_All_GATE();
    }
  });
}
}

/************************ REPORTS *********************** */

function LIST_All_REPORTS(){
  
  $.ajax({
    type: "GET",
    caches : false,
    url: Apphost+"report",
    headers: {Authorization: 'Bearer '+localStorage.getItem('token')},
    statusCode: {
      404: function() {
        ErrorAlert("page not found");
      }
    },
    error: function(jqXHR, textStatus, ex) {
        console.log(textStatus + "," + ex + "," + jqXHR.responseText);
        ErrorAlert(jqXHR.responseText);
        var resArr= JSON.parse(jqXHR.responseText);
        if(resArr.message ==" This Staff is not exsits" || resArr.detail == 'Invalid Token'){
          localStorage.clear();
          window.location.href = 'sign-in.html';
        }

    },
    success: function(data) {
      // console.log(data);00000000000000000000000000000
      $("#ReportTbl").empty();
      data.forEach(report => {
        $("#ReportTbl").append(`<tr>
          
          <td>${report.start_at}</td>
          <td>${report.end_at}</td>
          <td>${report.report_type}</td>
          <td><a href="${report.download_link}" download="file" class="btn btn-info">Download</a></td>
        </tr>`);
      });
      
    }
  });  
}
$("#generateBtn").click(function(e){
  e.preventDefault();
  console.log($("#reportSlct").val() +"---"+ $("#kt_daterangepicker_1").val())
  var Rtyp = $("#reportSlct").val();
  var StartD = $("#kt_daterangepicker_1").val().slice(0,10);
  var endD = $("#kt_daterangepicker_1").val().slice(12);
  Generate_REPORT(Rtyp , StartD , endD);

})

function Generate_REPORT(type_id,start,end){
  var start = new Date(start);
  start = start.toISOString();
  var end = new Date(end);
  end = end.toISOString();


  $.ajax({
    type: "POST",
    caches : false,
    url: Apphost+"report",
    headers: {Authorization: 'Bearer '+localStorage.getItem('token')},
    data:{
      "report_type": type_id,
      "start_at": start,
      "end_at": end
  },
    statusCode: {
      404: function() {
        ErrorAlert("page not found");
      }
    },
    error: function(jqXHR, textStatus, ex) {
        console.log(textStatus + "," + ex + "," + jqXHR.responseText);
        ErrorAlert(jqXHR.responseText);
        var resArr= JSON.parse(jqXHR.responseText);
        if(resArr.message ==" This Staff is not exsits" || resArr.detail == 'Invalid Token'){
          localStorage.clear();
          window.location.href = 'sign-in.html';
        }

    },
    success: function(data) {
      // console.log(data);
      SuccessAlert("New Report Created successfuly")
      LIST_All_REPORTS();
    }
  });  
}

$("#clearrepeBtn").click(function(){
  // $("#kt_daterangepicker_1").val();
  $("#reportSlct").val("GATE");;
  
})
/******************************* profile***************** */

function GET_USER_PROFILE(userid){
 
$.ajax({
  type: "GET",
  caches : false,
  url: Apphost+"staff/"+userid,
  headers: {Authorization: 'Bearer '+localStorage.getItem('token')},
  statusCode: {
    404: function() {
      ErrorAlert("page not found");
    }
  },
  error: function(jqXHR, textStatus, ex) {
      console.log(textStatus + "," + ex + "," + jqXHR.responseText);
      ErrorAlert(jqXHR.responseText);
      var resArr= JSON.parse(jqXHR.responseText);
      if(resArr.message ==" This Staff is not exsits" || resArr.detail == 'Invalid Token'){
        localStorage.clear();
        window.location.href = 'sign-in.html';
      }

  },
  success: function(data) {
    // console.log(data);
    var userRole="";
    if(data.is_admin){
      userRole="Admin";
    }else if(staff.is_operation){
      userRole="Operation";
    }else if(staff.is_supervisor){
      userRole="Supervisor";
    }else{
      userRole="Guard";
    }
    $("#userprofilename").text(data.user.username);
    $("#userprofileplan").text(userRole);
    $("#userprofilejob").text("");
    $("#userprofileaddress").text(data.created_at);
    $("#userprofilemail").text(data.email);
    $("#profileName").text(data.user.username);
    $("#profileMail").text(data.email);
    
    
  }
});


}

function openUserProf(){
  $("#tab-9").click();
}

$(".toggle-password").click(function() {

  $(this).toggleClass("fa-eye fa-eye-slash");
  var input = $($(this).attr("toggle"));
  var x = document.getElementById("usrpass");
  if (x.type === "password") {
    x.type = "text";
  } else {
    x.type = "password";
  }
});

$(".toggle-password1").click(function() {

  $(this).toggleClass("fa-eye fa-eye-slash");
  var input = $($(this).attr("toggle"));
  var x = document.getElementById("usrconpass");
  if (x.type === "password") {
    x.type = "text";
  } else {
    x.type = "password";
  }
});

// GAlert('Success',)
// GAlert('Error',)
// GAlert('Warning',)
// GAlert('Info',)
// GAlert('Question',)

$("#gatesearchtxt").keyup(function() {
  // searchGates()
  var query= $(this).val().toLowerCase();
  $('div#GateList #searchToken').each(function(){
    var $this = $(this);
    if($this.text().toLowerCase().indexOf(query) === -1){
      $this.closest('a.custom-list').addClass('d-none');
    }else{
      $this.closest('a.custom-list').removeClass('d-none');
    } 
 
  });
});


$("#camerasearchtxt").keyup(function() {
  // searchGates()
  var query= $(this).val().toLowerCase();
  $('div#CameraList #CamsearchToken').each(function(){
    var $this = $(this);
    if($this.text().toLowerCase().indexOf(query) === -1){
      $this.closest('a.custom-list').addClass('d-none');
    }else{
      $this.closest('a.custom-list').removeClass('d-none');
    } 
 
  });
});

function closeAside(){
  if($("#asside-btn").hasClass('active')){
    
  }
}