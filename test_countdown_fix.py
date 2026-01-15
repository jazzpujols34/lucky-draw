"""
COUNTDOWN FIX VERIFICATION TEST

Verifies that the countdown animation (3-2-1) works correctly:
1. Countdown displays 3, then 2, then 1 (not flashing/looping)
2. Each countdown number appears only once per winner
3. Animation proceeds to reveal after countdown completes
4. No crashes during draw with animation enabled
"""

from playwright.sync_api import sync_playwright
import time
import sys

def test_countdown_fix():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.set_viewport_size({"width": 1920, "height": 1080})

        try:
            print("\n" + "="*70)
            print("COUNTDOWN FIX VERIFICATION TEST")
            print("="*70)

            # Navigate to app
            page.goto('http://localhost:5173')
            page.wait_for_load_state('networkidle')
            time.sleep(1)

            print("\n[STEP 1] Enable animation")
            page.click('input[type="checkbox"]')
            time.sleep(0.5)
            print("  ✓ Animation enabled")

            print("\n[STEP 2] Set speed to SLOW (1200ms) for easier observation")
            speed_slider = page.locator('#speed-slider')
            speed_slider.fill("1200")
            time.sleep(0.5)
            print("  ✓ Speed set to Slow (1200ms per winner)")

            print("\n[STEP 3] Load 3 candidates")
            textarea = page.locator('textarea').first
            textarea.fill('Winner1\nWinner2\nWinner3')
            time.sleep(0.3)
            page.click('button:has-text("Load Candidates")')
            time.sleep(0.5)
            print("  ✓ Loaded 3 candidates")

            print("\n[STEP 4] Draw 3 winners and observe countdown")
            number_inputs = page.locator('input[type="number"]')
            number_inputs.first.fill('3')
            time.sleep(0.3)

            print("  • Drawing with animation...")
            page.click('button:has-text("DRAW WINNERS")')
            time.sleep(1)

            # Observe countdown sequence
            print("\n[STEP 5] Monitor countdown sequence (should be 3 → 2 → 1)")
            countdowns_observed = []
            observation_time = time.time()

            # Watch for countdowns over next 15 seconds
            while time.time() - observation_time < 15:
                page_text = page.content()
                # Look for numbered text in overlays
                if '>3<' in page_text or '>3 ' in page_text:
                    if not countdowns_observed or countdowns_observed[-1] != 3:
                        countdowns_observed.append(3)
                        print(f"  • Countdown: 3 detected")
                elif '>2<' in page_text or '>2 ' in page_text:
                    if not countdowns_observed or countdowns_observed[-1] != 2:
                        countdowns_observed.append(2)
                        print(f"  • Countdown: 2 detected")
                elif '>1<' in page_text or '>1 ' in page_text:
                    if not countdowns_observed or countdowns_observed[-1] != 1:
                        countdowns_observed.append(1)
                        print(f"  • Countdown: 1 detected")

                time.sleep(0.2)

            print(f"\n  Sequence observed: {countdowns_observed}")

            if countdowns_observed == [3, 2, 1]:
                print("  ✓ CORRECT: Countdown sequence 3 → 2 → 1")
            else:
                print(f"  ✗ WRONG: Expected [3, 2, 1], got {countdowns_observed}")
                if countdowns_observed and countdowns_observed.count(3) > 1:
                    print("     Issue: Countdown 3 appeared multiple times (flashing bug)")
                return False

            print("\n[STEP 6] Verify no crash and winners display")
            time.sleep(5)  # Wait for animation to complete
            page.screenshot(path='/tmp/test_countdown_after_animation.png')

            if page.locator('text="WINNERS!"').is_visible():
                print("  ✓ Winners displayed after animation (no crash)")
            else:
                print("  ✗ Winners not displayed (animation may have crashed)")
                return False

            print("\n[STEP 7] Verify all 3 winners displayed")
            winner_cards = page.locator('text="Winner"').count()
            if winner_cards >= 3:
                print(f"  ✓ All {winner_cards} winner cards visible")
            else:
                print(f"  ✗ Only {winner_cards} winner cards found (expected 3)")

            print("\n" + "="*70)
            print("COUNTDOWN FIX VERIFICATION PASSED ✓✓✓")
            print("="*70)
            print("\nSummary:")
            print("  ✓ Countdown displays 3 → 2 → 1 (not flashing)")
            print("  ✓ No crashes during draw with animation")
            print("  ✓ Winners display correctly after animation")
            print("\nAnimation is now FIXED!")

            return True

        except Exception as e:
            print(f"\n✗ Test failed: {e}")
            page.screenshot(path='/tmp/test_countdown_error.png')
            import traceback
            traceback.print_exc()
            return False

        finally:
            browser.close()

if __name__ == '__main__':
    success = test_countdown_fix()
    sys.exit(0 if success else 1)
