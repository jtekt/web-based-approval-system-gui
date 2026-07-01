#!/bin/sh

ROOT_DIR=/app

# Replace env vars in files served by NGINX
echo "Replacing environment variables"
for file in $ROOT_DIR/assets/*.js* $ROOT_DIR/index.html;
do
  echo "Processing $file ...";

  sed -i 's|VITE_APPS_URL_PLACEHOLDER|'${VITE_APPS_URL}'|g' $file
  sed -i 's|VITE_APP_TITLE_PLACEHOLDER|'${VITE_APP_TITLE:-申請マネージャ}'|g' $file

  sed -i 's|VITE_PDF_ONLY_PLACEHOLDER|'${VITE_PDF_ONLY}'|g' $file

  sed -i 's|VITE_SHINSEI_MANAGER_URL_PLACEHOLDER|'${VITE_SHINSEI_MANAGER_URL}'|g' $file
  
  sed -i 's|VITE_GROUP_MANAGER_API_URL_PLACEHOLDER|'${VITE_GROUP_MANAGER_API_URL}'|g' $file
  sed -i 's|VITE_EMPLOYEE_MANAGER_API_URL_PLACEHOLDER|'${VITE_EMPLOYEE_MANAGER_API_URL}'|g' $file
  sed -i 's|VITE_EMPLOYEE_MANAGER_FRONT_URL_PLACEHOLDER|'${VITE_EMPLOYEE_MANAGER_FRONT_URL}'|g' $file

  sed -i 's|VITE_LEGACY_LOGIN_URL_PLACEHOLDER|'${VITE_LEGACY_LOGIN_URL}'|g' $file
  sed -i 's|VITE_LEGACY_IDENTIFICATION_URL_PLACEHOLDER|'${VITE_LEGACY_IDENTIFICATION_URL}'|g' $file
  sed -i 's|VITE_LEGACY_PASSWORD_RESET_URL_PLACEHOLDER|'${VITE_LEGACY_PASSWORD_RESET_URL}'|g' $file

  sed -i 's|VITE_OIDC_AUTHORITY_PLACEHOLDER|'${VITE_OIDC_AUTHORITY}'|g' $file
  sed -i 's|VITE_OIDC_CLIENT_ID_PLACEHOLDER|'${VITE_OIDC_CLIENT_ID}'|g' $file

done

echo "Starting Nginx"
nginx -g 'daemon off;'
