var generatorClicked = false;
$(function(){
	init();
	initToast();
	var uuid = AS.storage.get(AS.VALUE_TYPE['str'], 'uuid');
	if(!uuid){
		$('.a-uuid-checker').on('click', function(){
			var inputUuid = $('.a-uuid-container').find('input').val();
			if(inputUuid.trim() === ''){
				AS.toast('还没有身份id可以点击“生成”', 'error', 5);
				return;
			}
			if(checkGenedUuid(inputUuid)){
				if(generatorClicked){
					generatorClicked = false;
					AS.storage.set('uuid', inputUuid);
					AS.sync.init(false, inputUuid);
					next();
					$('.a-guide').hide();
				}else{
					AS.sync.init(true, inputUuid, function(){
						$('.a-uuid-container').find('input').val('');
						AS.toast('id不存在，还没有身份id可以点击“生成”');
					});
				}
			}
		});
		$('.a-uuid-generator').on('click', function(){
			generatorClicked = true;
			var genUid = new Date().getTime().toString();
			$('.a-uuid-container').find('input').val(genUid).attr('readonly', true);
		});
		$('.a-guide').show();
	}else{
		AS.sync.init(false, uuid);
		next();
	}
});

function init(){
	//所有按钮行为，在点击后禁用1秒，防止意外连续点击
	$('.a-button').on('click', function(){
		var $that = $(this);
		$that.attr('disabled', true);
		window.setTimeout(function(){
			$that.attr('disabled', false);
		}, 1000);	
	});
}

function next(){
	AS.store.init($('.a-list'));
	initTools();
	bindListeners();
}

/**
*	检查输入的uuid
*	uuid只能是日期new Date().getTime()得到的一串数字或字符串
*/
function checkGenedUuid(uuid){
	var errMsg = '请填写已经拥有的身份id或者重新生成';
	if(!/^[0-9]*$/.test(uuid)){
		AS.toast(errMsg, 'warn', 5);
		return;
	}
	uuid = parseInt(uuid);
	var fiveYearsTime = 1000*60*60*24*365*5,
		nowTime = new Date().getTime();
	var dif = nowTime - uuid;
	if(dif > fiveYearsTime || dif <= 0){
		AS.toast(errMsg, 'warn', 5);
		return;
	}
	return true;
}

function bindListeners(){
	var tmpl = $('#tap-template').html();
	$('.a-tap-new').on('keyup', function(e){
		var input = $(this).val().trim();
		if(input == '' || e.keyCode != 13) return;
		var datetime = new Date().toLocaleString();
		var tid = $(this).attr('data-target'), title, content;
		if(tid){
			var task = AS.TID2TASK[tid];
			task.edit(input);
			title = task.title;
			content = task.content;
			$('.a-list').find('a[data-key="'+tid+'"]').find('.a-tap-title').html(title).end().find('.a-tap-content').html(content);
		}else{
			var inputArr = input.split('::');
			var options = {};
			if(inputArr.length == 1){
				options['content'] = input;
			}else{
				options['title'] = inputArr[0];
				options['content'] = inputArr[1];
			}
			AS.store.add(options);
			
		}
		$(this).attr('data-target', '').val('').blur();
	});

	this.editting = false;
	$('.a-container').delegate('.a-tap-header span', 'click', function(){
		var $tap = $(this).parents('.a-tap');
		var tid = $tap.attr('data-key');
		var task = AS.TID2TASK[tid];
		if($(this).hasClass('a-tap-delete')){
			//删除
			AS.store.remove(AS.TODO_DATA, tid);
			$tap.remove();
		}else if($(this).hasClass('a-tap-done')){
			//完成
			AS.store.finish(tid);
			$tap.remove();
		}else if($(this).hasClass('a-tap-edit')){
			//编辑
			$('.a-tap-new').val(task.title+"::"+task.content).attr('data-target', tid).focus();
		}else if($(this).hasClass('a-tap-flash')){
			//关注
			task.setFlash(!$(this).hasClass('action'));
			$(this).toggleClass('action').parent().parent().toggleClass('animation-flash');
		}
	});
}

