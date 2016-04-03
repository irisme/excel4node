# excel4node
A full featured xlsx file generation library allowing for the creation of advanced Excel files.

excel4node conforms to the ECMA-376 OOXML specification 2nd edition   

REFERENCES   
[OpenXML White Paper](http://www.ecma-international.org/news/TC45_current_work/OpenXML%20White%20Paper.pdf)   
[ECMA-376 Website](http://www.ecma-international.org/publications/standards/Ecma-376.htm)   
[OpenOffice Excel File Format Reference](http://www.openoffice.org/sc/excelfileformat.pdf)   
[OpenOffice Anatomy of OOXML explanation](http://officeopenxml.com/anatomyofOOXML-xlsx.php)   
[MS-XSLX spec (pdf)] (http://download.microsoft.com/download/D/3/3/D334A189-E51B-47FF-B0E8-C0479AFB0E3C/%5BMS-XLSX%5D.pdf)    

Code references specifications sections from ECMA-376 2nd edition doc   
ECMA-376, Second Edition, Part 1 - Fundamentals And Markup Language Reference.pdf   
found in ECMA-376 2nd edition Part 1 download at [http://www.ecma-international.org/publications/standards/Ecma-376.htm](http://www.ecma-international.org/publications/standards/Ecma-376.htm)   

### Basic Usage
```javascript
// Require library
var xl = require('excel4node');

// Create a new instance of a WorkBook class
var wb = new xl.WorkBook();

// Add Workseets to the workbook
var ws = wb.addWorksheet('Sheet 1');
var ws2 = wb.addWorksheet('Sheet 2');

// Create a reusable style
var style = wb.Style({
	font: {
		color: '#FF0800',
		size: 12
	},
	numberFormat: '$#,##0.00; ($#,##0.00); -'
});

// Set value of cell A1 to 100 as a number type styled with paramaters of style
ws.cell(1,1).number(100).style(style);

// Set value of cell B1 to 300 as a number type styled with paramaters of style
ws.cell(1,2).number(200).style(style);

// Set value of cell C1 to a formula styled with paramaters of style
ws.cell(1,3).formula('A1 + B1').style(style);

// Set value of cell A2 to 'string' styled with paramaters of style
ws.cell(2,1).string('string').style(style);

// Set value of cell A3 to true as a boolean type styled with paramaters of style but with an adjustment to the font size.
ws.cell(3,1).bool(true).style(style).style({font: {size: 14}});

wb.write('Excel.xlsx');
```
## excelnode
excel4node comes with some generic functions and types

xl.getExcelRowCol(cellRef)   
Accepts cell reference (i.e. 'A1') and returns object with corresponding row and column

```javascript 
xl.getExcelRowCol('B5);
// returns { row: 5, col: 2} 
```

xl.getExcelAlpha(column)   
Accepts column as integer and returns corresponding column reference as alpha

```javascript 
xl.getExcelAlpha(10);
// returns 'J'
```

xl.getExcelCellRef(row, column)   
Accepts row and column as integers and returns Excel cell reference

```javascript 
xl.getExcelCellRef(5, 3);
// returns 'C5'
```

xl.getExcelTS(date)   
Accepts Date object and returns an Excel timestamp

```javascript 
var newDate = new Date('2015-01-01T00:00:00.0000Z');
xl.getExcelTS(newDate);
// Returns 42004.791666666664
```

xl.PAPER_SIZE


## WorkBook
An instance of the WorkBook class contains all data and parameters for the Excel WorkBook.

#### Constructor
WorkBook constructor accepts a configuration object.

```javascript
var xl = require('excel4node');
var wb = new xl.WorkBook({
    jszip: {
        compression: 'DEFLATE'
    },
    defaultFont: {
        size: 12,
        name: 'Calibri',
        color: 'FFFFFFFF'
    }
});
```

#### Methods   
wb.addWorksheet(name, options);   
Adds a new WorkSheet to the WorkBook   
Accepts name of new WorkSheet and options object (see WorkSheet section)   
Returns a WorkSheet instance

wb.setSelectedTab(id);   
Sets which tab will be selected when the WorkBook is opened   
Accepts Sheet ID (1-indexed sheet in order that sheets were added)

wb.createStyle(opts);  
Creates a new Style instance   
Accepts Style configuration object (see Style section)
Returns a new Style instance   


## WorkSheet
An instance of the WorkSheet class contains all information specific to that worksheet

#### Contstructor
WorkSheet contructor is called via WorkBook class and accepts a name and configuration object

```javascript
var xl = require('excel4node');
var wb = new xl.WorkBook();

var options = {
	margins: {
		left: 1.5,
		right: 1.5
	}
};

var ws = wb.addWorksheet(options);
```

Full WorkSheet options. All options are optional.

```
{
    'margins': { // Accepts a Double in Inches
        'bottom': Double,
        'footer': Double,
        'header': Double,
        'left': Double,
        'right': Double,
        'top': Double
    },
    'printOptions': {
        'centerHorizontal': Boolean,
        'centerVertical': Boolean,
        'printGridLines': Boolean,
        'printHeadings': Boolean
    
    },
    'headerFooter': { // Set Header and Footer strings and options. 
        'evenFooter': String,
        'evenHeader': String,
        'firstFooter': String,
        'firstHeader': String,
        'oddFooter': String,
        'oddHeader': String,
        'alignWithMargins': Boolean,
        'differentFirst': Boolean,
        'differentOddEven': Boolean,
        'scaleWithDoc': Boolean
    },
    'pageSetup': {
        'blackAndWhite': Boolean,
        'cellComments': xl.CellComment,
        'copies': Integer,
        'draft': Boolean,
        'errors': xl.PrintError,
        'firstPageNumber': Integer,
        'fitToHeight': Integer, // Number of vertical pages to fit to
        'fitToWidth': Integer, // Number of horizontal pages to fit to
        'horizontalDpi': Integer,
        'orientation': xl.Orientation,
        'pageOrder': xl.PageOrder,
        'paperHeight': xl.PositiveUniversalMeasure,
        'paperSize': xl.PaperSize,
        'paperWidth': xl.PositiveUniversalMeasure,
        'scale': Integer,
        'useFirstPageNumber': Boolean,
        'usePrinterDefaults': Boolean,
        'verticalDpi': Integer
    },
    'sheetView': {
        'pane': {
            'activePane': xl.Pane,
            'state': xl.PaneState,
            'topLeftCell': Cell Reference,
            'xSplit': Float, // Horizontal position of the split, in 1/20th of a point; 0 (zero) if none. If the pane is frozen, this value indicates the number of columns visible in the top pane.
            'ySplit': Float // Vertical position of the split, in 1/20th of a point; 0 (zero) if none. If the pane is frozen, this value indicates the number of rows visible in the left pane.
        },
        'rightToLeft': Boolean, // Flag indicating whether the sheet is in 'right to left' display mode. When in this mode, Column A is on the far right, Column B ;is one column left of Column A, and so on. Also, information in cells is displayed in the Right to Left format.
        'zoomScale': Integer, // Defaults to 100
        'zoomScaleNormal': Integer, // Defaults to 100
        'zoomScalePageLayoutView': Integer // Defaults to 100
    },
    'sheetFormat': {
        'baseColWidth': Integer, // Defaults to 10. Specifies the number of characters of the maximum digit width of the normal style's font. This value does not include margin padding or extra padding for gridlines. It is only the number of characters.,
        'defaultColWidth': Integer,
        'defaultRowHeight': Integer,
        'thickBottom': Boolean, // 'True' if rows have a thick bottom border by default.
        'thickTop': Boolean // 'True' if rows have a thick top border by default.
    },
    'sheetProtection': { // same as "Protect Sheet" in Review tab of Excel 
        'autoFilter': Boolean, // True means that that user will be unable to modify this setting
        'deleteColumns': Boolean,
        'deleteRow': Boolean,
        'formatCells': Boolean,
        'formatColumns': Boolean,
        'formatRows': Boolean,
        'insertColumns': Boolean,
        'insertHyperlinks': Boolean,
        'insertRows': Boolean,
        'objects': Boolean,
        'password': String,
        'pivotTables': Boolean,
        'scenarios': Boolean,
        'selectLockedCells': Boolean,
        'selectUnlockedCell': Boolean,
        'sheet': Boolean,
        'sort': Boolean
    },
    'outline': {
        'summaryBelow': Boolean, // Flag indicating whether summary rows appear below detail in an outline, when applying an outline/grouping.
        'summaryRight': Boolean // Flag indicating whether summary columns appear to the right of detail in an outline, when applying an outline/grouping.
    }
}
```

Notes:   
headerFooter strings accept [Dynamic Formatting Strings](https://poi.apache.org/apidocs/org/apache/poi/xssf/usermodel/extensions/XSSFHeaderFooter.html). i.e. '&L&A&C&BCompany, Inc. Confidential&B&RPage &P of &N'   


#### Methods
WorkSheet data validations   
accepts a validation options object with these available options. All options are optional with exception of sqref.

```javascript
{
	sqref: String, // Required. Specifies range of cells to apply validate. i.e. "A1:A100"
	allowBlank: Boolean, // Allows cells to be empty
	errorStyle: String, // One of 'stop', 'warning', 'information'
	error: String, // Message to show on error
	erroTitle: String, // Title of message shown on error
	showErrorMessage: Boolean, // Defaults to true if error or errorTitle is set
	imeMode: String, // Restricts input to a specific set of characters. One of 'noControl', 'off', 'on', 'disabled', 'hiragana', 'fullKatakana', 'halfKatakana', 'fullAlpha', 'halfAlpha', 'fullHangul', 'halfHangul'
	operator: String, // Must be one of 'between', 'notBetween', 'equal', 'notEqual', 'lessThan', 'lessThanOrEqual', 'greaterThan', 'greaterThanOrEqual'
	prompt: String, // Message text of input prompt
	promptTitle: String, // Title of input prompt
	showInputMessage: Boolean, // Defaults to true if prompt or promptTitle is set
	showDropDown: Boolean, // A boolean value indicating whether to display a dropdown combo box for a list type data validation.
	type: String, // One of 'none', 'whole', 'decimal', 'list', 'date', 'time', 'textLength', 'custom'
	formulas: Array // Minimum count 1, maximum count 2. 
}
```


```javascript
ws.addDataValidation({
    type: 'list',
    allowBlank: true,
    prompt: 'Choose from dropdown',
    error: 'Invalid choice was chosen',
    showDropDown: true;
    sqref: 'X2:X10',
    formulas: [
        'value1,value2'
    ]
});

ws.addDataValidation({
    type: 'list',
    allowBlank: 1,
    sqref: 'B2:B10',
    formulas: [
        '=sheet2!$A$1:$A$2'
    ]
});

ws.addDataValidation({
    type: 'whole',
    operator: 'between',
    allowBlank: 1,
    sqref: 'A1:A10',
    formulas: [0, 100]
});
```


## Rows and Columns

Set custom widths and heights of columns/rows

```javascript
ws.column(3).setWidth(50);
ws.row(1).setHeight(20);
```

Set rows and/or columns to create a frozen pane with an optionall scrollTo

```javascript
ws.column(2).freeze(4); // Freezes the first two columns and scrolls the right view to column D
ws.row(4).freeze(); // Freezes the top four rows

```

Add Filters to a row
If not options are given to the filter function, a filter will be added to all columns that contain data. 
Optionally, if you wish to restrict your filter to a specific range, you can specify start and end rows and columns for that range. The filter row should be included in this range.

```javascript
ws.row(1).filter();
ws2.row(1).filter({
	firstRow: 1,
	firstColumn: 1,
	lastRow: 20,
	lastColumn: 5
})
```

Hide a row or column

```javascript 
ws.row(5).hide();
ws.column(10).hide();
```

Create groupings of rows or columns and optionally state to collapse the grouping

```javascript
ws.row(2).group(1, true);
ws.row(3).group(1, true);
ws.row(5).group(1);
ws.row(6).group(1);

ws.column(4).group(1, true);
ws.column(5).group(1, true);
```


## Cells
