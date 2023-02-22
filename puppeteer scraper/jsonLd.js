
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
    #techniques = {
        "ARIA6": {"url": "https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA6", "sc": "1.1.1", "description": "Using aria-label to provide labels for objects"},
        "ARIA5": {"url": "https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA5", "sc": "4.1.2", "description": "Using the title attribute to identify form controls when the label element cannot be used"},
        "ARIA11": {"url": "https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA11", "sc": ["1.3.1", "1.3.6", "2.4.1"], "description": "Using ARIA landmarks to identify regions of a page"},
        "ARIA7": {"url": "https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA7", "sc": "2.4.4", "description": "Using aria-labelledby for link purpose"},
        "ARIA16": {"url": "https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA16", "sc": "4.2.1", "description": "Using aria-labelledby to provide a name for user interface controls"},
        "": {"url": "", "sc": "", "description": ""},
        "": {"url": "", "sc": "", "description": ""},
        "": {"url": "", "sc": "", "description": ""},
        "": {"url": "", "sc": "", "description": ""},
        "": {"url": "", "sc": "", "description": ""},
        "": {"url": "", "sc": "", "description": ""},
    };

    constructor({validator, evaluatedPageUrl} = null, fileName = null){
        
        if(fileName != null){
            this.#json = require('./' + fileName);
            return;
        }
        
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
			"earl:result" : {
				
			},
			"earl:subject" : {
				"@id" : "????",
				"dcterms:source" : evaluatedPageUrl,
				"@type" : "earl:TestSubject"
			},
			"earl:test" : {
				"@id" : "https://imergo.com/ns/compliance/wcag21/techniques/html/H44", 
				"@type" : "earl:TestCriterion"
			},

			"@id" : "????",
			"@type" : "earl:Assertion"
		};
    }

    getJson(){
        return this.#json;
    }

    addNewElement(outcome, pointer = null, techniqueId, htmlElementPath){ // State: fail, cannotell, pass

        var element = Object.assign({}, this.#elementTemplate);

        var outcomeId;
        var outcomeType;

        if(outcome != "PASS"){
            outcomeId = this.#outcomes[outcome].id
            outcomeType = this.#outcomes[outcome].type
        }else{
            if(pointer != null){
                outcomeId = "earl:passed"
                outcomeType = "earl:Pass"
            } else{
                outcomeId = "earl:inapplicable"
                outcomeType = "earl:NotApplicable"
            }
        }
        

        element["earl:result"] = {
            "dcterms:description" : this.#techniques[techniqueId].description, 
            "earl:info" : "WCAG 2.1: technique " + techniqueId, 
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

        this.#json["@graph"].push(element);

        return;
    }

}