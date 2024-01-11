

export type ImageName = "icon128" | "contractedArrow" | "extendedArrow" | "settingsGear" | "delete" | "edit" | "blacklist" | "remove" | "ok"


type PredefinedChromeStorageKey = "blackList" | "enableBlackList" | "blackListUpdated" | "shiftWebpage" | "authenticationState" | "mantainExtended"
type RuntimeChromeStorageKey = "siteSummary" | "pageSummaries" | "reportTableContent" | "reportIsLoaded" | "parentId"
export type ChromeStorageKey = PredefinedChromeStorageKey | `${string}.${RuntimeChromeStorageKey}` | string

export type Evaluator = "A11Y" | "MAUVE" | "AccessMonitor" | "AChecker" | "Pa11y" | "Lighthouse"

export type Outcome = "cantTell" | "passed" | "failed" | "inapplicable" | "untested"
export type EarlOutcome = `earl:${Outcome}`

export interface BlackListedElement {
  evaluator: Evaluator,
  criteria: WcagSuccessCriteriaIdName,
  outcome: Outcome,
  message: string
}
// ----------------------------------------------------







export type ServerAction = "evaluation" | "authentication" | "storage"

export type WcagPrincipleId = "1" | "2" | "3" | "4"
export type WcagGuidelineId = "1.1" | "1.2" | "1.3" | "1.4" | "2.1" | "2.2" | "2.3" | "2.4" | "2.5" |"3.1" | "3.2" | "3.3" | "4.1"
/*export type WcagGuidelines = {
  [key in WcagGuidelineId]: string
};*/
export type WcagSuccessCriteriaId = "1.1.1" | "1.2.1" | "1.2.2" | "1.2.3" | "1.2.4" | "1.2.5" | "1.2.6" | "1.2.7" | "1.2.8" | "1.2.9" | "1.3.1" | "1.3.2" | "1.3.3" | "1.3.4" | "1.3.5" | "1.3.6" | "1.4.1" | "1.4.2" | "1.4.3" | "1.4.4" | "1.4.5" | "1.4.6" | "1.4.7" | "1.4.8" | "1.4.9" | "1.4.10" | "1.4.11" | "1.4.12" | "1.4.13" | "2.1.1" | "2.1.2" | "2.1.3" | "2.1.4" | "2.2.1" | "2.2.2" | "2.2.3" | "2.2.4" | "2.2.5" | "2.2.6" | "2.3.1" | "2.3.2" | "2.3.3" | "2.4.1" | "2.4.2" | "2.4.3" | "2.4.4" | "2.4.5" | "2.4.6" | "2.4.7" | "2.4.8" | "2.4.9" | "2.4.10" | "2.5.1" | "2.5.2" | "2.5.3" | "2.5.4" | "2.5.5" | "2.5.6" | "3.1.1" | "3.1.2" | "3.1.3" | "3.1.4" | "3.1.5" | "3.1.6" | "3.2.1" | "3.2.2" | "3.2.3" | "3.2.4" | "3.2.5" | "3.3.1" | "3.3.2" | "3.3.3" | "3.3.4" | "3.3.5" | "3.3.6" | "4.1.1" | "4.1.2" | "4.1.3"
export type WcagSuccessCriteriaIdName = '1.1.1: Non-text Content' | '1.2.1: Audio-only and Video-only (Prerecorded)' | '1.2.2: Captions (Prerecorded)' | '1.2.3: Audio Description or Media Alternative (Prerecorded)' |
  '1.2.4: Captions (Live)' | '1.2.5: Audio Description (Prerecorded)' | '1.2.6: Sign Language (Prerecorded)' | '1.2.7: Extended Audio Description (Prerecorded)' |
  '1.2.8: Media Alternative (Prerecorded)' | '1.2.9: Audio-only (Live)' | '1.3.1: Info and Relationships' | '1.3.2: Meaningful Sequence' | '1.3.3: Sensory Characteristics' |
  '1.3.4: Orientation' | '1.3.5: Identify Input Purpose' | '1.3.6: Identify Purpose' | '1.4.1: Use of Color' | '1.4.2: Audio Control' | '1.4.3: Contrast (Minimum)' |
  '1.4.4: Resize text' | '1.4.5: Images of Text' | '1.4.6: Contrast (Enhanced)' | '1.4.7: Low or No Background Audio' | '1.4.8: Visual Presentation' |
  '1.4.9: Images of Text (No Exception)' | '1.4.10: Reflow' | '1.4.11: Non-text Contrast' | '1.4.12: Text Spacing' | '1.4.13: Content on Hover or Focus' |
  '2.1.1: Keyboard' | '2.1.2: No Keyboard Trap' | '2.1.3: Keyboard (No Exception)' | '2.1.4: Character Key Shortcuts' | '2.2.1: Timing Adjustable' | '2.2.2: PauseStopHide' |
  '2.2.3: No Timing' | '2.2.4: Interruptions' | '2.2.5: Re-authenticating' | '2.2.6: Timeouts' | '2.3.1: Three Flashes or Below Threshold' | '2.3.2: Three Flashes' |
  '2.3.3: Animation from Interactions' | '2.4.1: Bypass Blocks' | '2.4.2: Page Titled' | '2.4.3: Focus Order' | '2.4.4: Link Purpose (In Context)' | '2.4.5: Multiple Ways' |
  '2.4.6: Headings and Labels' | '2.4.7: Focus Visible' | '2.4.8: Location' | '2.4.9: Link Purpose (Link Only)' | '2.4.10: Section Headings' | '2.5.1: Pointer Gestures' |
  '2.5.2: Pointer Cancellation' | '2.5.3: Label in Name' | '2.5.4: Motion Actuation' | '2.5.5: Target Size' | '2.5.6: Concurrent Input Mechanisms' | '3.1.1: Language of Page' |
  '3.1.2: Language of Parts' | '3.1.3: Unusual Words' | '3.1.4: Abbreviations' | '3.1.5: Reading Level' | '3.1.6: Pronunciation' | '3.2.1: On Focus' | '3.2.2: On Input' |
  '3.2.3: Consistent Navigation' | '3.2.4: Consistent Identification' | '3.2.5: Change on Request' | '3.3.1: Error Identification' | '3.3.2: Labels or Instructions' |
  '3.3.3: Error Suggestion' | '3.3.4: Error Prevention (LegalFinancialData)' | '3.3.5: Help' | '3.3.6: Error Prevention (All)' | '4.1.1: Parsing' | '4.1.2: NameRoleValue' |
  '4.1.3: Status Messages';