function initTools(){
	
	$('.a-doneList').on('click', function(){
		$('.a-slider-container').toggle('fast');
	});
	//设置
	$('[data-toggle="setting-popover"]').popover({
		html: true,
		placement: 'top',
		container: 'body',
		content: '<input placeholder="消息提醒频率(分钟)" class="a-setting-timer">\
					<button type="button" class="a-setting-set"> 设置 </button>'
	}).on('shown.bs.popover', function(){
		$('.a-setting-set').on('click', function(){
			var timer = $('.a-setting-timer').val();
			if(!timer || timer.trim() == ''){
				AS.toast('设置频率不能为空', 'warn');
				return;
			}
			timer = parseInt(timer)*60;
			AS.store.setTimerFrequency(timer);
		});
	});
	//时间
	$('[data-toggle="observer-popover"]').popover({
		html: true,
		placement: 'top',
		container: 'body',
		content: '<label><input placeholder="分钟" class="a-observer-time"></label>\
				   <input type="hidden" class="a-observer-color">\
				   <div class="a-observer-color-picker"><span style="background:#66FF00" data-hex="#66FF00"></span>\
				   <span style="background:#99FF00" data-hex="#99FF00"></span>&nbsp;<span style="background:#CCFF00" data-hex="#CCFF00"></span>\
				   <span style="background:#FFFF00" data-hex="#FFFF00"></span>&nbsp;<span style="background:#FFCC00" data-hex="#FFCC00"></span>\
				   <span style="background:#99CC00" data-hex="#99CC00"></span>&nbsp;<span style="background:#66CC00" data-hex="#66CC00"></span>\
				   <span style="background:#FF6600" data-hex="#FF6600"></span>&nbsp;<span style="background:#FF3300" data-hex="#FF3300"></span>\
				   <span style="background:#FF00FF" data-hex="#FF00FF"></span>&nbsp;<span style="background:#CC00FF" data-hex="#CC00FF"></span>\
				   <span style="background:#9900FF" data-hex="#9900FF"></span>&nbsp;<span style="background:#FF0066" data-hex="#FF0066"></span>\
				   <span style="background:#00CCFF" data-hex="#00CCFF"></span>&nbsp;<span style="background:#0099FF" data-hex="#0099FF"></span>\
				   <span style="background:#00CC99" data-hex="#00CC99"></span>&nbsp;<span style="background:#669999" data-hex="#669999"></span>\
				   <span style="background:#990033" data-hex="#990033"></span>&nbsp;<span style="background:#999999" data-hex="#999999"></span>\
				   <span style="background:#CCCCFF" data-hex="#CCCCFF"></span>&nbsp;<span style="background:#9933FF" data-hex="#9933FF"></span></div>\
				   <button type="button" class="a-observer-set"> 设置 </button>'
	}).on('shown.bs.popover', function(){
		//绑定时间设置事件
		$('.a-observer-set').on('click', function(){
			var time = $('.a-observer-time').val().trim();
			var color = $('.a-observer-color').val().trim();
			AS.store.setColorfulStatus(time, color)
		});
		//绑定颜色选择事件
		$('.a-observer-color-picker').delegate('span', 'click', function(){
			var color = $(this).attr('data-hex');
			$(this).css('border', '3px dashed black').siblings().css('border', 'none');
			$('.a-observer-color').val(color);
		});
	});
	//同步
	$('.a-sync').on('click', function(){
		console.log('同步中...');
		AS.sync.sync();
	});
	
}

//消息提示
function initToast(){
	var type_class = {
		success: "alert-success",
		info: "alert-info",
		warn: "alert-warning",
		error: "alert-danger"
	};
	var toastTimer,
		$alert = $('.a-alert'),
		$alertMessage = $alert.find('.a-alert-message'),
		latestClass = "alert-info";
	AS.toast = function(msg, type, time){
		if(!msg || msg.trim()==='') return;
		useClass = type_class[type] || "alert-info";
		time = time || 2;
		window.clearTimeout(toastTimer);
		$alertMessage.html(msg);
		$alert.removeClass(latestClass).addClass(useClass).show();
		latestClass = useClass;
		toastTimer = window.setTimeout(function(){
			$alert.hide();
		}, time*1000);
	};
}

// 将‘2015/11/22 下午9:57:30’ 转换成 ‘2015/11/22 21:57:30’，以便转换成Date实例
function dateTransfer(dateStr){
	var rawHour = dateStr.substring(dateStr.indexOf(' ')+1, dateStr.indexOf(':'));
	if(rawHour.indexOf('下午') != -1){
		var hour = parseInt(rawHour.replace('下午','')) + 12;
		return new Date(dateStr.replace(rawHour, hour));
	}else if(rawHour.indexOf('上午') != -1){
		return new Date(dateStr.replace('上午', ''));
	}
	return new Date(dateStr);
}

//将得到的background-color由rgb格式(rgb(255, 255, 255))转换为hex格式(#ffffff)
function rgbToHex(bgColor){
	console.log('bgColor=======>>>', bgColor);
	bgColor = bgColor.substring(4, bgColor.length-1).split(',');
	var r = parseInt(bgColor[0]),
		g = parseInt(bgColor[1]),
		b = parseInt(bgColor[2]);
	var result = '#' + r.toString(16) + g.toString(16) + b.toString(16);
	return result;
}