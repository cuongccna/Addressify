# 🧪 PHASE 4A - MANUAL TESTING GUIDE

## 🎯 Quick Start

### **Prerequisites**
1. ✅ Phase 3 completed (database integration)
2. ✅ User account created
3. ✅ At least one shop configured
4. ✅ Some quotes saved to database

---

## 📋 **TEST SCENARIO 1: First Visit**

### **Steps:**
1. Start dev server: `npm run dev`
2. Login at `http://localhost:3000/auth/sign-in`
3. You should see navigation with "🎯 Báo giá" and "📊 Lịch sử"
4. Click "📊 Lịch sử"

### **Expected Result:**
```
✓ Redirects to /history
✓ Shows dashboard with statistics
✓ Shows "No data" if no quotes exist
✓ Shows shop selector in header
```

### **If No Quotes:**
```
┌────────────────────────────────────────────┐
│ ⚠️ Không có dữ liệu phù hợp với bộ lọc     │
└────────────────────────────────────────────┘
```

### **Action:** Create some quotes first!
- Go to "🎯 Báo giá"
- Enter addresses and request quotes
- Return to "📊 Lịch sử"

---

## 📋 **TEST SCENARIO 2: View Statistics**

### **With Quote Data:**
You should see 4 statistics cards:

```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ Tổng số báo giá │ Phí ship TB     │ Phí thấp nhất   │ Tiết kiệm TN    │
│                 │                 │                 │                 │
│      [N]        │   [XX,XXX]₫     │   [XX,XXX]₫     │   [XXX,XXX]₫    │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘

Purple card        Blue card         Green card        Orange card
```

### **Verify:**
- [ ] All 4 cards display numbers
- [ ] Numbers make sense (no NaN, no negative)
- [ ] Currency format correct (comma separators)
- [ ] Colors are distinct

---

## 📋 **TEST SCENARIO 3: Provider Distribution**

### **Expected View:**
```
┌───────────────────────────────────────────────────────────────┐
│ 📈 Phân bố nhà cung cấp                                       │
├───────────────────────────────────────────────────────────────┤
│  GHN        GHTK         VTP         GHN Express              │
│   [N]        [N]         [N]           [N]                    │
└───────────────────────────────────────────────────────────────┘
```

### **Verify:**
- [ ] Shows all providers you've used
- [ ] Counts are accurate
- [ ] Layout is grid (responsive)
- [ ] Each provider in separate box

---

## 📋 **TEST SCENARIO 4: Search Filter**

### **Steps:**
1. Type recipient name in search box
2. Type partial phone number
3. Type partial address
4. Clear search box

### **Test Cases:**
```
Search: "Nguyễn"
→ Should filter to only names containing "Nguyễn"

Search: "090"
→ Should filter to phones starting with 090

Search: "Quận 1"
→ Should filter to addresses in Quận 1

Clear search
→ Should show all quotes again
```

### **Verify:**
- [ ] Search is case-insensitive
- [ ] Search updates in real-time (as you type)
- [ ] Statistics update with filtered data
- [ ] Table shows only matching records
- [ ] "No data" message when no matches

---

## 📋 **TEST SCENARIO 5: Provider Filter**

### **Steps:**
1. Select "GHN" from provider dropdown
2. Select "GHTK"
3. Select "VTP"
4. Select "All" to reset

### **Expected Behavior:**
```
Provider: GHN
→ Only shows quotes that include GHN

Provider: GHTK
→ Only shows quotes that include GHTK

Provider: All
→ Shows all quotes again
```

### **Verify:**
- [ ] Dropdown lists all providers
- [ ] Filter works correctly for each provider
- [ ] Statistics update with filtered data
- [ ] "All" option shows everything

---

## 📋 **TEST SCENARIO 6: Date Range Filter**

### **Test Cases:**

#### **Case 1: Today Only**
```
From: [Today's date]
To:   [Today's date]
→ Should show only today's quotes
```

#### **Case 2: This Week**
```
From: [Monday of this week]
To:   [Today]
→ Should show this week's quotes
```

