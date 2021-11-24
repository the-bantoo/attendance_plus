import frappe
from frappe import _

@frappe.whitelist()
def get_leave_types():
    leave_types = frappe.get_all("Leave Type", fields=['name'])
    frappe.errprint(leave_types)
    return leave_types


@frappe.whitelist()
def allocate_leaves(leave_type, employees, company, create_leave_application=1):
    if create_leave_application == 1:
        for employee in employees:
            # get leave details
            # leave approver
            frappe.get_doc("Employee", employee).leave_approver

            leave_application = frappe.get_doc({

                'doctype': 'Leave Application',
                'series': 'HR-LAP-.YYYY.-',
                'employee': employee,
                'status': 'Approved',
                'leave_type': leave_type,
                'posting_date': date,
                'from_date': date,
                'to_date': todate,
                'reason': _('Automatically created by the Attendance Tool'),
                'company': company,
            })
            leave_application.insert()