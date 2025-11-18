# ⚡ SIMPLE SOLUTION - No Installation Needed

Since Maven and npm aren't installed and you want to test quickly, here's what to do:

## The Problem
- You don't have Maven or Node.js installed
- Chocolatey needs admin privileges (not available)
- Docker build is complex due to multi-module Maven structure

## The Solution
Use **GitHub Codespaces** or **Remote Container** - Cloud-based development environment

---

## Option 1: GitHub Codespaces (Easiest - Cloud Based) ✅

### Step 1: Go to GitHub
```
https://github.com/HARI5KRISHNAN/darevel
```

### Step 2: Click "Code" → "Codespaces" → "Create codespace on main"

### Step 3: Wait for Codespace to load (Linux environment with all tools)

### Step 4: Terminal → New Terminal

### Step 5: Run the build
```bash
cd microservices
mvn clean install -DskipTests

cd ../apps/chat
npm install
npm run dev
```

### Step 6: Click "Open in Browser" when frontend starts

### Advantages
✅ Zero installation on your machine
✅ All tools pre-installed (Maven, Node, Java)
✅ Linux environment (proper WebSocket support)
✅ Can work from any browser
✅ 60 hours free per month

### Time: 10 minutes total (including Codespace startup)

---

## Option 2: Windows Sandbox + Tools (Local, Clean)

1. Open Windows Sandbox (built into Windows 10/11 Pro+)
2. Download Maven & Node installers
3. Run build

### Disadvantages
❌ Need Windows Pro/Enterprise edition
❌ Takes 5-10 min to start

---

## Option 3: Manual Maven Installation (No Chocolatey Admin)

### Step 1: Download Maven
```
https://maven.apache.org/download.cgi
```

Download: `apache-maven-3.9.11-bin.zip`

### Step 2: Extract
```
Extract to: C:\Users\acer\apache-maven-3.9.11
```

### Step 3: Add to PATH (User, not Admin)
```powershell
# Edit User Environment Variables (no admin needed)
$env:PATH += ";C:\Users\acer\apache-maven-3.9.11\bin"

# Verify
mvn --version
```

### Step 4: Download Node.js
```
https://nodejs.org/
Download Windows 64-bit LTS installer
Run it
```

### Step 5: Run Build
```powershell
cd microservices
mvn clean install -DskipTests

cd ../apps/chat  
npm install
npm run dev
```

### Time: 15 minutes (includes downloads)

---

## 🎯 RECOMMENDED: GitHub Codespaces (Fastest)

**Why?**
- ✅ No download needed
- ✅ No installation needed
- ✅ All tools ready in 1 minute
- ✅ Test in 10 minutes total
- ✅ Can come back anytime
- ✅ Free (60 hours/month)

**Steps:**
1. Go to https://github.com/HARI5KRISHNAN/darevel
2. Click "Code" → "Codespaces" → "Create"
3. Wait 1 minute for environment to load
4. Open terminal → run build → test in browser
5. Done in 10 minutes!

---

## 🚀 Which Should I Choose?

| Option | Time | Ease | Free | Recommendation |
|--------|------|------|------|---|
| GitHub Codespaces | 10 min | ⭐⭐⭐ | ✅ | **Best for testing** |
| Option 3 (Manual) | 15 min | ⭐⭐ | ✅ | Good for local dev |
| Docker | 30 min | ⭐ | ✅ | Complex setup |

---

## Start Now!

**Choose one:**

### 🌐 Cloud (Codespaces) - Click and wait 1 min
```
https://github.com/HARI5KRISHNAN/darevel
→ Code → Codespaces → Create
```

### 🖥️ Local (Manual) - Download & extract
```powershell
# Copy-paste this after extracting maven and installing node
cd microservices
mvn clean install -DskipTests
cd ../apps/chat
npm install  
npm run dev
```

Then test at http://localhost:3003 with two browser tabs!

---

## Next Step

**👉 Which option works best for you?** Let me know and I'll give you exact step-by-step commands!
