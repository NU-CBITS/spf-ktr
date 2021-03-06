var app = {};
app.config = {};
app.config.mode = "demo"; //demo or normal or assessment
app.inverventionId = "SPF-KTR";

app.text = {};
app.style = {};

app.config.mainContent = {};
app.config.mainContent.showTitle = false;

app.config.assessments = {};
app.config.assessments.exist = false;

app.status = {};
app.status.currentState = null; //lesson, post_lesson, assessment1, assessment2, summary1, summary2 
app.status.currentPageIndex = null;
app.status.currentChapterId = null;
app.status.currentChapterElement = null;
app.status.currentChapterContents = null;
app.status.numPagesInCurrentChapter = null;
app.status.currentChapter = function () {
	if (app.status.currentChapterId != null) {
		var chapter;

		chapter = _.where(app.content, {
			id: parseInt(app.status.currentChapterId)
		})[0].pretty_name;
		console.log(chapter);
		return chapter;
	}
};
app.start = function (appContents) {
	var moduleName = "baseline", progressBarOptions = {
		hideBackButton: true,
		hideNextButton: true,
		hidePagination: true
	};

	app.status.currentChapterId = 0;
	app.content = appContents.nav_elements;
	// app.questions = appContents.questions; // This is commented out so we skip the baseline/diagnostic
	app.actions.loadPage(0, moduleName, _.where(app.questions, { use: moduleName }), progressBarOptions);
	app.build.navChapterBar(app.arrayOfChapterIds(app.content));
};

app.arrayOfChapterIds = function (appContents) {

	var search_criteria = {
		element_type: "lesson"
	};
	return _.where(appContents, search_criteria);
};

app.getChapterContents = function (chapter_id, appContents) {
	var search_criteria = {
		id: chapter_id
	};
	chapter_contents_list = _.where(appContents, search_criteria)[0].element_list.toString().split(",");
	chapter_contents = [];

	// console.log("Chapter selected:",_.where(appContents, search_criteria)[0]);
	// console.log("Chapter contents list:",chapter_contents_list);

	_.each(chapter_contents_list, function (element) {
		// console.log(parseInt(element));
		chapter_contents.push(_.where(appContents, {
			id: parseInt(element)
		})[0]);
	});
	return chapter_contents;
};

app.build = {}
app.build.stringOfClicks = "a, a.animation, a.audio, a.audioImage, a.definition, a.graph, a.image, a.slide-show, a.table, a.table-modal, a.video, label.radio input, .mainContainer a, .mainContainer .btn, .bottom a, .bottom .btn";
app.build.form = {};
app.build.modal = ''+
	'<div id="confirmSkipping" class="modal">'+
		'<div class="modal-header">'+
			'<h1>'+
				function(){
					if (app.config.language == "spanish") {
						return 'Antes de continuar...'
					} else {
						return 'Before continuing...'
					};
				}()+
			'</h1>'+
		'</div>'+
		'<div class="modal-body">'+
			'<p style="margin-top: 20px;" class="lead text-center">'+
				'Do you want to skip this question without answering it?'+
			'</p>'+
		'</div>'+
		'<div class="modal-footer">'+
			'<button id="cancel" class="btn btn-large">Nope</button>'+
			'<button id="continue" autofocus class="btn btn-large btn-info">Yes <i class="icon-play icon-white"></i></button>'+
		'</div>'+
	'</div>'
 
app.build.alertMessage = function (index, moduleName, currentQuestion, questionsArray, options) {
	$('body').append(app.build.modal);
	var modal = $('#confirmSkipping');
	modal.modal('show');
	modal.find("#cancel").on('click', function(event) {
		modal.modal('hide');
		modal.remove();
	});
	modal.find("#continue").on('click', function(event) {
		modal.modal('hide');
		modal.remove();
		app.actions.loadPage(index, moduleName, questionsArray, options);
	});
};
app.build.questionForm = function(question) {
	var continueButton, form, saveButton;
	saveButton = "<div class='clearfix'></div><input autofocus type='submit' name='submit' value='Submit' class='btn btn-large' id='save-button'/>";
	continueButton = "<div class='clearfix'></div><button class='btn btn-large' id='continue-button' autofocus>Continue</button>";
	switch (question.type) {
	case "radio":
		form = app.build.form.radio(question);
		form += saveButton
		break;
	case "checkbox":
		form = app.build.form.checkbox(question);
		form += saveButton
		break;  
	case "text":
		form = app.build.form.textarea(question);
		form += saveButton
		break;
	default:
		form = app.build.form.defaultForm(question);
		form += continueButton;
	};
	return form;
};

