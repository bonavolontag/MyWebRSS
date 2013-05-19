// Filename: ArticleView.js

define([
	'backbone', 'text!templates/Article.html', 'models/Article'
], function(Backbone, ArticleTemplate, ArticleModel) {
	var ArticleView = Backbone.View.extend({
		el: $("#page"),
		
		initialize: function() {
			this.template = ArticleTemplate;
			
			// Redirect to the login page if necessary
			if(!$.localStorage("token"))
				window.location = "#login";
			
			// Show the buttons
			$("#button-back").show();
			$("#button-refresh").show();
			$("#button-previous").show();
			$("#button-next").show();
			
			// Refresh the article
			var view = this;
			$("#button-refresh").click(function() {
				view.refresh_article();
			});
			
			// Back to the feed
			$("#button-back").click(function() {
				if($.localStorage("feed"))
					window.location = "#feed/" + $.localStorage("feed");
				else
					window.location = "#";
			});
		},
		
		setModel: function(article) {
			if(typeof(article) != "object")
				return;
			
			delete this.model;
			this.model = article;
			this.render();
		},
		
		render: function(){
			$("#button-previous").attr("disabled", "disabled");
			$("#button-next").attr("disabled", "disabled");
			
			// Change the content
			if($.localStorage("feed"))
				$("#page-title").html($("a[href='#feed/" + $.localStorage("feed") + "']").html());
			else
				$("#page-title").html($("a[href='#']").html());
			
			var content = "<h1>Loading</h1>";
			if(this.model)
				content = _.template(this.template, this.model.toJSON());
			
			this.$el.html(content);
			
			// Handle the previous and next buttons
			if($.localStorage("collection") && this.article) {
				var collection = _.toArray($.localStorage("collection"));
				
				// Get the current ID in the array
				for(var i = 0; i < collection.length; i++) {
					if(collection[i].id == this.article)
						break;
				}
				
				// Previous button
				if(i > 0) {
					$("#button-previous").click(function() {
						window.location = "#article/" + collection[i-1].id;
					});
					$("#button-previous").removeAttr("disabled", "");
				}
				if(i < collection.length-1) {
					$("#button-next").click(function() {
						window.location = "#article/" + collection[i+1].id;
					});
					$("#button-next").removeAttr("disabled", "");
				}
			}
		},
		
		loadArticle: function(id) {
			this.article = id;
			this.refresh_article();
		},
		
		refresh_article: function() {
			if(!$.localStorage("token"))
				return;
			
			// Get the article
			var view = this;
			$.getJSON(window.mywebrss + "/article/show", {token: $.localStorage("token"), article: view.article}, function(data) {
				// Check error
				if(!data.success) {
					// Wrong token
					if(data.error == "token") {
						$.localStorage("token", null);
						window.location = "#login";
					}
					// Unknown error
					else
						alert(data.error);
					
					return;
				}
				
				// Delete datas we don't need
				delete data.success, delete data.error;
				
				// Create a new ArticleModel
				if(data.result)
					view.setModel(new ArticleModel(data.result));
				else
					alert("Can't get the article content. Try again later");
			});
		}
	});
	
	return ArticleView;
});
