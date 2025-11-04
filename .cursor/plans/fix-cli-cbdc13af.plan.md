<!-- cbdc13af-174d-440b-b3bc-5436150bd843 26ec289b-7578-46b9-b2f9-0d20b5bf4cc1 -->
# Fix CLI Configuration

Update CLI to use correct API Gateway URL and simplify by removing gum/charm dependencies.

## Root Cause

CLI hardcoded old API Gateway URL `jz8cqdl5h4` but infrastructure uses `dvuzkm7fu5`.

## Solution

1. Create helper script to auto-detect correct infrastructure URLs
2. Update CLI configuration (`.env` and fallback)
3. Simplify CLI display (remove gum/charm, use ANSI colors)
4. Add fail-fast validation on startup

## Implementation

### Step 1: Create Infrastructure Auto-Detection Script

**New File**: `scripts/update-cli-config.sh`

```bash
#!/bin/bash
# Auto-detect infrastructure URLs and update CLI .env file

PROFILE="shai-sandbox-profile"
REGION="us-east-1"

echo "🔍 Detecting infrastructure..."

# Get API Gateway ID
API_ID=$(aws apigateway get-rest-apis \
  --profile $PROFILE --region $REGION \
  --query 'items[?name==`Telco SMS Payment API`].id' \
  --output text)

if [ -z "$API_ID" ]; then
  echo "❌ API Gateway not found!"
  exit 1
fi

API_URL="https://${API_ID}.execute-api.${REGION}.amazonaws.com/prod"

echo "✓ Found API Gateway: $API_ID"
echo "✓ API URL: $API_URL"

# Create/update .env file
cat > cli/.env << EOF
# AWS Configuration
AWS_REGION=$REGION
AWS_PROFILE=$PROFILE

# Lambda Configuration
LAMBDA_LOG_GROUP=/aws/lambda/telco-sms-handler

# API Gateway Configuration (auto-detected)
API_GATEWAY_URL=$API_URL
EOF

echo "✓ Updated cli/.env"
echo ""
echo "Run './demo-viewer.sh' to test!"
```

### Step 2: Update CLI Hardcoded Fallback

**File**: `cli/src/demo-viewer.ts` (line 16)

```typescript
// Change from:
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'https://jz8cqdl5h4.execute-api.us-east-1.amazonaws.com/prod';

// To:
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'https://dvuzkm7fu5.execute-api.us-east-1.amazonaws.com/prod';
```

### Step 3: Simplify Display (Remove gum/charm)

**File**: `cli/src/demo-display.ts`

Replace all `gum` execSync calls with ANSI color codes:

```typescript
// Color constants at top of file
const COLORS = {
  GREEN: '\x1b[32m',
  BLUE: '\x1b[34m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  CYAN: '\x1b[36m',
  GRAY: '\x1b[90m',
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m'
};

// Replace gumStyle() method with simple ANSI output
private static display(content: string, color: keyof typeof COLORS): void {
  console.log(`${COLORS[color]}${content}${COLORS.RESET}`);
}
```

Remove all `execSync` and `isGumInstalled()` logic.

**File**: `cli/src/gum-ui.ts` - DELETE (no longer needed)

### Step 4: Add Startup Validation

**File**: `cli/src/demo-viewer.ts`

Add validation in `start()` method:

```typescript
async start(): Promise<void> {
  console.clear();
  DemoDisplay.displayBanner();
  console.log('');

  // Validate API connectivity
  console.log('🔍 Checking infrastructure...');
  try {
    await this.apiClient.checkHealth();
    console.log(`✓ API Gateway: ${API_GATEWAY_URL}\n`);
  } catch (error) {
    console.error('\n❌ INFRASTRUCTURE ERROR\n');
    console.error(`Cannot reach API Gateway: ${API_GATEWAY_URL}`);
    console.error('\nTo fix:');
    console.error('  Run: ./scripts/update-cli-config.sh');
    console.error('  This will auto-detect the correct API URL\n');
    process.exit(1);
  }

  // Continue with log streaming...
  this.logStreamer.on('log', async (logEvent: LogStreamEvent) => {
    await this.handleLogEvent(logEvent);
  });
  // ... rest of code
}
```

### Step 5: Update Documentation

Replace all instances of old URL with new URL:

**Files**: `cli/CONFIG.md`, `README.md`, `QUICKSTART.md`, `docs/demo-viewer.md`

- Find: `jz8cqdl5h4`
- Replace: `dvuzkm7fu5`

Add note about helper script:

```markdown
To auto-detect infrastructure URLs, run:
./scripts/update-cli-config.sh
```

## Files Changed

**New**:

- `scripts/update-cli-config.sh` - Auto-detect infrastructure URLs

**Modified**:

- `cli/src/demo-viewer.ts` - Update fallback URL, add startup validation
- `cli/src/demo-display.ts` - Replace gum with ANSI colors
- `cli/CONFIG.md` - Update URL, add helper script reference
- `README.md` - Update URL
- `QUICKSTART.md` - Update URL
- `docs/demo-viewer.md` - Update URL

**Deleted**:

- `cli/src/gum-ui.ts` - No longer needed

## Testing

1. Run helper script: `./scripts/update-cli-config.sh`
2. Rebuild CLI: `cd cli && npm run build`
3. Start demo viewer: `./demo-viewer.sh`
4. Verify: Balance fetching works, events display correctly

### To-dos

- [ ] Create scripts/update-cli-config.sh to auto-detect API Gateway URL from AWS
- [ ] Update hardcoded fallback URL in cli/src/demo-viewer.ts line 16
- [ ] Rewrite cli/src/demo-display.ts to use ANSI colors instead of gum
- [ ] Delete cli/src/gum-ui.ts file
- [ ] Add infrastructure validation in demo-viewer.ts start() method
- [ ] Update CONFIG.md, README.md, QUICKSTART.md, demo-viewer.md with correct URLs
- [ ] Run helper script, rebuild CLI, test demo viewer