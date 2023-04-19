
/**
 * Given a standard or sub-standard, returns the subsections of that standard or sub-standard.
 */
export function getWcagHierarchy(category){
    let hierarchy = {};
    switch(category){
        case "mainCategories":
            hierarchy = {
                '1': '1 Perceivable',
                '2': '2 Operable',
                '3': '3 Understandable',
                '4': '4 Robust'
            };
            break;
        case '1':
            hierarchy = {
                '1.1': '1.1 Text Alternatives',
                '1.2': '1.2 Time-based Media',
                '1.3': '1.3 Adaptable',
                '1.4': '1.4 Distinguishable'
            };
            break;
        case '2':
            hierarchy = {
                '2.1': '2.1 Keyboard Accessible',
                '2.2': '2.2 Enough Time',
                '2.3': '2.3 Seizures and Physical Reactions',
                '2.4': '2.4 Navigable',
                '2.5': '2.5 Input Modalities'
            }
            break;
        case '3':
            hierarchy = {
                '3.1': '3.1 Readable',
                '3.2': '3.2 Predictable',
                '3.3': '3.3 Input Assistance',
            }
            break;
        case '4':
            hierarchy = {
                '4.1' : '4.1 Compatible'
            }
            break;

        case '1.1':
            hierarchy = {
                '1.1.1' : '1.1.1: Non-text Content',
            }
            break;
        case '1.2':
            hierarchy = {
                '1.2.1':'1.2.1: Audio-only and Video-only (Prerecorded)',
                '1.2.2':'1.2.2: Captions (Prerecorded)',
                '1.2.3':'1.2.3: Audio Description or Media Alternative (Prerecorded)',
                '1.2.4':'1.2.4: Captions (Live)',
                '1.2.5':'1.2.5: Audio Description (Prerecorded)',
                '1.2.6':'1.2.6: Sign Language (Prerecorded)',
                '1.2.7':'1.2.7: Extended Audio Description (Prerecorded)',
                '1.2.8':'1.2.8: Media Alternative (Prerecorded)',
                '1.2.9':'1.2.9: Audio-only (Live)',
            }
            break;
        case '1.3':
            hierarchy = {
                '1.3.1':'1.3.1: Info and Relationships',
                '1.3.2':'1.3.2: Meaningful Sequence',
                '1.3.3':'1.3.3: Sensory Characteristics',
                '1.3.4':'1.3.4: Orientation',
                '1.3.5':'1.3.5: Identify Input Purpose',
                '1.3.6':'1.3.6: Identify Purpose',
            }
            break;
        case '1.4':
            hierarchy = {
                '1.4.1':'1.4.1: Use of Color',
                '1.4.2':'1.4.2: Audio Control',
                '1.4.3':'1.4.3: Contrast (Minimum)',
                '1.4.4':'1.4.4: Resize tex',
                '1.4.5':'1.4.5: Images of Text',

                '1.4.6':'1.4.6: Contrast (Enhanced)',
                '1.4.7':'1.4.7: Low or No Background Audio',
                '1.4.8':'1.4.8: Visual Presentation',
                '1.4.9':'1.4.9: Images of Text (No Exception)',

                '1.4.10':'1.4.10: Reflow',
                '1.4.11':'1.4.11: Non-text Contrast',
                '1.4.12':'1.4.12: Text Spacing',
                '1.4.13':'1.4.13: Content on Hover or Focus',

            }
            break;
        case '2.1':
            hierarchy = {
                '2.1.1':'2.1.1: Keyboard',
                '2.1.2':'2.1.2: No Keyboard Trap',
                '2.1.3':'2.1.3: Keyboard (No Exception)',
                '2.1.4':'2.1.4: Character Key Shortcuts',
            }
            break;
        case '2.2':
            hierarchy = {
                '2.2.1':'2.2.1: Timing Adjustable',
                '2.2.2':'2.2.2: Pause, Stop, Hide',
                '2.2.3':'2.2.3: No Timing',
                '2.2.4':'2.2.4: Interruptions',
                '2.2.5':'2.2.5: Re-authenticating',
                '2.2.6':'2.2.6: Timeouts',
            }
            break;
        case '2.3':
            hierarchy = {
                '2.3.1':'2.3.1: Three Flashes or Below Threshold',
                '2.3.2':'2.3.2: Three Flashes',
                '2.3.3':'2.3.3: Animation from Interactions'
            }
            break;
        case '2.4':
            hierarchy = {
                '2.4.1':'2.4.1: Bypass Blocks',
                '2.4.2':'2.4.2: Page Titled ',
                '2.4.3':'2.4.3: Focus Order',
                '2.4.4':'2.4.4: Link Purpose (In Context)',
                '2.4.5':'2.4.5: Multiple Ways',
                '2.4.6':'2.4.6: Headings and Labels',
                '2.4.7':'2.4.7: Focus Visible',
                '2.4.8':'2.4.8: Location',
                '2.4.9':'2.4.9: Link Purpose (Link Only)',
                '2.4.10':'2.4.10: Section Headings'
            }
            break;
        case '2.5':
            hierarchy = {
                '2.5.1':'2.5.1: Pointer Gestures',
                '2.5.2':'2.5.2: Pointer Cancellation',
                '2.5.3':'2.5.3: Label in Name',
                '2.5.4':'2.5.4: Motion Actuation',
                '2.5.5':'2.5.5: Target Size',
                '2.5.6':'2.5.6: Concurrent Input Mechanisms'
            }
            break;
        case '3.1':
            hierarchy = {
                '3.1.1':'3.1.1: Language of Page',
                '3.1.2':'3.1.2: Language of Parts',
                '3.1.3':'3.1.3: Unusual Words',
                '3.1.4':'3.1.4: Abbreviations',
                '3.1.5':'3.1.5: Reading Level',
                '3.1.6':'3.1.6: Pronunciation',
            }
            break;
        case '3.2':
            hierarchy = {
                '3.2.1':'3.2.1: On Focus',
                '3.2.2':'3.2.2: On Input',
                '3.2.3':'3.2.3: Consistent Navigation',
                '3.2.4':'3.2.4: Consistent Identification',
                '3.2.5':'3.2.5: Change on Request'
            }
            break;
        case '3.3':
            hierarchy = {
                '3.3.1':'3.3.1: Error Identification',
                '3.3.2':'3.3.2: Labels or Instructions',
                '3.3.3':'3.3.3: Error Suggestion',
                '3.3.4':'3.3.4: Error Prevention (Legal, Financial, Data)',
                '3.3.5':'3.3.5: Help',
                '3.3.6':'3.3.6: Error Prevention (All)'
            }
            break;
       case '4.1':
            hierarchy = {
                '4.1.1':'4.1.1: Parsing',
                '4.1.2':'4.1.2: Name, Role, Value',
                '4.1.3':'4.1.3: Status Messages'
            }
            break; 
        default:
            break;
    }
    return hierarchy;
}

