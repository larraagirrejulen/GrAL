
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
        "PASS": {"id": "earl:inapplicable", "type": "earl:NotApplicable"},
        "CANNOTTELL": {"id": "earl:failed", "type": "earl:Fail"},
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
				"doap:name" : this.#validators[validator]["name"],
				"@id" : this.#validators[validator]["url"], 
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

    addNewElement(outcome, techniqueId){ // State: fail, cannotell, pass

        var element = Object.assign({}, this.#elementTemplate);

        element["earl:result"] = {
            "dcterms:description" : "Using label elements to associate text labels with form controls.", 
            "earl:info" : "WCAG 2.1: technique " + techniqueId, 
            "earl:outcome" : {
                "@id" : "earl:" + this.#outcomes[outcome].id, 
                "@type" : "earl:" + this.#outcomes[outcome].type, 
            }, 
            "earl:pointer" : {
                "ptr:expression" : "//html/body/div/header/div[4]/div/div/div[1]/div/div/section/div/div[2]/div/form/fieldset/div[2]/select", 
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