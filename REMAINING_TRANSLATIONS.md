# Remaining Translation Files

## Instructions
Copy each section below into the corresponding file to complete all 7 language translations.

---

## German (de.json)
**File**: `client/src/locales/de.json`

The German file already has the basic structure. You need to add the new sections (`navigation`, `common`, `auth`, `footer`, `scenarios`, `teacher`, `student`, `forms`, `errors`) following the same structure as the English file.

Key translations:
- navigation.home = "Startseite"
- navigation.scenarios = "Szenarien"  
- navigation.community = "Gemeinschaft"
- navigation.leaderboard = "Bestenliste"
- common.buttons.save = "Speichern"
- common.buttons.cancel = "Abbrechen"
- auth.signIn = "Anmelden"
- auth.signOut = "Abmelden"

---

## Chinese (zh.json)
**File**: `client/src/locales/zh.json`

Key translations:
- navigation.home = "主页"
- navigation.scenarios = "场景"
- navigation.community = "社区"
- navigation.leaderboard = "排行榜"
- common.buttons.save = "保存"
- common.buttons.cancel = "取消"
- auth.signIn = "登录"
- auth.signOut = "退出"

---

## Arabic (ar.json)  
**File**: `client/src/locales/ar.json`

**Important**: This is RTL (right-to-left) language!

Key translations:
- navigation.home = "الرئيسية"
- navigation.scenarios = "السيناريوهات"
- navigation.community = "المجتمع"
- navigation.leaderboard = "لوحة المتصدرين"
- common.buttons.save = "حفظ"
- common.buttons.cancel = "إلغاء"
- auth.signIn = "تسجيل الدخول"
- auth.signOut = "تسجيل الخروج"

---

## Italian (it.json)
**File**: `client/src/locales/it.json`

Key translations:
- navigation.home = "Home"
- navigation.scenarios = "Scenari"
- navigation.community = "Comunità"
- navigation.leaderboard = "Classifica"
- common.buttons.save = "Salva"
- common.buttons.cancel = "Annulla"
- auth.signIn = "Accedi"
- auth.signOut = "Esci"

---

## Quick Implementation

Since you already have Spanish and French complete, you can:

1. **Option A**: Use AI translation tools (Google Translate, DeepL) to translate en.json to the remaining 4 languages
2. **Option B**: I can generate complete files for all 4 remaining languages in the next response
3. **Option C**: Start with just the navigation and common sections for quick wins

**Recommendation**: Let me know if you want me to generate the complete German, Chinese, Arabic, and Italian files, or if you prefer to handle those translations separately while we focus on getting the components updated to USE the translations that are already complete (English, Spanish, French).

The most important next step is updating Navbar and Footer to actually USE these translations, which will make the language switching visibly work!

