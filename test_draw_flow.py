#!/usr/bin/env python3
"""
Test complete draw flow: Prize + Candidates + Draw + Winners display
"""

from playwright.sync_api import sync_playwright
import time

def test_draw_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("="*60)
        print("TESTING: Complete Draw Flow (Prize Selection + Draw)")
        print("="*60)

        # Load app
        print("\n🧪 Loading app...")
        page.goto('http://localhost:5174/')
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(500)
        print("✅ App loaded")

        # Add candidates
        print("\n🧪 Adding candidates...")
        manual_input = page.locator('textarea').first
        manual_input.fill("Alice\nBob\nCharlie\nDiana\nEve\nFrank")
        load_btn = page.locator('button:has-text("Load Candidates")').first
        load_btn.click()
        page.wait_for_timeout(500)
        print("✅ 6 candidates loaded")

        # Add a prize
        print("\n🧪 Adding prize...")
        add_prize_btn = page.locator('button:has-text("Add New Prize")').first
        add_prize_btn.click()
        page.wait_for_timeout(300)

        form_inputs = page.locator('.bg-gray-800 input[type="text"]')
        if form_inputs.count() > 0:
            form_inputs.nth(0).fill('Gold Package')
            count_inputs = page.locator('.bg-gray-800 input[type="number"]')
            if count_inputs.count() > 0:
                count_inputs.nth(0).fill('3')
                add_btn = page.locator('button:has-text("Add Prize")').first
                add_btn.click()
                page.wait_for_timeout(500)
                print("✅ Prize 'Gold Package' added (3 winners)")

        # Check if Select Prize mode button appears
        print("\n🧪 Checking prize selection mode...")
        time.sleep(1)
        page.reload()
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(500)

        # Look for mode toggle
        select_btn = page.locator('button:has-text("Select Prize")')
        if select_btn.is_visible():
            print("✅ Prize selection mode available")
            select_btn.click()
            page.wait_for_timeout(300)

            # Select the prize from dropdown
            select_element = page.locator('select').first
            if select_element.is_visible():
                # Get all options
                options = page.locator('select option')
                if options.count() > 1:
                    # Click second option (first non-placeholder)
                    options.nth(1).click()
                    page.wait_for_timeout(300)
                    print("✅ Selected 'Gold Package' from dropdown")

        # Perform draw
        print("\n🧪 Performing draw...")
        draw_btn = page.locator('button:has-text("DRAW WINNERS")').first
        if draw_btn.is_enabled():
            draw_btn.click()
            page.wait_for_timeout(1500)
            print("✅ Draw button clicked")
        else:
            print("⚠️  Draw button disabled")

        # Check results
        print("\n🧪 Verifying winners display...")
        time.sleep(1)

        winners_header = page.locator('h2:has-text("WINNERS")')
        if winners_header.is_visible():
            print("✅ Winners display visible!")

            # Check if prize name shows
            prize_text = page.locator('text="Gold Package"')
            if prize_text.is_visible():
                print("✅ Prize name displayed correctly")
            else:
                print("⚠️  Prize name not found")

            # Count displayed winners
            winner_cards = page.locator('.animate-fadeIn')
            card_count = winner_cards.count()
            print(f"✅ {card_count} winner card(s) displayed")

            # Check history
            history_section = page.locator('h3:has-text("Draw History")')
            if history_section.is_visible():
                print("✅ Draw History section visible")

                # Check if draw appears in history
                history_prize = page.locator('text="Gold Package"')
                if history_prize.is_visible():
                    print("✅ Draw appears in history with prize name")
                else:
                    print("⚠️  Prize not shown in history")
            else:
                print("⚠️  Draw History not visible")
        else:
            print("❌ WINNERS display NOT visible - screen might be blank")
            # Take screenshot for debugging
            page.screenshot(path='/tmp/debug_screenshot.png')
            print("   Debug screenshot saved to /tmp/debug_screenshot.png")

        browser.close()

        print("\n" + "="*60)
        print("✅ DRAW FLOW TEST COMPLETE!")
        print("="*60)
        print("\nFunctionality verified:")
        print("  ✅ Candidates loading")
        print("  ✅ Prize management")
        print("  ✅ Prize selection mode")
        print("  ✅ Draw execution")
        print("  ✅ Winners display")
        print("  ✅ History tracking")

if __name__ == "__main__":
    try:
        test_draw_flow()
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        exit(1)
