# Stripe Coupon/Promotion Codes Setup Guide

Your Stripe checkout now supports coupon and promotion codes! Here's how to create and manage them.

## ✅ Feature Enabled

The checkout portal now has a **"Add promotion code"** link that guests can click to enter discount codes.

## 📋 How to Create Coupons in Stripe

### Step 1: Go to Stripe Dashboard

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com)
2. Make sure you're in the correct mode:
   - **Test mode** for testing
   - **Live mode** for real discounts

### Step 2: Create a Coupon

1. Go to **Products > Coupons**
2. Click **Create coupon**
3. Fill in the details:

#### **Coupon Type:**
- **Percentage off** (e.g., 10% off, 20% off)
- **Fixed amount off** (e.g., $50 off, $100 off)

#### **Example 1: Percentage Discount**
```
Name: 10% Off Early Bird
Type: Percentage
Amount: 10%
Duration: Once (applies to this booking only)
```

#### **Example 2: Fixed Amount Discount**
```
Name: $100 Off Summer Special
Type: Fixed amount
Amount: 100 AUD
Duration: Once
```

#### **Example 3: Repeating Discount** (for loyalty programs)
```
Name: VIP 15% Off
Type: Percentage
Amount: 15%
Duration: Forever (applies to all future bookings from this customer)
```

4. Click **Create coupon**

### Step 3: Create a Promotion Code

After creating the coupon, you need to create a **promotion code** (the actual code guests type):

1. On the coupon page, click **Add promotion code**
2. Enter the code guests will type:
   - **Examples:** `EARLYBIRD`, `SUMMER2025`, `FRIEND15`
   - **Tips:** Make it memorable and easy to type
3. **Optional settings:**
   - **Expiration date** - Set when code expires
   - **Max redemptions** - Limit how many times it can be used
   - **Minimum amount** - Require minimum booking value
   - **First time customers** - Only new customers
4. Click **Save**

## 🎯 Example Coupon Codes

### **Early Bird Special**
```
Code: EARLYBIRD2025
Type: 10% off
Expires: March 31, 2025
Max uses: 50
```

### **Friend & Family**
```
Code: FRIEND20
Type: 20% off
Expires: Never
Restricted: No
```

### **Long Stay Discount**
```
Code: LONGSTAY100
Type: $100 off
Minimum: $1000
Max uses: 20
```

### **Last Minute Deal**
```
Code: LASTMINUTE15
Type: 15% off
Expires: Weekly (create new codes each week)
Max uses: 5
```

## 📱 How Guests Use Codes

1. Guest selects dates and proceeds to checkout
2. On Stripe checkout page, clicks **"Add promotion code"**
3. Enters the code (e.g., `EARLYBIRD`)
4. Discount is **automatically applied**
5. Updated total is shown before payment

## 💡 Best Practices

### **Code Naming:**
- ✅ Short and memorable: `SUMMER2025`, `VIP15`
- ✅ All caps for consistency
- ❌ Avoid: `sdkfj2398sdfsdf` (hard to remember)

### **Discount Amounts:**
- **10-20% off**: Good for promotions
- **$50-$100 off**: Good for long stays
- **25%+ off**: Use sparingly for special occasions

### **Limitations:**
- Set **expiration dates** for seasonal offers
- Set **max redemptions** to control budget
- Set **minimum amounts** for bigger discounts

### **Testing:**
Always test codes in **test mode** before going live!

## 📊 Tracking Coupon Usage

### View Coupon Performance:
1. Go to **Products > Coupons**
2. Click on a coupon
3. See:
   - Total redemptions
   - Total discount given
   - Revenue impact

### View Individual Uses:
1. Go to **Payments**
2. Filter by coupon code
3. See which bookings used which codes

## 🔄 Managing Codes

### **Deactivate a Code:**
1. Go to coupon page
2. Find the promotion code
3. Click **••• > Deactivate**
4. Code immediately stops working

### **Create Multiple Codes for Same Coupon:**
You can create multiple codes that all give the same discount:
```
SUMMER2025  → 15% off
SUMMER      → 15% off (same coupon)
SAVE15      → 15% off (same coupon)
```

### **Track Which Code Was Used:**
In Stripe Dashboard > Payments, you can see exactly which promotion code each customer used.

## ⚠️ Important Notes

### **Test Mode vs Live Mode:**
- Coupons created in **test mode** only work with test payments
- Coupons created in **live mode** only work with real payments
- You'll need to **create codes in both modes**

### **Codes Apply at Checkout:**
- Discount is calculated by Stripe, not your app
- Works with all payment types
- Automatically handles tax calculations

### **Refunds:**
If you refund a booking that used a coupon:
- The **full amount paid** is refunded (after discount)
- The coupon **can** be used again if not at max redemptions

## 🎁 Popular Use Cases

### **Seasonal Promotions:**
```bash
WINTER2025    # 15% off winter bookings
SPRING2025    # 10% off spring bookings
```

### **Loyalty Program:**
```bash
RETURNGUEST   # 10% off for returning guests
VIP20         # 20% off for VIP customers
```

### **Partner Discounts:**
```bash
CORPORATE15   # 15% off for corporate partners
WEDDING10     # 10% off for wedding guests
```

### **Flash Sales:**
```bash
FLASH50       # $50 off, expires in 48 hours
WEEKEND20     # 20% off, weekend bookings only
```

## 📞 Need Help?

- [Stripe Coupons Documentation](https://stripe.com/docs/billing/subscriptions/coupons)
- [Promotion Codes Guide](https://stripe.com/docs/billing/subscriptions/promotion-codes)

---

**Your checkout is now ready to accept promotion codes!** Just create the codes in Stripe Dashboard and share them with your guests. 🎉

