// datetime.js

define(["jquery"],function($){

	var DateTime = function (dater){
		var self = this;

		this.dater = dater;

		var dateObj = new Date();

		//默认配置 时间区间以及当前时间
		//默认时间为当前日期
		setting = {
			maxDate: "2100-12-31",
			minDate: "1970-01-01",
			nowFullDate: self.dateTypeToggle(dateObj),
			nowYear: dateObj.getFullYear(),
			nowMonth: dateObj.getMonth() + 1,
			nowDate: dateObj.getDate()
		};

		//新配置为 用户设置的开始时间及结束时间 以及当前选中的时间
		//再试未限制用户输入日期
		this.setting = {
			maxDate: this.dater.attr("data-max"),
			minDate: this.dater.attr("data-min")
		};
		//配置参数合并
		this.setting = $.extend(setting,this.setting);

		//先绘制一次日历控件(外部盒子，不包括内部日期列表)
		this.render();

		//下拉盒子容器
		this.dropDownBox = this.dater.next(".DateTime-dropdown-box");

		//控件头部
		this.boxHeader = this.dropDownBox.find(".DateTime-header");

		//月份选择框
		this.choiceMonth = this.dropDownBox.find(".DateTime-month input");

		//年份选择框
		this.choiceYear = this.dropDownBox.find(".DateTime-year input");

		//返回“今天”
		this.goBack = this.boxHeader.find(".go-today");

		//包含日期列表的盒子
		this.daysListBox = this.dropDownBox.find(".days");

		//控制位置
		this.setPosition();

		//延后绘制部分(日期显示等到获取到相应节点后通过计算显示)
		this.renderLater();

		$(document).on("click",function(){
			self.dropDownBox.css("display","none");
		});

		this.dater.on("click",function(e){
			//一次只显示一个
			$("input[type='date']").next(".DateTime-dropdown-box").css("display","none");
			self.dropDownBox.css("display","block");
			e.stopPropagation();
		});

		this.dropDownBox.on("click",function(e){
			e.stopPropagation();
		});

		//日期月份/年份筛选按钮的点击事件
		//this.daysList = this.daysListBox.find("ul li");
		this.boxHeader.find("span").each(function(){
			$(this).on("click", function(){

				self.pageChange($(this).attr("data-rule"))

				//调用方法 将选择的日期赋给[type="date"]的value
				var thisDay = $(self.daysListBox).find("li.select").val();
				self.dateChoided(undefined,undefined,thisDay);

				//self.clcikDatList();
			});
		});

		//初始化 日期列表绑定点击事件
		//self.clcikDatList();


		//
		this.goBack.on("click",function(){
			//alert("go back");
			var year = dateObj.getFullYear();
			var month = dateObj.getMonth() + 1;
			var day = dateObj.getDate();
			//input[type="date"] value设置为当前日期
			self.dateChoided(year,month,day);

			//month/year input value设置为当前日期
			self.choiceMonth.val(month);
			self.choiceYear.val(year);

			//重新绘制日期列表并绑定事件
			self.renderLater();

		})


		//日期控件输入框通过js赋值 无法触发change事件
		//解决方案？
		//[type="date"] 的value改变h后 重新绘制日期列表
		/*this.dater.on("input propertychange", function(){
			//日期选择完成之后，触发input[type="date"]的change事件 
			//执行相应的事件
			//alert("time has change")
			self.renderLater();
		});*/

		//日期控件输入框通过js赋值 无法触发change事件
		//解决方案？
		//日历月份或年份改变后 计算并重新绘制日期列表
		//console.log(this.boxHeader.find("input"))
		this.boxHeader.find("input").on("input propertychange", function(){

			self.renderLater();
			//调用方法 将选择的日期赋给[type="date"]的value
			var thisDay = $(self.daysListBox).find("li.select").val();
			self.dateChoided(undefined,undefined,thisDay);
		});

	};

	DateTime.prototype = {
		//日期列表重新绘制后 重新获取并绑定事件
		clcikDatList: function(){
			var that = this;
			//循环为日期列表每个li绑定点击事件
			$(that.daysListBox).find("li.this-month").each(function(i){
				$(this).on(
					{
						"click": function(){

							//调用方法 将选择的日期赋给[type="date"]的value
							that.dateChoided();

							$(that.daysListBox).find("li").removeClass("select");
							$(this).addClass("select");
						},
						"dblclick": function(){
							alert("双击了,关闭控件");
							//self.dropDownBox.css("display","none");
						}
				});
			});
		},
		//点击列表选择日期 将选择的日期赋给[type="date"]的value值
		dateChoided: function (year,month,day,e){
			var e = e || event;
			var self = this;
			var clickEle = e.srcElement?e.srcElement:e.target;  
			//console.log(day);
			//console.log(clickDate);
			//console.log(year+","+month+","+day)
			var clickDay = day || $(clickEle).val();
			var clickMonth = month || self.choiceMonth.val();
			var clickYear = year || self.choiceYear.val();
			var clickDate = clickYear+"-"+ self.addZero(clickMonth)+"-"+ self.addZero(clickDay);
			self.dater.val(clickDate);

			console.log("input控件的value值:")
			console.log(self.dater.val())
			console.log("-------------")
		},
		//翻页（月份和年份）
		//传入点击对象属性：data-rule，表示需要执行的操作
		//月份/年份加减1
		pageChange: function (prevOrNext){
			var self = this;
			var month = Number(self.choiceMonth.val());
			var year = Number(self.choiceYear.val());
			var Val;
			//判断点击对象 做相应操作( 加/减 一 年/月 )
			if(prevOrNext && typeof prevOrNext === "string"){
				
				if(prevOrNext === "month-prev"){
					//上一月
					if(month === 1){
						Val = 12;
						$(self.choiceYear).val(year - 1);
					}else{
						Val = month - 1;
					}
					$(self.choiceMonth).val(Val);
					//alert($(self.choiceMonth).val());

				}else if(prevOrNext === "month-next"){

					//下一月
					if(month === 12){
						Val = 1;
						$(self.choiceYear).val((year + 1));
					}else{
						Val = month + 1;
					}
					$(self.choiceMonth).val((Val));

				}else if(prevOrNext === "year-prev"){

					//上一年
					$(self.choiceYear).val(year - 1);

				}else if(prevOrNext === "year-next"){

					//下一年
					$(self.choiceYear).val((year + 1));
				}


				//退而求其次  只有监翻页事件了
				self.renderLater();
			}
		},
		//绘制日期下拉框
		render: function (){
			var self = this;

			this.dropDownBox && this.dropDownBox.remove();

			var outBox = $("<div class=\"DateTime-dropdown-box\"></div>");
			var header = $("<div class=\"DateTime-header clearfix\">"
							+ "<div class=\"DateTime-month left\">"
							+ "<span data-rule=\"month-prev\">&lt;</span>"
							+ "<input type=\"tel\" value=\""+self.setting.nowMonth+"\" maxlength=\"2\">"
							+ "<span data-rule=\"month-next\">&gt;</span>"
							+ "</div>"
							+ "<p class=\"go-today\"></p>"
							+ "<div class=\"DateTime-year right\">"
							+ "<span data-rule=\"year-prev\">&lt;</span>"
							+ "<input type=\"tel\" value=\""+self.setting.nowYear+"\" maxlength=\"4\">"
							+ "<span data-rule=\"year-next\">&gt;</span>"
							+ "</div>"
						+ "</div>");


			var body = $("<div class=\"DateTime-body\">"
							+"<div class=\"week\">"
							+"<ul><li>日</li><li>一</li><li>二</li><li>三</li><li>四</li><li>五</li><li>六</li></ul>"
							+"</div>"
							+"<div class=\"days\"><ul></ul></div>"
						+"</div>");

			outBox.append(header).append(body);
			outBox.insertAfter(self.dater);
		},
		//延后绘制 获取到外部盒子后才绘制日期列表
		renderLater: function(index){
			//alert("ok?")
			var that = this;
			var thatMonth = that.getThatMonthInfo();
			var listbox = that.daysListBox.find("ul");
			var isBegin = false;
			var listStr = "";
			
			listbox.find("li") && listbox.find("li").remove();

			for(var i = 0; i < 42; i++){
				if(i === thatMonth.firstDay){
					isBegin = true;
				}

				if( isBegin && i-(thatMonth.firstDay) < (thatMonth.dayCount)){
					if(index && i == index){
						listStr += "<li class=\"this-month select\" value=\"" + (i + 1 - thatMonth.firstDay) + "\">" + (i + 1 - thatMonth.firstDay) + "</li>";	
					}
					else if( that.setting.nowDate == (i-(thatMonth.firstDay)+1)){
						listStr += "<li class=\"this-month select\" value=\"" + (i + 1 - thatMonth.firstDay) + "\">" + (i + 1 - thatMonth.firstDay) + "</li>";						
					}else{
						listStr += "<li class=\"this-month\" value=\"" + (i + 1 - thatMonth.firstDay) + "\">" + (i + 1 - thatMonth.firstDay) + "</li>";
					}
				}
				else if(isBegin && (i + 1 - thatMonth.dayCount - thatMonth.firstDay) < (7 - thatMonth.lastDay)){
					listStr += "<li value=\"" + (i + 1 - thatMonth.dayCount - thatMonth.firstDay) + "\">" + (i + 1 - thatMonth.dayCount - thatMonth.firstDay) + "</li>";
				}
				else if(!isBegin && i < thatMonth.firstDay){
					listStr += "<li value=\"" + (thatMonth.prevMonthDayCount+i+1-thatMonth.firstDay) + "\">" + (thatMonth.prevMonthDayCount+i+1-thatMonth.firstDay) + "</li>";
				}

			}
			//console.log(listStr)
			that.daysListBox.find("ul").append($(listStr));

			//日期列表重新绘制后 重新获取并绑定事件
			that.clcikDatList();

			//console.log("画完")
			//console.log($(this.daysListBox).find("li.this-month").size())
		},
		//日期对象/字符串日期的互相转换
		dateTypeToggle: function (time){
			var self = this;
			if(time instanceof Date){
				return time.getFullYear() + "-" + self.addZero((time.getMonth() + 1)) + "-" + self.addZero(time.getDate());
			}else if(typeof time === "string") {
				//console.log(time)
				var arr = time.split("-");
				return new Date().setDate(arr[0],(arr[1] - 1),arr[2]);
				//return time
			}else{
				throw new Error("date time is Error");
			}
		},
		//为只有一位数的日期前添加一个“0”
		addZero: function (str){
			var full = (str && str < 10) ? ("0" + str) : str;
			return full;
		},
		//获取每个月的第一天和最后一天是星期几以及该月总天数
		getThatMonthInfo: function(){
			var that = this;
			var year = that.choiceYear.val();
			var month = that.choiceMonth.val();
			var dayCount,firstDay,lastDay,prevMonthDayCount;

			//设置日期对象的时间为选择的月份的第一天
			var thatMonthFitstDay = new Date(year,(month - 1),1);
			//计算选择的月份的第一天是星期几
			firstDay = thatMonthFitstDay.getDay();

			//计算选择的月份前一个月的天数
			thatMonthFitstDay.setDate(0);
			prevMonthDayCount = thatMonthFitstDay.getDate();

			//计算当前月总天数
			thatMonthFitstDay.setMonth(month);
			thatMonthFitstDay.setDate(0);
			dayCount = thatMonthFitstDay.getDate();

			//计算选择的月份的最后一天是星期几
			//thatMonthFitstDay.setMonth(month);
			//thatMonthFitstDay.setDate(1);
			lastDay = thatMonthFitstDay.getDay();

			return {
				firstDay: firstDay,
				lastDay: lastDay,
				dayCount: dayCount,
				prevMonthDayCount: prevMonthDayCount
			};
		},
		//设置下拉框的位置
		setPosition: function(){
			var that = this;
			var offsetLeft;
			var parent = that.dater.parent();
			if(parent !== null && parent.css("display") != "none"){
				offsetLeft = (that.dater.offset().left) - (parent.offset().left);
			}
			that.dropDownBox.css("left",offsetLeft + 8);
		}
	};

	DateTime.init = function(dates){
		var _this = this;
		dates.each(function(){
			new _this($(this));
		});
	};

	return DateTime;

})