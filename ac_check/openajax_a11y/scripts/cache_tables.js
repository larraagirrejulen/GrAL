/*
 * Copyright 2011-2018 OpenAjax Alliance
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// import {OpenAjax} from '../openajax_a11y_constants.js';

/* ---------------------------------------------------------------- */
/*                            TableInfo                             */
/* ---------------------------------------------------------------- */

/**
 * @constructor TableInfo
 *
 * @memberOf OpenAjax.a11y.cache
 *
 * @desc Creates a TableInfo object for preserving the current table information
 *        when traversing the DOM for table information
 *
 * @property {Object}               parent_element     - Parent table cache Object (if any)
 * @property {TableElement}         table_element      - Parent TableElement (if any)
 * @property {TBodyElement}         table_body_element - Parent TBodyElement (if any)
 * @property {TableRowElement}      table_row_element  - Parent TableRowElement (if any)
 *
 * @param {TableInfo} table_info - Current ControlInfo object
 */

 OpenAjax.a11y.cache.TableInfo = function (table_info) {

   if (table_info) {
     this.parent_element      = table_info.parent_element;
     this.table_element       = table_info.table_element;
     this.table_body_element  = table_info.table_body_element;
     this.table_row_element   = table_info.table_row_element;
   }
   else {
     this.parent_element      = null;
     this.table_element       = null;
     this.table_body_element  = null;
     this.table_row_element   = null;
   }
 };

/* ---------------------------------------------------------------- */
/*                          TablesCache Object                      */
/* ---------------------------------------------------------------- */

/**
 * @constructor TablesCache
 *
 * @memberOf OpenAjax.a11y.cache
 *
 * @desc Create a table cache object to hold information about tables in a web page
 *
 * @param {DOMCache}   dom_cache   - Reference to the DOMCache object
 *
 * @property {DOMCache}  dom_cache   - Reference to the DOMCache object
 * @property {Boolean}   up_to_date  - true if the cache has been creating using the current DOMElements, else false
 *                                       NOTE: This is a common property of all caches and is used when selectively build caches
 *                                             based on whether a rule needs the cache
 *
 * @property {Array}    child_cache_elements - Root array of the tree representation of the table elements in the document
 *
 * @property {Array}    table_elements - Array of all the TableElement objects in the cache
 * @property {Number}   length         - Running length of the table_elements array for use in calculating cache_id values
 *
 * @property {Array}    rule_results   - Root array of the tree representation of the table elements in the document
 *
 * @property {ResultRuleSummary}  rule_summary_result  - Rule results associated with this cache
 */
OpenAjax.a11y.cache.TablesCache = function (dom_cache) {

  // Private properties
  this.dom_cache = dom_cache;
  this.up_to_date = false;

  // Public properties
  this.child_cache_elements = [];

  this.table_elements = [];
  this.length         = 0;

  this.page_element  = null;


};

/**
 * @method addTableElement
 *
 * @memberOf OpenAjax.a11y.cache.TablesCache
 *
 * @desc Adds a table element object to the list of tables and generates a cache_id for the table element object
 *
 * @param {TableElement}  table_element   - TableElement object to add to the cache
 *
 * @return {Number} Returns the number of table element objects in the list
 *
 */
 OpenAjax.a11y.cache.TablesCache.prototype.addTableElement = function (table_element) {

   // item must exist and have the position property
   if (table_element) {
     this.length = this.length + 1;
     table_element.document_order = this.length;
     table_element.cache_id = "table_" + this.length;
     this.table_elements.push( table_element );
   }

   return this.length;

 };

/**
 * @method addChild
 *
 * @memberOf OpenAjax.a11y.cache.TablesCache
 *
 * @desc Adds a cache table element to the tree representation of the table in the table cache
 *
 * @param  {TableElement | CaptionElement | THeadElement | TBodyElement | TableRowElement | TableCellElement }  table_element  - Cache table element object to add to root of tree of table elements
 */

 OpenAjax.a11y.cache.TablesCache.prototype.addChild = function (table_element) {
   if (table_element) {
     this.child_cache_elements.push(table_element);
   }
 };

/**
 * @method addRuleResult
 *
 * @memberOf OpenAjax.a11y.cache.TablesCache
 *
 * @desc Add a RuleResult reference to the table cache
 *
 * @param {RuleResult}  rule_result - Rule result to associate with the table cache
 */
 OpenAjax.a11y.cache.TablesCache.prototype.addRuleResult = function (rule_result) {

   if (rule_result) {
     this.rule_results.push(rule_result);
   }
 };

/**
 * @deprecated getTableElementByCacheId
 *
 * @memberOf OpenAjax.a11y.cache.TablesCache
 *
 * @desc Finds the the table cache element object with the matching cache id
 *
 * @param  {String}  cache_id  - Cache id of table cache element object
 *
 * @return {TableElement | CaptionElement | THeadElement | TBodyElement | TableRowElement | TableCellElement | null} Returns cache table element object if cache id is found, otherwise null
 */
 OpenAjax.a11y.cache.TablesCache.prototype.getTableElementByCacheId = function (cache_id) {
   return this.getItemByCacheId(cache_id);
 };

/**
 * @method getItemByCacheId
 *
 * @memberOf OpenAjax.a11y.cache.TablesCache
 *
 * @desc Finds the the table cache element object with the matching cache id
 *
 * @param  {String}  cache_id  - Cache id of table cache element object
 *
 * @return {TableElement | CaptionElement | THeadElement | TBodyElement | TableRowElement | TableCellElement | null} Returns cache table element object if cache id is found, otherwise null
 */
 OpenAjax.a11y.cache.TablesCache.prototype.getItemByCacheId = function (cache_id) {

   var i;
   var te;
   var table_elements_len = this.table_elements.length;
   var id_info = cache_id.split('_');
   var table_id = "table_" + id_info[1];

   for (i = 0; i < table_elements_len; i++) {
     te = this.table_elements[i];

     if (te.cache_id == cache_id) {
       return te;
     }
     else {
       if (te.cache_id == table_id) {
         return te.getTableElementByCacheId(cache_id);
       }
     }
   }

   return null;
 };

/**
 * @method getRuleResultByCacheId
 *
 * @memberOf OpenAjax.a11y.cache.TablesCache
 *
 * @desc Finds the the rule result object with the matching cache id
 *
 * @param  {String}  cache_id  - Cache id of table cache element object
 *
 * @return {ResultRule | null} Returns cache rule result object if cache id is found, otherwise null
 */
 OpenAjax.a11y.cache.TablesCache.prototype.getRuleResultByCacheId = function (cache_id) {

   var i;
   var rr;
   var rule_results     = this.evaluation_results.rule_results;
   var rule_results_len = rule_results.length;

   for (i = 0; i < rule_results_len; i++) {
     rr = rule_results[i];
     if (rr.cache_id == cache_id) return rr;
   } // end loop

   return null;
 };
/**
 * @method getRuleResultByRuleId
 *
 * @memberOf OpenAjax.a11y.cache.TablesCache
 *
 * @desc Gets the rule result object with the matching rule id
 *
 * @param {String} rule_id - rule id of table element
 *
 * @return {RuleResult | null}}  Returns rule result object if rule id is found, otherwise null
 */

 OpenAjax.a11y.cache.TablesCache.prototype.getRuleResultByRuleId = function (rule_id) {

  var i;
  var rr;
  var rule_results_len = this.rule_results.length;

  for (i = 0; i < rule_results_len; i++) {
    rr = this.rule_results[i];

    if (rr.rule.rule_id == rule_id) {
      return rr;
    }
  }

  return null;
};


/**
 * @method updateCacheItems
 *
 * @memberOf OpenAjax.a11y.cache.TablesCache
 *
 * @desc Updates the tables cache object by checking to see if a dom element object
 *          should be added to the table cache objects
 *
 * @param  {DOMElement}  dom_element  - DOMElement object to check for inclusion in tables cache
 * @param  {TableInfo}   table_info   - Information about the current table relationships in the DOM
 */

 OpenAjax.a11y.cache.TablesCache.prototype.updateCacheItems = function (dom_element, table_info) {

   var te;
   var tce;
   var ce;
   var tbe;
   var the;
   var tre;

   var ti = new OpenAjax.a11y.cache.TableInfo(table_info);

   switch (dom_element.tag_name) {

     case 'table':
       te = new OpenAjax.a11y.cache.TableElement(this.dom_cache, dom_element, table_info);
       this.addTableElement(te);

       if (table_info.parent_element) {
         table_info.parent_element.addChild(te);
       }
       else {
         this.addChild(te);
       }

       ti.parent_element = te;
       ti.table_element  = te;
       ti.table_body_element  = null;
       ti.table_row_element  = null;

       this.dom_cache.getAccessibleNameDescriptionForTable(te);

       break;

     case 'caption':
       ce = new OpenAjax.a11y.cache.CaptionElement(dom_element, table_info);

       te = table_info.table_element;

       if (te) {
         table_info.table_element.addTableElement(ce);
         if (table_info.parent_element) {
           table_info.parent_element.addChild(ce);
         }

         this.dom_cache.getAccessibleNameDescriptionForTable(te, ce);

       }

       break;

     case 'thead':
       the = new OpenAjax.a11y.cache.THeadElement(dom_element, table_info);

       if (table_info.table_element) {
         table_info.table_element.addTableElement(the);
         if (table_info.parent_element) {
           table_info.parent_element.addChild(the);
         }
       }

       ti.parent_element     = the;
       ti.table_body_element = the;
       ti.table_row_element  = null;

       break;

     case 'tbody':
       tbe = new OpenAjax.a11y.cache.TBodyElement(dom_element, table_info);

       if (table_info.table_element) {
         table_info.table_element.addTableElement(tbe);

         if (table_info.parent_element) {
           table_info.parent_element.addChild(tbe);
         }
       }

       ti.parent_element = tbe;
       ti.table_body_element = tbe;
       ti.table_row_element  = null;

       break;

     case 'tr':
       tre = new OpenAjax.a11y.cache.TableRowElement(dom_element, table_info);

       if (table_info.table_element) {
         table_info.table_element.addTableElement(tre);

         if (table_info.parent_element) {
           table_info.parent_element.addChild(tre);
         }

         if (table_info.table_body_element) {
           table_info.table_body_element.row_count++;
         }
       }

       ti.parent_element     = tre;
       ti.table_row_element  = tre;

       break;


     case 'td':
     case 'th':
       tce = new OpenAjax.a11y.cache.TableCellElement(dom_element, table_info);

       if (table_info.table_element) {
         table_info.table_element.addTableElement(tce);

         if (table_info.parent_element) {
           table_info.parent_element.addChild(tce);
         }
       }

       ti.parent_element      = tce;

       break;

     case 'body':
       if (!this.page_element) {
         this.page_element = new OpenAjax.a11y.cache.PageElementLayout(dom_element);
       }
       break;

     default:
       break;

   } // end switch

   return ti;
 };

