<!-- DEPRECATED: This plan has been superseded -->
# ⚠️ DEPRECATED PLAN - DO NOT USE

**Deprecation Date**: October 29, 2025  
**Reason**: Combined plan was too large and complex  
**Replaced By**: 
- `.cursor/plans/phase3-intents-chain-signatures.plan.md`
- `.cursor/plans/phase4-shade-agents.plan.md`

---

## Why This Plan Was Deprecated

This original plan attempted to implement NEAR Intents, Chain Signatures, and Shade Agents all in one phase. This was:

1. **Too Complex**: ~40+ hours of work in single phase
2. **Wrong Order**: Tried to build Shade Agents without Intents foundation
3. **Unclear Dependencies**: Didn't explain why Intents needs Chain Signatures
4. **User Ownership Unclear**: Didn't detail user-owned agent architecture

## Use The New Plans Instead

### Phase 3: NEAR Intents + Chain Signatures
**File**: `.cursor/plans/phase3-intents-chain-signatures.plan.md`

Implements:
- Chain Signatures simulator (derive addresses, sign TXs)
- NEAR Intents simulator (1Click API compatibility)
- Cross-chain payment integration
- ~14-20 hours

### Phase 4: Shade Agents  
**File**: `.cursor/plans/phase4-shade-agents.plan.md`

Implements:
- TEE attestation simulator
- User-owned agent contexts
- Agent SDK per user
- AI reasoning with verification
- ~18-26 hours

## Migration Guide

If you started implementing from this old plan:

1. **Stop** - Don't continue with this plan
2. **Review** - Read the new Phase 3 and Phase 4 plans
3. **Restart** - Follow the new plans in order (3 then 4)

The new plans are:
- ✅ More detailed and tested
- ✅ Correct dependency order
- ✅ Clear user ownership model
- ✅ Realistic timelines

---

# Original Plan Content Below (For Reference Only)

See `near-simulators-implementation-c84d32b0.plan.md` for original content.

**DO NOT IMPLEMENT FROM BELOW - USE NEW PLANS**

---

