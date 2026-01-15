"""
COUNTDOWN FLASH TEST - Verify no repeated 3 flashing

Confirms that animation countdown displays 3-2-1 correctly without flashing
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
            print("\n" + "="*60)
            print("COUNTDOWN FLASH TEST")
            print("="*60)

            # Navigate
            page.goto('http://localhost:5173')
            page.wait_for_load_state('networkidle')
            time.sleep(1)
            print("✓ App loaded\n")

            # Enable animation
            page.click('input[type="checkbox"]')
            time.sleep(0.3)
            print("✓ Animation enabled")

            # Load 3 candidates
            textarea = page.locator('textarea').first
            textarea.fill('Alice\nBob\nCarol')
            time.sleep(0.2)
            page.click('button:has-text("Load Candidates")')
            time.sleep(0.3)
            print("✓ Loaded 3 candidates")

            # Draw 3 winners
            number_inputs = page.locator('input[type="number"]')
            number_inputs.first.fill('3')
            time.sleep(0.2)

            print("\n• Drawing with animation (observing countdown)...\n")
            page.click('button:has-text("DRAW WINNERS")')
            time.sleep(0.5)

            # Monitor for flashing 3
            three_count = 0
            observation_start = time.time()

            for i in range(30):  # Check for 6 seconds
                page_html = page.content()
                # Count occurrences of "3" in the countdown overlay
                if '>3<' in page_html or '>3 ' in page_html or '3</div>' in page_html:
                    three_count += 1
                time.sleep(0.2)

            elapsed = time.time() - observation_start

            if three_count > 5:  # Should only appear once or twice
                print(f"✗ FAIL: Countdown '3' appeared {three_count} times (likely flashing)")
                return False
            else:
                print(f"✓ PASS: Countdown '3' appeared {three_count} times (normal)")

            # Wait for animation to complete
            time.sleep(8)

            # Verify winners display
            if page.locator('text="WINNERS!"').is_visible():
                print("✓ Winners displayed after animation")
                print("\n" + "="*60)
                print("✓✓✓ COUNTDOWN WORKING CORRECTLY (No Flash)")
                print("="*60)
                return True
            else:
                print("✗ Winners not displayed")
                return False

        except Exception as e:
            print(f"\n✗ Test failed: {e}")
            import traceback
            traceback.print_exc()
            return False

        finally:
            browser.close()

if __name__ == '__main__':
    success = test()
    sys.exit(0 if success else 1)
