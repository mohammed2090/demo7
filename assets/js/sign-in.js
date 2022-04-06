var Apphost = "http://147.182.164.139:8000/login/";
$(document).ready(function(){
    localStorage.clear();
    $("#signerror").text("");
});
function Login(uname,pass){
    var logindata = 
    {
        'username': uname,
        'password': pass
    }

    // alert(logindata)
   
    $.ajax({
        type: "POST",
        url: Apphost,
        data: logindata,
        statusCode: {
          404: function() {
            alert("page not found");
            // $("#logmessage").text("page not found");
          }
        },
        error: function(jqXHR, textStatus, ex) {
            console.log(textStatus + "," + ex + "," + jqXHR.responseText);
            if(jqXHR.responseText == 'undefined'){
              $("#signerror").removeClass('d-none');
              $("#signerror").text("Check your Connection , try Again!! ")
              // $("#logmessage").text("Check your Connection , try Again!! ");
            }else{
              $("#signerror").removeClass('d-none');
              $("#signerror").text(JSON.parse(jqXHR.responseText).message);
              // $("#logmessage").text(jqXHR.responseText);
            }
            
        },
        success: function(data) {
            
            // console.log(data);
            localStorage.setItem('token',data.token);
            localStorage.setItem('userMail',data.staff_details.email);
            localStorage.setItem('Gates',JSON.stringify(data.gates[0]));
            localStorage.setItem("userName",data.staff_details.user.username)
            localStorage.setItem('User',data.staff_details.id);
            
            if (data.staff_details.is_active){
              window.location.href = 'dashboard.html';
            }else{
              alert("Inactive User , contact Admin To Active");
              $("#signerror").removeClass('d-none');
              $("#signerror").text("Inactive User , contact Admin To Active");
            }
            
        }
      });
}
$("#kt_sign_in_submit").click(function(e){
    e.preventDefault();
    var uname = $("#usernametxt").val();
    var pass = $("#passwordtxt").val();

    if(uname=="" || pass ==""){
      $("#signerror").removeClass('d-none');
      $("#signerror").text("You Must Enter Username and Password")
    }else{
      Login(uname,pass);
    }
    
})


// $('.input').keypress(function (e) {
//   if (e.which == 13) {
//     $('form#kt_sign_in_form').submit();
//     return false;    //<---- Add this line
//   }
// });

$('#usernametxt').keypress(function(e) {
  if(e.which == 13) {
      jQuery(this).blur();
      jQuery('#kt_sign_in_submit').focus().click();
  }
});

$('#passwordtxt').keypress(function(e) {
  if(e.which == 13) {
      jQuery(this).blur();
      jQuery('#kt_sign_in_submit').focus().click();
  }
});

function myFunction() {
  var x = document.getElementById("passwordtxt");
  if (x.type === "password") {
    x.type = "text";
  } else {
    x.type = "password";
  }
}