app.build.form.radio = function (question) {
	form = "<form><fieldset><p class='lead'>" + question.content + "</p>";
	for (var i = 0; i < 5; i++) {
		if (eval("question.response" + i) != "") {
			var answer = "<label class='radio' for='response" + i + "'>" +
				"<input type='radio' name='" + question.data_label + "' id=response" + i + " value='" + eval("question.response" + i) + "'>" +
				eval("question.response" + i) +
				"</label>";
			form += answer;
		};
	};
	form += "</fieldset></form>"
	return form;
};

app.build.form.checkbox = function (question) {
	form = "<form><fieldset><legend>" + question.content + "</legend>";
	for (var i = 0; i < 5; i++) {
		if (eval("question.response" + i) != "") {
			var answer = "<label class='checkbox' for='response" + i + "'>" +
				"<input type='checkbox' name='" + question.data_label + "' id=response" + i + " value='" + eval("question.response" + i) + "'>" +
				eval("question.response" + i) +
				"</label>";
			form += answer;
		};
	};
	form += "</fieldset></form>"
	return form;
};

app.build.form.textarea = function (question) {
	form = "<form><fieldset><legend>" + question.content + "</legend><textarea rows='3' style='width:99%;'></textarea>";
	form += "</fieldset></form>"
	return form;
};

app.build.form.defaultForm = function (question) {
	return "<" + question.type + ">" + question.content + "</" + question.type + ">";
};

app.build.navChapterBar = function (arrayOfChapters) {
	var coverPage = _.where(arrayOfChapters, { id: 977 })[0];
	var trainingPage = _.where(arrayOfChapters, { id: 978 })[0];
	// var coverPageSpanish = _.where(arrayOfChapters, { id: 980 })[0];

	arrayOfChapters = _.without(arrayOfChapters, coverPage, trainingPage);

	_.each(arrayOfChapters, function (i) {
		$("#main_nav").append('<li class="load-chapter" data-id="' + i.id + '"><a href="#' + i.pretty_name + '" style="'+app.style.loadChapterStyle+'">' + i.pretty_name + '</a></li>');
	});

	$(".load-chapter").on("click", function (ev) {
		app.actions.goToChapter(ev.currentTarget.dataset.id, app.contents)
	})
	app.actions.recordUserActions(".load-chapter a");
};

app.build.chapter = function (currentChapterId, appContents) {
	$("li.load-chapter").removeClass("active");
	console.log("Building Chapter", currentChapterId);

	if (currentChapterId == 0) {
		currentChapterId = 977; // loads the first desired page...i.e., table of contents
		$("li.load-chapter[data-id=\"" + currentChapterId + "\"]").addClass("active");
	} else {
		$("li.load-chapter[data-id=\"" + currentChapterId + "\"]").addClass("active");
	};
	app.status.currentChapterId = currentChapterId;
	console.log("Building Chapter", currentChapterId);
	app.status.currentChapterElement = _.where(appContents, { id: currentChapterId })[0];
	app.status.currentChapterContents = app.getChapterContents(currentChapterId, appContents);
	app.status.numPagesInCurrentChapter = app.status.currentChapterContents.length;
	app.status.currentPageIndex = 0;
	app.build.chapterProgressBar(app.status.currentPageIndex + 1, app.status.numPagesInCurrentChapter);
	app.actions.setPage(app.status.currentChapterContents[app.status.currentPageIndex]);

	$(".mainContainer").show();
};

app.build.chapterProgressBar = function (position, total, options) {
	options = options || {};
	if (!options.hidePagination) { $(".currentSlideCount").html(position + " of " + total); }
	$(".chapterProgressBar").width((position / total) * 100 + "%");
	app.build.progressBarButtons(position, total, options);
	$(".chapterProgress, .currentSlideCount").show();
	app.actions.recordUserSubmission('form#sun-exposure-checklist-form-1, form#sun-exposure-checklist-form-2');
	app.actions.recordUserSubmission('form#remember-checklist');
};

app.templates = {};
app.templates.fullPage = '<div class="span12 mainContent"></div>';
app.templates.threePanel = '' +
	'<div class="span7 mainContent"></div>' +
	'<div class="span5 mainRight">' +
	'<div class="row-fluid">' +
	'<div class="span12 topRight"></div>' +
	'<div class="row-fluid">' +
	'<div class="span12 bottomRight"></div>' +
	'</div>' +
	'</div>' +
	'</div>';

