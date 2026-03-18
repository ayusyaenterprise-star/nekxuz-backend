# 🎯 QUICK FIX CARD (Copy & Paste)

## THE PROBLEM
Render using its own empty database instead of Neon (your database with 4 orders)

## THE SOLUTION (2 Steps)

### STEP 1: Set DATABASE_URL on Render
```
Go to: https://dashboard.render.com/
→ Click: nekxuz-backend
→ Settings → Environment
→ Add Environment Variable:

NAME:  DATABASE_URL
VALUE: postgresql://neondb_owner:npg_ihaG8sPfUnX9@ep-dry-lab-aigsw75j-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

→ SAVE
```

### STEP 2: Deploy
```
→ Settings → General → Danger Zone → Clear build cache
→ Deploys tab → Deploy
→ Wait for "Live" (green status)
```

## VERIFY IT WORKED
```
✅ Check Logs tab for: "✅ Database Connection: SUCCESS"

✅ Test command:
   curl "https://nekxuz-backend.onrender.com/api/orders?email=infodevayushenterprise@gmail.com"
   
   Should return: {"ok":true,"orders":[4 orders],"count":4}
```

## THEN
✅ Website's My Orders tab will show 4 orders

---

**TIME: 2 minutes**  
**DIFFICULTY: Super Easy**  
**RESULT: Orders appear! 🎉**
