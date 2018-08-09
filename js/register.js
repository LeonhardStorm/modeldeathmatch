function main(){
	$('.login-button').on('click',function(){
		$.post("/register-post",{user:$('.user-name').val(),pass:$('.password').val()},function(success){
			if (success==="success"){
                $('.success-text').removeClass("fail-text")
                $('.success-text').html("Succesfully registered!")
				window.location.href = "/"
			}else{
                $('.success-text').addClass("fail-text")

                $('.success-text').html("Username taken!")

			}
		})
	})
}
particlesJS.load('particles-js', '/js/particles.json', function() {
    console.log('callback - particles.js config loaded');
});

$(document).ready(main)