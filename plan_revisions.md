# Platform Revision Plan - Based on Dave's Feedback

## Executive Summary
This document outlines systematic revisions to address feedback from Dave (AI4K12 reviewer) to improve platform credibility, usability, and focus.

---

## Phase 1: Marketing Claims Revision 🎯

### Current Issues
- **Overstated claims** hurt credibility for early-stage platform
- **Unsubstantiated features** mentioned that aren't fully implemented
- **Hyperbolic language** ("world's most advanced") that's off-putting

### Specific Changes

#### Home Page (client/src/pages/Home.tsx)

**Line 153: Hero Description**
- ❌ REMOVE: "The world's most advanced platform for developing critical thinking about AI ethics in education"
- ✅ REPLACE: "An interactive platform for developing critical thinking about AI ethics in education"

**Line 154: Subheadline**
- ❌ REMOVE: "Powered by artificial intelligence, driven by community wisdom, with comprehensive teacher tools for classroom management"
- ✅ REPLACE: "Real-world scenarios, teacher tools for classroom management, and community-driven discussions"

**Lines 261-270: Smart Ranking Card**
- ❌ REMOVE: "Smart Ranking Algorithms" + "Seven sophisticated ranking methods including smart ranking that combines quality, reputation, engagement, and recency"
- ✅ REPLACE: "Flexible Discussion Sorting" + "Multiple ways to organize perspectives including by quality scores, engagement, and recency"

**Lines 274-300+: Gamification Card**
- ❌ REMOVE: "Advanced Gamification" 
- ✅ REPLACE: "Achievement System" or "Progress Tracking"
- Tone down language from "sophisticated" to "meaningful"

**Line 141-142: Badge**
- KEEP: "Featured Project - ISTE+ASCD AI Innovator Challenge 2025" (this is factual)

#### About Page (client/src/pages/About.tsx)
- Review for similar hyperbolic claims
- Replace "advanced" with "comprehensive" or remove entirely
- Focus on what exists, not aspirations

#### Translation Files
- Update all 7 language files: en.json, es.json, fr.json, zh.json, ar.json, hi.json, pt.json
- Ensure consistency across all translations

### Principles for Revision
1. **Be specific**: Say what the feature IS, not how amazing it is
2. **Be honest**: Early-stage is fine - it's still valuable
3. **Be modest**: Let the features speak for themselves
4. **Be user-focused**: Describe value to teachers/students, not technical sophistication

---

## Phase 2: UN SDG Removal 🗑️