/**
 * @method traverseDOMElementsForTableElements
 *
 * @memberOf OpenAjax.a11y.cache.TablesCache
 *
 * @desc Traverses the DOMElements to update table elements
 *
 * @param {TableElement}      dom_element  - DOMElement object to check fo inclusion in tables cache
 * @param {TableInformation}  table_info   - Information needed for identifying the parent/child relationships of nested tables
 */

 OpenAjax.a11y.cache.TablesCache.prototype.traverseDOMElementsForTableElements = function (dom_element, table_info) {

   var i;
   var ti;

   if (!dom_element) return;

     if (dom_element.type == Node.ELEMENT_NODE) {

       ti = this.updateCacheItems(dom_element, table_info);

       for (i=0; i<dom_element.child_dom_elements.length; i++ ) {
         this.traverseDOMElementsForTableElements(dom_element.child_dom_elements[i], ti);
       } // end loop
     }
 };

/**
 * @method updateCache
 *
 * @memberOf OpenAjax.a11y.cache.TablesCache
 *
 * @desc Traverses the DOMElements to update the tables cache
 *       NOTE: This function is only used when the specialized caches
 *       are build as rules need them.  In this condition, if the rules
 *       dependent on the controls cache are disabled, this cache would
 *       not be updated
 */

 OpenAjax.a11y.cache.TablesCache.prototype.updateCache = function () {

   var i;
   var children = this.dom_cache.element_cache.child_dom_elements;
   var children_len = children.length;

   var table_info = new OpenAjax.a11y.cache.TableInfo(null);


   for (i=0; i < children_len; i++) {
     this.traverseDOMElementsForTableElements(children[i], table_info);
   }

   this.up_to_date = true;
 };

/* ---------------------------------------------------------------- */
/*                       TableElement Object                        */
/* ---------------------------------------------------------------- */

/**
 * @constructs TableElement
 *
 * @memberOf OpenAjax.a11y.cache
 *
 * @desc Creates table element object used to hold data about a table
 *
 * @param  {DOMCache} dom_cache - Reference to the current dom cache for use of
 *                                dom cache methods to find references
 *
 * @param  {DOMElement}        dom_element         - dom_element object provides information about current dom node
 * @param  {TableCellElement}  table_cell_element  - table_cell_element object provides information about the table
 *                                                   cell the table may be a child of in the dom
 *
 * @property  {DOMCache}    dom_cache    - DOMCache reference for reference DOMCache methods for calculating headers
 * @property  {DOMElement}  dom_element  - DOMElement associated with the form element
 * @property  {String}      cache_id     - String that uniquely identifies the cache element object in the cache
 * @property  {Number}      document_order  - Ordinal position of the table element in the document in relationship to other table elements
 *
 * @property  {Array}       child_cache_elements  - Array of cache table elements as part of table elements relationship tree
 * @property  {Array}       table_elements        - List of all table element objects in this table element object
 * @property  {Number}      length                - Number of table element objects
 *
 * @property  {String}  accessible_name                - The caption for the table
 * @property  {String}  accessible_name_for_comparison - The caption for the table used for comparison
 * @property  {Number}  accessible_name_length         - Length of the caption used for comparison
 * @property  {Number}  accessible_name_source         - Numeric constant representing the source of the caption
 *
 * @property  {String}  accessible_description                 - Summary of the table
 * @property  {String}  accessible_description_for_comparison  - Summary of table used for comparison
 * @property  {Number}  accessible_description_source          - Numeric constant representing the source of thesummary
 *
 * @property  {Number}  max_row     - Number of rows in a table
 * @property  {Number}  max_column  - Number of columns in a table
 * @property  {Number}  cell_count  - Number of cells (i.e. th and td elements) in a table
 *
 * @property  {Number}  row     - Used as the current row counter when traversing a table dom elements
 * @property  {Number}  column  - Used as the current column counter when traversing a table dom elements
 *
 * @property  {Array}   cells     - A two dimensional array representing the table row and columns
 * @property  {Array}   cell_ids  - List of table cell objects who have an id attribute defined
 *
 * @property  {Number}   table_role             - Constant identifying the role of the table: layout, data or unknown role
 * @property  {Boolean}  is_complex_data_table  - True if the table is identified as a complex data table
 *
 * @return {TableElement}
 */
 OpenAjax.a11y.cache.TableElement = function (dom_cache, dom_element, table_info) {

   if( !dom_element ) return null;

   this.table_type = OpenAjax.a11y.TABLE.TABLE_ELEMENT;

   this.dom_cache      = dom_cache;
   this.dom_element    = dom_element;
   this.cache_id       = "";
   this.document_order = 0;

   this.child_cache_elements = [];

   this.table_elements = [];
   this.length = 0;

   this.max_row = 0;
   this.max_column = 0;
   this.cell_count = 0;

   this.cell_count = 0;

   this.cell_ids = [];

   this.row      = -1;
   this.column   = 0;

   this.cells    = [];
   this.cells[0]  = [];
   this.cells[0][0] = null;

   this.accessible_name                = "";
   this.accessible_name_for_comparison = "";
   this.accessible_name_length         = "";
   this.accessible_name_source         = OpenAjax.a11y.SOURCE.NONE;

   this.accessible_description                = "";
   this.accessible_description_for_comparison = "";
   this.accessible_description_source         = OpenAjax.a11y.DESCRIPTION_SOURCE.NONE;

   if (dom_element.role &&
       (dom_element.role === 'presentation' || dom_element.role === 'none')) {
      this.table_role = OpenAjax.a11y.TABLE_ROLE.LAYOUT;
   } else {
      this.table_role = OpenAjax.a11y.TABLE_ROLE.UNKNOWN;
   }

   this.is_complex_data_table = false;

   this.nesting_level        = 0;
   this.layout_nesting_level = 0;
   this.layout_table_in_data_table = false;
   this.data_table_in_data_table = false;

   this.parent_table_element = table_info.table_element;

   if (table_info.table_element) {

     this.nesting_level = table_info.table_element.nesting_level + 1;

     if (table_info.table_element.table_role >= OpenAjax.a11y.TABLE_ROLE.DATA) {
       this.layout_in_data_table = true;
     }
     else {
       this.layout_nesting_level = table_info.table_element.layout_nesting_level + 1;
     }

   }

   return this;
 };

/**
 * @method setIsDataTable
 *
 * @memberOf OpenAjax.a11y.cache.TableElement
 *
 * @desc  Set is a data table property, if not already set
 */

OpenAjax.a11y.cache.TableElement.prototype.setIsDataTable = function () {

  // if role=presentation this is a layout table
  if (this.dom_element.has_role  &&
      (this.dom_element.role === 'presentation' || this.dom_element.role === 'none')) {

    this.setIsLayoutTable();
    return;
  }

  if(this.table_role >= OpenAjax.a11y.TABLE_ROLE.DATA) return;

  if (this.is_complex_data_table) this.table_role = OpenAjax.a11y.TABLE_ROLE.COMPLEX;
  else this.table_role = OpenAjax.a11y.TABLE_ROLE.DATA;

  if (this.parent_table_element) {

    if (this.parent_table_element.table_role >= OpenAjax.a11y.TABLE_ROLE.DATA) {
      this.layout_table_in_data_table = false;
      this.data_table_in_data_table = true;
    }

    this.layout_nesting_level = this.parent_table_element.layout_nesting_level + 1;

  }

};

/**
 * @method setIsLayoutTable
 *
 * @memberOf OpenAjax.a11y.cache.TableElement
 *
 * @desc  Set is a data table property, if not already set
 */

OpenAjax.a11y.cache.TableElement.prototype.setIsLayoutTable = function () {

  this.table_role = OpenAjax.a11y.TABLE_ROLE.LAYOUT;

  if (this.parent_table_element) {

    if (this.parent_table_element.table_role >= OpenAjax.a11y.TABLE_ROLE.DATA) {
      this.layout_table_in_data_table = true;
      this.data_table_in_data_table = false;
    }

    this.layout_nesting_level = this.parent_table_element.layout_nesting_level + 1;

  }

};