#### **Case 3: From Date Only**
```
From: [Last week]
To:   [empty]
→ Should show quotes from last week onwards
```

#### **Case 4: To Date Only**
```
From: [empty]
To:   [Today]
→ Should show all quotes up to today
```

#### **Case 5: Future Date**
```
From: [Tomorrow]
To:   [Next week]
→ Should show "No data" (no future quotes)
```

### **Verify:**
- [ ] Date picker works correctly
- [ ] Filtering is accurate
- [ ] Both from and to work together
- [ ] Single date filters work
- [ ] Statistics update correctly

---

## 📋 **TEST SCENARIO 7: Sorting**

### **Test Sort by Date:**
```
Sort: Date → Order: Desc
→ Newest quotes first

Sort: Date → Order: Asc
→ Oldest quotes first
```

### **Test Sort by Amount:**
```
Sort: Amount → Order: Desc
→ Highest fee first

Sort: Amount → Order: Asc
→ Lowest fee first
```

### **Verify:**
- [ ] Both sort options work
- [ ] Order toggle works
- [ ] Table reorders correctly
- [ ] First row matches expected order

---

## 📋 **TEST SCENARIO 8: Results Table**

### **Expected Table Structure:**
```
┌────────────┬──────────────┬─────────────┬────────────┬───────────┐
│ Ngày giờ   │ Người nhận   │ Địa chỉ     │ Báo giá    │ Tốt nhất  │
├────────────┼──────────────┼─────────────┼────────────┼───────────┤
│ 04/10 14:30│ Nguyễn Văn A │ 123 Street  │ GHN: 25k   │  GHN      │
│            │ 0901234567   │ Quận 1, HCM │ GHTK: 30k  │ 25,000₫   │
│            │              │ 85% tin cậy │ VTP: 28k   │ ⏱️ 1-2 ngày│
└────────────┴──────────────┴─────────────┴────────────┴───────────┘
```

### **Check Each Column:**

#### **Column 1: Date/Time**
- [ ] Format: DD/MM HH:MM
- [ ] Vietnamese locale
- [ ] Sorted correctly

#### **Column 2: Recipient**
- [ ] Name displayed
- [ ] Phone below name
- [ ] Text color readable

#### **Column 3: Address**
- [ ] Normalized address shown
- [ ] Province, District, Ward below
- [ ] Confidence badge displayed
- [ ] Badge color matches confidence:
  - 🟢 Green: 80-100%
  - 🟡 Yellow: 60-79%
  - 🔴 Red: <60%
- [ ] Long addresses truncate with hover tooltip

#### **Column 4: All Quotes**
- [ ] Each provider listed
- [ ] Amount next to provider
- [ ] Best quote has green background
- [ ] Amounts formatted with commas

#### **Column 5: Best Quote**
- [ ] Provider name in green
- [ ] Amount displayed
- [ ] Delivery time if available
- [ ] Matches lowest amount in quotes

### **Interaction Tests:**
- [ ] Hover on row highlights it
- [ ] Hover on long address shows full text
- [ ] Table scrolls horizontally on mobile
- [ ] All data readable

---

## 📋 **TEST SCENARIO 9: CSV Export**

### **Steps:**
1. Click "📥 Export CSV (N)" button
2. File should download automatically
3. Open file in Excel

### **Verify File:**
- [ ] Filename format: `quote-history-YYYY-MM-DD.csv`
- [ ] File downloads successfully
- [ ] Opens in Excel without errors
- [ ] Vietnamese characters display correctly (UTF-8 BOM)
- [ ] All columns present
- [ ] Data matches table

### **Check CSV Contents:**
```csv
Ngày giờ,Người nhận,SĐT,Địa chỉ gốc,...
"04/10/2025 14:30:00","Nguyễn Văn A","0901234567",...
```

### **Verify Columns:**
- [ ] Date/Time
- [ ] Recipient name
- [ ] Phone
- [ ] Original address
- [ ] Normalized address
- [ ] Province, District, Ward
- [ ] Confidence score
- [ ] Weight, Value
- [ ] Provider, Service, Amount, Delivery time
- [ ] Notes