### Rationale
- Takes up excessive space (Dave's direct feedback)
- Not relevant to US K-12 teachers' planning frameworks
- Feels like grant-speak rather than user-focused
- Adds complexity without educational value
- Can be replaced with standards teachers actually use

### Removal Checklist

#### UI Components
- [ ] `client/src/components/SdgDetails.tsx` - DELETE entire component
- [ ] `client/src/pages/Home.tsx` - Remove SDG Impact Section (lines ~355-400)
- [ ] `client/src/pages/About.tsx` - Remove SDG sections
- [ ] `client/src/components/ScenarioView.tsx` - Remove SDG rendering
- [ ] Any references in `client copy/` directory

#### Data & Schema
- [ ] `shared/scenarios.json` - Keep sdgTags field but stop displaying (for backward compatibility)
- [ ] Database schema - Don't modify (avoid migration complexity)
- [ ] Just stop rendering SDG data in UI

#### Translation Files
- [ ] Remove SDG-related translation keys from all 7 languages:
  - `about.sdg.*`
  - `home.sdg.*`
  - Any SDG statistics references

#### Stats Display
- [ ] Remove "UN SDG Goals" from stats on Home and About pages
- [ ] Replace with more relevant metrics (scenarios completed, active discussions, etc.)

### What to Replace With
- **ISTE Standards alignment** (what teachers actually use)
- **Learning objectives** (clear, measurable outcomes)
- **Key themes**: Privacy, Bias, Transparency, Accountability, Fairness, Access
- Focus on **ethical concepts**, not SDG mapping

---

## Phase 3: UI Scrolling Fix 🔧

### Issue
When user clicks "Next" after answering multiple-choice questions, the narrative text box appears below the fold and isn't visible without manual scrolling.

### Root Cause
- In `ScenarioView.tsx`, after selecting resolution and clicking Next, the perspective textarea appears
- The resolution outcome content above it can be quite long
- No auto-scroll behavior to bring textarea into view

### Solution: Scroll-into-View on Step Transition

**File**: `client/src/components/ScenarioView.tsx`

**Implementation**:
1. Add ref for perspective section
2. Add useEffect to scroll when currentStep changes to perspective step
3. Use smooth scrolling with appropriate block positioning
4. Optional: Add visual indicator showing where to scroll

**Code Changes**:
```typescript
// Add ref near other refs
const perspectiveRef = useRef<HTMLDivElement>(null);

// Add useEffect for scroll behavior
useEffect(() => {
  if (currentStep === 3 && perspectiveRef.current) {
    // Small delay to ensure DOM is updated
    setTimeout(() => {
      perspectiveRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }, 100);
  }
}, [currentStep]);

// Add ref to the perspective section div
<div ref={perspectiveRef} className="space-y-4">
  <Textarea ... />
</div>
```

**Additional Enhancement**:
- Add a visual indicator when moving to step 3: "📝 Now share your perspective below"
- Consider adding step indicator showing "Step 3 of 3"

---

## Phase 4: Resource Links Audit (Future)
- Test all external links on Resources page
- Replace broken ones
- Add "last verified" dates
- Consider fewer, curated resources vs. many potentially broken ones

---

## Phase 5: Scenario Detail Enhancement (Future)
- Add more context to scenario descriptions
- Include specific details: school size, demographics, timelines, stakeholder quotes
- Reframe multiple-choice questions to be more productive
- Add "dilemma clarity" sections explicitly stating ethical tensions

---

## Implementation Order

### 🔴 Critical (This Session)
1. ✅ Create plan_revisions.md
2. ✅ Create TODO.md
3. Revise marketing claims in Home.tsx
4. Revise marketing claims in About.tsx
5. Update all 7 translation files
6. Remove UN SDG sections from Home.tsx
7. Remove UN SDG sections from About.tsx
8. Delete SdgDetails.tsx component
9. Remove SDG rendering from ScenarioView.tsx
10. Update translation files to remove SDG keys
11. Fix scrolling issue in ScenarioView.tsx
12. Test all changes
13. Review for any remaining SDG references

### 🟡 High Priority (Next Session)
- Audit and fix Resource page links
- Begin enhancing scenario details
- Create teacher guide sections

### 🟢 Future Enhancements
- Add tutorial/learning content
- Create lesson plan templates
- Partner with existing curricula

---

## Success Criteria

### Marketing Claims
- ✅ No superlatives ("world's most", "best", "most advanced")
- ✅ Only claim features that fully exist
- ✅ Honest about development stage
- ✅ Focus on value, not hype

### UN SDG Removal
- ✅ No visible SDG content in UI
- ✅ No SDG sections on any page
- ✅ Replaced with relevant frameworks (ISTE, learning objectives)
- ✅ Cleaner, more focused user experience

### Scrolling Fix
- ✅ Perspective textarea visible when step 3 loads
- ✅ Smooth scroll behavior
- ✅ No user confusion about next action
- ✅ Clear visual flow through steps

---

## Files to Modify

### Primary Changes
1. `client/src/pages/Home.tsx` - Marketing text + SDG removal
2. `client/src/pages/About.tsx` - Marketing text + SDG removal
3. `client/src/components/ScenarioView.tsx` - Scrolling fix + SDG removal
4. `client/src/components/SdgDetails.tsx` - DELETE
5. `client/src/locales/en.json` - Update claims + remove SDG
6. `client/src/locales/es.json` - Update claims + remove SDG
7. `client/src/locales/fr.json` - Update claims + remove SDG
8. `client/src/locales/zh.json` - Update claims + remove SDG
9. `client/src/locales/ar.json` - Update claims + remove SDG
10. `client/src/locales/hi.json` - Update claims + remove SDG
11. `client/src/locales/pt.json` - Update claims + remove SDG

### Files to Check (may have duplicates)
- `client copy/` directory - mirror changes if needed

---

## Testing Checklist

### Marketing Claims
- [ ] Home page reads honestly and compellingly
- [ ] No unsubstantiated feature claims
- [ ] All 7 languages updated consistently
- [ ] About page aligns with home page tone

### UN SDG Removal
- [ ] No SDG sections visible on Home page
- [ ] No SDG sections visible on About page
- [ ] No SDG details showing in scenarios
- [ ] Stats show relevant metrics, not SDG counts
- [ ] No broken UI from removed components

### Scrolling Fix
- [ ] Navigate through scenario steps 1-2-3
- [ ] Verify textarea scrolls into view on step 3
- [ ] Test on different screen sizes
- [ ] Smooth scroll animation works
- [ ] No layout jumps or flashing

---

## Notes
- Keep changes minimal and focused
- Maintain backward compatibility with database
- Don't remove SDG data, just stop displaying it
- Preserve all existing functionality
- Test thoroughly before considering done

