const xml = require('xmlbuilder');
const utils = require('../utils.js');
const Hyperlink = require('./classes/hyperlink');
const Picture = require('../drawing/picture.js');

let _addSheetPr = (promiseObj) => {
    // §18.3.1.82 sheetPr (Sheet Properties)
    return new Promise((resolve, reject) => {
        let o = promiseObj.ws.opts;

        // Check if any option that would require the sheetPr element to be added exists
        if (
            o.printOptions.fitToHeight || 
            o.printOptions.fitToWidth || 
            o.printOptions.orientation || 
            o.printOptions.horizontalDpi || 
            o.printOptions.verticalDpi
        ) {
            let ele = promiseObj.xml.ele('sheetPr');

            // §18.3.1.65 pageSetUpPr (Page Setup Properties)
            if (o.printOptions.fitToHeight || o.printOptions.fitToWidth) {
                ele.ele('pageSetUpPr').att('fitToPage', 1);
            }

            if (o.autoFilter.ref) {
                ele.att('enableFormatConditionsCalculation', 1);
                ele.att('filterMode', 1);
            }
        }

        resolve(promiseObj);
    });
};

let _addDimension = (promiseObj) => {
    // §18.3.1.35 dimension (Worksheet Dimensions)
    return new Promise((resolve, reject) => {
        let firstCell = 'A1';
        let lastCell = `${utils.getExcelAlpha(promiseObj.ws.lastUsedCol)}${promiseObj.ws.lastUsedRow}`;
        let ele = promiseObj.xml.ele('dimension');
        ele.att('ref', `${firstCell}:${lastCell}`);

        resolve(promiseObj);
    });
};

let _addSheetViews = (promiseObj) => {
    // §18.3.1.88 sheetViews (Sheet Views)
    return new Promise((resolve, reject) => {
        let o = promiseObj.ws.opts.sheetView;
        let ele = promiseObj.xml.ele('sheetViews');
        let tabSelected = promiseObj.ws.opts;
        let sv = ele.ele('sheetView')
        .att('tabSelected', o.tabSelected)
        .att('workbookViewId', o.workbookViewId)
        .att('rightToLeft', o.rightToLeft)
        .att('zoomScale', o.zoomScale)
        .att('zoomScaleNormal', o.zoomScaleNormal)
        .att('zoomScalePageLayoutView', o.zoomScalePageLayoutView);

        let modifiedPaneParams = [];
        Object.keys(o.pane).forEach((k) => {
            if (o.pane[k] !== null) {
                modifiedPaneParams.push(k);
            }
        });
        if (modifiedPaneParams.length > 0) {
            let pEle = sv.ele('pane');
            o.pane.xSplit !== null ? pEle.att('xSplit', o.pane.xSplit) : null;
            o.pane.ySplit !== null ? pEle.att('ySplit', o.pane.ySplit) : null;
            o.pane.topLeftCell !== null ? pEle.att('topLeftCell', o.pane.topLeftCell) : null;
            o.pane.activePane !== null ? pEle.att('activePane', o.pane.activePane) : null;
            o.pane.state !== null ? pEle.att('state', o.pane.state) : null;
        }

        resolve(promiseObj);
    });
};

let _addSheetFormatPr = (promiseObj) => {
    // §18.3.1.81 sheetFormatPr (Sheet Format Properties)
    return new Promise((resolve, reject) => {
        let o = promiseObj.ws.opts.sheetFormat;
        let ele = promiseObj.xml.ele('sheetFormatPr');
        Object.keys(o).forEach((k) => {
            if (o[k] !== null) {
                ele.att(k, o[k]);
            } 
        });

        if (typeof o.defaultRowHeight === 'number') {
            ele.att('customHeight', '1');
        }

        resolve(promiseObj);
    });
};

