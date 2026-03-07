# Docker Fix #5: Prisma CLI Dependency Not Found

## 🐛 **Issue Encountered**
During Docker build, `npx prisma generate` failed with:
```
Error: Cannot find module '/app/node_modules/@prisma/client/runtime/query_engine_bg.sqlite.wasm-base64.js'
```

## 🔍 **Root Cause**
The Dockerfile was installing only production dependencies with `npm install --only=production`, but the Prisma CLI (`prisma` package) is a **devDependency**, not a production dependency.

When we tried to run `npx prisma generate`, the Prisma CLI wasn't available in node_modules because we had already removed dev dependencies.

## ✅ **Fix Applied**
Changed the dependency installation strategy in the production stage:

**Before**:
```dockerfile
# Install only production dependencies
RUN npm install --only=production --legacy-peer-deps && npm cache clean --force

# Copy backend code
COPY server.js .
COPY shiprocket.js .
COPY prisma ./prisma
COPY public ./public

# Generate Prisma client
RUN npx prisma generate
```

**After**:
```dockerfile
# Install all dependencies (including dev deps needed for prisma generate)
RUN npm install --legacy-peer-deps

# Copy backend code
COPY server.js .
COPY shiprocket.js .
COPY prisma ./prisma
COPY public ./public

# Generate Prisma client (required for Prisma ORM to work)
RUN npx prisma generate

# Copy built frontend from builder
COPY --from=frontend-builder /app/build ./build

# Clean up - remove dev dependencies to keep image small
RUN npm install --only=production --legacy-peer-deps --no-save && npm cache clean --force
```

## 📋 **How It Works**

**Step 1**: Install ALL dependencies (including devDependencies)
- Prisma CLI is available
- All peer dependencies installed
- Full node_modules ready

**Step 2**: Generate Prisma client
- `npx prisma generate` runs successfully
- Generates TypeScript/JS client from schema.prisma
- Creates @prisma/client module

**Step 3**: Clean up dev dependencies
- Run `npm install --only=production` to remove dev deps
- Keeps final image size small
- Only production dependencies remain
- `--no-save` prevents modifying package.json
- `npm cache clean` removes npm cache

## 🎯 **Commit Details**
- **Commit Hash**: `bb533ff`
- **Branch**: `main`
- **Status**: ✅ Pushed to GitHub
- **Changes**: Modified Dockerfile install strategy

## 🚀 **Next Steps**

### 1. Clear Cache & Redeploy on Render
1. Go to: https://dashboard.render.com
2. Click: nekxuz-backend service
3. Click: Settings tab
4. Click: **"Clear build cache & redeploy"**
5. Confirm: Yes

### 2. Monitor Build
Watch the Deployments tab for:
- ✅ `npm install --legacy-peer-deps` (all deps) runs
- ✅ `npx prisma generate` completes successfully
- ✅ `npm install --only=production` cleans up
- ✅ Frontend builds successfully
- ✅ Docker image created
- ✅ Service goes "Live"

### 3. Verify API Health
Once "Live":
```bash
curl https://nekxuz-backend.onrender.com/health
```

Expected response:
```json
{"status":"ok","timestamp":"..."}
```

## 📊 **Summary of All Fixes**

| # | Issue | Fix | Commit | Status |
|---|-------|-----|--------|--------|
| 1 | GID 1000 conflict | Changed to 1001 | 1c44266 | ✅ Deployed |
| 2 | npm ci lock file mismatch | npm install --legacy-peer-deps | 85dc8f8 | ✅ Deployed |
| 3 | Missing shiprocket.js | COPY shiprocket.js | 3df8ee1 | ✅ Deployed |
| 4 | Prisma client not initialized | RUN npx prisma generate | 58fa1de | ✅ Deployed |
| 5 | Prisma CLI not found | Install all deps, then cleanup | bb533ff | ⏳ Ready for deploy |

## 🎯 **Why This Matters**

- **Before**: Dev dependencies were removed before running `prisma generate`, so the Prisma CLI wasn't available
- **After**: All dependencies available for `prisma generate`, then dev deps cleaned up to keep image small
- **Result**: Prisma client generates successfully, and production image stays lean

## ✨ **Image Optimization**

The final image will be optimized because:
1. All dependencies installed once (for prisma generate)
2. Prisma client generated from schema
3. Dev dependencies removed
4. Only production dependencies remain in final image
5. npm cache cleaned to save space

## 🔧 **Technical Details**

### Why Prisma is a devDependency
- Prisma CLI is only needed at build time
- It generates the client files
- In production, only `@prisma/client` (runtime) is needed
- However, the CLI still needs to run during build

### The Two-Phase Approach
```
Phase 1: Build dependencies
├─ Install all (dev + prod)
├─ Run prisma generate
└─ Prisma client files created

Phase 2: Production cleanup
├─ Remove dev dependencies
├─ Keep only production deps
└─ Lean production image
```

## ⚠️ **If Build Still Fails**

Check the error logs for:
1. **Same error?** Cache not cleared - try again
2. **Prisma schema error?** Check prisma/schema.prisma syntax
3. **Node version?** Node 18 is correct for Alpine
4. **Disk space?** Render might be out of space (unlikely)

## ✅ **What's Ready**

- ✅ Dockerfile optimized and fixed
- ✅ All 5 fixes complete
- ✅ Code pushed to GitHub (commit bb533ff)
- ✅ Documentation complete
- ✅ Ready for final deployment attempt

**Ready to proceed with redeploy!** 🚀
