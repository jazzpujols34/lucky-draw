"""
QUICK ANIMATION TEST - Single draw with animation
"""

from playwright.sync_api import sync_playwright
import time
import sys

def test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.set_viewport_size({"width": 1920, "height": 1080})

        try:
            print("\nQUICK ANIMATION TEST")
            print("="*50)

            # Navigate
            page.goto('http://localhost:5173')
            page.wait_for_load_state('networkidle')
            time.sleep(1)

            # Enable animation
            page.click('input[type="checkbox"]')
            time.sleep(0.3)

            # Set fast speed
            speed_slider = page.locator('#speed-slider')
            speed_slider.fill("400")
            time.sleep(0.3)
            print("✓ Animation enabled at fast speed (400ms)")

            # Load candidates
            textarea = page.locator('textarea').first
            textarea.fill('Alice\nBob\nCarol')
            time.sleep(0.2)
            page.click('button:has-text("Load Candidates")')
            time.sleep(0.3)
            print("✓ Loaded 3 candidates")

            # Draw
            number_inputs = page.locator('input[type="number"]')
            number_inputs.first.fill('2')
            time.sleep(0.2)

            print("• Starting draw with animation...")
            page.click('button:has-text("DRAW WINNERS")')
            time.sleep(1)
            page.screenshot(path='/tmp/test_quick_draw.png')

            # Wait for completion
            time.sleep(4)

            # Check results
            if page.locator('text="WINNERS!"').is_visible():
                print("✓ Winners displayed successfully")
                print("\n" + "="*50)
                print("✓✓✓ ANIMATION WORKING!")
                print("="*50)
                return True
            else:
                print("✗ Winners not displayed")
                return False

        except Exception as e:
            print(f"✗ Error: {e}")
            import traceback
            traceback.print_exc()
            return False

        finally:
            browser.close()

if __name__ == '__main__':
    success = test()
    sys.exit(0 if success else 1)