let _addCols = (promiseObj) => {
    // §18.3.1.17 cols (Column Information)
    return new Promise((resolve, reject) => {

        if (promiseObj.ws.columnCount > 0) {
            let colsEle = promiseObj.xml.ele('cols');

            for (let colId in promiseObj.ws.cols) {
                let col = promiseObj.ws.cols[colId];
                let colEle = colsEle.ele('col');
                
                col.min !== null ? colEle.att('min', col.min) : null;
                col.max !== null ? colEle.att('max', col.max) : null;
                col.width !== null ? colEle.att('width', col.width) : null;
                col.style !== null ? colEle.att('style', col.style) : null;
                col.hidden !== null ? colEle.att('hidden', utils.boolToInt(col.hidden)) : null;
                col.customWidth !== null ? colEle.att('customWidth', utils.boolToInt(col.customWidth)) : null;
                col.outlineLevel !== null ? colEle.att('outlineLevel', col.outlineLevel) : null;
                col.collapsed !== null ? colEle.att('collapsed', utils.boolToInt(col.collapsed)) : null;
            }
        }

        resolve(promiseObj);
    });
};

let _addSheetData = (promiseObj) => {
    // §18.3.1.80 sheetData (Sheet Data)
    return new Promise((resolve, reject) => {

        let ele = promiseObj.xml.ele('sheetData');
        let rows = Object.keys(promiseObj.ws.rows);
        
        let processNextRow = () => {
            let r = rows.shift();
            if (r) {
                let thisRow = promiseObj.ws.rows[r];
                thisRow.cellRefs.sort(utils.sortCellRefs);

                let rEle = ele.ele('row');
                // If defaultRowHeight !== 16, set customHeight attribute to 1 as stated in §18.3.1.81
                if (promiseObj.ws.opts.sheetFormat.defaultRowHeight !== 16) {
                    rEle.att('customHeight', '1');
                }

                rEle.att('r', r);
                rEle.att('spans', thisRow.spans);
                thisRow.s !== null ? rEle.att('s', thisRow.s) : null;
                thisRow.customFormat !== null ? rEle.att('customFormat', thisRow.customFormat) : null;
                thisRow.ht !== null ? rEle.att('ht', thisRow.ht) : null;
                thisRow.hidden !== null ? rEle.att('hidden', thisRow.hidden) : null;
                thisRow.customHeight !== null ? rEle.att('customHeight', thisRow.customHeight) : null;
                thisRow.outlineLevel !== null ? rEle.att('outlineLevel', thisRow.outlineLevel) : null;
                thisRow.collapsed !== null ? rEle.att('collapsed', thisRow.collapsed) : null;
                thisRow.thickTop !== null ? rEle.att('thickTop', thisRow.thickTop) : null;
                thisRow.thickBot !== null ? rEle.att('thickBot', thisRow.thickBot) : null;

                thisRow.cellRefs.forEach((c) => {
                    let thisCell = promiseObj.ws.cells[c];
                    let cEle = rEle.ele('c').att('r', thisCell.r).att('s', thisCell.s);
                    if (thisCell.t !== null) {
                        cEle.att('t', thisCell.t);
                    }
                    if (thisCell.f !== null) {
                        cEle.ele('f').txt(thisCell.f);
                    }
                    if (thisCell.v !== null) {
                        cEle.ele('v').txt(thisCell.v);
                    }
                });
                processNextRow();
            } else {
                resolve(promiseObj);
            }
        };
        processNextRow();

    });
};

let _addSheetProtection = (promiseObj) => {
    // §18.3.1.85 sheetProtection (Sheet Protection Options)
    return new Promise((resolve, reject) => {
        let o = promiseObj.ws.opts.sheetProtection;
        let includeSheetProtection = false;
        Object.keys(o).forEach((k) =>  {
            if (o[k] !== null) {
                includeSheetProtection = true;
            }
        });

        if (includeSheetProtection) {
            // Set required fields with defaults if not specified
            o.sheet = o.sheet !== null ? o.sheet : true;
            o.objects = o.objects !== null ? o.objects : true;
            o.scenarios = o.scenarios !== null ? o.scenarios : true;

            let ele = promiseObj.xml.ele('sheetProtection');
            Object.keys(o).forEach((k) => {
                if (o[k] !== null) {
                    if (k === 'password') {
                        ele.att('hashValue', utils.getHashOfPassword(o[k]));
                    } else {
                        ele.att(k, utils.boolToInt(o[k]));
                    }
                }            
            });
        }
        resolve(promiseObj);
    });
};

