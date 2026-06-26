pip install pyinstaller

pyinstaller --noconfirm --onefile --windowed ^
    --add-data "index.html;." ^
    --add-data "css;css" ^
    --add-data "js;js" ^
    --name "MyApp" ^
    main.py