/**
 * @method getTableElementByCacheId
 *
 * @memberOf OpenAjax.a11y.cache.TableElement
 *
 * @desc  Retrieve table cache element from the tree of table cache elements
 *
 * @param  {String}  cache_id  -  cache_id of a table cache element
 *
 * @return  {CaptionElement | TheadElement | TBodyElement | TableRowElement | TableCellElement | null}  Returns table cache element if cahce id is found, otherwise null
 */
OpenAjax.a11y.cache.TableElement.prototype.getTableElementByCacheId = function (cache_id) {
  return this.getItemByCacheId(cache_id);
};

/**
 * @method getItemByCacheId
 *
 * @memberOf OpenAjax.a11y.cache.TableElement
 *
 * @desc  Retrieve table cache element from the tree of table cache elements
 *
 * @param  {String}  cache_id  -  cache_id of a table cache element
 *
 * @return  {CaptionElement | TheadElement | TBodyElement | TableRowElement | TableCellElement | null}  Returns table cache element if cahce id is found, otherwise null
 */

OpenAjax.a11y.cache.TableElement.prototype.getItemByCacheId = function (cache_id) {

   function traverseTableElements(table_elements) {
     var table_elements_len = table_elements.length;
     var to;
     var i;
     var ro;

     for (i = 0; i < table_elements_len; i++) {
       to = table_elements[i];

       if (to.cache_id == cache_id) {
         return to;
       }
       else {
         if (to.child_cache_elements && to.child_cache_elements.length) {
           ro = traverseTableElements(to.child_cache_elements);
           if (ro) return ro;
         }
       }
     } // end loop

     return null;
   }

   return traverseTableElements(this.child_cache_elements);

 };


/**
 * @method addTableElement
 *
 * @memberOf OpenAjax.a11y.cache.TableElement
 *
 * @desc    Adds a table cache element object to table_elements array and generates a cache id value for the table element object
 *
 * @param  {CaptionElement | TableTHeadElement | TableTBodyElement | TableRowElement | TableCellElement} table_element  - table cache element to add
 *
 * @return  {Number}  Returns the length the list of table elements
 *
 */
OpenAjax.a11y.cache.TableElement.prototype.addTableElement = function (table_element) {

   this.length = this.length + 1;
   table_element.document_order = this.length;
   table_element.cache_id = this.cache_id + "_te_" + this.length;

   this.table_elements.push(table_element);

   switch (table_element.table_type) {

   case OpenAjax.a11y.TABLE.CAPTION_ELEMENT:
     this.setIsDataTable();
     break;

   case OpenAjax.a11y.TABLE.THEAD_ELEMENT:
     this.setIsDataTable();
     break;

   case OpenAjax.a11y.TABLE.TBODY_ELEMENT:
     break;

   case OpenAjax.a11y.TABLE.TR_ELEMENT:
     this.nextRow();
     break;

   case OpenAjax.a11y.TABLE.TH_ELEMENT:
     this.setIsDataTable();

     if ((table_element.number_of_header_ids > 1) ||
         (table_element.row_span             > 1) ||
         (table_element.column_span          > 1)) {
       this.is_complex_data_table = true;
       this.table_role = OpenAjax.a11y.TABLE_ROLE.COMPLEX;
     }

     this.addTableCellElement(table_element);
     break;

   case OpenAjax.a11y.TABLE.TD_ELEMENT:

//   OpenAjax.a11y.logger.debug("  Data Table Assumption: " + OpenAjax.a11y.DATA_TABLE_ASSUMPTION);

     if (this.table_role >= OpenAjax.a11y.TABLE_ROLE.DATA) {
       if ((table_element.number_of_header_ids > 1) ||
           (table_element.row_span             > 1) ||
           (table_element.column_span          > 1)) {
         this.setIsDataTable();
         this.is_complex_data_table = true;
         this.table_role = OpenAjax.a11y.TABLE_ROLE.COMPLEX;
       }
     }

     this.addTableCellElement(table_element);
     break;

   default:
     break;


   } // end switch

   return this.length;

 };

/**
 * @method addChild
 *
 * @memberOf OpenAjax.a11y.cache.TableElement
 *
 * @desc Adds a cache table element to the root tree representation of the tree cache
 *
 * @param  {TableElement | CaptionElement | THeadElement | TBodyElement | TableRowElement | TableCellElement }  table_element  - Cache table element object to add to root of tree of table elements
 */

OpenAjax.a11y.cache.TableElement.prototype.addChild = function (table_element) {

 if (table_element) {
  this.child_cache_elements.push(table_element);
 }

};

/**
 * @method nextRow
 *
 * @memberOf OpenAjax.a11y.cache.TableElement
 *
 * @desc Updates the current table cell counters and array to start a new row in the table
 */
 OpenAjax.a11y.cache.TableElement.prototype.nextRow = function () {

//  OpenAjax.a11y.logger.debug("Row: " + this.row);

   if ((this.table_role !== OpenAjax.a11y.TABLE_ROLE.COMPLEX) &&
       (this.max_column > 2)) {
     this.multipleTHInRow(this.row);
   }

   this.row = this.row + 1;
   this.max_row = this.row + 1; // 1 based index

   // see if there is already a row created
   if (!this.cells[this.row]) {
     // If row does not exist create it
     this.cells[this.row] = [];
     this.cells[this.row][0] = null;
   }

   if ((this.table_role !== OpenAjax.a11y.TABLE_ROLE.COMPLEX) &&
       (this.max_row > 2)) {
     this.multipleTHInColumn();
   }
 };

/**
 * @method multipleTHInRow
 *
 * @memberOf OpenAjax.a11y.cache.TableElement
 *
 * @desc Tests to see if there are multiple table header cells in a row and sets complex data table flag if there are
 *
 * @param {Number} row - Number of the row to test for headers
 */
OpenAjax.a11y.cache.TableElement.prototype.multipleTHInRow = function(row) {

//  OpenAjax.a11y.logger.debug(" CELLS: " + (!this.cells[row]) + "  ROW LENGTH: " + this.cells[row]);

  if (!this.cells[row]) return;

  var i = 0;
  var th_count = 0;
  var td_count = 0;

  var cell;

  while (this.cells[row][i]) {
    cell = this.cells[row][i];
    if (cell) {
      if (cell.has_content) {
        if (cell.table_type == OpenAjax.a11y.TABLE.TH_ELEMENT) {
          th_count++;
        }
        else {
          td_count++;
        }
      }
    }
    i += 1;
  }

//  OpenAjax.a11y.logger.debug(" TH Count: " + th_count + "  TD count: " + td_count);

  if ((th_count > 1) && (td_count > 0)) {
    this.is_complex_data_table = true;
    this.table_role = OpenAjax.a11y.TABLE_ROLE.COMPLEX;
  }
};

/**
 * @method multipleTHInColumn
 *
 * @memberOf OpenAjax.a11y.cache.TableElement
 *
 * @desc Tests to see if there are multiple table header cells in a column and sets complex data table flag if there are
 *
 * @param {Number} column - Number of the column to test for headers
 */
 OpenAjax.a11y.cache.TableElement.prototype.multipleTHInColumn = function() {

   var th_count;
   var td_count;

   var cell;

   var c = 0;
   var r = 0;

   while (this.cells[0][c] &&
          (this.table_role !== OpenAjax.a11y.TABLE_ROLE.COMPLEX)) {

     th_count = 0;
     td_count = 0;
     r = 0;

     while (this.cells[r][c]  &&
            (this.table_role !== OpenAjax.a11y.TABLE_ROLE.COMPLEX)) {

       cell = this.cells[r][c];

       if (cell.has_content) {
         if (cell.table_type == OpenAjax.a11y.TABLE.TH_ELEMENT) {
           th_count++;
         }
         else {
           td_count++;
         }
       }

       if (th_count > 1 && td_count > 1) {
         this.is_complex_data_table = true;
         this.table_role = OpenAjax.a11y.TABLE_ROLE.COMPLEX;
         return;
       }

       r += 1;
     }

     c += 1;
   }
 };

/**
 * @method addTableCellElement
 *
 * @memberOf OpenAjax.a11y.cache.TableElement
 *
 * @desc Adds a TableCellElement to the current row
 *
 * @param {TableCellElement}  table_cell_element  -  The table cell element object to add in to the current row and column of a table
 */
 OpenAjax.a11y.cache.TableElement.prototype.addTableCellElement = function (table_cell_element) {

   var i;
   var j;
   var r;
   var c;

   this.column = 0;

   if (table_cell_element.id &&
       table_cell_element.id.length) {
     this.cell_ids.push(table_cell_element.id);
   }

   // find the next available spot in cells array, this needs to be calculated due to row and column spanning
   while ((this.cells[this.row][this.column] !== undefined) &&
          (this.cells[this.row][this.column] !== null)) {
     this.column++;
   } // end loop

   r = this.row;
   c = this.column;

   table_cell_element.row    = r;
   table_cell_element.column = c;

   for (i=0; i<table_cell_element.row_span; i++) {

     for (j=0; j<table_cell_element.column_span; j++) {
       this.cells[r][c] = table_cell_element;
       c += 1;
     }
     r += 1;

     // see if there is already a row created
     if (!this.cells[r]) {
       // If row does not exist create it
       this.cells[r] = [];
       this.cells[r][0] = null;
     }
   }
   this.setTableCellHeader(this.row, this.column, table_cell_element);

   if (c > this.max_column) this.max_column = c;

   this.cell_count++;

 };

