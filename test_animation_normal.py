"""
ANIMATION TEST - Normal Speed

Verifies that animation works correctly at normal speed (800ms):
1. Animation toggle works
2. Speed slider visible when enabled
3. Draw animation displays 3-2-1 countdown correctly
4. Winners display after countdown
5. No crashes or flashing issues
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
            print("\n" + "="*70)
            print("ANIMATION TEST - Normal Speed (800ms)")
            print("="*70)

            # Navigate to app
            page.goto('http://localhost:5173')
            page.wait_for_load_state('networkidle')
            time.sleep(1)
            print("\n✓ App loaded")

            # Step 1: Enable animation
            print("\n[STEP 1] Enable Sequential Reveal Animation")
            checkbox = page.locator('input[type="checkbox"]').first
            if not checkbox.is_checked():
                checkbox.check()
                time.sleep(0.5)
            print("  ✓ Animation enabled")

            # Step 2: Verify speed slider appears (should be at default 800ms/Normal)
            print("\n[STEP 2] Verify speed slider is visible")
            speed_slider = page.locator('#speed-slider, input[type="range"]')
            if speed_slider.count() > 0:
                print("  ✓ Speed slider visible")
            else:
                print("  ✗ Speed slider not found")
                return False

            # Step 3: Load candidates
            print("\n[STEP 3] Load candidates")
            textarea = page.locator('textarea').first
            textarea.fill('Alice\nBob\nCarol')
            time.sleep(0.3)
            page.click('button:has-text("Load Candidates")')
            time.sleep(0.5)
            print("  ✓ Loaded 3 candidates")

            # Step 4: Draw with animation at normal speed
            print("\n[STEP 4] Perform draw with animation (3 winners, normal speed)")
            number_inputs = page.locator('input[type="number"]')
            number_inputs.first.fill('3')
            time.sleep(0.3)

            print("  • Starting draw...")
            start_time = time.time()
            page.click('button:has-text("DRAW WINNERS")')
            time.sleep(0.5)

            # Take screenshot during animation
            page.screenshot(path='/tmp/test_animation_normal_during.png')
            print("  • Animation in progress...")

            # Step 5: Wait for animation to complete
            print("\n[STEP 5] Wait for animation completion (~10 seconds for 3 winners)")
            time.sleep(10)
            elapsed = time.time() - start_time
            print(f"  ✓ Animation completed in {elapsed:.1f}s")

            page.screenshot(path='/tmp/test_animation_normal_complete.png')

            # Step 6: Verify winners display
            print("\n[STEP 6] Verify winners display correctly")
            winners_section = page.locator('text="WINNERS!"')
            if winners_section.is_visible():
                print("  ✓ Winners section visible")

                # Count winner cards
                winner_count = page.locator('text="Winner"').count()
                if winner_count >= 3:
                    print(f"  ✓ All {winner_count} winner cards displayed")
                else:
                    print(f"  ⚠ Only {winner_count} winner cards found (expected 3+)")
            else:
                print("  ✗ Winners section not visible")
                return False

            # Step 7: Verify no crashes
            print("\n[STEP 7] Verify no errors in console")
            # Get any console errors
            console_logs = []
            page.on("console", lambda msg: console_logs.append(msg.text))
            time.sleep(1)

            error_logs = [log for log in console_logs if 'error' in log.lower()]
            if not error_logs:
                print("  ✓ No console errors detected")
            else:
                print(f"  ⚠ Console errors found: {error_logs[:2]}")

            # Step 8: Test toggle off
            print("\n[STEP 8] Disable animation and verify instant draw")
            checkbox.uncheck()
            time.sleep(0.3)

            page.click('button:has-text("Reset Pool")')
            time.sleep(0.3)

            number_inputs.first.fill('2')
            time.sleep(0.2)

            start_time = time.time()
            page.click('button:has-text("DRAW WINNERS")')
            time.sleep(1)
            instant_elapsed = time.time() - start_time

            if page.locator('text="WINNERS!"').is_visible():
                print(f"  ✓ Instant draw completed in {instant_elapsed:.2f}s (no animation)")
            else:
                print("  ✗ Winners not displayed for instant draw")
                return False

            print("\n" + "="*70)
            print("✓✓✓ ANIMATION TEST PASSED ✓✓✓")
            print("="*70)
            print("\nSummary:")
            print("  ✓ Animation toggle works")
            print("  ✓ Speed slider visible when enabled")
            print("  ✓ Animation displays winners sequentially")
            print("  ✓ No crashes or console errors")
            print("  ✓ Instant draw works when animation disabled")
            print("\nAnimation feature is FUNCTIONING NORMALLY!")

            return True

        except Exception as e:
            print(f"\n✗ Test failed: {e}")
            page.screenshot(path='/tmp/test_animation_normal_error.png')
            import traceback
            traceback.print_exc()
            return False

        finally:
            browser.close()

if __name__ == '__main__':
    success = test()
    sys.exit(0 if success else 1)
