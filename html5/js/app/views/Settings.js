// Filename: SettingsView.js

define([
	'backbone', 'views/Status', 'text!templates/Settings.html'
], function(Backbone, StatusView, SettingsTemplate) {
	var SettingsView = Backbone.View.extend({
		el: $("#page"),
		
		initialize: function() {
			this.template = SettingsTemplate;
			
			// Redirect to the login page if necessary
			if(!$.localStorage("token"))
				window.location = "#login";
			
			// Show the buttons
			$("#button-menu").show();
		},
		
		render: function(){
			$("#page-title").html("Settings");
			$("#page").html(_.template(this.template));
			
			// Auto-refresh
			$("#check-autorefresh").prop("checked", $.localStorage("autorefresh"));
			
			$("#check-autorefresh").click(function() {
				$.localStorage("autorefresh", $("#check-autorefresh").is(":checked"));
				
				// Disable auto-refresh
				if(!$.localStorage("autorefresh")) {
					if($.localStorage("autorefresh_cnt"))
						clearTimeout($.localStorage("autorefresh_cnt")), $.localStorage("autorefresh_cnt", 0);
				}
			});
			
			// Change password
			$("#settings-password").click(function() {
				$("#settings-password").attr("disabled", "disabled");
				
				$.ajax({
					dataType: "json",
					url: window.mywebrss + "/user/password",
					data: {token: $.localStorage("token"), old_password: $("#settings-password-old").val(), password: $("#settings-password-new").val(), confirm_password: $("#settings-password-confirm").val()},
					success: function(data) {
						// Check error
						if(!data.success) {
							var status = new StatusView();
							
							// Wrong token
							if(data.error == "token") {
								$.localStorage("token", null);
								window.location = "#login";
							}
							else if(data.error == "old_password") {
								status.setMessage("Bad password");
								$("#settings-password-old").focus();
							}
							else if(data.error == "password") {
								status.setMessage("Bad new password");
								$("#settings-password-new").focus();
							}
							else if(data.error == "confirm_password") {
								status.setMessage("New passwords are different");
								$("#settings-password-confirm").focus();
							}
							// Unknown error
							else
								status.setMessage(data.error);
							
							$("#settings-password").removeAttr("disabled");
							return;
						}
						
						alert("Password changed with success");
						window.location = "#settings";
					},
					error: function() {
						var status = new StatusView();
						status.setMessage("Can't contact the server");
						
						$("#settings-password").removeAttr("disabled");
					}
				});
			});
		}
	});
	
	return SettingsView;
});