/**
 * @method sortCellIds
 *
 * @memberOf OpenAjax.a11y.cache.TableElement
 *
 * @desc Sorts the cell ids array for this table based on the id values
 */
 OpenAjax.a11y.cache.TableElement.prototype.sortCellIds = function () {

   var swapped = false;
   var temp = null;
   var i;

   var cell_ids_len = this.cell_ids.length;

   do{
     swapped = false;

     for (i = 1; i < cell_ids_len; i++ ) {

       if (this.cell_ids[i-1] > this.cell_ids[i]) {

         // swap the values
         temp = this.cell_ids[i-1];
         this.cell_ids[i-1] = this.cell_ids[i];
         this.cell_ids[i] = temp;
         swapped = true;
       }
     } // end loop
   } while (swapped);
 };

/**
 * @method setTableCellHeader
 *
 * @memberOf OpenAjax.a11y.cache.TableElement
 *
 * @desc Sets header content property of the table cell element object
 *
 * @param {Number}            row                 - Current row position of the table cell element object
 * @param {Number}            column              - Current column position of the table cell element object
 * @param {TableCellElement}  table_cell_element  - Table cell element object to create header content property
 */
 OpenAjax.a11y.cache.TableElement.prototype.setTableCellHeader = function (row, column, table_cell_element) {

   var tag_name;
   var scope;
   var string_array = [];
   var cell, r, c;

   var normalizeSpace = OpenAjax.a11y.util.normalizeSpace;

   tag_name = table_cell_element.dom_element.tag_name;
   scope  = table_cell_element.dom_element.scope;

   table_cell_element.header_source =  OpenAjax.a11y.HEADER_SOURCE.NONE;

   if (table_cell_element.headers) {
     var hc = this.dom_cache.element_with_id_cache.getTextFromIds(table_cell_element.headers);
     table_cell_element.header_content = normalizeSpace(hc);
     if (table_cell_element.header_content.length) table_cell_element.header_source =  OpenAjax.a11y.HEADER_SOURCE.HEADERS_ATTRIBUTE;
   }
   else {
     // if a table cell is used as a header in the table and has no header attribute set its header to an empty string
     if (table_cell_element.table_type === OpenAjax.a11y.TABLE.TH_ELEMENT) {
       table_cell_element.header_content = "";
     }
     else {

       // find TH or TD with scope=column in the same column
       for (r=(row-1); r>=0; r--) {
         cell = this.cells[r][column];

         if (cell) {
           tag_name = cell.dom_element.tag_name;
           scope  = cell.scope;

           if (tag_name == "th" || scope == "col") {
             if (!cell.cell_text) cell.cell_text = normalizeSpace(cell.dom_element.getText());
             string_array.push(cell.cell_text);
           }
         }
       }

       // find TH or TD with scope=row in the same row
       for (c=(column-1); c>=0; c--) {
         cell = this.cells[row][c];

         if (cell) {
           tag_name = cell.dom_element.tag_name;
           scope  = cell.scope;

           if (tag_name == "th" || scope == "row") {
             if (!cell.cell_text) cell.cell_text = normalizeSpace(cell.dom_element.getText());
             string_array.push(cell.cell_text);
           }
         }
       }
       table_cell_element.header_content = normalizeSpace(string_array.join(' '));

       if (table_cell_element.header_content.length) table_cell_element.header_source =  OpenAjax.a11y.HEADER_SOURCE.ROW_OR_COLUMN_HEADERS;
     }
   }
 };

/**
 * @method findFirstRowWithContent
 *
 * @memberOf OpenAjax.a11y.cache.TableElement
 *
 * @desc Finds the first row of the table which has text content in at least one cell.
 *       This is used to skip rows that are used for stylistic puposes, since they usually
 *       do not have any text content other than spaces in them.
 *
 * @return {Number}  Returns number of first row with content
 *
 */
 OpenAjax.a11y.cache.TableElement.prototype.findFirstRowWithContent = function() {

   var r;
   var c;
   var max_row = this.max_row;
   var max_col;
   var text;
   var cell;

   for (r = 0; r < max_row; r++) {
     max_col = this.cells[r].length;

     for (c = 0; c < max_col; c++) {
       cell = this.cells[r][c];

       if (!cell || !cell.dom_element) continue;

       text = cell.dom_element.getText();

       if (text) text = OpenAjax.a11y.util.normalizeSpace(text);

       if (cell.table_type == OpenAjax.a11y.TABLE.TH_ELEMENT ||
           text.length) {
         return r;
       }
     }
   }
   return -1;
 };

/**
 * @method findFirstColumnWithContent
 *
 * @memberOf OpenAjax.a11y.cache.TableElement
 *
 * @desc Finds the first column of the table which has text content in at least one cell.
 *       This is used to skip columns that are used for stylistic puposes, since they usually
 *       do not have any text content other than spaces in them.
 *
 * @return {Number}  Returns number of first column with content
 *
 */
 OpenAjax.a11y.cache.TableElement.prototype.findFirstColumnWithContent = function() {

   var r;
   var c;
   var max_col = this.max_column;
   var max_row = this.max_row;
   var text;
   var cell;

   for (c = 0; c < max_col; c++) {

     for (r = 0; r < max_row; r++) {

       cell = this.cells[r][c];

       if (!cell || !cell.dom_element) continue;

       text = cell.dom_element.getText();

       if (text) text = OpenAjax.a11y.util.normalizeSpace(text);

       if (cell.table_type == OpenAjax.a11y.TABLE.TH_ELEMENT ||
           text.length) {
         return c;
       }
     }
   }
   return -1;
 };


/**
 * @method headerCellsInFirstRow
 *
 * @memberOf OpenAjax.a11y.cache.TableElement
 *
 * @desc Calculates the number of non-empty cells in the first row with content and
 *       how many of the non-empty cells are header cells
 *
 * @return {Object} Returns an object with two properties 'total' and 'th_count'
 */
 OpenAjax.a11y.cache.TableElement.prototype.headerCellsInFirstRow = function () {

   // ro is the Return Object
   var ro = {};
   ro.total = 0;
   ro.th_count = 0;

   var c;
   var max_col;
   var cell;
   var text;

   var r = this.findFirstRowWithContent();

   if (r < 0) return ro;

   if (this.cells[r]) {

     max_col = this.cells[r].length;

     for (c = 0; c < max_col;) {
       cell = this.cells[r][c];

       if (cell.table_type == OpenAjax.a11y.TABLE.TH_ELEMENT) {
         ro.total++;
         ro.th_count++;
       }
       else {
         text = cell.dom_element.getText();

         if (text) text = OpenAjax.a11y.util.normalizeSpace(text);

         if (text.length) {
           ro.total++;
         }
       }
       c += cell.column_span;
     }
   }
   return ro;
 };

/**
 * @method headerCellsInFirstColumn
 *
 * @memberOf OpenAjax.a11y.cache.TableElement
 *
 * @desc Calculates the number of non-empty cells in the first column with content and
 *       how many of the non-empty cells are header cells
 *
 * @return {Object} Returns an object with two properties 'total' and 'th_count'
 */
 OpenAjax.a11y.cache.TableElement.prototype.headerCellsInFirstColumn = function () {

   // ro is the Return Object
   var ro = {};
   ro.total = 0;
   ro.th_count = 0;

   var r;
   var c;
   var text;
   var cell;
   var max_row;

   c = this.findFirstColumnWithContent();

   if (c < 0) return ro;

   max_row = this.max_row;

   for (r = 0; r < max_row;) {
     cell = this.cells[r][c];

     if (!cell) break;

     if (cell.table_type == OpenAjax.a11y.TABLE.TH_ELEMENT) {
       ro.total++;
       ro.th_count++;
     }
     else {
       text = cell.dom_element.getText();

       if (text) text = OpenAjax.a11y.util.normalizeSpace(text);

       if (text.length) {
         ro.total++;
       }
     }
     r += cell.row_span;
   }
   return ro;
 };

/**
 * @method getElementResults
 *
 * @memberOf OpenAjax.a11y.cache.TableElement
 *
 * @desc Returns an array of node results in severity order
 *
 * @return {Array} Returns a array of node results
 */

OpenAjax.a11y.cache.TableElement.prototype.getElementResults = function () {
  return this.dom_element.getElementResults();
};

/**
 * @method getAttributes
 *
 * @memberOf OpenAjax.a11y.cache.TableElement
 *
 * @desc Returns an array of attributes for the element, sorted in alphabetical order
 *
 * @return {Array} Returns a array of node results
 */

OpenAjax.a11y.cache.TableElement.prototype.getAttributes = function (unsorted) {

  var cache_nls = OpenAjax.a11y.nls.Cache;

  var attributes = this.dom_element.getAttributes(unsorted);

  attributes.push(cache_nls.getLabelAndValueNLS('summary', this.accessible_description));
  attributes.push(cache_nls.getLabelAndValueNLS('role', this.dom_element.role));

  if (!unsorted) this.dom_element.sortItems(attributes);

  return attributes;
};

/**
 * @method getEvents
 *
 * @memberOf OpenAjax.a11y.cache.TableElement
 *
 * @desc Returns an array of events for the element, sorted in alphabetical order
 *
 * @return {Array} Returns a array of event information
 */

OpenAjax.a11y.cache.TableElement.prototype.getEvents = function () {

  return this.dom_element.getEvents();

};


/**
 * @method getStyle
 *
 * @memberOf OpenAjax.a11y.cache.TableElement
 *
 * @desc Returns an array of style items
 *
 * @return {Array} Returns a array of style items
 */

