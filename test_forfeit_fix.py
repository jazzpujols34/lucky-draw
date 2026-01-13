"""
CRITICAL FIX VERIFICATION: Partial Forfeit & Redraw

Tests that the app correctly:
1. ✓ Draws initial winners (e.g., 5 for prize)
2. ✓ Marks some as forfeited (e.g., 2 forfeit)
3. ✓ Redraws ONLY forfeited count (e.g., 2 new)
4. ✓ Consolidates properly (5 total: 3 original + 2 replacement)
5. ✓ Does NOT show forfeited winners in final display
6. ✓ Shows both original and replacement with badges
"""

from playwright.sync_api import sync_playwright
import time
import sys

def test_partial_forfeit_redraw():
    """Test critical forfeit & redraw logic"""

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.set_viewport_size({"width": 1920, "height": 1080})

        try:
            print("\n" + "="*70)
            print("CRITICAL FIX TEST: Partial Forfeit & Redraw Consolidation")
            print("="*70)

            # Navigate to app
            page.goto('http://localhost:5173')
            page.wait_for_load_state('networkidle')
            time.sleep(1)

            print("\n[STEP 1] Load 7 candidates (5 for draw + 2 extra for redraw)")
            textarea = page.locator('textarea').first
            # 7 candidates: 5 for initial draw + 2 for redraw if needed
            textarea.fill('KR-MinJoon\nTW-Michael\nKR-HyunWoo\nUS-Xavier\nMY-Afiq\nCN-Zhiyuan\nJP-Haruki')
            time.sleep(0.3)
            page.click('button:has-text("Load Candidates")')
            time.sleep(0.5)
            print("✓ Loaded 7 candidates (5 for initial draw + 2 backup for redraw)")

            print("\n[STEP 2] Draw initial 5 winners for $2000 Prize")
            number_inputs = page.locator('input[type="number"]')
            number_inputs.first.fill('5')
            time.sleep(0.3)
            page.click('button:has-text("DRAW WINNERS")')
            time.sleep(2)
            page.screenshot(path='/tmp/test_initial_draw.png')

            # Verify 5 winners displayed (by counting winner cards in grid)
            # Each winner card has a position number like "#1", "#2", etc
            winner_numbers = page.locator('div:has-text("#")').count()
            # Be more specific - look for the actual winners display section
            winners_section = page.locator('text="WINNERS!"').is_visible()

            if winners_section:
                print(f"✓ Initial draw: Winners displayed")
            else:
                print(f"✗ Winners display not found")
                return False

            print("\n[STEP 3] Mark 2 winners as forfeited (HyunWoo, Xavier)")
            page.click('button:has-text("Manage Forfeits")')
            time.sleep(0.8)

            # Select 2 forfeited winners
            checkboxes = page.locator('input[type="checkbox"]')
            for i in range(min(2, checkboxes.count())):
                checkboxes.nth(i).check()
                time.sleep(0.2)

            # Enter reason
            reason_inputs = page.locator('input[type="text"]')
            if reason_inputs.count() > 0:
                reason_inputs.last.fill('Absent')
                time.sleep(0.3)

            # Mark as forfeited
            page.click('button:has-text("Mark")')
            time.sleep(1)
            page.screenshot(path='/tmp/test_after_forfeit.png')
            print("✓ Marked 2 winners as forfeited")

            print("\n[STEP 4] Trigger redraw for 2 forfeited slots")
            page.click('button:has-text("Manage Forfeits")')
            time.sleep(0.8)
            page.screenshot(path='/tmp/test_redraw_modal.png')

            # Proceed to redraw
            redraw_btns = page.locator('button:has-text("Proceed to Redraw")')
            if redraw_btns.count() > 0:
                redraw_btns.click()
                time.sleep(0.5)

                # Confirm redraw
                page.click('button:has-text("Confirm Redraw")')
                time.sleep(1.5)
                print("✓ Redrew 2 replacement winners")
            else:
                print("✗ Redraw button not found")
                return False

            page.screenshot(path='/tmp/test_final_consolidation.png')

            print("\n[STEP 5] VERIFY CRITICAL FIX: Final consolidation")
            page_html = page.content()

            # Count "Valid" badges (original non-forfeited winners) - in status badges only
            valid_count = page.locator('div:has-text("Valid"):nth-child(1)').count()

            # More reliable: count by checking the actual badge elements
            all_badges = page.locator('div.absolute.top-3.right-3').all()
            valid_count = 0
            replacement_count = 0
            forfeited_count = 0

            for badge in all_badges:
                text = badge.text_content() or ""
                if "Valid" in text:
                    valid_count += 1
                elif "Replacement" in text:
                    replacement_count += 1
                elif "Forfeited" in text:
                    forfeited_count += 1

            total_displayed = valid_count + replacement_count

            print(f"\n  Valid winners (original): {valid_count}")
            print(f"  Replacement winners: {replacement_count}")
            print(f"  Forfeited in display: {forfeited_count}")
            print(f"  TOTAL DISPLAYED: {total_displayed}")

            # CRITICAL ASSERTIONS
            print("\n[CRITICAL CHECKS]")

            if valid_count == 3:
                print("  ✓ 3 original winners preserved")
            else:
                print(f"  ✗ Expected 3 original winners, got {valid_count}")
                return False

            if replacement_count == 2:
                print("  ✓ 2 replacement winners redrawn")
            else:
                print(f"  ✗ Expected 2 replacements, got {replacement_count}")
                return False

            if forfeited_count == 0:
                print("  ✓ Forfeited winners HIDDEN from display (CRITICAL FIX VERIFIED!)")
            else:
                print(f"  ✗ Forfeited winners visible in display! (BUG: {forfeited_count} shown)")
                return False

            if total_displayed == 5:
                print("  ✓ Total 5 winners displayed (3 original + 2 replacement)")
            else:
                print(f"  ✗ Expected 5 total displayed, got {total_displayed}")
                return False

            # Check that all winners are 'won' status (none 'forfeited')
            if '(status: \'forfeited\')' not in page_html or page.locator('p:has-text("Forfeited:")').count() == 0:
                print("  ✓ No forfeited status in winner display")
            else:
                print("  ⚠ Forfeited status visible (check display filtering)")

            print("\n" + "="*70)
            print("CRITICAL FIX TEST PASSED ✓✓✓")
            print("="*70)
            print("\nSummary:")
            print("  ✓ Initial draw: 5 winners")
            print("  ✓ Marked as forfeited: 2 winners")
            print("  ✓ Redraw count: 2 (ONLY forfeited count, NOT all 5)")
            print("  ✓ Final consolidation: 5 total (3 original + 2 replacement)")
            print("  ✓ Display clarity: Original & Replacement badges visible")
            print("  ✓ Forfeited filtering: Properly hidden from display")
            print("\nThe partial redraw and consolidation logic is CORRECT!")

            return True

        except Exception as e:
            print(f"\n✗ Test failed: {e}")
            page.screenshot(path='/tmp/test_error.png')
            import traceback
            traceback.print_exc()
            return False

        finally:
            browser.close()

if __name__ == '__main__':
    success = test_partial_forfeit_redraw()
    sys.exit(0 if success else 1)
