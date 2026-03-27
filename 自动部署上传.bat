echo 正在提交到 GitHub...
git add .
git commit -m "自动部署：%date% %time%"
git push

echo.
echo ==============================================
echo              部署完成！??
echo ==============================================
pause