app.actions = {};

app.actions.setScript = function(app) {
	var script = document.createElement('script');
	script.type = 'text/javascript';

	if (app.config.language == "english") {
		script.src = 'http://mohrlab.northwestern.edu/spf-ktr/build/js/app/content.js';
	} else {
		script.src = 'http://mohrlab.northwestern.edu/spf-ktr-e/build/js/app/content.js';
	};

  var template = ''+
    '<div class="navbar navbar-static-top">'+
      '<div class="navbar-inner">'+
        '<div class="container-fluid">'+
          '<a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">'+
            '<span class="icon-bar"></span>'+
            '<span class="icon-bar"></span>'+
            '<span class="icon-bar"></span>'+
          '</a>'+
          '<div class="nav-collapse collapse">'+
            '<ul class="nav" id="main_nav"></ul>'+
          '</div>'+
        '</div>'+
      '</div>'+
    '</div>'+
    '<div id="main" class="container-fluid">'+
      '<div class="row-fluid mainContainer"></div>'+
      '<div class="row-fluid bottom">'+
        '<div class="span2">'+
          '<button class="pageBack btn btn-large"></button>'+
        '</div>'+
        '<div class="span8">'+
          '<div class="currentSlideCount text-center"></div>'+
          '<div class="progress progress-striped chapterProgress">'+
              '<div class="bar chapterProgressBar" style="width: 20%;"></div>'+
          '</div>'+
        '</div>'+
        '<div class="span2">'+
          '<button class="pageNext btn btn-large" autofocus></button>'+
        '</div>'+
      '</div>'+
    '</div>'
  $('body').css('background-color','transparent').html(template);

	$.getScript(script.src, function(){ app.start(appContent); });
}

app.actions.setLanguage = function(language) {
	if (language == "english") {
		app.text.goBack = "BACK"
		app.text.nextText = "NEXT";
		app.text.goOn = "Continue";
		app.style.loadChapterStyle = "font-size:1.2em;";
	} else {
		app.text.goBack = "Regresar"
		app.text.nextText = "Pr&oacute;ximo";
		app.text.goOn = "Continuar";
		app.style.loadChapterStyle = "font-size:1.2em;";
	};
};

app.actions.sendEmail = function(data){
	console.log('sending data', data);
	$.ajax({
	  type: "POST",
	  url: "http://mohrlab.northwestern.edu/utility/sendmail.cfm",
	  data: { mailJSON: JSON.stringify(data) },
	  success: function(data, textStatus, jqXHR) {
	  	console.log("success", data);
	  	alert("Email was sent!");
	  }
	});
};

app.actions.loadPage = function(index, moduleName, questionsArray, options) {
	var currentQuestion, progressBarOptions, questionForm;

	options = options || {};
	index = index || 0;
	app.current_question = currentQuestion = questionsArray[index];

	// if (questionsArray[index] == undefined) {
		app.build.chapter(app.status.currentChapterId, app.content);
	// } else {
	// 	$(".mainContainer").html(app.templates.fullPage);
	// 	questionForm = app.build.questionForm(questionsArray[index]);
	// 	$(".mainContent").html(questionForm);
	// 	$(".mainContainer").show();

	// 	app.build.chapterProgressBar(index + 1, questionsArray.length, options);
	// 	$("#save-button").on("click", function (ev) {
	// 		app.actions.submitAnswer(index, moduleName, currentQuestion, questionsArray, options);
	// 	});
	// 	$("#continue-button").on("click", function (ev) {
	// 		app.actions.loadPage(index + 1, moduleName, questionsArray, options);
	// 	});
	// };
};

app.actions.submitAnswer = function (index, moduleName, currentQuestion, questionsArray, options) {
	var selectedAnswerIds = [];

	_.each($(".mainContent input:checked"), function(element, index) {
		selectedAnswerIds.push($(element).attr("id"));
	});

	if (_.isEmpty(selectedAnswerIds)) {
		app.build.alertMessage(index + 1, moduleName, currentQuestion, questionsArray, options);
	} else {
		app.actions.loadPage(index + 1, moduleName, questionsArray, options);
	};
};

