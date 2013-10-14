var app = {};
app.content = appContent;

app.config = {};
app.config.mode = "demo"; //demo or normal or assessment
app.config.language = "english";
app.config.language = "spanish";

app.text = {}

if (app.config.language == "english") {
	app.text.goBack = "BACK"
	app.text.nextText = "NEXT";
	app.text.goOn = "GO ON";
} else {
	app.text.goBack = "Regresar"
	app.text.nextText = "Pr&oacute;ximo";
	app.text.goOn = "Continuar";
};

app.config.mainContent = {};
app.config.mainContent.showTitle = false;

app.config.assessments = {};
app.config.assessments.exist = false;

app.images_url = "images/";
app.videos_url = "videos/";
app.audio_url = "audio/";

app.status = {};
app.status.currentPageIndex = null;
app.status.currentChapterId = null;
app.status.currentChapterElement = null;
app.status.currentChapterContents = null;
app.status.numPagesInCurrentChapter = null;


app.start = function (appContent) {

	if (app.config.mode == "demo") {
		app.status.currentChapterId = 681;
	}

	app.build.navChapterBar(app.arrayOfChapterIds(app.content));
	app.build.chapter(app.status.currentChapterId, app.content);

}

app.arrayOfChapterIds = function (appContent) {

	var search_criteria = {
		element_type: "lesson"
	};
	return _.where(appContent, search_criteria);
};

app.getChapterContents = function (chapter_id, appContent) {
	var search_criteria = {
		id: chapter_id
	};
	chapter_contents_list = _.where(appContent, search_criteria)[0].element_list.toString().split(",");
	chapter_contents = [];

	// console.log("Chapter selected:",_.where(appContent, search_criteria)[0]);
	// console.log("Chapter contents list:",chapter_contents_list);

	_.each(chapter_contents_list, function (element) {
		// console.log(parseInt(element));
		chapter_contents.push(_.where(appContent, {
			id: parseInt(element)
		})[0]);
	});
	return chapter_contents;
};

app.build = {}
app.build.navChapterBar = function (arrayOfChapters) {

	_.each(arrayOfChapters, function (i) {

		$("#main_nav").append('<li class="load-chapter" data-id="' + i.id + '"><a href="#' + i.pretty_name + '">' + i.pretty_name + '</a></li>');

	});

	$(".load-chapter").on("click", function (ev) {
		app.actions.goToChapter(ev.currentTarget.dataset.id, app.contents)
	})
};

app.build.chapter = function (currentChapterId, appContents) {

	console.log("Building Chapter", currentChapterId);
	app.status.currentChapterElement = _.where(app.content, {
		id: currentChapterId
	})[0];
	app.status.currentChapterContents = app.getChapterContents(currentChapterId, appContents);
	app.status.numPagesInCurrentChapter = app.status.currentChapterContents.length;
	app.status.currentPageIndex = 0;
	app.actions.setPage(app.status.currentChapterContents[app.status.currentPageIndex]);

	$("li.load-chapter").removeClass("active");
	$("li.load-chapter[data-id=\"" + currentChapterId + "\"]").addClass("active");

	$(".currentSlideCount").html("1 of " + app.status.numPagesInCurrentChapter);

	app.build.chapterProgressBar(app.status.currentPageIndex + 1, app.status.numPagesInCurrentChapter);

	$(".mainContainer, .pageNext, .chapterProgress, .currentSlideCount").show();

};

app.build.chapterProgressBar = function (position, total) {
	$(".chapterProgressBar").width((position / total) * 100 + "%");
	app.build.progressBarButtons();
}

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

	// $(".tooltip").tooltip();
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
	})

};

app.actions.changePage = function (index_of_page) {

	console.log("Page changed to ", index_of_page + 1, "of", app.status.numPagesInCurrentChapter);

	$(".currentSlideCount").html(index_of_page + 1 + " of " + app.status.numPagesInCurrentChapter);

	app.status.currentPageIndex = index_of_page;

	app.build.chapterProgressBar(app.status.currentPageIndex + 1, app.status.numPagesInCurrentChapter);
	app.actions.setPage(app.status.currentChapterContents[app.status.currentPageIndex]);
	app.build.loadSkinColorHighChart()
	app.build.displayChoosenSkinType()

};

app.actions.goToChapter = function (chapterId, appContents) {

	// if (confirm('Are you sure you want to quit this chapter?')) {
	app.build.chapter(parseInt(chapterId), app.content);
	// } else {
	//     // Do nothing!
	// }

};

