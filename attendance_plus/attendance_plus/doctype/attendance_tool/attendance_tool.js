frappe.ui.form.on('Attendance Tool', {
	refresh: function(frm) {
		frm.disable_save();
	},
	
		onload: function(frm) {
			frm.set_value("date", frappe.datetime.get_today());
			erpnext.employee_attendance_tool.load_employees(frm);
		},
	
		date: function(frm) {
			erpnext.employee_attendance_tool.load_employees(frm);
		},
	
		department: function(frm) {
			erpnext.employee_attendance_tool.load_employees(frm);
		},
	
		branch: function(frm) {
			erpnext.employee_attendance_tool.load_employees(frm);
		},
	
		company: function(frm) {
			erpnext.employee_attendance_tool.load_employees(frm);
		}
	
	});
	
	
	erpnext.employee_attendance_tool = {
		load_employees: function(frm) {
			if(frm.doc.date) {
				frappe.call({
					method: "erpnext.hr.doctype.employee_attendance_tool.employee_attendance_tool.get_employees",
					args: {
						date: frm.doc.date,
						department: frm.doc.department,
						branch: frm.doc.branch,
						company: frm.doc.company
					},
					callback: function(r) {
						if(r.message['unmarked'].length > 0) {
							unhide_field('unmarked_attendance_section')
							if(!frm.employee_area) {
								frm.employee_area = $('<div>')
								.appendTo(frm.fields_dict.employees_html.wrapper);
							}
							frm.EmployeeSelector = new erpnext.EmployeeSelector(frm, frm.employee_area, r.message['unmarked'])
						}
						else{
							hide_field('unmarked_attendance_section')
						}
	
						if(r.message['marked'].length > 0) {
							unhide_field('marked_attendance_section')
							if(!frm.marked_employee_area) {
								frm.marked_employee_area = $('<div>')
									.appendTo(frm.fields_dict.marked_attendance_html.wrapper);
							}
							frm.marked_employee = new erpnext.MarkedEmployee(frm, frm.marked_employee_area, r.message['marked'])
						}
						else{
							hide_field('marked_attendance_section')
						}
					}
				});
			}
		}
	}
	
	erpnext.MarkedEmployee = Class.extend({
		init: function(frm, wrapper, employee) {
			this.wrapper = wrapper;
			this.frm = frm;
			this.make(frm, employee);
		},
		make: function(frm, employee) {
			var me = this;
			$(this.wrapper).empty();
	
			var row;
			$.each(employee, function(i, m) {
				var attendance_icon = "fa fa-check";
				var color_class = "";
				if(m.status == "Absent") {
					attendance_icon = "fa fa-check-empty"
					color_class = "text-muted";
				}
				else if(m.status == "Half Day") {
					attendance_icon = "fa fa-check-minus"
				}
	
				if (i===0 || i % 4===0) {
					row = $('<div class="row"></div>').appendTo(me.wrapper);
				}
	
				$(repl('<div class="col-sm-3 %(color_class)s">\
					<label class="marked-employee-label"><span class="%(icon)s"></span>\
					%(employee)s</label>\
					</div>', {
						employee: m.employee_name,
						icon: attendance_icon,
						color_class: color_class
					})).appendTo(row);
			});
		}
	});
	
	
	erpnext.EmployeeSelector = Class.extend({
		init: function(frm, wrapper, employee) {
			this.wrapper = wrapper;
			this.frm = frm;
			this.make(frm, employee);
		},
		make: function(frm, employee) {
			var me = this;
	
			var leave_types = "";
	
			frappe.call({
				method: "attendance_plus.app.get_leave_types",
				callback: function(r) {
					leave_types = r.message;
					console.log(leave_types)
	
				}
			});
			
	
			$(this.wrapper).empty();
			var employee_toolbar = $('<div class="col-sm-12 top-toolbar">\
				<button class="btn btn-default btn-add btn-xs"></button>\
				<button class="btn btn-xs btn-default btn-remove"></button>\
				</div>').appendTo($(this.wrapper));
			
			
			var custom_buttons = `<button class="btn btn-danger btn-mark-sick-leave btn-xs">Mark Sick Leave</button>
			<button class="btn btn-danger btn-mark-leave-without-payment btn-xs">Mark Leave Without Payment</button>
			<button class="btn btn-danger btn-mark-privilege-leave btn-xs">Mark Privilege Leave</button>
			<button class="btn btn-danger btn-mark-compensatory-off btn-xs">Mark Compensatory Off</button>
			<button class="btn btn-danger btn-mark-casual-leave btn-xs">Mark Casual Leave</button>
			<button class="btn btn-danger btn-mark-annual-leave btn-xs">Mark Annual Leave</button>
			<button class="btn btn-danger btn-mark-sick-leave-2 btn-xs">Mark Sick Leave 2</button>
			<button class="btn btn-danger btn-mark-accrued-leave btn-xs">Mark Accrued Leave</button>`;
			
			var mark_employee_toolbar = $('<div class="col-sm-12 bottom-toolbar">\
				<button class="btn btn-primary btn-mark-present btn-xs">Mark Present</button>\
				<button class="btn btn-primary btn-mark-work-from-home btn-xs">Mark Work From Home</button>\
				<button class="btn btn-warning btn-mark-half-day btn-xs"> Mark Half Day</button>\
				<button class="btn btn-danger btn-mark-absent btn-xs">Mark Absent</button>\
				'+ custom_buttons +'\
				</div>');
	
			console.log("HTML BUTTONS \n" + mark_employee_toolbar);
			
			mark_employee_toolbar.find(".btn-mark-sick-leave")
				.on("click", function() {
					var employee_sick = [];
					$(me.wrapper).find('input[type="checkbox"]').each(function(i, check) {
						if($(check).is(":checked")) {
							employee_sick.push(employee[i]);
						}
					});
					frappe.call({
						method: "attendance_plus.attendance_plus.doctype.attendance_tool.attendance_tool.mark_employee_attendance",
						args:{
							"employee_list":employee_sick,
							"status":"Sick",
							"date":frm.doc.date,
							"leave_type":"Sick",
							"company":frm.doc.company
						},
	
						callback: function(r) {
							erpnext.employee_attendance_tool.load_employees(frm);
	
						}
					});
				});
				
				mark_employee_toolbar.find(".btn-mark-leave-without-payment")
				.on("click", function(){
					var employee_leave_without_payment = [];
					$(me.wrapper).find('input[type="checkbox"]').each(function(i, check) {
						if($(check).is(":checked")) {
							employee_leave_without_payment.push(employee[i]);
						}
					});
					frappe.call({
						method: "attendance_plus.attendance_plus.doctype.attendance_tool.attendance_tool.mark_employee_attendance",
						args:{
							"employee_list":employee_leave_without_payment,
							"status":"Leave Without Payment",
							"date":frm.doc.date,
							"leave_type":"Leave Without Payment",
							"company":frm.doc.company
						},
	
						callback: function(r) {
							erpnext.employee_attendance_tool.load_employees(frm);
	
						}
					});
				});
	
				mark_employee_toolbar.find(".btn-mark-sick-leave-2")
				.on("click", function() {
					var employee_sick_leave_2 = [];
					$(me.wrapper).find('input[type="checkbox"]').each(function(i, check) {
						if($(check).is(":checked")) {
							employee_sick_leave_2.push(employee[i]);
						}
					});
					frappe.call({
						method: "attendance_plus.attendance_plus.doctype.attendance_tool.attendance_tool.mark_employee_attendance",
						args:{
							"employee_list":employee_sick_leave_2,
							"status":"Sick Leave 2",
							"date":frm.doc.date,
							"leave_type":"Sick Leave 2",
							"company":frm.doc.company
						},
	
						callback: function(r) {
							erpnext.employee_attendance_tool.load_employees(frm);
	
						}
					});
				});
	
				mark_employee_toolbar.find(".btn-mark-annual-leave")
				.on("click", function(){
					var employee_annual_leave = [];
					$(me.wrapper).find('input[type="checkbox"]').each(function(i, check) {
						if($(check).is(":checked")) {
							employee_annual_leave.push(employee[i]);
						}
					});
					frappe.call({
						method:"attendance_plus.attendance_plus.doctype.attendance_tool.attendance_tool.mark_employee_attendance",
						args:{
							"employee_list":employee_annual_leave,
							"status":"Annual Leave",
							"date":frm.doc.date,
							"leave_type":"Annual Leave",
							"company":frm.doc.company
						},
	
						callback: function(r) {
							erpnext.employee_attendance_tool.load_employees(frm);
	
						}
					});
				});
				mark_employee_toolbar.find(".btn-mark-accrued-leave")
				.on("click", function(){
					var employee_accrued_leave = [];
					$(me.wrapper).find('input[type="checkbox"]').each(function(i, check) {
						if($(check).is(":checked")) {
							employee_accrued_leave.push(employee[i]);
						}
					});
					frappe.call({
						method: "attendance_plus.attendance_plus.doctype.attendance_tool.attendance_tool.mark_employee_attendance",
						args:{
							"employee_list":employee_accrued_leave,
							"status":"Accrued Leave",
							"date":frm.doc.date,
							"leave_type":"Accrued Leave",
							"company":frm.doc.company
						},
	
						callback: function(r) {
							erpnext.employee_attendance_tool.load_employees(frm);
	
						}
					});
				});
				mark_employee_toolbar.find(".btn-mark-privilege-leave")
				.on("click", function(){
					var employee_privilege_leave = [];
					$(me.wrapper).find('input[type="checkbox"]').each(function(i, check) {
						if($(check).is(":checked")) {
							employee_privilege_leave.push(employee[i]);
						}
					});
					frappe.call({
						method: "attendance_plus.attendance_plus.doctype.attendance_tool.attendance_tool.mark_employee_attendance",
						args:{
							"employee_list":employee_privilege_leave,
							"status":"Privilege Leave",
							"date":frm.doc.date,
							"leave_type":"Privilege Leave",
							"company":frm.doc.company
						},
	
						callback: function(r) {
							erpnext.employee_attendance_tool.load_employees(frm);
	
						}
					});
				});
	
				mark_employee_toolbar.find(".btn-mark-compensatory-off")
				.on("click", function(){
					var employee_compensatory_off = [];
					$(me.wrapper).find('input[type="checkbox"]').each(function(i, check) {
						if($(check).is(":checked")) {
							employee_compensatory_off.push(employee[i]);
						}
					});
					frappe.call({
						method: "attendance_plus.attendance_plus.doctype.attendance_tool.attendance_tool.mark_employee_attendance",
						args:{
							"employee_list":employee_compensatory_off,
							"status":"Compensatory Off",
							"date":frm.doc.date,
							"leave_type":"Compensatory Off",
							"company":frm.doc.company
						},
	
						callback: function(r) {
							erpnext.employee_attendance_tool.load_employees(frm);
	
						}
					});
				});	
	
				mark_employee_toolbar.find(".btn-mark-casual-leave")
				.on("click", function(){
					var employee_casual_leave = [];
					$(me.wrapper).find('input[type="checkbox"]').each(function(i, check) {
						if($(check).is(":checked")) {
							employee_casual_leave.push(employee[i]);
						}
					});
					frappe.call({
						method: "attendance_plus.attendance_plus.doctype.attendance_tool.attendance_tool.mark_employee_attendance",
						args:{
							"employee_list":employee_casual_leave,
							"status":"Casual Leave",
							"date":frm.doc.date,
							"leave_type":"Casual Leave",
							"company":frm.doc.company
						},
	
						callback: function(r) {
							erpnext.employee_attendance_tool.load_employees(frm);
	
						}
					});
				});	
	
			employee_toolbar.find(".btn-add")
				.html(__('Check all'))
				.on("click", function() {
					$(me.wrapper).find('input[type="checkbox"]').each(function(i, check) {
						if(!$(check).is(":checked")) {
							check.checked = true;
						}
					});
				});
	
			employee_toolbar.find(".btn-remove")
				.html(__('Uncheck all'))
				.on("click", function() {
					$(me.wrapper).find('input[type="checkbox"]').each(function(i, check) {
						if($(check).is(":checked")) {
							check.checked = false;
						}
					});
				});
	
			mark_employee_toolbar.find(".btn-mark-present")
				//.html(__('Mark Present'))
				.on("click", function() {
					var employee_present = [];
					$(me.wrapper).find('input[type="checkbox"]').each(function(i, check) {
						if($(check).is(":checked")) {
							employee_present.push(employee[i]);
						}
					});
					frappe.call({
						method: "attendance_plus.attendance_plus.doctype.attendance_tool.attendance_tool.mark_employee_attendance",
						args:{
							"employee_list":employee_present,
							"status":"Present",
							"date":frm.doc.date,
							"leave_type":"Present",
							"company":frm.doc.company
						},
	
						callback: function(r) {
							erpnext.employee_attendance_tool.load_employees(frm);
	
						}
					});
				});
	
			mark_employee_toolbar.find(".btn-mark-absent")
				//.html(__('Mark Absent'))
				.on("click", function() {
					var employee_absent = [];
					$(me.wrapper).find('input[type="checkbox"]').each(function(i, check) {
						if($(check).is(":checked")) {
							employee_absent.push(employee[i]);
						}
					});
					
					frappe.call({
						method: "attendance_plus.attendance_plus.doctype.attendance_tool.attendance_tool.mark_employee_attendance",
						args:{
							"employee_list":employee_absent,
							"status":"Absent",
							"date":frm.doc.date,
							"leave_type":"Absent",
							"company":frm.doc.company
						},
	
						callback: function(r) {
							erpnext.employee_attendance_tool.load_employees(frm);
	
						}
					});
				});
	
	
			mark_employee_toolbar.find(".btn-mark-half-day")
				//.html(__('Mark Half Day'))
				.on("click", function() {
					var employee_half_day = [];
					$(me.wrapper).find('input[type="checkbox"]').each(function(i, check) {
						if($(check).is(":checked")) {
							employee_half_day.push(employee[i]);
						}
					});
					frappe.call({
						method: "attendance_plus.attendance_plus.doctype.attendance_tool.attendance_tool.mark_employee_attendance",
						args:{
							"employee_list":employee_half_day,
							"status":"Half Day",
							"date":frm.doc.date,
							"leave_type":"Half Day",
							"company":frm.doc.company
						},
	
						callback: function(r) {
							erpnext.employee_attendance_tool.load_employees(frm);
						},
					});
				});
		
				
				mark_employee_toolbar.find(".btn-mark-work-from-home")
					.on("click", function() {
						var employee_work_from_home = [];
						$(me.wrapper).find('input[type="checkbox"]').each(function(i, check) {
							if($(check).is(":checked")) {
								employee_work_from_home.push(employee[i]);
						}
					});
					frappe.call({
						method: "attendance_plus.attendance_plus.doctype.attendance_tool.attendance_tool.mark_employee_attendance",
						args:{
							"employee_list":employee_work_from_home,
							"status":"Work From Home",
							"date":frm.doc.date,
							"leave_type": "Work From Home",
							"company":frm.doc.company
						},
	
						callback: function(r) {
							erpnext.employee_attendance_tool.load_employees(frm);
	
						}
					});
				});
	
			var row;
			$.each(employee, function(i, m) {
				if (i===0 || (i % 4) === 0) {
					row = $('<div class="row"></div>').appendTo(me.wrapper);
				}
	
				$(repl('<div class="col-sm-3 unmarked-employee-checkbox">\
					<div class="checkbox">\
					<label><input type="checkbox" class="employee-check" employee="%(employee)s"/>\
					%(employee)s</label>\
					</div></div>', {employee: m.employee_name})).appendTo(row);
			});
		
	
			mark_employee_toolbar.appendTo($(this.wrapper));
		}
			


	});