app.actions.setPage = function (pageContents) {
	mainContentsTemplate = function (headline, contents) {

		var main_contents = "";
		if (app.config.mainContent.showTitle == true) {
			main_contents = main_contents + "<h1>" + headline + "</h1>";
		}

		main_contents = main_contents + contents;
		return main_contents;

	};

	if (pageContents.template == "fullPage") {

		$(".mainContainer").html(app.templates.fullPage);
		$(".mainContent").html(mainContentsTemplate(pageContents.pretty_name, pageContents.main_content));

	} else {

		$(".mainContainer").html(app.templates.threePanel);
		$(".mainContent").html(mainContentsTemplate(pageContents.pretty_name, pageContents.main_content));
		$(".topRight").html(pageContents.side_panel_content2);
		$(".bottomRight").html(pageContents.side_panel_content);
	}

	$("a.image").on("click", function (ev) {
		ev.preventDefault();
		console.log(ev);
		app.actions.loadImage(ev.currentTarget.href, $(ev.currentTarget).data('styles'));
	});
	$("a.graph").on("click", function (ev) {
		ev.preventDefault();
		console.log(ev);
		app.actions.loadGraph(ev.currentTarget.href);
	});
	$("a.video").on("click", function (ev) {
		ev.preventDefault();
		console.log(ev);
		app.actions.loadVideo(ev.currentTarget.href);
	});
	$("a.audio").on("click", function (ev) {
		ev.preventDefault();
		console.log(ev);
		app.actions.loadAudio(ev.currentTarget.href);
	});
	$("a.audioImage").on("click", function (ev) {
		ev.preventDefault();
		console.log(ev);
		app.actions.loadAudioImage(ev.currentTarget.href);
	});
	$(".definition").tooltip();
	$(".definition").on("click", function (ev) {
		ev.preventDefault();
	});
	$(".skin-colors button").on("click", function (ev) {
		ev.preventDefault();
		app.actions.setSkinTone(ev.currentTarget.href);
	});
	$(".btn-group button#email-score").on("click", function(event) {
		var target = event.target,
			$btnGroup = $(target).parent('.btn-group'),
			$emailContainer = $("div#email-container");

		if ($emailContainer.length === 0) {
			var email = app.config.email || "";

			$btnGroup.after(''+
				'<div id="email-container">'+
					'<label for="email">Email</label>'+
					'<input name="email" type="email" value="'+email+'" class="span12 input-lg">'+
				'</div>');

			var $emailInput = $("div#email-container input");

			$emailInput.on('change', function(){
				var email = $emailInput.val();

				app.config.email = email;
				app.config.handout = false;
			});
			$(".btn-group button#email-handout").on("click", function(event) {
				var $emailContainer = $("div#email-container");

				if (!($emailContainer.length === 0)) { $emailContainer.remove(); };
				app.config.handout = true;
			});
		};
	});

	app.actions.recordUserActions(app.build.stringOfClicks);
};

app.actions.recordUserSubmission = function(forms) {

	_.each($(forms), function(value, key, list){
		var activeButtons = $(value).find('label .btn.btn-warning');
		
		arrayOfAcitivies = app[value.id] = [];
		_.each($(activeButtons), function(value, key, list){
			var activity = $(value).parent('label').text().replace(/\s+/g, ' ');

			arrayOfAcitivies.push(activity);
		});
	});
};

app.actions.recordUserActions = function(tagsList) {

	$(tagsList).on('click', function(event) {
		var userClick, supportingContent, $target;

		$target = $(event.currentTarget);
		supportingContent = $target.parent().text() || ""

		userClick = {
			"user_id": app.config.username,
			"invervention_id": JSON.stringify(app.inverventionId),
			"intervention_language": JSON.stringify(app.config.language),
			"intervention_voice_over": JSON.stringify(app.config.voice_over),
			"readable_click_datetime": JSON.stringify((""+new Date())),
			"click_datetime": JSON.stringify(new Date()),
			"chapter": JSON.stringify(app.status.currentChapter()),
			"section": JSON.stringify(app.status.currentState),
			"page": JSON.stringify(app.status.currentPageIndex + 1),
			"href": JSON.stringify($(this).attr("href")),
			"contents": JSON.stringify($(this).html()),
			"supportingContent": JSON.stringify($.trim(supportingContent)),
			"tagClass": JSON.stringify($(this).attr("class")),
			"tagId": JSON.stringify($(this).attr("id")),
			"tagName": JSON.stringify($(this).get(0).tagName)
		};

		console.log("userClick", userClick)
		//var postToPRImporter = function(protoHostAndPortUrlBase, userId, tableName, postData, cbFn, cbData) {
		postToPRImporter(prwAddrHostAndPortHttps, app.inverventionId, "userClicks", userClick);

	});
};