OpenAjax.a11y.cache.TableElement.prototype.getStyle = function () {

  return this.dom_element.getStyle();

};

/**
 * @method getCacheProperties
 *
 * @memberOf OpenAjax.a11y.cache.TableElement
 *
 * @desc Returns an array of cache properties sorted by property name
 *
 * @return {Array} Returns a array of cache properties
 */

OpenAjax.a11y.cache.TableElement.prototype.getCacheProperties = function () {

  var cache_nls = OpenAjax.a11y.nls.Cache;

  var properties = this.dom_element.getCacheProperties();

  properties.push(cache_nls.getLabelAndValueNLS('table_role',             this.table_role));
  properties.push(cache_nls.getLabelAndValueNLS('is_complex_data_table',  this.is_complex_data_table));
  properties.push(cache_nls.getLabelAndValueNLS('caption',                this.accessible_name));
  properties.push(cache_nls.getLabelAndValueNLS('caption_for_comparison', this.accessible_name_for_comparison));
  properties.push(cache_nls.getLabelAndValueNLS('caption_source',         this.accessible_name_source));
  properties.push(cache_nls.getLabelAndValueNLS('summary',                this.accessible_description));
  properties.push(cache_nls.getLabelAndValueNLS('summary_source',         this.accessible_description_source));
  properties.push(cache_nls.getLabelAndValueNLS('max_row',                this.max_row));
  properties.push(cache_nls.getLabelAndValueNLS('max_column',             this.max_column));
  properties.push(cache_nls.getLabelAndValueNLS('cell_count',             this.cell_count));
  properties.push(cache_nls.getLabelAndValueNLS('nesting_level',          this.nesting_level));

  this.dom_element.sortItems(properties);

  return properties;
};

/**
 * @method getCachePropertyValue
 *
 * @memberOf OpenAjax.a11y.cache.TableElement
 *
 * @desc Returns the value of a property
 *
 * @param {String}  property  - The property to retreive the value
 *
 * @return {String | Number} Returns the value of the property
 */

OpenAjax.a11y.cache.TableElement.prototype.getCachePropertyValue = function (property) {

  if (typeof this[property] == 'undefined') {
    return this.dom_element.getCachePropertyValue(property);
  }

  return this[property];
};


/**
 * @method toString
 *
 * @memberOf OpenAjax.a11y.cache.TableElement
 *
 * @desc Creates a text string representation of the table element object
 *
 * @return {String} Returns a text string representation of the table
 */
 OpenAjax.a11y.cache.TableElement.prototype.toString = function () {
   var str = this.max_column + "x" + this.max_row + " ";

   if (this.table_role >= OpenAjax.a11y.TABLE_ROLE.DATA) {

     if (this.table_role === OpenAjax.a11y.TABLE_ROLE.DATA) {
       str += "Data Table: ";
     }
     else {
       str += "Complex Data Table: ";
     }

     if (this.accessible_name && this.accessible_name.length) str += this.accessible_name;
     else  str += "no name";

   }
   else {
     if (this.table_role === OpenAjax.a11y.TABLE_ROLE.LAYOUT) str += "Layout Table ";
     else str += "Table: unknown role on page";
   }

   return str;

 };


/* ---------------------------------------------------------------- */
/*                         CaptionElement Object                    */
/* ---------------------------------------------------------------- */

/**
 * @constructor CaptionElement
 *
 * @memberOf OpenAjax.a11y.cache
 *
 * @desc Creates a caption element object which contains
 *       information obout a caption element in a table
 *
 * @param  {DOMElement}  dom_element  - Reference to the dom element object associated with caption element
 * @param  {TableInfo}   table_info   - Information about the current table relationships in the DOM
 *
 * @property  {DOMElement}  dom_element  - Reference to the dom element object associated with caption element
 * @property  {String}      cache_id     - String that uniquely identifies the cache element object in the cache
 *
 * @property  {TableElement}  parent_table_element  - Reference to the table element object that contatins the caption element
 *
 * @property  {Number}  type                 - Constant indicating the type of table cache element object
 *
 * @property  {String}  name                 - The text content of the caption element
 * @property  {String}  name_for_comparison  - The text content used for comparisons with other text content (i.e. lowercase, space normalized and trimmed)
 */

OpenAjax.a11y.cache.CaptionElement = function (dom_element, table_info) {

  this.dom_element = dom_element;

  var name = dom_element.getText();
  this.accessible_name   = name;
  this.accessible_name_source = OpenAjax.a11y.SOURCE.TEXT_CONTENT;

  name = OpenAjax.a11y.util.normalizeSpace(name);
  this.accessible_name_for_comparison = name;
  this.accessible_name_length         = name.length;

  this.table_type = OpenAjax.a11y.TABLE.CAPTION_ELEMENT;

  this.parent_table_element = table_info.table_element;

};

/**
 * @method getElementResults
 *
 * @memberOf OpenAjax.a11y.cache.CaptionElement
 *
 * @desc Returns an array of node results in severity order
 *
 * @return {Array} Returns a array of node results
 */

OpenAjax.a11y.cache.CaptionElement.prototype.getElementResults = function () {
  return this.dom_element.getElementResults();
};

/**
 * @method getAttributes
 *
 * @memberOf OpenAjax.a11y.cache.CaptionElement
 *
 * @desc Returns an array of attributes for the element, sorted in alphabetical order
 *
 * @return {Array} Returns a array of node results
 */

OpenAjax.a11y.cache.CaptionElement.prototype.getAttributes = function () {

  var attributes = this.dom_element.getAttributes();

  return attributes;
};

/**
 * @method getEvents
 *
 * @memberOf OpenAjax.a11y.cache.CaptionElement
 *
 * @desc Returns an array of events for the element, sorted in alphabetical order
 *
 * @return {Array} Returns a array of event information
 */

OpenAjax.a11y.cache.CaptionElement.prototype.getEvents = function () {

  return this.dom_element.getEvents();

};

/**
 * @method getStyle
 *
 * @memberOf OpenAjax.a11y.cache.CaptionElement
 *
 * @desc Returns an array of style items
 *
 * @return {Array} Returns a array of style items
 */

OpenAjax.a11y.cache.CaptionElement.prototype.getStyle = function () {

  return this.dom_element.getStyle();

};

/**
 * @method getCacheProperties
 *
 * @memberOf OpenAjax.a11y.cache.CaptionElement
 *
 * @desc Returns an array of cache properties sorted by property name
 *
 * @return {Array} Returns a array of cache properties
 */

OpenAjax.a11y.cache.CaptionElement.prototype.getCacheProperties = function () {

  var properties = this.dom_element.getCacheProperties();

  return properties;
};

/**
 * @method getCachePropertyValue
 *
 * @memberOf OpenAjax.a11y.cache.CaptionElement
 *
 * @desc Returns the value of a property
 *
 * @param {String}  property  - The property to retreive the value
 *
 * @return {String | Number} Returns the value of the property
 */

OpenAjax.a11y.cache.CaptionElement.prototype.getCachePropertyValue = function (property) {

  if (typeof this[property] == 'undefined') {
    return this.dom_element.getCachePropertyValue(property);
  }

  return this[property];
};


/**
 * @method toString
 *
 * @memberOf OpenAjax.a11y.cache.CaptionElement
 *
 * @desc Creates a text string representation of the caption element object
 *
 * @return {String} Returns a text string representation of the caption element object
 */

 OpenAjax.a11y.cache.CaptionElement.prototype.toString = function () {
   return "caption: " + this.name;
 };

/* ---------------------------------------------------------------- */
/*                         THeadElement Object                      */
/* ---------------------------------------------------------------- */

/**
 * @constructor THeadElement
 *
 * @memberOf OpenAjax.a11y.cache
 *
 * @desc Creates a thead element object which contains
 *       information obout a thead element in a table
 *
 * @param  {DOMElement}  dom_element  - Reference to the dom element object associated with thead element
 * @param  {TableInfo}   table_info   - Information about the current table relationships in the DOM
 *
 * @property  {DOMElement}  dom_element  - Reference to the dom element object associated with thead element
 * @property  {String}      cache_id     - String that uniquely identifies the cache element object in the cache
 *
 * @property  {Array}         child_cache_elements  - Array of table cache elements for the tree representation of the table
 * @property  {TableElement}  parent_table_element  - Reference to the table element object that contatins the thead element
 *
 * @property  {Number}  type       - Constant indicating the type of table cache element object
 *
 * @property  {Number}  row_count  - Number of table rows contained in the childresn of the thead element
 */

OpenAjax.a11y.cache.THeadElement = function (dom_element, table_info) {

  this.dom_element = dom_element;
  this.cache_id    = "";

  this.child_cache_elements = [];
  this.parent_table_element = table_info.table_element;

  this.table_type = OpenAjax.a11y.TABLE.THEAD_ELEMENT;

  this.row_count = 0;

};

/**
 * @method addChild
 *
 * @memberOf OpenAjax.a11y.cache.THeadElement
 *
 * @desc Adds a cache table element to the tree representation of the table in the cache
 *
 * @param  {TableElement | CaptionElement | THeadElement | TBodyElement | TableRowElement | TableCellElement }  table_element  - Cache table element object to add to root of tree of table elements
 */

OpenAjax.a11y.cache.THeadElement.prototype.addChild = function (child_object) {

  if (child_object) {
    this.child_cache_elements.push(child_object);
  }

};

