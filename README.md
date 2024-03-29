# 申請マネージャ GUI

This is the GUI for [申請マネージャ (Shinsei-manager)](https://github.com/jtekt/web-based-approval-system), a web application to manage approval workflows.
The application aims at replacing ハンコ (Hanko) - personal seals used to approve paper documents in Japan - with a digital equivalent.

In this GUI, this digital equivalent proof of approval takes the form of the following virtual seal, named web hanko:


<p align="center">
  <img width="100" height="150" src="./docs/web_hanko.png">
</p>

The Web hanko embeds a QR code which contains the database ID of the given approval from the given approver, meaning that the web hanko for every approval of every user is unique.
Thus, the validity of those seals can be verified even if those are included in documents which are later exchanged in pdf format or printed out.

## Environment variables

| Variable  | Description |
| ---  | --- |
| VUE_APP_SHINSEI_MANAGER_URL  | URL of the Shinsei-manager API |
| VUE_APP_LOGIN_URL | URL used for user login |
| VUE_APP_IDENTIFICATION_URL | URL used to identify users |
| VUE_APP_GROUP_MANAGER_API_URL | URL of the group management service API |