app.actions.changePage = function (index_of_page) {

	console.log("Page changed to ", index_of_page + 1, "of", app.status.numPagesInCurrentChapter);
	// $(".currentSlideCount").html(index_of_page + 1 + " of " + app.status.numPagesInCurrentChapter);
	app.status.currentPageIndex = index_of_page;

	if ((app.status.currentChapterId == 687) && (app.status.currentPageIndex == 4)) {
		var page = app.actions.completed();

		var modal = app.build.modal = ''+
			'<div class="modal summary-modal">'+
				'<div class="modal-header">'+
					'<h1>'+
						function(){
							if (app.config.language == "spanish") {
								return '¡Felicidades!'
							} else {
								return 'Congratulations!'
							};
						}()+
					'</h1>'+
				'</div>'+
				'<div class="modal-body">'+page+'</div>'+
				'<div class="modal-footer">'+
          '<button class="remove-congratulations-modal pageBack btn btn-large pull-left"></button>'+
          '<button class="remove-congratulations-modal pageNext btn btn-large pull-right" autofocus></button>'+
				'</div>'+
			'</div>'

		$(".summary-modal").modal('hide');
		$(".summary-modal").remove();
		$('body').append(modal).find('.summary-modal').modal('show');
		// send email
		app.actions.sendSummary();
	};

	app.build.chapterProgressBar(app.status.currentPageIndex + 1, app.status.numPagesInCurrentChapter);
	app.actions.setPage(app.status.currentChapterContents[app.status.currentPageIndex]);
	app.build.loadSkinColorHighChart();
	app.build.displayChoosenSkinType();

	if ((app.status.currentChapterId == 687) && (app.status.currentPageIndex == 4)) {
		$(".mainContent").empty();
	};

	$("button.remove-congratulations-modal").on('click', function(){
		$(".summary-modal").modal('hide');
		$(".summary-modal").remove();
	})

};

app.actions.goToChapter = function (chapterId, appContents) {

	// if (confirm('Are you sure you want to quit this chapter?')) {
	app.build.chapter(parseInt(chapterId), app.content);
	// } else {
	//     // Do nothing!
	// }

};

app.actions.loadImage = function (image, styles) {
	var imageWidth = imageWidth || '100%';
	var imageTemplate = function (image_location, imageWidth) {
		// return '<img src="'+app.images_url+image_location+'" style="'+styles+'"/>'
		return '<img src="' + app.images_url + image_location + '"/>'
	};
	$(".topRight").html(imageTemplate(image.replace("http://", "").replace("/", ""), imageWidth));
};

app.actions.loadVideo = function (video) {
	var source = "http://mohrlab.northwestern.edu/spf-ktr/build/"+app.videos_url;
	var videoTemplate = function (source, mp4_location) {
		return '<video style=\"width:100%;\" controls autoplay><source src="' + source + mp4_location + '" type="video/mp4">Your browser does not support the video tag.</video>'
	}
	$(".topRight").html(videoTemplate(source, video.replace("http://", "").replace("/", "")));
	$('.topRight audio')[0].play(); // bc in android html5 autoplay doesn't work
};



app.actions.loadAudio = function (audiofile) {

	var audioTemplate = function (mp4_location) {
		// return '<audio style=\"width:100%;\" controls autoplay><source src="' + app.audio_url + mp4_location + '" type="audio/mp3">Your browser does not support the video tag.</video>'
		// Add in narrarator
		return '<audio controls autoplay><source src="' + app.audio_url + "Final Audio/" + app.config.voice_over + '/' + mp4_location + '" type="audio/mp3">Your browser does not support the video tag.</video>'
	};
	if ($('.mainContent #audio-container').length == 0) {
		$('.mainContent a.audio').after('<div id="audio-container">'+audioTemplate(audiofile.replace("http://", "").replace("/", ""))+'</div>');
	};
	$('.mainContent #audio-container audio')[0].play(); // bc in android html5 autoplay doesn't work
	// $(".topRight").html(audioTemplate(audiofile.replace("http://", "").replace("/", "")));
};

app.actions.loadAudioImage = function (filename) {

	var audioImageTemplate = function (filename) {
		var src = '' + app.images_url + filename + '.jpg';
		return '<img src="' + app.images_url + filename + '.jpg" onload="app.actions.resizeIfNecessary(event);"/><br/><audio style=\"width:100%;\" controls autoplay><source src="' + app.audio_url + "Final Audio/" + app.config.voice_over + '/' + filename + '.mp3" type="audio/mp3">Your browser does not support the video tag.</audio>'
	};

	$(".topRight").html(audioImageTemplate(filename.replace("http://", "").replace("/", "")));
	$('.topRight audio')[0].play(); // bc in android html5 autoplay doesn't work
};

