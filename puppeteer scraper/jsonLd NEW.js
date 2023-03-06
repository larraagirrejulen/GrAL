
class jsonLd{

    #json;
    #elementTemplate;
    #assertors = {
        "MV": {"name": "MAUVE Validator", "url": "http://mauve.isti.cnr.it"},
        "AM": {"name": "AccessMonitor Validator", "url": "https://accessmonitor.acessibilidade.gov.pt"},
        "AC": {"name": "AChecker Validator", "url": "https://achecker.achecks.ca/checker/index.php"},
    };
    #outcomes = {
        0: { outcome: "earl:passed", description: "No violations found" },
        1: { outcome: "earl:failed", description: "Found a violation ..." },
        2: { outcome: "earl:cantTell", description: "Found possible applicable issue, but not sure..." },
        3: { outcome: "earl:inapplicable", description: "SC is not applicable" }
    };
    #successCriterias = { 
        '1.1.1':'non-text-content',
        '1.2.1':'audio-only-and-video-only-prerecorded',
        '1.2.2':'captions-prerecorded',
        '1.2.3':'audio-description-or-media-alternative-prerecorded',
        '1.2.4':'captions-live',
        '1.2.5':'audio-description-prerecorded',
        '1.3.1':'info-and-relationships',
        '1.3.2':'meaningful-sequence',
        '1.3.3':'sensory-characteristics',
        '1.3.4':'orientation',
        '1.3.5':'identify-input-purpose',
        '1.4.1':'use-of-color',
        '1.4.2':'audio-control',
        '1.4.3':'contrast-minimum',
        '1.4.4':'resize-text',
        '1.4.5':'images-of-text',
        '1.4.10':'reflow',
        '1.4.11':'non-text-contrast',
        '1.4.12':'text-spacing',
        '1.4.13':'content-on-hover-or-focus',
        '2.1.1':'keyboard',
        '2.1.2':'no-keyboard-trap',
        '2.1.4':'character-key-shortcuts',
        '2.2.1':'timing-adjustable',
        '2.2.2':'pause-stop-hide',
        '2.3.1':'three-flashes-or-below-threshold',
        '2.4.1':'bypass-blocks',
        '2.4.2':'page-titled',
        '2.4.3':'focus-order',
        '2.4.4':'link-purpose-in-context',
        '2.4.5':'multiple-ways',
        '2.4.6':'headings-and-labels',
        '2.4.7':'focus-visible',
        '2.5.1':'pointer-gestures',
        '2.5.2':'pointer-cancellation',
        '2.5.3':'label-in-name',
        '2.5.4':'motion-actuation',
        '3.1.1':'language-of-page',
        '3.1.2':'language-of-parts',
        '3.2.1':'on-focus',
        '3.2.2':'on-input',
        '3.2.3':'consistent-navigation',
        '3.2.4':'consistent-identification',
        '3.3.1':'error-identification',
        '3.3.2':'labels-or-instructions',
        '3.3.3':'error-suggestion',
        '3.4.3':'error-prevention-legal-financial-data',
        '4.1.1':'parsing',
        '4.1.2':'name-role-value',
        '4.1.3':'status-messages'
    };

    constructor(assertor, evaluatedPageUrl, evaluatedPageTitle){
        
        const url = (new URL(evaluatedPageUrl));
        const domain = url.hostname.replace('www.','');

        const date = new Date();
        const currentDate = date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneOffset: true,
            timeZoneName: 'short'
          }).replace(/ GMT\+\d+/, '');

        this.#json = {
            "@context":
            {
                "@vocab": "http://www.w3.org/TR/WCAG-EM/#",
                "wcag2": "http://www.w3.org/TR/WCAG21/#",
                "earl": "http://www.w3.org/ns/earl#",
                "dct": "http://purl.org/dc/terms/",
                "wai": "http://www.w3.org/WAI/",
                "sch": "http://schema.org/",
                "xmlns": "http://xmlns.com/foaf/0.1/",

                "evaluationScope": "step1",
                "siteScope": "step1a",
                "conformanceTarget": { "@id": "step1b", "@type": "@id" },
                "accessibilitySupportBaseline": "step1c",
                "additionalEvalRequirement": "step1d",
                "structuredSample": "step3a",
                "auditResult": "step4",

                "siteName": "sch:name",
                "website": "wcag2:dfn-set-of-web-pages",
                "webpage": "wcag2:dfn-web-page-s",

                "Assertion": "earl:Assertion",
                "test":
                {
                    "@id": "earl:test",
                    "@type": "@id"
                },
                "assertedBy":
                {
                    "@id": "earl:assertedBy",
                    "@type": "@id"
                },
                "subject":
                {
                    "@id": "earl:subject",
                    "@type": "@id"
                },
                "result": "earl:result",
                "mode":
                {
                    "@id": "earl:mode",
                    "@type": "@id"
                },
                "outcome":
                {
                    "@id": "earl:outcome",
                    "@type": "@id"
                },
                "pointer":
                {
                    "@id": "earl:pointer",
                    "@type": "@id"
                },

                "title": "dct:title",
                "description": "dct:description",
                "hasPart": "dct:hasPart",
                "creator":
                {
                    "@id": "dct:creator",
                    "@type": "@id"
                },

                "id": "@id",
                "type": "@type"
            },

            "type": "Evaluation",
            "@language": "en",
    
            "title": "Accessibility Evaluation Report for " + domain + " Website",
            "commissioner": "https://github.com/larraagirrejulen/GrAL/tree/main/ac_check%20(react)",
            "creator": {
                "type": "earl:Assertor",
                "xmlns:name": assertor
            },
            "dct:date": currentDate,
            "dct:summary": "Undefined",
    
            "evaluationScope":
            {
                "type": "EvaluationScope",
                "website":
                {
                    "id": "_:website",
                    "type": [
                        "earl:TestSubject",
                        "sch:WebSite"
                    ],
                    "siteName": domain,
                    "siteScope": "Single page: " + url
                },
                "conformanceTarget": "wai:WCAG2AA-Conformance",
                "accessibilitySupportBaseline": "Google Chrome latest version",
                "additionalEvalRequirement": "The report will include a list of all errors identified by the evaluator, rather than examples only"
            },
    
            "structuredSample":
            {
                "type": "Sample",
                "webpage": [
                {
                    "id": "_:webpage",
                    "@type": ["earl:TestSubject", "sch:WebPage"],
                    "description": url + " (desktop version)",
                    "source": url,
                    "title": evaluatedPageTitle,
                    "tested": true
                }]
            },
    
            "auditResult": []
        };

        Object.keys(this.#successCriterias).forEach(function(key) {
            this.#json["@graph"][0].auditResult.push(
                {
                    "type": "Assertion",
                    "test": "WCAG2:" + this.#successCriterias[key],
                    "subject": "_:website",
                    "result":
                    {
                        "outcome": "earl:untested",
                        "description": ""
                    },
                    "hasPart": []
                }
            );
        })

        this.#elementTemplate = {
			"auditID" : "????",
			"earl:assertedBy" : {
				"doap:name" : this.#assertors[assertor].name,
				"@id" : this.#assertors[assertor].url, 
				"@type" : "earl:Software"
			},
			"earl:mode" : {
				"@id" : "earl:automatic",
				"@type" : "earl:TestMode"
			},
			"earl:result" : {},
			"earl:subject" : {
				"@id" : "????",
				"dcterms:source" : evaluatedPageUrl,
				"@type" : "earl:TestSubject"
			},
			"earl:test" : {},
			"@id" : "????",
			"@type" : "earl:Assertion"
		};
    }

    getJson(){
        return this.#json;
    }

    getNewAuditResult(successCriteriaNumber, outcome, description){

        const successCriteriaId = this.#successCriterias[successCriteriaNumber]


        return {
            "type": "Assertion",
            "test": "WCAG2:" + successCriteriaId,
            "assertedBy": "_:evaluator",
            "subject": "_:website",
            "result":
            {
                "outcome": this.#outcomes[outcome].outcome,
                "description": this.#outcomes[outcome].description,
                "date": currentDate
            },
            "mode": "earl:automatic",
            "hasPart": []
        }
    }

}

module.exports = jsonLd;