let _addAutoFilter = (promiseObj) => {
    // §18.3.1.2 autoFilter (AutoFilter Settings)
    return new Promise((resolve, reject) => {
        let o = promiseObj.ws.opts.autoFilter;

        if (typeof o.startRow === 'number') {
            let ele = promiseObj.xml.ele('autoFilter');
            let filterRow = promiseObj.ws.rows[o.startRow];

            o.startCol = typeof o.startCol === 'number' ? o.startCol : null;
            o.endCol = typeof o.endCol === 'number' ? o.endCol : null;

            if (typeof o.endRow !== 'number') {
                let firstEmptyRow = undefined;
                let curRow = o.startRow;
                while (firstEmptyRow === undefined) {
                    if (!promiseObj.ws.rows[curRow]) {
                        firstEmptyRow = curRow;
                    } else {
                        curRow++;
                    }
                }

                o.endRow = firstEmptyRow - 1;
            }

            // Columns to sort not manually set. filter all columns in this row containing data.
            if (typeof o.startCol !== 'number' || typeof o.endCol !== 'number') {
                o.startCol = filterRow.firstColumn;
                o.endCol = filterRow.lastColumn;
            }

            let startCell = utils.getExcelAlpha(o.startCol) + o.startRow;
            let endCell = utils.getExcelAlpha(o.endCol) + o.endRow;

            ele.att('ref', `${startCell}:${endCell}`);
            promiseObj.ws.wb.definedNameCollection.addDefinedName({
                hidden: 1,
                localSheetId: promiseObj.ws.localSheetId,
                name: '_xlnm._FilterDatabase',
                refFormula: '\'' + promiseObj.ws.name + '\'!' +
                    '$' + utils.getExcelAlpha(o.startCol) + 
                    '$' + o.startRow +
                    ':' +
                    '$' + utils.getExcelAlpha(o.endCol) + 
                    '$' + o.endRow
            });

        }
        resolve(promiseObj);
    });
};

let _addMergeCells = (promiseObj) => {
    // §18.3.1.55 mergeCells (Merge Cells)
    return new Promise((resolve, reject) => {

        if (promiseObj.ws.mergedCells instanceof Array && promiseObj.ws.mergedCells.length > 0) {
            let ele = promiseObj.xml.ele('mergeCells');
            promiseObj.ws.mergedCells.forEach((cr) => {
                ele.ele('mergeCell').att('ref', cr);
            });
        }

        resolve(promiseObj);
    });
};

let _addConditionalFormatting = (promiseObj) => {
    // §18.3.1.18 conditionalFormatting (Conditional Formatting)
    return new Promise((resolve, reject) => {
        promiseObj.ws.cfRulesCollection.addToXMLele(promiseObj.xml);
        resolve(promiseObj);
    });
};

let _addHyperlinks = (promiseObj) => {
    // §18.3.1.48 hyperlinks (Hyperlinks)
    return new Promise((resolve, reject) => {
        promiseObj.ws.hyperlinkCollection.addToXMLele(promiseObj.xml);
        resolve(promiseObj);
    });
};

let _addDataValidations = (promiseObj) => {
    // §18.3.1.33 dataValidations (Data Validations)
    return new Promise((resolve, reject) => {
        if (promiseObj.ws.dataValidationCollection.length > 0) {
            promiseObj.ws.dataValidationCollection.addToXMLele(promiseObj.xml);
        }
        resolve(promiseObj);
    });
};

let _addPrintOptions = (promiseObj) => {
    // §18.3.1.70 printOptions (Print Options)
    return new Promise((resolve, reject) => {

        let addPrintOptions = false;
        let o = promiseObj.ws.opts.printOptions;
        Object.keys(o).forEach((k) => {
            if (o[k] !== null) {
                addPrintOptions = true;
            }
        });

        if (addPrintOptions) {
            let poEle = promiseObj.xml.ele('printOptions');
            o.centerHorizontal === true ? poEle.att('horizontalCentered', 1) : null;
            o.centerVertical === true ? poEle.att('verticalCentered', 1) : null;
            o.printHeadings === true ? poEle.att('headings', 1) : null;
            if (o.printGridLines === true) {
                poEle.att('gridLines', 1);
                poEle.att('gridLinesSet', 1);
            } 
        }

        resolve(promiseObj);
    });
};

