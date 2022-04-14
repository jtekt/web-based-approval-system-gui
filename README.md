# 申請マネージャ GUI

This is the GUI for [申請マネージャ (Shinsei-manager)](https://github.com/jtekt/web-based-approval-system), a web application to manage approval workflows.
The application aims at replacing ハンコ (Hanko) - personal seals used to approve paper documents in Japan - with a digital equivalent.

In this GUI, this digital equivalent proof of approval takes the form of the following virtual seal, named web hanko:

<div style="text-align:center"><img src="./docs/hanko.png" style="width:200px"/></div>

The Web hanko embeds a QR code which contains the database ID of the given approval from the given approver, meaning that the web hanko for every approval of every user is unique.
Thus, the validity of those seals can be verified even if those are included in documents which are later exchanged in pdf format or printed out.

## Environment variables

| Variable  | Description |
| ---  | --- |
| VUE_APP_SHINSEI_MANAGER_URL  | The URL of the 申請マネージャ API |
| VUE_APP_EMPLOYEE_MANAGER_API_URL | The URL of the employee management service API |
| VUE_APP_GROUP_MANAGER_API_URL | The URL of the group management service API |