/**
 * @method getElementResults
 *
 * @memberOf OpenAjax.a11y.cache.THeadElement
 *
 * @desc Returns an array of node results in severity order
 *
 * @return {Array} Returns a array of node results
 */

OpenAjax.a11y.cache.THeadElement.prototype.getElementResults = function () {
  return this.dom_element.getElementResults();
};

/**
 * @method getAttributes
 *
 * @memberOf OpenAjax.a11y.cache.THeadElement
 *
 * @desc Returns an array of attributes for the element, sorted in alphabetical order
 *
 * @return {Array} Returns a array of node results
 */

OpenAjax.a11y.cache.THeadElement.prototype.getAttributes = function () {

  var cache_nls = OpenAjax.a11y.nls.Cache;

  var attributes = this.dom_element.getAttributes();

  attributes.push(cache_nls.getLabelAndValueNLS('role', this.dom_element.role));

  return attributes;
};



/**
 * @method getStyle
 *
 * @memberOf OpenAjax.a11y.cache.THeadElement
 *
 * @desc Returns an array of style items
 *
 * @return {Array} Returns a array of style items
 */

OpenAjax.a11y.cache.THeadElement.prototype.getStyle = function () {

  return this.dom_element.getStyle();

};

/**
 * @method getCacheProperties
 *
 * @memberOf OpenAjax.a11y.cache.THeadElement
 *
 * @desc Returns an array of cache properties sorted by property name
 *
 * @return {Array} Returns a array of cache properties
 */

OpenAjax.a11y.cache.THeadElement.prototype.getCacheProperties = function () {

  var properties = this.dom_element.getCacheProperties();

  return properties;
};

/**
 * @method getCachePropertyValue
 *
 * @memberOf OpenAjax.a11y.cache.THeadElement
 *
 * @desc Returns the value of a property
 *
 * @param {String}  property  - The property to retreive the value
 *
 * @return {String | Number} Returns the value of the property
 */

OpenAjax.a11y.cache.THeadElement.prototype.getCachePropertyValue = function (property) {

  if (typeof this[property] == 'undefined') {
    return this.dom_element.getCachePropertyValue(property);
  }

  return this[property];
};


/**
 * @method getEvents
 *
 * @memberOf OpenAjax.a11y.cache.THeadElement
 *
 * @desc Returns an array of events for the element, sorted in alphabetical order
 *
 * @return {Array} Returns a array of event information
 */

OpenAjax.a11y.cache.THeadElement.prototype.getEvents = function () {

  return this.dom_element.getEvents();

};

/**
 * @method toString
 *
 * @memberOf OpenAjax.a11y.cache.THeadElement
 *
 * @desc Creates a text string representation of the thead element object
 *
 * @return {String} Returns a text string representation of the thead element object
 */
 OpenAjax.a11y.cache.THeadElement.prototype.toString = function () {
   var str = "thead: " + this.row_count + " rows";

   if (this.row_count === 1 ) str =  "thead: " + this.row_count + " row";

   return str;
 };


/* ---------------------------------------------------------------- */
/*                         TBodyElement Object                      */
/* ---------------------------------------------------------------- */

/**
 * @constructor TBodyElement
 *
 * @memberOf OpenAjax.a11y.cache
 *
 * @desc Creates a tbody element object which contains
 *       information obout a tbody element in a table
 *
 * @param  {DOMElement}  dom_element  - Reference to the dom element object associated with tbody element
 * @param  {TableInfo}   table_info   - Information about the current table relationships in the DOM
 *
 * @property  {DOMElement}  dom_element  - Reference to the dom element object associated with tbody element
 * @property  {String}      cache_id     - String that uniquely identifies the cache element object in the cache
 *
 * @property  {Array}         child_cache_elements  - Array of table cache elements for the tree representation of the table
 * @property  {TableElement}  parent_table_element  - Reference to the table element object that contatins the tbody element
 *
 * @property  {Number}  type                 - Constant indicating the type of table cache element object
 *
 * @property  {Number}  row_count            - Number of table rows contained in the childresn of the tbody element
 */

OpenAjax.a11y.cache.TBodyElement = function (dom_element, table_info) {

  this.dom_element          = dom_element;
  this.child_cache_elements = [];
  this.parent_table_element = table_info.table_element;

  this.table_type = OpenAjax.a11y.TABLE.TBODY_ELEMENT;

  this.row_count = 0;

};

/**
 * @method addChild
 *
 * @memberOf OpenAjax.a11y.cache.TBodyElement
 *
 * @desc Adds a cache table element to the tree representation of the table in the cache
 *
 * @param  {TableElement | CaptionElement | THeadElement | TBodyElement | TableRowElement | TableCellElement }  table_element  - Cache table element object to add to root of tree of table elements
 */

OpenAjax.a11y.cache.TBodyElement.prototype.addChild = function (child_object) {

 if (child_object) {
  this.child_cache_elements.push(child_object);
 }

};

/**
 * @method getElementResults
 *
 * @memberOf OpenAjax.a11y.cache.TBodyElement
 *
 * @desc Returns an array of node results in severity order
 *
 * @return {Array} Returns a array of node results
 */

OpenAjax.a11y.cache.TBodyElement.prototype.getElementResults = function () {
  return this.dom_element.getElementResults();
};

/**
 * @method getAttributes
 *
 * @memberOf OpenAjax.a11y.cache.TBodyElement
 *
 * @desc Returns an array of attributes for the element, sorted in alphabetical order
 *
 * @return {Array} Returns a array of node results
 */

OpenAjax.a11y.cache.TBodyElement.prototype.getAttributes = function () {
  var cache_nls = OpenAjax.a11y.nls.Cache;

  var attributes = this.dom_element.getAttributes();

  attributes.push(cache_nls.getLabelAndValueNLS('role', this.dom_element.role));

  return attributes;
};


/**
 * @method getStyle
 *
 * @memberOf OpenAjax.a11y.cache.TBodyElement
 *
 * @desc Returns an array of style items
 *
 * @return {Array} Returns a array of style items
 */

OpenAjax.a11y.cache.TBodyElement.prototype.getStyle = function () {

  return this.dom_element.getStyle();

};

/**
 * @method getCacheProperties
 *
 * @memberOf OpenAjax.a11y.cache.TBodyElement
 *
 * @desc Returns an array of cache properties sorted by property name
 *
 * @return {Array} Returns a array of cache properties
 */

OpenAjax.a11y.cache.TBodyElement.prototype.getCacheProperties = function () {

  var properties = this.dom_element.getCacheProperties();

  return properties;
};

/**
 * @method getCachePropertyValue
 *
 * @memberOf OpenAjax.a11y.cache.TBodyElement
 *
 * @desc Returns the value of a property
 *
 * @param {String}  property  - The property to retreive the value
 *
 * @return {String | Number} Returns the value of the property
 */

OpenAjax.a11y.cache.TBodyElement.prototype.getCachePropertyValue = function (property) {

  if (typeof this[property] == 'undefined') {
    return this.dom_element.getCachePropertyValue(property);
  }

  return this[property];
};


/**
 * @method getEvents
 *
 * @memberOf OpenAjax.a11y.cache.TBodyElement
 *
 * @desc Returns an array of events for the element, sorted in alphabetical order
 *
 * @return {Array} Returns a array of event information
 */

OpenAjax.a11y.cache.TBodyElement.prototype.getEvents = function () {

  return this.dom_element.getEvents();

};

/**
 * @method toString
 *
 * @memberOf OpenAjax.a11y.cache.TBodyElement
 *
 * @desc Creates a text string representation of the tbody element object
 *
 * @return {String} Returns a text string representation of the tbody element object
 */
 OpenAjax.a11y.cache.TBodyElement.prototype.toString = function () {
   var str = "tbody: " + this.row_count + " rows";

   if (this.row_count === 1 ) str =  "tbody: " + this.row_count + " row";

   return str;
 };


/* ---------------------------------------------------------------- */
/*                       TableRowElement Object                     */
/* ---------------------------------------------------------------- */

/**
 * @constructor TableRowElement
 *
 * @memberOf OpenAjax.a11y.cache
 *
 * @desc Creates a table row element object which contains
 *       information obout a tr element in a table
 *
 * @param  {DOMElement}  dom_element  - Reference to the dom element object associated with tr element
 * @param  {TableInfo}   table_info   - Information about the current table relationships in the DOM
 *
 * @property  {DOMElement}  dom_element  - Reference to the dom element object associated with tr element
 * @property  {String}      cache_id     - String that uniquely identifies the cache element object in the cache
 *
 * @property  {Array}         child_cache_elements  - Array of table cache elements for the tree representation of the table
 * @property  {TableElement}  parent_table_element  - Reference to the table element object that contatins the tr element
 *
 * @property  {Number}  type               - Constant indicating the type of table cache element object
 * @property  {String}  cache_id           - String that uniquely identifies the cache element in the DOMCache
 *
 * @property  {Number}  header_cell_count  - Number of header cells in the row
 * @property  {Number}  data_cell_count    - Number of data cells in the row
 */

OpenAjax.a11y.cache.TableRowElement = function (dom_element, table_info) {

  this.dom_element  = dom_element;
  this.cache_id     = "";

  this.child_cache_elements = [];
  this.parent_table_element = table_info.table_element;

  this.table_type = OpenAjax.a11y.TABLE.TR_ELEMENT;

  this.header_cell_count = 0;
  this.data_cell_count   = 0;

  var te = table_info.table_element;
  var de = dom_element;

  if (te && (te.table_role !== OpenAjax.a11y.TABLE_ROLE.LAYOUT)) {
    de.element_aria_info = OpenAjax.a11y.ariaInHTML.elementInfo['tr[table]'];
    de.implicit_role = de.element_aria_info.defaultRole;
  }


};

