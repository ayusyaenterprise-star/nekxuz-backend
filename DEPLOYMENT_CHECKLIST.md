# ✅ Deployment Checklist

## Phase 1: Preparation ✅
- [x] Stock system fixed and tested
- [x] Out-of-stock prevention implemented
- [x] Razorpay switched to production mode
- [x] Backend API URL corrected
- [x] Database schema migrated to PostgreSQL
- [x] Firebase alternative prepared

## Phase 2: Firebase Setup (Choose This)

### Prerequisites
- [ ] Firebase account created (FREE)
- [ ] Firebase CLI installed: `npm install -g firebase-tools`
- [ ] Node.js 18+ installed

### Firebase Deployment
- [ ] Run `firebase login`
- [ ] Run `firebase init` in project root
- [ ] Select: Firestore, Cloud Functions, Hosting
- [ ] Run `firebase deploy`
- [ ] Note the Cloud Functions URL

### Frontend Update
- [ ] Edit `src/App.js` line 12
- [ ] Change `API_BASE_URL` to Firebase function URL
- [ ] Run `npm run build`
- [ ] Upload `new_build/` to Hostinger

### Testing
- [ ] Visit https://nekxuz.in
- [ ] Add product to cart
- [ ] Go to checkout
- [ ] Enter shipping details
- [ ] Click "Pay Now"
- [ ] Complete Razorpay payment
- [ ] Verify order appears in "My Orders"
- [ ] Check Firestore for saved order
- [ ] Check Shiprocket for created shipment

## Phase 3: Live Verification

### Functionality Tests
- [ ] Stock display shows correct quantities
- [ ] Can't add out-of-stock items to cart
- [ ] Payment processes without errors
- [ ] Order saved with correct details
- [ ] Order visible in user account
- [ ] Shiprocket shipment created

### Performance Tests
- [ ] Page loads in <3 seconds
- [ ] Checkout completes in <5 seconds
- [ ] Payment verifies in <2 seconds
- [ ] Order appears instantly

### Security Tests
- [ ] Razorpay signature verified
- [ ] Firestore rules preventing unauthorized access
- [ ] Environment variables not exposed
- [ ] CORS properly configured

## Phase 4: Monitoring

### Daily
- [ ] Check Firebase functions logs
- [ ] Monitor Razorpay transactions
- [ ] Verify Shiprocket shipments

### Weekly
- [ ] Review Firestore usage
- [ ] Check Firebase cost ($0 expected)
- [ ] Test payment with real transaction

### Monthly
- [ ] Archive old orders
- [ ] Review performance metrics
- [ ] Update inventory as needed

## Phase 5: Maintenance

### Backup
- [ ] Export Firestore data monthly
- [ ] Keep git repo updated
- [ ] Document any issues

### Updates
- [ ] Monitor Firebase updates
- [ ] Monitor Razorpay updates
- [ ] Monitor Shiprocket updates

## Rollback Plan

If Firebase doesn't work:
1. [ ] Revert `API_BASE_URL` to Render URL
2. [ ] Run `npm run build`
3. [ ] Upload to Hostinger
4. [ ] Test previous deployment
5. Time needed: **5 minutes**

## Success Criteria

Your deployment is successful when:

✅ All tests pass  
✅ No errors in console  
✅ Firebase cost remains $0  
✅ Orders saved in Firestore  
✅ Shipments created in Shiprocket  
✅ Real payment processed  
✅ Customer receives order confirmation  

---

## Quick Reference

| Action | Command |
|--------|---------|
| Deploy Firebase | `firebase deploy` |
| View logs | `firebase functions:log` |
| Stop emulator | `Ctrl+C` |
| Rebuild React | `npm run build` |
| Deploy React | Upload `new_build/` to Hostinger |

## Important Dates

| Event | Date | Status |
|-------|------|--------|
| Backend migration | Today | ✅ READY |
| Frontend update | Today | ✅ READY |
| Go live | Today | ✅ READY |
| First real order | TBD | ⏳ PENDING |

---

## Contact

For support:
1. Check documentation
2. Review Firebase logs
3. Test with Postman
4. Verify .env variables

**Everything is ready to deploy!** 🚀