app.actions.resizeIfNecessary = function (event) {
	var target = event.target;
	if ((target.width < 460) && (target.height < 325)) {
		if ((460 - target.width) < (325 - target.height)) {
			$(target).width(460); // Not sure if used.
		} else {
			$(target).height(325)
		}
	}
};

//proxy until highcharts discussion
app.actions.loadGraph = function (image) {

	var imageTemplate = function (image_location) {
		return '<img src="' + app.images_url + image_location + '"/>'
	}

	$(".topRight").html(imageTemplate(image.replace("http://", "").replace("/", "")));

};

app.actions.loadId = function (id_to_load, appContents) {

	return _.where(appContents, {
		id: id_to_load
	}).main_content;

};

app.actions.createSentence = function(array) {
	var sentence = "";

	_.each(array, function(value, key, list) {
		value = value.trim().toLowerCase();
		value = "<span style='text-decoration: underline;'>"+value+"</span>";

		switch(key) {
		case 0:
			sentence = sentence + value;
			break;
		case (list.length - 1):
			if (app.config.language == "spanish") {
				sentence = sentence + ", y " + value;
			} else {
				sentence = sentence + ", and " + value;
			};
			break;
		default:
			sentence = sentence + ", " + value;
		};
	});

	return sentence;
};

if (String.prototype.capitalize === undefined) { 
	String.prototype.capitalize = function() { 
   		return (this.charAt(0).toUpperCase() + this.slice(1))
   	};
};

app.actions.completed = function() {
	var checklistArray, exposureChecklistArray, page, rememberCheckListArray, skinColor = app.skinColor || "not available";

	app["sun-exposure-checklist-form-1"] = app["sun-exposure-checklist-form-1"] || [];
	app["sun-exposure-checklist-form-2"] = app["sun-exposure-checklist-form-2"] || [];
	app["remember-checklist"] = app["remember-checklist"] || [];

	exposureChecklistArray = app["sun-exposure-checklist-form-1"].concat(app["sun-exposure-checklist-form-2"]);
	exposureChecklist = app.actions.createSentence(exposureChecklistArray) || "";

	rememberChecklist = app.actions.createSentence(app["remember-checklist"]) || "none";

	// on Congratuations page!
	$("span#skinColor").html(skinColor);
	$("span#exposureChecklist").html(exposureChecklist);
	$("span#rememberChecklist").html(rememberChecklist);


	// The FOLLOWING will be sent in an email!
	if (app.config.language == "spanish") {
		page = ''+
			'<p>Yo espero que usted haya aprendido que es importante usar protección solar y los diferentes maneras de como protegerse. Usted me pidió que le enviara este mensaje como un recordatorio de que  usted debe de usar protección solar. </p>'+
			'<p>El número de tono de su piel es '+skinColor+'.</p>'+
			'<p>Esto significa que cuando usted planea estar al aire libre '+exposureChecklist+', es importante que usted recuerde aplicar bloqueador solar con un factor de protección (SPF) de 50 o más 20 minutos antes de salir afuera. Algunos recordatorios que serán útiles para usted son: '+rememberChecklist+'.</p>'+
			'<p>El uso de bloqueador solar protege a usted de desarrollar cáncer de piel. Felicidades por su decisión de mantener su piel sana.</p>'+
			'<p><img src="./js/vendor/images/june_k_robinson_signature.png" alt="June K Robinson, MD" height="100" width="400"></p>'+
			'<p>June K. Robinson, MD</p>'+
			'<p>Northwestern University Feinberg School of Medicine</p>'+
			'<p>Departamento de Dermatología</p>';
	} else {
		page = ''+
			'<p>I hope that you have learned that it is important to use sun protection and ways to protect yourself. You asked me to send you this as a reminder to use sun protection.</p>'+
			'<p>Your skin tone number is '+skinColor+'.</p>'+
			'<p>This means that when you are planning on being outdoors '+exposureChecklist+', it is important for you to remember to apply a sunscreen with an SPF of 50 or more about 20 minutes before you go out. Some of the reminders that you thought would work for you are: '+rememberChecklist+'.</p>'+
			'<p>Using sunscreen will keep you from getting skin cancer. Congratulations on your decision to keeping your skin healthy.</p>'+
			'<p><img src="./js/vendor/images/june_k_robinson_signature.png" alt="June K Robinson, MD" height="100" width="400"></p>'+
			'<p>June K. Robinson, MD</p>'+
			'<p>Northwestern University Feinberg School of Medicine</p>'+
			'<p>Department of Dermatology</p>';
	};

	return page;
};