/**
 * @method addChild
 *
 * @memberOf OpenAjax.a11y.cache.TableRowElement
 *
 * @desc Adds a cache table element to the tree representation of the table in the table cache
 *
 * @param  {TableElement | CaptionElement | THeadElement | TBodyElement | TableRowElement | TableCellElement }  table_element  - Cache table element object to add to root of tree of table elements
 */

OpenAjax.a11y.cache.TableRowElement.prototype.addChild = function (child_object) {

 if (child_object) {
  this.child_cache_elements.push(child_object);
 }

};

/**
 * @method getElementResults
 *
 * @memberOf OpenAjax.a11y.cache.TableRowElement
 *
 * @desc Returns an array of node results in severity order
 *
 * @return {Array} Returns a array of node results
 */

OpenAjax.a11y.cache.TableRowElement.prototype.getElementResults = function () {
  return this.dom_element.getElementResults();
};

/**
 * @method getAttributes
 *
 * @memberOf OpenAjax.a11y.cache.TableRowElement
 *
 * @desc Returns an array of attributes for the element, sorted in alphabetical order
 *
 * @return {Array} Returns a array of node results
 */

OpenAjax.a11y.cache.TableRowElement.prototype.getAttributes = function () {

  var cache_nls = OpenAjax.a11y.nls.Cache;

  var attributes = this.dom_element.getAttributes();

  attributes.push(cache_nls.getLabelAndValueNLS('role', this.dom_element.role));

  return attributes;
};

/**
 * @method getStyle
 *
 * @memberOf OpenAjax.a11y.cache.TableRowElement
 *
 * @desc Returns an array of style items
 *
 * @return {Array} Returns a array of style items
 */

OpenAjax.a11y.cache.TableRowElement.prototype.getStyle = function () {

  return this.dom_element.getStyle();

};

/**
 * @method getCacheProperties
 *
 * @memberOf OpenAjax.a11y.cache.TableRowElement
 *
 * @desc Returns an array of cache properties sorted by property name
 *
 * @return {Array} Returns a array of cache properties
 */

OpenAjax.a11y.cache.TableRowElement.prototype.getCacheProperties = function () {

  return this.dom_element.getCacheProperties();

};

/**
 * @method getCachePropertyValue
 *
 * @memberOf OpenAjax.a11y.cache.TableRowElement
 *
 * @desc Returns the value of a property
 *
 * @param {String}  property  - The property to retreive the value
 *
 * @return {String | Number} Returns the value of the property
 */

OpenAjax.a11y.cache.TableRowElement.prototype.getCachePropertyValue = function (property) {

  if (typeof this[property] == 'undefined') {
    return this.dom_element.getCachePropertyValue(property);
  }

  return this[property];
};

/**
 * @method getEvents
 *
 * @memberOf OpenAjax.a11y.cache.TableRowElement
 *
 * @desc Returns an array of events for the element, sorted in alphabetical order
 *
 * @return {Array} Returns a array of event information
 */

OpenAjax.a11y.cache.TableRowElement.prototype.getEvents = function () {

  return this.dom_element.getEvents();

};

/**
 * @method toString
 *
 * @memberOf OpenAjax.a11y.cache.TableRowElement
 *
 * @desc Creates a text string representation of the tr element object
 *
 * @return {String} Returns a text string representation of the tr element object
 */
 OpenAjax.a11y.cache.TableRowElement.prototype.toString = function () {

   var str =  "tr: ";

   if (this.header_cell_count && this.data_cell_count) {
     if (this.header_cell_count === 1) str += " 1 header cell and ";
     else str += this.header_cell_count + " header cells and ";

     if (this.data_cell_count === 1) str += " 1 data cell";
     else str += this.data_cell_count + " data cells";
   }
   else {
     if (this.header_cell_count) {
       if (this.header_cell_count === 1) str += " 1 header cell";
       else str += this.header_cell_count + " header cells";
     }
     else {
       if (this.data_cell_count) {
         if (this.data_cell_count === 1) str += " 1 data cell";
         else str += this.data_cell_count + " data cells";
       }
       else {
         str += " no table cells ";
       }
     }
   }

   return str;
 };


/* ---------------------------------------------------------------- */
/*                            TableCellElement                      */
/* ---------------------------------------------------------------- */

/**
 * @constructor TableCellElement
 *
 * @memberOf OpenAjax.a11y.cache
 *
 * @desc Create a table cell element object which contains
 *       information obout a td or th element in a table
 *
 * @param  {DOMElement}  dom_element  - Reference to the dom element object associated with td or th element
 * @param  {TableInfo}   table_info   - Information about the current table relationships in the DOM
 *
 * @property  {DOMElement}  dom_element  - Reference to the dom element object associated with td or th element
 * @property  {String}      cache_id     - String that uniquely identifies the cache element object in the cache
 *
 * @property  {Array}            child_cache_elements  - Array of table cache elements for the tree representation of the table
 * @property  {TableElement}     parent_table_element  - Reference to the table element object that contatins the td or th element
 * @property  {TableRowElement}  parent_row_element    - Reference to the table element object that contatins the td or th element
 *
 * @property  {Number}  type               - Constant indicating the type of table cache element object
 *
 * @property  {String}  text_content          - Text content of the element including descendent element content
 * @property  {String}  scope                 - Value of the scope attribute
 * @property  {String}  headers               - Value of the headers attribute
 * @property  {Array}   headers_array         - Array of id values in the headers attribute
 * @property  {String}  header_content        - Text content of calculated headers
 * @property  {Number}  header_source         - How header content was calculated
 * @property  {Number}  number_of_header_ids  - Number of ids in the headers attribute
 *
 * @property  {Boolean} has_spans          - Value of the rowspan attribute
 * @property  {Number}  row_span           - Value of the rowspan attribute (Note: converted to Number)
 * @property  {Number}  column_span        - Value of the colspan attribute (Note: converted to Number)
 */

OpenAjax.a11y.cache.TableCellElement = function (dom_element, table_info) {

  var is_th;

  this.dom_element  = dom_element;
  this.cache_id     = "";

  this.parent_table_element = table_info.table_element;
  this.parent_row_element   = table_info.table_row_element;

  this.child_cache_elements = [];

  var text_content = dom_element.getText();
  this.text_content = text_content;
  if (typeof this.text_content === 'string') this.text_content_for_comparison = OpenAjax.a11y.util.normalizeSpace(text_content.toLowerCase());
  else this.text_content_for_comparison = "";

  this.has_content = false;

  if (this.text_content_for_comparison.length) this.has_content = true;

  this.table_type = OpenAjax.a11y.TABLE.TD_ELEMENT;

  is_th = dom_element.tag_name == 'th';
  this.scope = dom_element.node.getAttribute('scope');

  if (is_th) {
    this.table_type = OpenAjax.a11y.TABLE.TH_ELEMENT;
  }
  else {
    if (this.scope) {
      this.scope = this.scope.toLowerCase();

      if (this.scope == 'row' || this.scope == 'col') {
       this.table_type = OpenAjax.a11y.TABLE.TH_ELEMENT;
      }
    }
  }

  var te = table_info.table_element;
  var de = this.dom_element;

  if (te && (te.table_role !== OpenAjax.a11y.TABLE_ROLE.LAYOUT)) {
    if (is_th) {
      if (te.dom_element.role && ('grid'.indexOf(te.dom_element.role) >= 0)) {
        de.element_aria_info = OpenAjax.a11y.ariaInHTML.elementInfo['th[gridcell]'];
      } else {
        de.element_aria_info = OpenAjax.a11y.ariaInHTML.elementInfo['th[cell]'];
      }
    } else {
      if (te.dom_element.role && ('grid'.indexOf(te.dom_element.role) >= 0)) {
        de.element_aria_info = OpenAjax.a11y.ariaInHTML.elementInfo['td[gridcell]'];
      } else {
        de.element_aria_info = OpenAjax.a11y.ariaInHTML.elementInfo['td[cell]'];
      }
    }
    de.implicit_role = de.element_aria_info.defaultRole;
  }

  if (table_info.table_row_element) {
    if (this.table_type === OpenAjax.a11y.TABLE.TD_ELEMENT) {
      table_info.table_row_element.data_cell_count++;
    }
    else{
      table_info.table_row_element.header_cell_count++;
    }
  }

  this.headers = dom_element.node.getAttribute('headers');

  this.number_of_header_ids = 0;

  if (this.headers && this.headers.length > 0) {
    this.headers_array = this.headers.split(" ");

    this.number_of_header_ids = this.headers_array.length;
  }

  this.row_span   = dom_element.node.getAttribute('rowspan');

  if (typeof this.row_span === 'string') {
    this.has_spans = true;
    this.row_span   = parseInt(this.row_span,10);
  }
  else {
    this.row_span   = 1;
  }

  this.column_span   = dom_element.node.getAttribute('colspan');

  if (typeof this.column_span === 'string') {
    this.has_spans = true;
    this.column_span   = parseInt(this.column_span,10);
  } else {
    this.column_span   = 1;
  }

};


/**
 * @method addChild
 *
 * @memberOf OpenAjax.a11y.cache.TableCellElement
 *
 * @desc Adds a cache table element to the tree representation of the table in the cache
 *
 * @param  {TableElement | CaptionElement | THeadElement | TBodyElement | TableRowElement | TableCellElement }  table_element  - Cache table element object to add to root of tree of table elements
 */

