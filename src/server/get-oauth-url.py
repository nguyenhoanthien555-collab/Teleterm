import sqlite3
import os
import shutil
import sys
import time

def get_latest_oauth_url(max_age_seconds=180):
    appdata = os.environ.get('APPDATA', '')
    localappdata = os.environ.get('LOCALAPPDATA', '')
    
    candidates = [
        os.path.join(appdata, 'Opera Software', 'Opera GX Stable', 'Default', 'History'),
        os.path.join(localappdata, 'Microsoft', 'Edge', 'User Data', 'Default', 'History'),
        os.path.join(localappdata, 'Google', 'Chrome', 'User Data', 'Default', 'History')
    ]
    
    # Chromium epoch is Jan 1, 1601 UTC
    now_epoch = time.time()
    min_chromium_time = int((now_epoch - max_age_seconds + 11644473600) * 1000000)
    
    for hist_path in candidates:
        if not os.path.exists(hist_path):
            continue
        tmp_path = hist_path + f'.teleterm_{os.getpid()}.tmp'
        try:
            shutil.copy2(hist_path, tmp_path)
            conn = sqlite3.connect(tmp_path)
            c = conn.cursor()
            
            # Query 1: OAuth URL for Antigravity (client_id 1071006060591)
            c.execute("""
                SELECT url FROM urls 
                WHERE url LIKE '%accounts.google.com%' 
                  AND url LIKE '%1071006060591%'
                  AND last_visit_time > ?
                ORDER BY last_visit_time DESC 
                LIMIT 1
            """, (min_chromium_time,))
            row = c.fetchone()
            if row and row[0]:
                conn.close()
                return row[0]
            
            # Query 2: Any Account Chooser URL
            c.execute("""
                SELECT url FROM urls 
                WHERE url LIKE '%accounts.google.com/v3/signin/accountchooser%'
                  AND last_visit_time > ?
                ORDER BY last_visit_time DESC 
                LIMIT 1
            """, (min_chromium_time,))
            row = c.fetchone()
            if row and row[0]:
                conn.close()
                return row[0]
                
            conn.close()
        except Exception:
            pass
        finally:
            if os.path.exists(tmp_path):
                try:
                    os.remove(tmp_path)
                except Exception:
                    pass
    return ""

if __name__ == '__main__':
    max_age = 180
    if len(sys.argv) > 1:
        try:
            max_age = int(sys.argv[1])
        except ValueError:
            pass
    url = get_latest_oauth_url(max_age)
    if url:
        print(url)