let _addPageMargins = (promiseObj) => {
    // §18.3.1.62 pageMargins (Page Margins)
    return new Promise((resolve, reject) => {
        let o = promiseObj.ws.opts.margins;

        promiseObj.xml.ele('pageMargins')
        .att('left', o.left)
        .att('right', o.right)
        .att('top', o.top)
        .att('bottom', o.bottom)
        .att('header', o.header)
        .att('footer', o.footer);

        resolve(promiseObj);
    });
};

let _addPageSetup = (promiseObj) => {
    // §18.3.1.63 pageSetup (Page Setup Settings)
    return new Promise((resolve, reject) => {

        let addPageSetup = false;
        let o = promiseObj.ws.opts.pageSetup;
        Object.keys(o).forEach((k) => {
            if (o[k] !== null) {
                addPageSetup = true;
            }
        });

        if (addPageSetup === true) {
            let psEle = promiseObj.xml.ele('pageSetup');
            o.paperSize !== null ? psEle.att('paperSize', o.paperSize) : null;
            o.paperHeight !== null ? psEle.att('paperHeight', o.paperHeight) : null;
            o.paperWidth !== null ? psEle.att('paperWidth', o.paperWidth) : null;
            o.scale !== null ? psEle.att('scale', o.scale) : null;
            o.firstPageNumber !== null ? psEle.att('firstPageNumber', o.firstPageNumber) : null;
            o.fitToWidth !== null ? psEle.att('fitToWidth', o.fitToWidth) : null;
            o.fitToHeight !== null ? psEle.att('fitToHeight', o.fitToHeight) : null;
            o.pageOrder !== null ? psEle.att('pageOrder', o.pageOrder) : null;
            o.orientation !== null ? psEle.att('orientation', o.orientation) : null;
            o.usePrinterDefaults !== null ? psEle.att('usePrinterDefaults', utils.boolToInt(o.usePrinterDefaults)) : null;
            o.blackAndWhite !== null ? psEle.att('blackAndWhite', utils.boolToInt(o.blackAndWhite)) : null;
            o.draft !== null ? psEle.att('draft', utils.boolToInt(o.draft)) : null;
            o.cellComments !== null ? psEle.att('cellComments', o.cellComments) : null;
            o.useFirstPageNumber !== null ? psEle.att('useFirstPageNumber', utils.boolToInt(o.useFirstPageNumber)) : null;
            o.errors !== null ? psEle.att('errors', o.errors) : null;
            o.horizontalDpi !== null ? psEle.att('horizontalDpi', o.horizontalDpi) : null;
            o.verticalDpi !== null ? psEle.att('verticalDpi', o.verticalDpi) : null;
            o.copies !== null ? psEle.att('copies', o.copies) : null;
        }

        resolve(promiseObj);
    });
};

let _addHeaderFooter = (promiseObj) => {
    // §18.3.1.46 headerFooter (Header Footer Settings)
    return new Promise((resolve, reject) => {

        let addHeaderFooter = false;
        let o = promiseObj.ws.opts.headerFooter;
        Object.keys(o).forEach((k) => {
            if (o[k] !== null) {
                addHeaderFooter = true;
            }
        });

        if (addHeaderFooter === true) {
            let hfEle = promiseObj.xml.ele('headerFooter');
            o.evenFooter !== null ? hfEle.ele('evenFooter').text(o.evenFooter) : null;
            o.evenHeader !== null ? hfEle.ele('evenHeader').text(o.evenHeader) : null;
            o.firstFooter !== null ? hfEle.ele('firstFooter').text(o.firstFooter) : null;
            o.firstHeader !== null ? hfEle.ele('firstHeader').text(o.firstHeader) : null;
            o.oddFooter !== null ? hfEle.ele('oddFooter').text(o.oddFooter) : null;
            o.oddHeader !== null ? hfEle.ele('oddHeader').text(o.oddHeader) : null;
            o.alignWithMargins !== null ? hfEle.att('alignWithMargins', utils.boolToInt(o.alignWithMargins)) : null;
            o.differentFirst !== null ? hfEle.att('differentFirst', utils.boolToInt(o.differentFirst)) : null;
            o.differentOddEven !== null ? hfEle.att('differentOddEven', utils.boolToInt(o.differentOddEven)) : null;
            o.scaleWithDoc !== null ? hfEle.att('scaleWithDoc', utils.boolToInt(o.scaleWithDoc)) : null;
        }

        resolve(promiseObj);
    });
};

