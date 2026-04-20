#!/bin/sh

ROOT_DIR=/app

# Replace env vars in files served by NGINX
echo "Replacing environment variables"
for file in $ROOT_DIR/js/*.js* $ROOT_DIR/index.html $ROOT_DIR/precache-manifest*.js;
do
  echo "Processing $file ...";

  sed -i 's|VITE_PDF_MODE=VITE_PDF_MODE_PLACEHOLDER|'${VITE_PDF_MODE=VITE_PDF_MODE}'|g' $file

  sed -i 's|VITE_SHINSEI_MANAGER_URL_PLACEHOLDER|'${VITE_SHINSEI_MANAGER_URL}'|g' $file
  
  sed -i 's|VITE_GROUP_MANAGER_API_URL_PLACEHOLDER|'${VITE_GROUP_MANAGER_API_URL}'|g' $file
  sed -i 's|VITE_EMPLOYEE_MANAGER_API_URL_PLACEHOLDER|'${VITE_EMPLOYEE_MANAGER_API_URL}'|g' $file
  sed -i 's|VITE_EMPLOYEE_MANAGER_FRONT_URL_PLACEHOLDER|'${VITE_EMPLOYEE_MANAGER_FRONT_URL}'|g' $file
 
  sed -i 's|VITE_HOMEPAGE_URL_PLACEHOLDER|'${VITE_HOMEPAGE_URL}'|g' $file

  sed -i 's|VITE_IDENTIFICATION_URL_PLACEHOLDER|'${VITE_IDENTIFICATION_URL}'|g' $file
  sed -i 's|VITE_LOGIN_URL_PLACEHOLDER|'${VITE_LOGIN_URL}'|g' $file
  sed -i 's|VITE_PASSWORD_RESET_URL_PLACEHOLDER|'${VITE_PASSWORD_RESET_URL}'|g' $file
  
  sed -i 's|VITE_LOGIN_HINT_PLACEHOLDER|'${VITE_LOGIN_HINT}'|g' $file

  sed -i 's|VITE_OIDC_AUTHORITY_PLACEHOLDER|'${VITE_OIDC_AUTHORITY}'|g' $file
  sed -i 's|VITE_OIDC_CLIENT_ID_PLACEHOLDER|'${VITE_OIDC_CLIENT_ID}'|g' $file
  sed -i 's|VITE_OIDC_AUDIENCE_PLACEHOLDER|'${VITE_OIDC_AUDIENCE}'|g' $file

done

echo "Starting Nginx"
nginx -g 'daemon off;'