OpenAjax.a11y.cache.TableCellElement.prototype.addChild = function (table_element) {

 if (table_element) {
  this.child_cache_elements.push(table_element);
 }

};

/**
 * @method getElementResults
 *
 * @memberOf OpenAjax.a11y.cache.TableCellElement
 *
 * @desc Returns an array of node results in severity order
 *
 * @return {Array} Returns a array of node results
 */

OpenAjax.a11y.cache.TableCellElement.prototype.getElementResults = function () {
  return this.dom_element.getElementResults();
};

/**
 * @method getStyle
 *
 * @memberOf OpenAjax.a11y.cache.TableCellElement
 *
 * @desc Returns an array of style items
 *
 * @return {Array} Returns a array of style items
 */

OpenAjax.a11y.cache.TableCellElement.prototype.getStyle = function () {

  return this.dom_element.getStyle();

};


/**
 * @method getAttributes
 *
 * @memberOf OpenAjax.a11y.cache.TableCellElement
 *
 * @desc Returns an array of attributes for the element, sorted in alphabetical order
 *
 * @return {Array} Returns a array of node results
 */

OpenAjax.a11y.cache.TableCellElement.prototype.getAttributes = function (unsorted) {

  var cache_nls = OpenAjax.a11y.nls.Cache;
  var attributes = this.dom_element.getAttributes();

  cache_nls.addPropertyIfDefined(attributes, this, 'tag_name');
  cache_nls.addPropertyIfDefined(attributes, this, 'row_span');
  cache_nls.addPropertyIfDefined(attributes, this, 'column_span');
  cache_nls.addPropertyIfDefined(attributes, this, 'headers');
  cache_nls.addPropertyIfDefined(attributes, this, 'scope');
  cache_nls.addPropertyIfDefined(attributes, this, 'role');

  if (!unsorted) this.dom_element.sortItems(attributes);

  return attributes;
};

/**
 * @method getCacheProperties
 *
 * @memberOf OpenAjax.a11y.cache.TableCellElement
 *
 * @desc Returns an array of cache properties sorted by property name
 *
 * @return {Array} Returns a array of cache properties
 */

OpenAjax.a11y.cache.TableCellElement.prototype.getCacheProperties = function () {

  var cache_nls = OpenAjax.a11y.nls.Cache;

  var properties = this.dom_element.getCacheProperties();

  cache_nls.addPropertyIfDefined(properties, this, 'table_type');
  cache_nls.addPropertyIfDefined(properties, this, 'header_content');
  cache_nls.addPropertyIfDefined(properties, this, 'header_source');
  cache_nls.addPropertyIfDefined(properties, this, 'text_content');

  this.dom_element.sortItems(properties);

  return properties;
};

/**
 * @method getCachePropertyValue
 *
 * @memberOf OpenAjax.a11y.cache.TableCellElement
 *
 * @desc Returns the value of a property
 *
 * @param {String}  property  - The property to retreive the value
 *
 * @return {String | Number} Returns the value of the property
 */

OpenAjax.a11y.cache.TableCellElement.prototype.getCachePropertyValue = function (property) {

  if (typeof this[property] == 'undefined') {
    return this.dom_element.getCachePropertyValue(property);
  }

  return this[property];
};


/**
 * @method getEvents
 *
 * @memberOf OpenAjax.a11y.cache.TableCellElement
 *
 * @desc Returns an array of events for the element, sorted in alphabetical order
 *
 * @return {Array} Returns a array of event information
 */

OpenAjax.a11y.cache.TableCellElement.prototype.getEvents = function () {

  return this.dom_element.getEvents();

};

/**
 * @method toString
 *
 * @memberOf OpenAjax.a11y.cache.TableCellElement
 *
 * @desc Creates a text string representation of the table cell element object
 *
 * @return {String} Returns a text string representation of the table cell element object
 */
OpenAjax.a11y.cache.TableCellElement.prototype.toString = function () {
  var text = this.dom_element.getText();
  var tag_name = this.dom_element.tag_name;

  if (this.parent_table_element.table_role >= OpenAjax.a11y.TABLE_ROLE.DATA) {

    if (text.length) {
      return tag_name + ": " + text;
    }
    else {
      return tag_name + ": empty cell";
    }
  }
  else {
    var str = tag_name + "(for layout) contains: ";

    var count = this.dom_element.getElementCount();

    if (count === 1) str += "1 element and ";
    else str += count + " elements and ";

    count = text.length;

    if (count === 1) str += "1 character";
    else str += count + " characters";

    return str;
  }
};

/* ---------------------------------------------------------------- */
/*                       PageElementLayout                               */
/* ---------------------------------------------------------------- */

/**
 * @constructor PageElementLayout
 *
 * @memberOf OpenAjax.a11y.cache
 *
 * @desc Creates a body element object used to hold information about a title element
 *
 * @param  {DOMelement}   dom_element      - The dom element object representing the heading element
 * @param  {MainElement}  parent_landmark  - This is always null since this is the root element
 *
 * @property  {DOMElement}   dom_element      - Reference to the dom element representing the optgroup element
 * @property  {String}       cache_id         - String that uniquely identifies the cache element object in the cache
 * @property  {Number}       document_order   - Ordinal position of the title and main cache items in the document to other title and main cache items
 *
 * @property  {Array}  child_cache_elements  - List of child cache title element, main landmarks and h1 heading element objects as part of cache title and main elements tree
 *
 * @property  {Boolean}  is_page_element  -  Boolean indicating the element is a page element
 *
 */

OpenAjax.a11y.cache.PageElementLayout = function (dom_element) {

  this.dom_element     = dom_element;
  this.cache_id        = "page_layout";
  this.document_order  = 0;
  this.is_page_element = true;

  this.child_cache_elements = []; // this is always empty for the body element

};

/**
 * @method addChildMainElement
 *
 * @memberOf OpenAjax.a11y.cache.PageElementLayout
 *
 * @desc Adds a main landmark  object to the tree of title and main elements
 *
 * @param {MainElement}  main_element  -  Main landmark element object to add
 */

OpenAjax.a11y.cache.PageElementLayout.prototype.addChildMainElement = function (main_element) {

  if (main_element) {
    this.child_cache_elements.push(main_element);
  }

};

/**
 * @method getElementResults
 *
 * @memberOf OpenAjax.a11y.cache.PageElementLayout
 *
 * @desc Returns an array of node results in severity order
 *
 * @return {Array} Returns a array of node results
 */

OpenAjax.a11y.cache.PageElementLayout.prototype.getElementResults = function () {
  return this.dom_element.getElementResults();
};

/**
 * @method getStyle
 *
 * @memberOf OpenAjax.a11y.cache.PageElementLayout
 *
 * @desc Returns an array of style items
 *
 * @return {Array} Returns a array of style display objects
 */

OpenAjax.a11y.cache.PageElementLayout.prototype.getStyle = function () {

  return this.dom_element.getStyle();

};

/**
 * @method getAttributes
 *
 * @memberOf OpenAjax.a11y.cache.PageElementLayout
 *
 * @desc Returns an array of attributes for the element, sorted in alphabetical order
 *
 * @param {Boolean}  unsorted  - If defined and true the results will NOT be sorted alphabetically
 *
 * @return {Array} Returns a array of attribute display object
 */

OpenAjax.a11y.cache.PageElementLayout.prototype.getAttributes = function (unsorted) {

  var cache_nls = OpenAjax.a11y.nls.Cache;
  var attributes = this.dom_element.getAttributes();

  cache_nls.addPropertyIfDefined(attributes, this, 'role');

  if (!unsorted) this.dom_element.sortItems(attributes);

  return attributes;
};

/**
 * @method getCacheProperties
 *
 * @memberOf OpenAjax.a11y.cache.PageElementLayout
 *
 * @desc Returns an array of cache properties sorted by property name
 *
 * @param {Boolean}  unsorted  - If defined and true the results will NOT be sorted alphabetically
 *
 * @return {Array} Returns a array of cache property display object
 */

OpenAjax.a11y.cache.PageElementLayout.prototype.getCacheProperties = function (unsorted) {

  var properties = this.dom_element.getCacheProperties(unsorted);

  if (!unsorted) this.dom_element.sortItems(properties);

  return properties;
};

/**
 * @method getCachePropertyValue
 *
 * @memberOf OpenAjax.a11y.cache.PageElementLayout
 *
 * @desc Returns the value of a property
 *
 * @param {String}  property  - The property to retreive the value
 *
 * @return {String | Number} Returns the value of the property
 */

OpenAjax.a11y.cache.PageElementLayout.prototype.getCachePropertyValue = function (property) {

  if (typeof this[property] == 'undefined') {
    return this.dom_element.getCachePropertyValue(property);
  }

  return this[property];
};



/**
 * @method getEvents
 *
 * @memberOf OpenAjax.a11y.cache.PageElementLayout
 *
 * @desc Returns an array of events for the element, sorted in alphabetical order
 *
 * @return {Array} Returns a array of event item display objects
 */

OpenAjax.a11y.cache.PageElementLayout.prototype.getEvents = function () {

  return this.dom_element.getEvents();

};

/**
 * @method toString
 *
 * @memberOf OpenAjax.a11y.cache.PageElementLayout
 *
 * @desc Returns a text string representation of the title element
 *
 * @return {String} Returns string represention the title element object
 */

OpenAjax.a11y.cache.PageElementLayout.prototype.toString = function () {
  return "page";
};