let _addDrawing = (promiseObj) => {
    // §18.3.1.36 drawing (Drawing)
    return new Promise((resolve, reject) => {
        if (!promiseObj.ws.drawingCollection.isEmpty) {
            let dId = promiseObj.ws.relationships.indexOf('drawing') + 1;
            promiseObj.xml.ele('drawing').att('r:id', 'rId' + dId);
        }
        resolve(promiseObj);
    });
};

let sheetXML = (ws) => {
    return new Promise((resolve, reject) => {

        let wsXML = xml.create(
            'worksheet',
            {
                'version': '1.0', 
                'encoding': 'UTF-8', 
                'standalone': true
            }
        )
        .att('mc:Ignorable', 'x14ac')
        .att('xmlns', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main')
        .att('xmlns:mc', 'http://schemas.openxmlformats.org/markup-compatibility/2006')
        .att('xmlns:r', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships')
        .att('xmlns:x14ac', 'http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac');

        // Excel complains if specific elements on not in the correct order in the XML doc.
        let promiseObj = { xml: wsXML, ws: ws };
        _addSheetPr(promiseObj)
        .then(_addDimension)
        .then(_addSheetViews)
        .then(_addSheetFormatPr)
        .then(_addCols)
        .then(_addSheetData)
        .then(_addSheetProtection)
        .then(_addAutoFilter)
        .then(_addMergeCells)
        .then(_addConditionalFormatting)
        .then(_addDataValidations)
        .then(_addHyperlinks)
        .then(_addPrintOptions)
        .then(_addPageMargins)
        .then(_addPageSetup)
        .then(_addHeaderFooter)
        .then(_addDrawing)
        .then((promiseObj) => {
            let xmlString = promiseObj.xml.doc().end({ pretty: true, indent: '  ', newline: '\n' });
            ws.wb.logger.debug(xmlString);
            resolve(xmlString);
        })
        .catch((e) => {
            console.error(e.stack);
        });
    });
};

let relsXML = (ws) => {
    return new Promise((resolve, reject) => {
        let sheetRelRequired = false;
        if (ws.relationships.length > 0) {
            sheetRelRequired = true;
        }

        if (sheetRelRequired === false) {
            resolve();
        } 

        let relXML = xml.create(
            'Relationships',
            {
                'version': '1.0', 
                'encoding': 'UTF-8', 
                'standalone': true
            }
        );
        relXML.att('xmlns', 'http://schemas.openxmlformats.org/package/2006/relationships');

        ws.relationships.forEach((r, i) => {
            let rId = 'rId' + (i + 1);
            if (r instanceof Hyperlink) {
                relXML.ele('Relationship')
                .att('Id', rId)
                .att('Target', r.location)
                .att('TargetMode', 'External')
                .att('Type', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink');                
            } else if (r === 'drawing') {
                relXML.ele('Relationship')
                .att('Id', rId)
                .att('Target', '../drawings/drawing' + ws.sheetId + '.xml')
                .att('Type', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing');
            }
        });

        let xmlString = relXML.doc().end({ pretty: true, indent: '  ', newline: '\n' });
        ws.wb.logger.debug(xmlString);
        resolve(xmlString);
    });
};

module.exports = { sheetXML, relsXML };