### **Test with Filters:**
```
1. Apply search filter
2. Export CSV
3. Verify CSV only contains filtered data

Button text should show: "📥 Export CSV (N)"
Where N = number of filtered records
```

---

## 📋 **TEST SCENARIO 10: Reset Filters**

### **Steps:**
1. Apply multiple filters:
   - Search: "Nguyễn"
   - Provider: "GHN"
   - Date from: "Last week"
   - Sort by: "Amount"
2. Click "🔄 Reset"

### **Expected Result:**
- [ ] Search box clears
- [ ] Provider resets to "All"
- [ ] Date fields clear
- [ ] Sort resets to "Date, Desc"
- [ ] All quotes visible again
- [ ] Statistics show full dataset

---

## 📋 **TEST SCENARIO 11: Multi-Shop Testing**

### **Steps:**
1. Create multiple shops
2. Add quotes to Shop A
3. Switch to Shop B in header
4. Check dashboard

### **Expected:**
```
Shop A selected:
→ Shows Shop A's quotes

Switch to Shop B:
→ Dashboard updates
→ Shows Shop B's quotes
→ Statistics recalculate

Shop B has no quotes:
→ Shows "No data" message
```

### **Verify:**
- [ ] Shop selector updates dashboard
- [ ] Data loads for correct shop
- [ ] Statistics are shop-specific
- [ ] No mixing of shop data

---

## 📋 **TEST SCENARIO 12: Responsive Design**

### **Desktop (>1024px):**
- [ ] Statistics: 4 columns
- [ ] Provider grid: 4 columns
- [ ] Filters: 4 columns in one row
- [ ] Table: Full width, no scroll

### **Tablet (768px-1024px):**
- [ ] Statistics: 2 columns
- [ ] Provider grid: 2-4 columns
- [ ] Filters: 2 columns per row
- [ ] Table: Scrolls horizontally if needed

### **Mobile (<768px):**
- [ ] Statistics: 1 column
- [ ] Provider grid: 2 columns
- [ ] Filters: 1 column (stacked)
- [ ] Table: Definitely scrolls horizontally
- [ ] All text readable
- [ ] Buttons large enough to tap

### **Test Method:**
1. Open dev tools (F12)
2. Toggle device toolbar
3. Test at: 375px, 768px, 1024px, 1920px

---

## 📋 **TEST SCENARIO 13: Loading States**

### **Initial Load:**
```
Loading state should show:
┌────────────────────────────────────┐
│ ⏳ Đang tải lịch sử...             │
└────────────────────────────────────┘
```

### **After Load:**
- [ ] Loading message disappears
- [ ] Data displays
- [ ] No flash of wrong content

### **Slow Network Simulation:**
1. Open dev tools → Network tab
2. Set throttling to "Slow 3G"
3. Refresh page
4. Verify loading state visible for longer

---

## 📋 **TEST SCENARIO 14: Error Handling**

### **Test Network Error:**
1. Stop backend server
2. Visit /history page
3. Should show error message:
```
┌────────────────────────────────────┐
│ ❌ Lỗi: Failed to fetch...        │
│ [Thử lại]                          │
└────────────────────────────────────┘
```
4. Click "Thử lại" button
5. Start server
6. Click again → Data loads

### **Test Auth Error:**
1. Clear cookies
2. Visit /history
3. Should redirect to /auth/sign-in

### **Test No Shop Selected:**
1. Login but don't select shop
2. Visit /history
3. Should show warning:
```
⚠️ Vui lòng chọn shop từ menu trên để xem lịch sử
```

---

## 📋 **TEST SCENARIO 15: Performance**

### **Large Dataset Test:**
1. Create 100+ quotes (use bulk quote feature)
2. Visit /history
3. Test all filters

### **Verify:**
- [ ] Page loads in <2 seconds
- [ ] Filters respond instantly
- [ ] No lag when typing in search
- [ ] Sorting is instant
- [ ] Export completes in <5 seconds
- [ ] No browser freeze

