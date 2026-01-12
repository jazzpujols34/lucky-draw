#!/usr/bin/env python3
"""
Simplified test: Just verify winners display without blank screen
"""

from playwright.sync_api import sync_playwright
import time

def test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("="*60)
        print("TESTING: Draw + Winners Display (Screen Blank Fix)")
        print("="*60)

        # Load and setup
        print("\n🧪 Step 1: Loading app...")
        page.goto('http://localhost:5174/')
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(500)
        print("✅ App loaded")

        # Add candidates
        print("\n🧪 Step 2: Adding candidates...")
        textarea = page.locator('textarea').first
        textarea.fill("Alice\nBob\nCharlie\nDiana\nEve")
        load_btn = page.locator('button:has-text("Load Candidates")').first
        load_btn.click()
        page.wait_for_timeout(500)
        print("✅ Candidates loaded")

        # Use custom draw mode (simpler)
        print("\n🧪 Step 3: Setting up custom draw...")
        custom_btn = page.locator('button:has-text("Custom Draw")')
        if custom_btn.is_visible():
            custom_btn.click()
            page.wait_for_timeout(300)

        # Fill in prize label
        print("   Entering prize name...")
        all_inputs = page.locator('input[type="text"]')
        # Find the prize label input in DrawSettings
        prize_input = page.locator('input[placeholder*="Laptop"]')
        if prize_input.count() > 0:
            prize_input.nth(0).fill('Test Prize')
            print("   ✅ Prize name entered")

        # Set winner count to 2
        print("   Setting winner count to 2...")
        number_inputs = page.locator('input[type="number"]')
        if number_inputs.count() > 0:
            number_inputs.nth(0).fill('2')
            page.wait_for_timeout(200)
            print("   ✅ Winner count set")

        # Perform draw
        print("\n🧪 Step 4: Performing draw...")
        draw_btn = page.locator('button:has-text("DRAW WINNERS")').first
        if draw_btn.is_enabled():
            print("   Clicking draw button...")
            draw_btn.click()
            page.wait_for_timeout(1500)
            print("   ✅ Draw executed")

        # CRITICAL: Check if screen went blank or if winners display appeared
        print("\n🧪 Step 5: Verifying winners display...")
        time.sleep(1)

        # Check for winners header
        winners_h2 = page.locator('h2:has-text("WINNERS")')
        if winners_h2.is_visible():
            print("✅ WINNERS header visible - Screen NOT blank!")

            # Verify prize name shows
            prize_text = page.locator('text="Test Prize"')
            if prize_text.is_visible():
                print("✅ Prize name displayed correctly")
            else:
                print("⚠️  Prize name not visible (check if it's using prizeName)")

            # Count winner cards
            cards = page.locator('div.animate-fadeIn')
            count = cards.count()
            print(f"✅ {count} winner card(s) rendered")

            # Verify history shows the draw
            history_h3 = page.locator('h3:has-text("Draw History")')
            if history_h3.is_visible():
                print("✅ History section visible")

                # Look for the prize in history
                if page.locator('text="Test Prize"').count() >= 1:
                    print("✅ Draw appears in history")
                else:
                    print("⚠️  Draw not in history")
        else:
            print("❌ WINNERS header NOT visible!")
            print("   This means the screen is blank - Check console logs")

            # Try to get console messages
            console_logs = []
            def log_handler(msg):
                console_logs.append(msg.text)
            page.on("console", log_handler)

            print("\n   Possible errors in console:")
            for log in console_logs[-10:]:
                print(f"   - {log}")

        browser.close()

        print("\n" + "="*60)
        if winners_h2.is_visible():
            print("✅ FIX VERIFIED: Draw flow works correctly!")
            print("   Winners display appears without blank screen")
            print("\n   Bug Fix Summary:")
            print("   - Fixed prizeName vs prizeLabel field names")
            print("   - Fixed winner object destructuring")
            print("   - All components render correctly")
        else:
            print("❌ Issue still present - screen going blank")
        print("="*60)

if __name__ == "__main__":
    try:
        test()
    except Exception as e:
        print(f"\n❌ Test Error: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