app.actions.loadAssessment = function (id_of_questionnaire) {
	if (app.config.assessments.exist) {
		alert("Assessments have not yet been provided, please check in later!");
	}
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

	var videoTemplate = function (mp4_location) {
		return '<video style=\"width:100%;\" controls autoplay><source src="' + app.videos_url + mp4_location + '" type="video/mp4">Your browser does not support the video tag.</video>'
	}
	$(".topRight").html(videoTemplate(video.replace("http://", "").replace("/", "")));
};



app.actions.loadAudio = function (audiofile) {

	var audioTemplate = function (mp4_location) {
		return '<audio style=\"width:100%;\" controls autoplay><source src="' + app.audio_url + mp4_location + '" type="audio/mp3">Your browser does not support the video tag.</video>'
	}

	$(".topRight").html(audioTemplate(audiofile.replace("http://", "").replace("/", "")));
};

app.actions.loadAudioImage = function (filename) {

	var audioImageTemplate = function (filename) {
		var src = '' + app.images_url + filename + '.jpg';
		return '<img src="' + app.images_url + filename + '.jpg" onload="app.actions.resizeIfNecessary(event);"/><br/><audio style=\"width:100%;\" controls autoplay><source src="' + app.audio_url + filename + '.mp3" type="audio/mp3">Your browser does not support the video tag.</audio>'
	};

	$(".topRight").html(audioImageTemplate(filename.replace("http://", "").replace("/", "")));
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

app.build.backNextButtons = function() {
	
	$(".pageNext").html(app.text.nextText+' <i class= "icon-chevron-right"></i>');
	$(".pageBack").html('<i class="icon-chevron-left"></i> '+app.text.goBack);

	$("button.pageNext").on("click", function (ev) {
		app.actions.changePage(app.status.currentPageIndex + 1)
	});

	$("button.pageBack").on("click", function (ev) {
		app.actions.changePage(app.status.currentPageIndex - 1)
	});

	$("button.pageNext").show();

}

app.build.goOnButton = function () {

	$(".pageNext").html(app.text.goOn+' <i class= "icon-stop"></i>');

	$("button.pageNext").on("click", function (ev) {
		app.actions.loadAssessment();
	});

	$("button.pageBack").on("click", function (ev) {
		app.actions.changePage(app.status.currentPageIndex - 1)
	});

	$("button.pageNext").show();

};

app.build.progressBarButtons = function () {

	var index_of_page = app.status.currentPageIndex;
	var numPages = app.status.numPagesInCurrentChapter;
	var lastPage = numPages - 1;
	$("button.pageNext").off("click");
	$("button.pageBack").off("click");

	// ONLY 'Go On' - on FIRST page of ONLY 1 page
	if (app.status.numPagesInCurrentChapter == 1) {
		app.build.goOnButton();
		$("button.pageBack").hide();
	};

	// ONLY 'Next' - on FIRST page of many pages
	if ((index_of_page == 0) && (index_of_page != lastPage)) {
		app.build.backNextButtons();
		$("button.pageBack").hide();
	};

	// 'Back' & 'Next' - on a middle page of many pages
	if ((index_of_page != 0) && (index_of_page != lastPage)) {
		app.build.backNextButtons();
		$("button.pageBack").show();
	};

	// 'Back' & 'Go On' - on the LAST page of many pages
	if ((numPages > 1) && (index_of_page == lastPage)) {
		app.build.goOnButton();
		$("button.pageBack").show();
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
				skinCategories[app.skinColor - 1] = "<p style=\"margin-top:5px;\"><span class='label label-success' style=\"padding: 4px 6px;font-size: 16px;line-height: 18px;\">Your Chance</span></p>"
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
					name: 'Before Transplant',
					data: [100, 80, 50, 25, 10, 2]
				}, {
					name: 'After Transplant',
					data: [100, 100, 90, 70, 40, 25]
				}],
				title: {
					margin: 50,
					text: 'Your Chance of Getting Sunburn Based on Your Skin Color',
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
						text: 'Skin Color Level',
						style: {
							fontSize: '18px'
						}
					},
				},
				yAxis: {
					min: 0,
					max: 100,
					title: {
						text: 'Chance of Getting Sunburn (%)',
						style: {
							fontSize: '18px'
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

	this.$element.toggleClass('active')

	this.$element.toggleClass('btn-warning')
	this.$element.find("i.icon-ok.icon-white").toggleClass('hide');
};