export type SuccessCriteriaName =
  | "non-text-content" | "audio-only-and-video-only-prerecorded" | "captions-prerecorded"
  | "audio-description-or-media-alternative-prerecorded" | "captions-live" | "audio-description-prerecorded"
  | "sign-language-prerecorded" | "extended-audio-description-prerecorded" | "media-alternative-prerecorded"
  | "audio-only-live" | "info-and-relationships" | "meaningful-sequence" | "sensory-characteristics"
  | "orientation" | "identify-input-purpose" | "identify-purpose" | "use-of-color" | "audio-control"
  | "contrast-minimum" | "resize-text" | "images-of-text" | "contrast-enhanced" | "low-or-no-background-audio"
  | "visual-presentation" | "images-of-text-no-exception" | "reflow" | "non-text-contrast" | "text-spacing"
  | "content-on-hover-or-focus" | "keyboard" | "no-keyboard-trap" | "keyboard-no-exception" | "character-key-shortcuts"
  | "timing-adjustable" | "pause-stop-hide" | "no-timing" | "interruptions" | "re-authenticating" | "timeouts"
  | "three-flashes-or-below-threshold" | "three-flashes" | "animation-from-interactions" | "bypass-blocks"
  | "page-titled" | "focus-order" | "link-purpose-in-context" | "multiple-ways" | "headings-and-labels"
  | "focus-visible" | "location" | "link-purpose-link-only" | "section-headings" | "pointer-gestures"
  | "pointer-cancellation" | "label-in-name" | "motion-actuation" | "target-size" | "concurrent-input-mechanisms"
  | "language-of-page" | "language-of-parts" | "unusual-words" | "abbreviations" | "reading-level" | "pronunciation"
  | "on-focus" | "on-input" | "consistent-navigation" | "consistent-identification" | "change-on-request"
  | "error-identification" | "labels-or-instructions" | "error-suggestion" | "error-prevention-legal-financial-data"
  | "help" | "error-prevention-all" | "parsing" | "name-role-value" | "status-messages";



export type BlackList = BlackListedElement[]


export type ConformanceLevel = "A" | "AA" | "AAA"