import sys
import os
from PyQt6.QtCore import Qt, QUrl
from PyQt6.QtGui import QAction, QFont, QIcon
from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QToolBar, QLabel, QWidget, QHBoxLayout, QSizePolicy
)
from PyQt6.QtWebEngineCore import QWebEngineSettings
from PyQt6.QtWebEngineWidgets import QWebEngineView


def get_web_path():
    """获取 web 目录的绝对路径，兼容 PyInstaller 打包"""
    if getattr(sys, 'frozen', False):
        base = sys._MEIPASS
    else:
        base = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base, 'web')


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("My App")
        self.resize(1200, 800)

        self.browser = QWebEngineView()
        self.setCentralWidget(self.browser)

        # 允许本地页面加载远程资源（Google Fonts 等）
        settings = self.browser.settings()
        settings.setAttribute(QWebEngineSettings.WebAttribute.LocalContentCanAccessRemoteUrls, True)
        settings.setAttribute(QWebEngineSettings.WebAttribute.JavascriptEnabled, True)
        settings.setFontFamily(QWebEngineSettings.FontFamily.SansSerifFont, 'Noto Sans SC, Segoe UI, system-ui')

        self.web_path = get_web_path()
        self.entry = os.path.join(self.web_path, 'index.html')

        self._setup_toolbar()
        self.browser.setUrl(QUrl.fromLocalFile(self.entry))

    def _setup_toolbar(self):
        toolbar = QToolBar()
        toolbar.setMovable(False)
        toolbar.setStyleSheet("""
            QToolBar {
                background: #1e293b;
                border-bottom: 1px solid #334155;
                padding: 4px 8px;
            }
            QToolButton {
                background: #38bdf8;
                color: white;
                border: none;
                border-radius: 6px;
                padding: 6px 16px;
                font-weight: bold;
                font-size: 13px;
            }
            QToolButton:hover { background: #0ea5e9; }
            QToolButton:pressed { background: #0284c7; }
        """)
        self.addToolBar(toolbar)

        reload_action = QAction("🔄 重新加载", self)
        reload_action.setShortcut("F5")
        reload_action.triggered.connect(self._reload)
        toolbar.addAction(reload_action)

        spacer = QWidget()
        spacer.setStyleSheet("background: transparent;")
        spacer.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        toolbar.addWidget(spacer)

        hint = QLabel("修改 HTML 后点此刷新  |  快捷键 F5")
        hint.setStyleSheet("color: #64748b; font-size: 12px; background: transparent; border: none;")
        toolbar.addWidget(hint)

    def _reload(self):
        self.browser.setUrl(QUrl.fromLocalFile(self.entry))


if __name__ == '__main__':
    app = QApplication(sys.argv)
    app.setStyle('Fusion')

    window = MainWindow()
    window.show()

    sys.exit(app.exec())
