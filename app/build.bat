pip install pyinstaller

pyinstaller --noconfirm --onefile --windowed ^
    --add-data "web;web" ^
    --name "MyApp" ^
    main.py
