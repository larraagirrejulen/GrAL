
export default class jsonLd{

    #json;
    #elementTemplate;
    #validators = {
        "MV": {"name": "MAUVE Validator", "url": "http://mauve.isti.cnr.it"},
        "AM": {"name": "AccessMonitor Validator", "url": "https://accessmonitor.acessibilidade.gov.pt"},
        "AC": {"name": "AChecker Validator", "url": "https://achecker.achecks.ca/checker/index.php"},
    };
    #outcomes = {
        "FAIL": {"id": "earl:failed", "type": "earl:Fail"},
        "CANNOTTELL": {"id": "earl:failed", "type": "earl:Fail"},
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

    constructor(validator, evaluatedPageUrl){
        
        this.#json = {
            "@contest": {
                "doap" : "http://usefulinc.com/ns/doap#",
                "dc" : "http://purl.org/dc/elements/1.1/",
                "foaf" : "http://xmlns.com/foaf/0.1/",
                "vs" : "http://www.w3.org/2003/06/sw-vocab-status/ns#",
                "owl" : "http://www.w3.org/2002/07/owl#",
                "rdfs" : "http://www.w3.org/2000/01/rdf-schema#",
                "rdf" : "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                "wot" : "http://xmlns.com/wot/0.1/",
                "dcterms" : "http://purl.org/dc/terms/",
                "skos" : "http://www.w3.org/2004/02/skos/core#",
                "dcam" : "http://purl.org/dc/dcam/",
                "xsd" : "http://www.w3.org/2001/XMLSchema#",
                "earl" : "https://www.w3.org/ns/earl#",
                "ptr" : "http://www.w3.org/2009/pointers#"
            },
            "@graph" : [ ]
        };

        this.#elementTemplate = {
			"auditID" : "????",
			"earl:assertedBy" : {
				"doap:name" : this.#validators[validator].name,
				"@id" : this.#validators[validator].url, 
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

    addNewElement(outcome, criteriaId, criteriaDescription, htmlElementPath = null){

        var element = Object.assign({}, this.#elementTemplate);

        var outcomeId;
        var outcomeType;

        if(outcome != "PASS"){
            outcomeId = this.#outcomes[outcome].id
            outcomeType = this.#outcomes[outcome].type
        }else{
            if(htmlElementPath != null){
                outcomeId = "earl:passed"
                outcomeType = "earl:Pass"
            } else{
                outcomeId = "earl:inapplicable"
                outcomeType = "earl:NotApplicable"
            }
        }
        
        element["earl:result"] = {
            "dcterms:description" : criteriaDescription, 
            "earl:info" : "WCAG 2.1 Success Criteria " + criteriaId + ": " + this.#successCriterias[criteriaId], 
            "earl:outcome" : {
                "@id" : outcomeId, 
                "@type" : outcomeType, 
            }, 
            "earl:pointer" : {
                "ptr:expression" : htmlElementPath, 
                "ptr:namespace" : { 
                    "@id" : "http://www.w3.org/1999/xhtml", 
                    "@type" : "ptr:NamespaceMapping", 
                    "ptr:namespaceName" : "http://www.w3.org/1999/xhtml", 
                    "ptr:prefix" :  "" 
                }, 
                "@id" : "????", 
                "@type" : "ptr:XPathPointer"
            },
            "dcterms:title" : outcome, 
            "@id" : "????", 
            "@type" : "earl:TestResult"
        };

        element["earl:test"] = {
            "@id" : "https://www.w3.org/WAI/WCAG21/quickref/#" + this.#successCriterias[criteriaId],
            "@type" : "earl:TestCriterion"
        };

        this.#json["@graph"].push(element);

        return;
    }

}