// THIS IS FOR YOU MARK! :-)
app.actions.loadSummary = function () {
	app.build.chapter(687, app.content);
	app.actions.setPage(app.status.currentChapterContents[4]);
};

app.actions.sendSummary = function() {
	var page = app.actions.completed(), bcc, results;

	if (app.config.language == "spanish") {
		results = "¡Felicidades!";
		bcc = "j-duffecy@northwestern.edu, protecionsolar@northwestern.edu";
	} else {
		results = "Congratulations!";
		bcc = "j-duffecy@northwestern.edu, sunprotection@northwestern.edu";
	};

	// send email
	data = {
		"from" : "informme@cbits.northwestern.edu",
		"to" : app.config.email,
		"bcc" : bcc,
		"subject" : app.inverventionId+" Summary of Results",
		"contents" : page,
		// "additional_contents": additional_contents,
		"mime" : "html",
		"saveAsPDFAndLink": true
	};

	if (app.config.email && !app.emailSent) {
		app.emailSent = true;
		app.actions.sendEmail(data);
	};
};

// Additional functions and overrides by wehrley

app.actions.setSkinTone = function (link) {
	var skinColor = $(event.target).data('skin-color');
	app.skinColor = skinColor;
	console.log('app.skinColor', app.skinColor);
};

app.build.displayChoosenSkinType = function () {
	$(function () {
		var skinColors = $('.skin-colors');

		if ((skinColors.length === 1) && (app.skinColor)) {
			$('button[data-skin-color="' + app.skinColor + '"]').addClass('active').addClass('btn-warning');
		};
	});
};

app.build.backNextButtons = function(options) {
	$("button.pageNext").off("click");
	$("button.pageBack").off("click");  

	$(".pageNext").html(app.text.nextText+' <i class= "icon-chevron-right"></i>');
	$(".pageBack").html('<i class="icon-chevron-left"></i> '+app.text.goBack);

	$("button.pageNext").on("click", function (ev) {
		app.actions.changePage(app.status.currentPageIndex + 1)
	});

	$("button.pageBack").on("click", function (ev) {
		app.actions.changePage(app.status.currentPageIndex - 1)
	});

	if (options.hideNextButton) {
		$("button.pageNext").hide();    
	} else {
		$("button.pageNext").show();
	};

	if (options.hideBackButton) {
		$("button.pageBack").hide();    
	} else {
		$("button.pageBack").show();
	};

}

app.build.goOnButton = function (options) {
	$("button.pageNext").off("click");
	$(".pageNext").html(app.text.goOn+' <i class= "icon-stop"></i>');

	$("button.pageNext").on("click", function (ev) {
		var currentChapterIndex, nextChapter;

		currentChapterIndex = _.indexOf(app.arrayOfChapterIds(appContent.nav_elements), app.status.currentChapterElement)
		nextChapter = app.arrayOfChapterIds(appContent.nav_elements)[currentChapterIndex + 1]

		if (nextChapter !== undefined) {
			app.build.chapter(nextChapter.id, app.content);
		} else {
			// app.actions.loadSummary();
		};

	});

	$("button.pageBack").on("click", function (ev) {
		app.actions.changePage(app.status.currentPageIndex)
	});

	if (options.hideNextButton) {
		$("button.pageNext").hide();    
	} else {
		$("button.pageNext").show();
	};

	if ((app.status.currentChapterId == 687) && (app.status.currentPageIndex == 5)) {
		$("button.pageNext").hide();    
	};

};
app.build.progressBarButtons = function (position, total, options) {
	options = options || {};
	var index_of_page = position - 1;
	var numPages = total;
	var lastPage = total - 1;

	// ONLY 'Go On' - on FIRST page of ONLY 1 page
	if (total == 1) {
		options.hideBackButton = options.hideBackButton || true;
		options.hideNextButton = options.hideNextButton || false;
		app.build.goOnButton(options);
	};

	// ONLY 'Next' - on FIRST page of many pages
	if ((index_of_page == 0) && (index_of_page != lastPage)) {
		options.hideBackButton = options.hideBackButton || true;
		options.hideNextButton = options.hideNextButton || false;
		app.build.backNextButtons(options);
	};

	// 'Back' & 'Next' - on a middle page of many pages
	if ((index_of_page != 0) && (index_of_page != lastPage)) {
		options.hideBackButton = options.hideBackButton || false;
		options.hideNextButton = options.hideNextButton || false;
		app.build.backNextButtons(options);
	};

	// 'Back' & 'Go On' - on the LAST page of many pages
	if ((total > 1) && (index_of_page == lastPage)) {
		options.hideBackButton = options.hideBackButton || false;
		options.hideNextButton = options.hideNextButton || false;
		app.build.goOnButton(options);
	};
};

