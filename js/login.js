function main(){
	$('.login-button').on('click',function(){
		$.post("/login-post",{user:$('.user-name').val(),pass:$('.password').val()},function(success){
			if (success==="success"){
                $('.success-text').removeClass("fail-text")

                $('.success-text').html("Succesfully logged in!")
				window.location.href = "/"
			}else{
				$('.success-text').addClass("fail-text")
				$('.success-text').html("Login failed!")

			}
		})
	})
}
particlesJS.load('particles-js', '/js/particles.json', function() {
    console.log('callback - particles.js config loaded');
});

$(document).ready(main)