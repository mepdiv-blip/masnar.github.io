@echo off
echo ========================================
echo   ProyekKu - Download CDN Files
echo ========================================
echo.

:: Buat folder
mkdir css 2>nul
mkdir js 2>nul
mkdir webfonts 2>nul
mkdir fonts 2>nul

echo [1/6] Download Tailwind CSS...
curl -L -o js\tailwind.min.js https://cdn.tailwindcss.com

echo [2/6] Download jsPDF...
curl -L -o js\jspdf.umd.min.js https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js

echo [3/6] Download jsPDF AutoTable...
curl -L -o js\jspdf-autotable.min.js https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js

echo [4/6] Download Font Awesome CSS...
curl -L -o css\fontawesome.min.css https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css

echo [5/6] Download Font Awesome Webfonts...
curl -L -o webfonts\fa-solid-900.woff2 https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/webfonts/fa-solid-900.woff2
curl -L -o webfonts\fa-solid-900.ttf https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/webfonts/fa-solid-900.ttf
curl -L -o webfonts\fa-regular-400.woff2 https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/webfonts/fa-regular-400.woff2
curl -L -o webfonts\fa-regular-400.ttf https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/webfonts/fa-regular-400.ttf
curl -L -o webfonts\fa-brands-400.woff2 https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/webfonts/fa-brands-400.woff2
curl -L -o webfonts\fa-brands-400.ttf https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/webfonts/fa-brands-400.ttf

echo [6/6] Download Plus Jakarta Sans...
curl -L -o fonts\PlusJakartaSans-Light.woff2 https://cdn.jsdelivr.net/fontsource/fonts/plus-jakarta-sans@latest/latin-300-normal.woff2
curl -L -o fonts\PlusJakartaSans-Regular.woff2 https://cdn.jsdelivr.net/fontsource/fonts/plus-jakarta-sans@latest/latin-400-normal.woff2
curl -L -o fonts\PlusJakartaSans-Medium.woff2 https://cdn.jsdelivr.net/fontsource/fonts/plus-jakarta-sans@latest/latin-500-normal.woff2
curl -L -o fonts\PlusJakartaSans-SemiBold.woff2 https://cdn.jsdelivr.net/fontsource/fonts/plus-jakarta-sans@latest/latin-600-normal.woff2
curl -L -o fonts\PlusJakartaSans-Bold.woff2 https://cdn.jsdelivr.net/fontsource/fonts/plus-jakarta-sans@latest/latin-700-normal.woff2
curl -L -o fonts\PlusJakartaSans-ExtraBold.woff2 https://cdn.jsdelivr.net/fontsource/fonts/plus-jakarta-sans@latest/latin-800-normal.woff2
curl -L -o fonts\PlusJakartaSans-Black.woff2 https://cdn.jsdelivr.net/fontsource/fonts/plus-jakarta-sans@latest/latin-900-normal.woff2

echo.
echo ========================================
echo   Semua file CDN berhasil diunduh!
echo   Jalankan di local server untuk testing
echo ========================================
pause