export function getSuccessCriterias() { 
    return [
        {
            "num": "1.1.1",
            "id": "non-text-content",
            "conformanceLevel": "A"
        },
        {
            "num": "1.2.1",
            "id": "audio-only-and-video-only-prerecorded",
            "conformanceLevel": "A"
        },
        {
            "num": "1.2.2",
            "id": "captions-prerecorded",
            "conformanceLevel": "A"
        },
        {
            "num": "1.2.3",
            "id": "audio-description-or-media-alternative-prerecorded",
            "conformanceLevel": "A"
        },
        {
            "num": "1.2.4",
            "id": "captions-live",
            "conformanceLevel": "AA"
        },
        {
            "num": "1.2.5",
            "id": "audio-description-prerecorded",
            "conformanceLevel": "AA"
        },
        {
            "num": "1.2.6",
            "id": "sign-language-prerecorded",
            "conformanceLevel": "AAA"
        },
        {
            "num": "1.2.7",
            "id": "extended-audio-description-prerecorded",
            "conformanceLevel": "AAA"
        },
        {
            "num": "1.2.8",
            "id": "media-alternative-prerecorded",
            "conformanceLevel": "AAA"
        },
        {
            "num": "1.2.9",
            "id": "audio-only-live",
            "conformanceLevel": "AAA"
        },
        {
            "num": "1.3.1",
            "id": "info-and-relationships",
            "conformanceLevel": "A"
        },
        {
            "num": "1.3.2",
            "id": "meaningful-sequence",
            "conformanceLevel": "A"
        },
        {
            "num": "1.3.3",
            "id": "sensory-characteristics",
            "conformanceLevel": "A"
        },
        {
            "num": "1.3.4",
            "id": "orientation",
            "conformanceLevel": "AA"
        },
        {
            "num": "1.3.5",
            "id": "identify-input-purpose",
            "conformanceLevel": "AA"
        },
        {
            "num": "1.3.6",
            "id": "identify-purpose",
            "conformanceLevel": "AAA"
        },
        {
            "num": "1.4.1",
            "id": "use-of-color",
            "conformanceLevel": "A"
        },
        {
            "num": "1.4.2",
            "id": "audio-control",
            "conformanceLevel": "A"
        },
        {
            "num": "1.4.3",
            "id": "contrast-minimum",
            "conformanceLevel": "AA"
        },
        {
            "num": "1.4.4",
            "id": "resize-text",
            "conformanceLevel": "AA"
        },
        {
            "num": "1.4.5",
            "id": "images-of-text",
            "conformanceLevel": "AA"
        },
        {
            "num": "1.4.6",
            "id": "contrast-enhanced",
            "conformanceLevel": "AAA"
        },
        {
            "num": "1.4.7",
            "id": "low-or-no-background-audio",
            "conformanceLevel": "AAA"
        },
        {
            "num": "1.4.8",
            "id": "visual-presentation",
            "conformanceLevel": "AAA"
        },
        {
            "num": "1.4.9",
            "id": "images-of-text-no-exception",
            "conformanceLevel": "AAA"
        },
        { "num": "1.4.10", "id": "reflow", "conformanceLevel": "AA" },
        {
            "num": "1.4.11",
            "id": "non-text-contrast",
            "conformanceLevel": "AA"
        },
        {
            "num": "1.4.12",
            "id": "text-spacing",
            "conformanceLevel": "AA"
        },
        {
            "num": "1.4.13",
            "id": "content-on-hover-or-focus",
            "conformanceLevel": "AA"
        },
        { "num": "2.1.1", "id": "keyboard", "conformanceLevel": "A" },
        {
            "num": "2.1.2",
            "id": "no-keyboard-trap",
            "conformanceLevel": "A"
        },
        {
            "num": "2.1.3",
            "id": "keyboard-no-exception",
            "conformanceLevel": "AAA"
        },
        {
            "num": "2.1.4",
            "id": "character-key-shortcuts",
            "conformanceLevel": "A"
        },
        {
            "num": "2.2.1",
            "id": "timing-adjustable",
            "conformanceLevel": "A"
        },
        {
            "num": "2.2.2",
            "id": "pause-stop-hide",
            "conformanceLevel": "A"
        },
        {
            "num": "2.2.3",
            "id": "no-timing",
            "conformanceLevel": "AAA"
        },
        {
            "num": "2.2.4",
            "id": "interruptions",
            "conformanceLevel": "AAA"
        },
        {
            "num": "2.2.5",
            "id": "re-authenticating",
            "conformanceLevel": "AAA"
        },
        {
            "num": "2.2.6",
            "id": "timeouts",
            "conformanceLevel": "AAA"
        },
        {
            "num": "2.3.1",
            "id": "three-flashes-or-below-threshold",
            "conformanceLevel": "A"
        },
        {
            "num": "2.3.2",
            "id": "three-flashes",
            "conformanceLevel": "AAA"
        },
        {
            "num": "2.3.3",
            "id": "animation-from-interactions",
            "conformanceLevel": "AAA"
        },
        {
            "num": "2.4.1",
            "id": "bypass-blocks",
            "conformanceLevel": "A"
        },
        {
            "num": "2.4.2",
            "id": "page-titled",
            "conformanceLevel": "A"
        },
        {
            "num": "2.4.3",
            "id": "focus-order",
            "conformanceLevel": "A"
        },
        {
            "num": "2.4.4",
            "id": "link-purpose-in-context",
            "conformanceLevel": "A"
        },
        {
            "num": "2.4.5",
            "id": "multiple-ways",
            "conformanceLevel": "AA"
        },
        {
            "num": "2.4.6",
            "id": "headings-and-labels",
            "conformanceLevel": "AA"
        },
        {
            "num": "2.4.7",
            "id": "focus-visible",
            "conformanceLevel": "AA"
        },
        {
            "num": "2.4.8",
            "id": "location",
            "conformanceLevel": "AAA"
        },
        {
            "num": "2.4.9",
            "id": "link-purpose-link-only",
            "conformanceLevel": "AAA"
        },
        {
            "num": "2.4.10",
            "id": "section-headings",
            "conformanceLevel": "AAA"
        },
        {
            "num": "2.5.1",
            "id": "pointer-gestures",
            "conformanceLevel": "A"
        },
        {
            "num": "2.5.2",
            "id": "pointer-cancellation",
            "conformanceLevel": "A"
        },
        {
            "num": "2.5.3",
            "id": "label-in-name",
            "conformanceLevel": "A"
        },
        {
            "num": "2.5.4",
            "id": "motion-actuation",
            "conformanceLevel": "A"
        },
        {
            "num": "2.5.5",
            "id": "target-size",
            "conformanceLevel": "AAA"
        },
        {
            "num": "2.5.6",
            "id": "concurrent-input-mechanisms",
            "conformanceLevel": "AAA"
        },
        {
            "num": "3.1.1",
            "id": "language-of-page",
            "conformanceLevel": "A"
        },
        {
            "num": "3.1.2",
            "id": "language-of-parts",
            "conformanceLevel": "AA"
        },
        {
            "num": "3.1.3",
            "id": "unusual-words",
            "conformanceLevel": "AAA"
        },
        {
            "num": "3.1.4",
            "id": "abbreviations",
            "conformanceLevel": "AAA"
        },
        {
            "num": "3.1.5",
            "id": "reading-level",
            "conformanceLevel": "AAA"
        },
        {
            "num": "3.1.6",
            "id": "pronunciation",
            "conformanceLevel": "AAA"
        },
        { "num": "3.2.1", "id": "on-focus", "conformanceLevel": "A" },
        { "num": "3.2.2", "id": "on-input", "conformanceLevel": "A" },
        {
            "num": "3.2.3",
            "id": "consistent-navigation",
            "conformanceLevel": "AA"
        },
        {
            "num": "3.2.4",
            "id": "consistent-identification",
            "conformanceLevel": "AA"
        },
        {
            "num": "3.2.5",
            "id": "change-on-request",
            "conformanceLevel": "AAA"
        },
        {
            "num": "3.3.1",
            "id": "error-identification",
            "conformanceLevel": "A"
        },
        {
            "num": "3.3.2",
            "id": "labels-or-instructions",
            "conformanceLevel": "A"
        },
        {
            "num": "3.3.3",
            "id": "error-suggestion",
            "conformanceLevel": "AA"
        },
        {
            "num": "3.3.4",
            "id": "error-prevention-legal-financial-data",
            "conformanceLevel": "AA"
        },
        { "num": "3.3.5", "id": "help", "conformanceLevel": "AAA" },
        {
            "num": "3.3.6",
            "id": "error-prevention-all",
            "conformanceLevel": "AAA"
        },
        { "num": "4.1.1", "id": "parsing", "conformanceLevel": "A" },
        {
            "num": "4.1.2",
            "id": "name-role-value",
            "conformanceLevel": "A"
        },
        {
            "num": "4.1.3",
            "id": "status-messages",
            "conformanceLevel": "AA"
        }
    ]
};