app.build.loadSkinColorHighChart = function () {
	$(function () {

		var skinColorContainer = $('#skin-color-graph-container');
		if (skinColorContainer.length === 1) {

			var skinCategories = [
				'<p style="margin-top:10px;">1<p>',
				'<p style="margin-top:10px;">2<p>',
				'<p style="margin-top:10px;">3<p>',
				'<p style="margin-top:10px;">4<p>',
				'<p style="margin-top:10px;">5<p>',
				'<p style="margin-top:10px;">6<p>'
			]

			if (app.skinColor) {
				var text;
				if (app.config.language == "spanish") {
					text = "Su Probabilidad";
				} else {
					text = "Your Chance";
				};
				skinCategories[app.skinColor - 1] = "<p style=\"margin-top:5px;\"><span class='label label-success' style=\"padding: 4px 6px;font-size: 16px;line-height: 18px;\">"+text+"</span></p>"
			};

			skinColorContainer.highcharts({
				chart: {
					type: 'column',
				},
				colors: [
					"#4572A7",
					"#AA4643"
				],
				exporting: {
					enabled: false
				},
				plotOptions: {
					column: {
						pointPadding: 0.2,
						borderWidth: 0,
						dataLabels: {
							enabled: true,
							formatter: function () {
								return (this.y + '%');
							},
							style: {
								fontSize: '16px'
							}
						}
					},
					series: {
						pointWidth: 40
					}
				},
				legend: {
					itemStyle: {
						fontSize: '18px'
					}
				},
				plotOptions: {
					series: {
						dataLabels: {
							enabled: true,
							style: {
								fontSize: "16px"
							}
						}
					}
				},
				series: [{
					name: function() {
						if (app.config.language == "spanish") {
							return "Antes de trasplante";
						} else {
							return 'Before Transplant';
						};
					}(),
					data: [100, 80, 50, 25, 10, 2]
				}, {
					name: function() {
						if (app.config.language == "spanish") {
							return "Después de trasplante";
						} else {
							return 'After Transplant';
						};
					}(),
					data: [100, 100, 90, 70, 40, 25]
				}],
				title: {
					margin: 50,
					text: function() {
						if (app.config.language == "spanish") {
							return "Su Probabilidad de una Quemadura Solar Basada en su Tono de Piel.";
						} else {
							return 'Your Chance of Getting Sunburn Based on Your Skin Color';
						};
					}(),
					style: {
						fontSize: '20px'
					}
				},
				xAxis: {
					categories: skinCategories,
					labels: {
						useHTML: true,
						style: {
							fontSize: '16px'
						}
					},
					title: {
						text: function() {
							if (app.config.language == "spanish") {
								return "Nivel de Tono de Piel";
							} else {
								return 'Skin Color Level';
							};
						}(),
						style: {
							fontSize: '18px'
						}
					},
				},
				yAxis: {
					min: 0,
					max: 100,
					title: {
						text: function() {
							if (app.config.language == "spanish") {
								return "Probabilidad de una Quemadura Solar (%)";
							} else {
								return 'Chance of Getting Sunburn (%)';
							};
						}(),
						style: {
							fontSize: '16px'
						}
					},
					labels: {
						formatter: function () {
							return (this.value + '%');
						},
						style: {
							fontSize: '16px'
						}
					}
				},
			});
		}
	});
};

$(function () {
	var savingDiv = '<div class="alert alert-success hide" id="saving-alert" style="padding-right:14px;position:absolute;right:25px;bottom:65px;">Saving...</div>';
	$('body').append(savingDiv);
});

$.fn.button.Constructor.prototype.toggle = function () {

	$("#saving-alert").show().delay(500).fadeOut(500);

	var $parent = this.$element.closest('[data-toggle="buttons-radio"]')

	$parent && $parent
		.find('.active')
		.removeClass('active')
		.removeClass('btn-warning')

	this.$element.toggleClass('active');

	this.$element.toggleClass('btn-warning');
	this.$element.find("i.icon-ok.icon-white").toggleClass('hide');
};