### **Memory Leak Test:**
1. Open /history
2. Apply various filters 20+ times
3. Open dev tools → Memory tab
4. Take heap snapshot
5. Check for memory growth

---

## 📋 **TEST SCENARIO 16: Edge Cases**

### **Case 1: Single Quote**
```
Quote with only 1 provider:
→ Still displays correctly
→ No "best quote" highlighting needed
→ Savings = 0 for this quote
```

### **Case 2: Same Amount**
```
Multiple providers with same amount:
→ First one is "best"
→ All show same amount
```

### **Case 3: Very Long Address**
```
Address > 100 characters:
→ Truncates in table
→ Full text on hover
→ No layout break
```

### **Case 4: Special Characters**
```
Name: "Nguyễn Văn A & B (Test)"
→ Displays correctly
→ CSV escapes properly
→ Search works
```

### **Case 5: No Confidence Score**
```
Quote without confidence:
→ No badge displayed
→ No error thrown
```

---

## ✅ **FINAL CHECKLIST**

### **Functionality:**
- [ ] All filters work independently
- [ ] Filters work together
- [ ] Statistics calculate correctly
- [ ] Table displays all data
- [ ] Export works
- [ ] Reset works

### **UI/UX:**
- [ ] Design matches specification
- [ ] Colors are consistent
- [ ] Text is readable
- [ ] Buttons are clickable
- [ ] No layout issues

### **Performance:**
- [ ] Page loads fast
- [ ] Filters are instant
- [ ] No lag or freeze
- [ ] Memory usage stable

### **Security:**
- [ ] Auth required
- [ ] Shop validation works
- [ ] Cannot see other user's data
- [ ] RLS enforced

### **Responsive:**
- [ ] Works on mobile
- [ ] Works on tablet
- [ ] Works on desktop
- [ ] Works on large screens

### **Edge Cases:**
- [ ] No data handled
- [ ] Single quote handled
- [ ] Long text handled
- [ ] Special characters handled

---

## 🎯 **PASS CRITERIA**

To pass Phase 4A testing, ALL of these must work:

1. ✅ Dashboard loads without errors
2. ✅ Statistics display correct numbers
3. ✅ All 4 filter types work
4. ✅ Sorting works both ways
5. ✅ Table displays data correctly
6. ✅ Best quote is highlighted
7. ✅ CSV export downloads
8. ✅ CSV opens correctly in Excel
9. ✅ Reset clears all filters
10. ✅ Responsive on mobile/tablet/desktop

---

## 🐛 **BUG REPORT TEMPLATE**

If you find issues, report using this format:

```
Bug Title: [Brief description]

Steps to Reproduce:
1. 
2. 
3. 

Expected Result:
[What should happen]

Actual Result:
[What actually happened]

Screenshot:
[Attach if possible]

Environment:
- Browser: [Chrome/Firefox/Safari]
- Screen size: [Mobile/Tablet/Desktop]
- Data size: [Number of quotes]
```

---

## 📞 **TROUBLESHOOTING**

### **Problem: Dashboard shows "No data" but I have quotes**
**Solution:**
1. Check if shop is selected in header
2. Check if filters are too restrictive
3. Click "Reset" to clear filters
4. Refresh page (F5)

### **Problem: CSV export not working**
**Solution:**
1. Check browser's download settings
2. Check if popup blocker is enabled
3. Try different browser
4. Check console for errors (F12)

### **Problem: Statistics show NaN or 0**
**Solution:**
1. Verify quotes have amount > 0
2. Check database quote structure
3. Refresh page
4. Check console for errors

### **Problem: Very slow performance**
**Solution:**
1. Check number of quotes (>500?)
2. Clear browser cache
3. Restart dev server
4. Check database query performance

---

## 🎉 **SUCCESS!**

If all tests pass, Phase 4A is working perfectly! 🚀

**Next Steps:**
- Deploy to production
- Or proceed to Phase 4B (Charts & Advanced Analytics)

---

*Happy Testing! 🧪*  
*Phase 4A - Quote History Dashboard*  
*October 4, 2025*
